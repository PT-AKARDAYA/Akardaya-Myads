import express from 'express';
import http from 'http';
import path from 'path';
import fs from 'fs';
import { WebSocketServer, WebSocket } from 'ws';
import { createServer as createViteServer } from 'vite';
import { INITIAL_APP_DATA } from './src/data/defaultData';
import { AppData, Testimonial, OrderLead, WebSocketMessage } from './src/types';

const PORT = 3000;
const DATA_FILE_PATH = path.join(process.cwd(), 'data-storage.json');

// In-memory data store with disk persistence
let appData: AppData = { ...INITIAL_APP_DATA };

// Load persisted data if available
try {
  if (fs.existsSync(DATA_FILE_PATH)) {
    const raw = fs.readFileSync(DATA_FILE_PATH, 'utf-8');
    const parsed = JSON.parse(raw);
    if (parsed && parsed.packages && parsed.channelRates) {
      appData = parsed;
      console.log('Successfully loaded persisted data from data-storage.json');
    }
  }
} catch (err) {
  console.warn('Could not load data-storage.json, using defaults:', err);
}

function saveDataToDisk() {
  try {
    fs.writeFileSync(DATA_FILE_PATH, JSON.stringify(appData, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error saving data to disk:', err);
  }
}

async function startServer() {
  const app = express();
  const server = http.createServer(app);

  app.use(express.json({ limit: '10mb' }));

  // Initialize WebSocket Server
  const wss = new WebSocketServer({ server });
  const clients = new Set<WebSocket>();

  function broadcast(message: WebSocketMessage, excludeClient?: WebSocket) {
    const messageStr = JSON.stringify(message);
    clients.forEach((client) => {
      if (client !== excludeClient && client.readyState === WebSocket.OPEN) {
        try {
          client.send(messageStr);
        } catch (e) {
          console.error('Error broadcasting to client:', e);
        }
      }
    });
  }

  function broadcastActiveUsers() {
    broadcast({
      type: 'ACTIVE_USERS',
      payload: { count: clients.size },
      timestamp: new Date().toISOString(),
    });
  }

  wss.on('connection', (ws) => {
    clients.add(ws);
    console.log(`WebSocket client connected. Total connected clients: ${clients.size}`);

    // Send initial full state immediately
    const initMsg: WebSocketMessage = {
      type: 'INIT_DATA',
      payload: appData,
      timestamp: new Date().toISOString(),
    };
    ws.send(JSON.stringify(initMsg));

    // Send current active user count
    broadcastActiveUsers();

    ws.on('message', (data) => {
      try {
        const msg: WebSocketMessage = JSON.parse(data.toString());
        if (msg.type === 'UPDATE_DATA') {
          appData = {
            ...appData,
            ...msg.payload,
            lastUpdated: new Date().toISOString(),
          };
          saveDataToDisk();
          broadcast({
            type: 'SYNC_DATA',
            payload: appData,
            timestamp: new Date().toISOString(),
          }, ws);
        }
      } catch (err) {
        console.error('Error processing incoming websocket message:', err);
      }
    });

    ws.on('close', () => {
      clients.delete(ws);
      console.log(`WebSocket client disconnected. Remaining: ${clients.size}`);
      broadcastActiveUsers();
    });

    ws.on('error', (err) => {
      console.error('WebSocket client error:', err);
      clients.delete(ws);
    });
  });

  // REST API Endpoints
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', activeClients: clients.size, lastUpdated: appData.lastUpdated });
  });

  // Analytics in-memory store
  interface ServerVisitorLog {
    id: string;
    visitorId?: string;
    timestamp: string;
    ip: string;
    page: string;
    device: string;
    browser: string;
    referrer: string;
    eventType?: string;
  }
  const serverVisitorLogs: ServerVisitorLog[] = [];

  app.post('/api/analytics/track', (req, res) => {
    try {
      const body = req.body || {};
      const ipHeader = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || '127.0.0.1';
      const ip = ipHeader.split(',')[0].trim();
      
      const jakartaTimestamp = (() => {
        try {
          return new Intl.DateTimeFormat('id-ID', {
            timeZone: 'Asia/Jakarta',
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false,
          }).format(new Date()).replace(/\./g, ':') + ' WIB';
        } catch {
          return new Date().toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' }) + ' WIB';
        }
      })();

      const log: ServerVisitorLog = {
        id: 'vis_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
        visitorId: body.visitorId || 'v_' + Math.random().toString(36).substring(2, 6),
        timestamp: jakartaTimestamp,
        ip,
        page: body.page || '/',
        device: body.device || 'Desktop',
        browser: body.browser || 'Web Browser',
        referrer: body.referrer || 'Langsung',
        eventType: body.eventType || 'pageview',
      };

      serverVisitorLogs.unshift(log);
      if (serverVisitorLogs.length > 1000) {
        serverVisitorLogs.pop();
      }

      // Forward to Google Apps Script as dual-redundancy background sync
      const gasUrl = appData?.companyConfig?.spreadsheetUrl;
      if (gasUrl && gasUrl.startsWith('https://script.google.com/')) {
        fetch(gasUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'text/plain;charset=utf-8' },
          body: JSON.stringify({
            action: 'track_visitor',
            visitorId: log.visitorId,
            timestamp: log.timestamp,
            page: log.page,
            device: log.device,
            browser: log.browser,
            referrer: log.referrer,
            eventType: log.eventType,
            screen: body.screen || 'Unknown',
          }),
        }).catch((err) => {
          console.warn('Server GAS forward err:', err?.message);
        });
      }

      res.json({ status: 'success', totalLogged: serverVisitorLogs.length, activeClients: clients.size });
    } catch (e: any) {
      res.status(500).json({ status: 'error', message: e.message });
    }
  });

  app.get('/api/analytics/stats', (req, res) => {
    try {
      const totalViews = serverVisitorLogs.length;
      const uniqueVisitors = new Set(serverVisitorLogs.map((l) => l.visitorId || l.ip)).size;

      res.json({
        status: 'success',
        data: {
          totalPageViews: totalViews,
          uniqueVisitors: uniqueVisitors || (totalViews > 0 ? 1 : 0),
          activeNow: Math.max(1, clients.size),
          logs: serverVisitorLogs.slice(0, 50),
        },
      });
    } catch (e: any) {
      res.status(500).json({ status: 'error', message: e.message });
    }
  });

  // Get full app state
  app.get('/api/data', (req, res) => {
    res.json(appData);
  });

  // Update full app state (from Admin Dashboard)
  app.post('/api/data', (req, res) => {
    try {
      const incomingData = req.body as Partial<AppData>;
      appData = {
        ...appData,
        ...incomingData,
        lastUpdated: new Date().toISOString(),
      };
      saveDataToDisk();

      // Broadcast real-time change to all clients instantly!
      broadcast({
        type: 'SYNC_DATA',
        payload: appData,
        timestamp: new Date().toISOString(),
      });

      res.json({ success: true, data: appData });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err?.message || 'Failed to update data' });
    }
  });

  // Add a new customer review/testimonial
  app.post('/api/reviews', (req, res) => {
    try {
      const { name, companyOrStore, role, rating, comment, packageName } = req.body;
      if (!name || !comment || !rating) {
        return res.status(400).json({ error: 'Name, rating, and comment are required' });
      }

      const colors = ['bg-blue-600', 'bg-emerald-600', 'bg-indigo-600', 'bg-amber-600', 'bg-rose-600', 'bg-teal-600'];
      const randomColor = colors[Math.floor(Math.random() * colors.length)];

      const newTestimonial: Testimonial = {
        id: `testi_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        name: String(name).trim(),
        companyOrStore: companyOrStore ? String(companyOrStore).trim() : 'Pelanggan Setia',
        role: role ? String(role).trim() : 'Pemilik Usaha',
        rating: Math.min(5, Math.max(1, Number(rating) || 5)),
        comment: String(comment).trim(),
        packageName: packageName ? String(packageName).trim() : 'Paket Langganan',
        date: new Date().toISOString().split('T')[0],
        avatarBgColor: randomColor,
        verified: true,
      };

      appData.testimonials = [newTestimonial, ...appData.testimonials];
      appData.lastUpdated = new Date().toISOString();
      saveDataToDisk();

      // Broadcast real-time
      broadcast({
        type: 'NEW_REVIEW',
        payload: newTestimonial,
        timestamp: new Date().toISOString(),
      });

      broadcast({
        type: 'SYNC_DATA',
        payload: appData,
        timestamp: new Date().toISOString(),
      });

      res.json({ success: true, testimonial: newTestimonial });
    } catch (err: any) {
      res.status(500).json({ error: err?.message || 'Failed to save review' });
    }
  });

  // Submit order lead / consultation request
  app.post('/api/orders', (req, res) => {
    try {
      const { customerName, whatsapp, businessName, selectedPackageId, selectedPackageName, estimatedBudget, targetCityOrArea, notes } = req.body;

      if (!customerName || !whatsapp) {
        return res.status(400).json({ error: 'Customer name and WhatsApp number are required' });
      }

      const newOrder: OrderLead = {
        id: `lead_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        customerName: String(customerName).trim(),
        whatsapp: String(whatsapp).trim(),
        businessName: businessName ? String(businessName).trim() : '',
        selectedPackageId: selectedPackageId || 'custom',
        selectedPackageName: selectedPackageName || 'Konsultasi Iklan',
        estimatedBudget: estimatedBudget || 'Fleksibel',
        targetCityOrArea: targetCityOrArea || '',
        notes: notes || '',
        createdAt: new Date().toISOString(),
        status: 'PENDING',
      };

      appData.orders = [newOrder, ...(appData.orders || [])];
      appData.lastUpdated = new Date().toISOString();
      saveDataToDisk();

      // Broadcast real-time
      broadcast({
        type: 'NEW_ORDER',
        payload: newOrder,
        timestamp: new Date().toISOString(),
      });

      broadcast({
        type: 'SYNC_DATA',
        payload: appData,
        timestamp: new Date().toISOString(),
      });

      res.json({ success: true, order: newOrder });
    } catch (err: any) {
      res.status(500).json({ error: err?.message || 'Failed to create order' });
    }
  });

  // Reset to default data
  app.post('/api/admin/reset', (req, res) => {
    try {
      appData = {
        ...INITIAL_APP_DATA,
        lastUpdated: new Date().toISOString(),
      };
      saveDataToDisk();

      broadcast({
        type: 'SYNC_DATA',
        payload: appData,
        timestamp: new Date().toISOString(),
      });

      res.json({ success: true, message: 'Data reset to defaults successfully', data: appData });
    } catch (err: any) {
      res.status(500).json({ error: err?.message || 'Failed to reset data' });
    }
  });

  // Support /admin route shortcut redirecting to /admin.html
  app.get('/admin', (req, res) => {
    res.redirect('/admin.html');
  });

  // Vite middleware for development & static serving for production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('/admin.html', (req, res) => {
      res.sendFile(path.join(distPath, 'admin.html'));
    });
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  server.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Server running on http://0.0.0.0:${PORT}`);
    console.log(`🔌 WebSocket Server initialized on port ${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
});
