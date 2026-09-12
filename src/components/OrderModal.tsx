import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { trackRealVisitor } from '../utils/analyticsTracker';
import { SubscriptionPackage, OrderLead, ChannelRate, BankAccount } from '../types';
import { GpsLocationMapPickerModal } from './GpsLocationMapPickerModal';
import {
  DAFTAR_PROVINSI,
  DAFTAR_KOTA,
  DAFTAR_KECAMATAN,
  DAFTAR_KELURAHAN,
} from '../data/wilayahIndonesia';
import {
  X,
  PhoneCall,
  Send,
  Sparkles,
  MapPin,
  Building2,
  User,
  CreditCard,
  CheckCircle2,
  Check,
  Copy,
  ArrowRight,
  Radio,
  Users,
  Target,
  Megaphone,
  HelpCircle,
  Coins,
  ShieldCheck,
  ExternalLink,
  RotateCcw,
  Smartphone,
  ChevronRight,
  Gift,
  Zap,
  TrendingUp,
  Percent,
  Star,
  Calendar,
  MessageSquare,
  Globe,
  Tag,
  Compass,
  Navigation,
  Heart,
  Sliders,
  DollarSign,
  Layers,
  ShoppingBag,
  Briefcase,
  Smile,
  FileSpreadsheet,
  UploadCloud,
  FileText,
  Download,
  Trash2,
  Paperclip,
  FileCheck,
  CheckSquare,
  Landmark,
  Mail,
} from 'lucide-react';
import confetti from 'canvas-confetti';

type CampaignType = 'LBA' | 'BROADCAST' | 'TARGETED';

export const getPackageBudgetRange = (pkg: SubscriptionPackage | undefined) => {
  if (!pkg) return { targetBudget: 200000, maxBudget: 200000, minBudget: 150000 };
  
  let target = 200000;
  let max = 200000;
  let min = 150000;

  if (pkg.maxBudget && pkg.maxBudget > 0) {
    max = pkg.maxBudget;
    target = pkg.maxBudget;
    min = pkg.minBudget || Math.round(max * 0.5);
  } else if (pkg.minBudget && pkg.minBudget > 0) {
    min = pkg.minBudget;
    if (pkg.minBudget >= 1000000) {
      target = pkg.minBudget;
      max = 10000000; // e.g. 10 Jt
    } else if (pkg.minBudget >= 500000) {
      target = pkg.minBudget; // e.g. 500000
      max = 5000000; // max slider up to 5 Jt
    } else {
      target = pkg.minBudget;
      max = pkg.minBudget * 2;
    }
  } else {
    const parsed = parseInt(pkg.priceDisplay.replace(/\D/g, ''), 10);
    if (!isNaN(parsed) && parsed > 0) {
      target = parsed;
      max = parsed;
      min = Math.round(parsed * 0.5);
    }
  }

  return { targetBudget: target, maxBudget: max, minBudget: min };
};

export const OrderModal: React.FC = () => {
  const {
    data,
    isOrderModalOpen,
    setIsOrderModalOpen,
    selectedPackageForOrder,
    submitOrder,
  } = useApp();
  const { packages, companyConfig, discountConfig, channelRates } = data;

  // Step state: 'FORM' or 'PAYMENT'
  const [step, setStep] = useState<'FORM' | 'PAYMENT'>('FORM');

  // Form Fields
  const [campaignType, setCampaignType] = useState<CampaignType>('LBA');
  const [selectedPackageId, setSelectedPackageId] = useState<string>('');
  // Multi-select Media Channels with individual quantities: { [channelId]: quantity }
  const [channelQuantities, setChannelQuantities] = useState<Record<string, number>>({});
  
  // Topup Package specific states
  const [budgetAmount, setBudgetAmount] = useState<number>(200000);
  const [customBudgetInput, setCustomBudgetInput] = useState<string>('200000');

  const [customerName, setCustomerName] = useState<string>('');
  const [whatsapp, setWhatsapp] = useState<string>('');
  const [businessName, setBusinessName] = useState<string>('');
  const [targetCityOrArea, setTargetCityOrArea] = useState<string>('');
  const [myAdsEmail, setMyAdsEmail] = useState<string>('');
  const [notes, setNotes] = useState<string>('');

  // LBA GPS States
  const [isMapModalOpen, setIsMapModalOpen] = useState<boolean>(false);
  const [gpsLatitude, setGpsLatitude] = useState<number | undefined>(undefined);
  const [gpsLongitude, setGpsLongitude] = useState<number | undefined>(undefined);
  const [gpsRadiusMeters, setGpsRadiusMeters] = useState<number>(1000);
  const [streetAddress, setStreetAddress] = useState<string>('');

  // Campaign Parameters (H+3 Date, 160 chars message, web link, sender name)
  const [broadcastDate, setBroadcastDate] = useState<string>('');
  const [adMessageContent, setAdMessageContent] = useState<string>('');
  const [webLink, setWebLink] = useState<string>('');
  const [senderName, setSenderName] = useState<string>('');

  // TARGETED Hierarchical Indonesian Administrative Region States
  const [targetProvinceId, setTargetProvinceId] = useState<string>('p_jatim');
  const [targetCityId, setTargetCityId] = useState<string>('k_gresik');
  const [targetDistrictId, setTargetDistrictId] = useState<string>('');
  const [targetVillageId, setTargetVillageId] = useState<string>('');
  const [targetAgeGroup, setTargetAgeGroup] = useState<string>('Semua Rentang Usia');
  const [targetReligion, setTargetReligion] = useState<string>('Semua Agama');
  const [targetGender, setTargetGender] = useState<string>('Semua Gender (Pria & Wanita)');
  const [targetArpuSpending, setTargetArpuSpending] = useState<string>('Semua ARPU (Standard)');
  const [targetSes, setTargetSes] = useState<string>('Semua SES (Mass Market)');
  const [targetDeviceOs, setTargetDeviceOs] = useState<string>('Semua Device & OS');
  const [targetMaritalStatus, setTargetMaritalStatus] = useState<string>('Semua Status');
  const [targetInterests, setTargetInterests] = useState<string[]>([
    'Belanja Online & E-Commerce',
  ]);
  const [customInterestInput, setCustomInterestInput] = useState<string>('');

  // BROADCAST File Upload State (Excel / CSV customer list)
  const [uploadedListFileName, setUploadedListFileName] = useState<string>('');
  const [uploadedListFileCount, setUploadedListFileCount] = useState<number | undefined>(undefined);
  const [uploadedListFileSize, setUploadedListFileSize] = useState<string>('');
  const [isDraggingFile, setIsDraggingFile] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleProcessFile = (file: File) => {
    if (!file) return;
    const name = file.name;
    const sizeKB = (file.size / 1024).toFixed(1) + ' KB';
    setUploadedListFileName(name);
    setUploadedListFileSize(sizeKB);

    if (name.toLowerCase().endsWith('.csv') || name.toLowerCase().endsWith('.txt')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = (e.target?.result as string) || '';
        if (text) {
          const lines = text.split(/\r\n|\n/).filter(line => line.trim().length > 0);
          const count = lines.length > 1 && (lines[0].toLowerCase().includes('nomor') || lines[0].toLowerCase().includes('phone') || lines[0].toLowerCase().includes('hp') || lines[0].toLowerCase().includes('kontak'))
            ? lines.length - 1
            : lines.length;
          setUploadedListFileCount(count);
        }
      };
      reader.readAsText(file);
    } else {
      setUploadedListFileCount(undefined);
    }
  };

  const handleRemoveUploadedFile = () => {
    setUploadedListFileName('');
    setUploadedListFileCount(undefined);
    setUploadedListFileSize('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDownloadSampleCsv = () => {
    const csvContent = 'data:text/csv;charset=utf-8,Nomor_HP,Nama_Penerima,Kota\n081234567890,Budi Santoso,Surabaya\n085712345678,Siti Nurhaliza,Gresik\n089612345678,Ahmad Dahlan,Jakarta\n087812345678,Dewi Lestari,Bandung';
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'template_list_broadcast_nomor.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filtered Wilayah Lists based on hierarchy selection
  const filteredKotaList = useMemo(() => {
    if (!targetProvinceId) return DAFTAR_KOTA;
    return DAFTAR_KOTA.filter((k) => k.provinsiId === targetProvinceId);
  }, [targetProvinceId]);

  const filteredKecamatanList = useMemo(() => {
    if (!targetCityId) return [];
    return DAFTAR_KECAMATAN.filter((kc) => kc.kotaId === targetCityId);
  }, [targetCityId]);

  const filteredKelurahanList = useMemo(() => {
    if (!targetDistrictId) return [];
    return DAFTAR_KELURAHAN.filter((kl) => kl.kecamatanId === targetDistrictId);
  }, [targetDistrictId]);

  // Derived selected names for labels
  const selectedProvinceObj = useMemo(() => DAFTAR_PROVINSI.find((p) => p.id === targetProvinceId), [targetProvinceId]);
  const selectedKotaObj = useMemo(() => DAFTAR_KOTA.find((k) => k.id === targetCityId), [targetCityId]);
  const selectedKecamatanObj = useMemo(() => DAFTAR_KECAMATAN.find((kc) => kc.id === targetDistrictId), [targetDistrictId]);
  const selectedKelurahanObj = useMemo(() => DAFTAR_KELURAHAN.find((kl) => kl.id === targetVillageId), [targetVillageId]);

  // Formatted targeted administrative area text
  const formattedTargetedAdministrativeArea = useMemo(() => {
    const parts: string[] = [];
    if (selectedKelurahanObj) parts.push(`Kel. ${selectedKelurahanObj.nama}`);
    if (selectedKecamatanObj) parts.push(`Kec. ${selectedKecamatanObj.nama}`);
    if (selectedKotaObj) parts.push(selectedKotaObj.nama);
    if (selectedProvinceObj) parts.push(selectedProvinceObj.nama);
    return parts.length > 0 ? parts.join(', ') : 'Nasional / Seluruh Indonesia';
  }, [selectedProvinceObj, selectedKotaObj, selectedKecamatanObj, selectedKelurahanObj]);

  // Min broadcast date H+3
  const minBroadcastDate = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + 3);
    return d.toISOString().split('T')[0];
  }, []);

  const minBroadcastDateFormatted = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + 3);
    return d.toLocaleDateString('id-ID', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }, []);

  // Submission & Result state
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [createdOrder, setCreatedOrder] = useState<OrderLead | null>(null);
  const [copiedAccount, setCopiedAccount] = useState<boolean>(false);
  const [copiedSummary, setCopiedSummary] = useState<boolean>(false);
  const [selectedBankAccountId, setSelectedBankAccountId] = useState<string | null>(null);
  const [copiedBankId, setCopiedBankId] = useState<string | null>(null);
  const [isUploadingProof, setIsUploadingProof] = useState<boolean>(false);
  const prevIsOpenRef = useRef<boolean>(false);

  const handleCustomerUploadProof = (file: File) => {
    setIsUploadingProof(true);
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const maxDim = 1200;
        let w = img.width;
        let h = img.height;
        if (w > h) {
          if (w > maxDim) {
            h = Math.round((h * maxDim) / w);
            w = maxDim;
          }
        } else {
          if (h > maxDim) {
            w = Math.round((w * maxDim) / h);
            h = maxDim;
          }
        }
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, w, h);
          const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
          const nowStr = new Date().toLocaleString('id-ID');
          if (createdOrder) {
            const updated: OrderLead = {
              ...createdOrder,
              paymentProofUrl: dataUrl,
              paymentProofFileName: file.name,
              paymentProofUploadedAt: nowStr,
            };
            setCreatedOrder(updated);
            fetch('/api/orders', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(updated),
            }).catch(console.error);
          }
        }
        setIsUploadingProof(false);
      };
      img.onerror = () => setIsUploadingProof(false);
    };
    reader.onerror = () => setIsUploadingProof(false);
  };

  // Active Bank Accounts for Payment
  const activeBankAccounts: BankAccount[] = useMemo(() => {
    const rawList = companyConfig.bankAccounts && companyConfig.bankAccounts.length > 0
      ? companyConfig.bankAccounts.filter((b) => b.isActive !== false)
      : [];

    if (rawList.length > 0) return rawList;

    // Fallback if no accounts configured yet
    return [
      {
        id: 'default-primary-bank',
        bankName: companyConfig.bankName || 'BCA (Bank Central Asia)',
        accountNumber: companyConfig.bankAccountNumber || '0188-3333-7157',
        accountHolder: companyConfig.bankAccountHolder || 'PT Akardaya Telekomunikasi Indonesia',
        isPrimary: true,
        isActive: true,
        notes: 'Rekening Resmi Utama',
      },
    ];
  }, [companyConfig.bankAccounts, companyConfig.bankName, companyConfig.bankAccountNumber, companyConfig.bankAccountHolder]);

  // Selected Bank Account
  const currentBankAccount = useMemo(() => {
    if (selectedBankAccountId) {
      const found = activeBankAccounts.find((b) => b.id === selectedBankAccountId);
      if (found) return found;
    }
    return activeBankAccounts.find((b) => b.isPrimary) || activeBankAccounts[0];
  }, [activeBankAccounts, selectedBankAccountId]);

  // Filter channel rates based on selected campaign type
  const availableChannels = useMemo(() => {
    const list = channelRates.filter(
      (r) => r.featureName.toUpperCase() === campaignType
    );
    return list.length > 0 ? list : channelRates;
  }, [channelRates, campaignType]);

  const currentPkg = packages.find((p) => p.id === selectedPackageId) || selectedPackageForOrder || packages[0];
  
  const isOneKlik = Boolean(
    currentPkg && (
      currentPkg.category === 'ONE_KLIK' ||
      currentPkg.id?.toLowerCase().startsWith('one_klik') ||
      currentPkg.name?.toLowerCase().includes('one klik')
    )
  );

  const isTopupPackage = !isOneKlik && currentPkg && (
    currentPkg.name.toLowerCase().includes('mandiri') ||
    currentPkg.name.toLowerCase().includes('jawara') ||
    currentPkg.name.toLowerCase().includes('enterprise') ||
    currentPkg.category === 'MANDIRI'
  );

  // Top-Up Package budget bounds strictly following the current package configuration
  const { maxBudget: topupMaxBudget, minBudget: topupMinBudget } = useMemo(() => {
    return getPackageBudgetRange(currentPkg);
  }, [currentPkg]);

  // Determine step size for topup slider
  const topupSliderStep = useMemo(() => {
    const diff = topupMaxBudget - topupMinBudget;
    if (diff <= 100000) return 5000;
    if (diff <= 350000) return 10000;
    if (diff <= 2000000) return 50000;
    return 100000;
  }, [topupMaxBudget, topupMinBudget]);

  // Helper to calculate bonus percentage and matching tier for any given amount
  const getBonusForAmount = useMemo(() => {
    return (amount: number): { percent: number; tier: any | null } => {
      // Paket One Klik tidak ada bonus saldo
      if (isOneKlik) return { percent: 0, tier: null };
      if (!discountConfig.isPromoActive) return { percent: 0, tier: null };
      const tiers = discountConfig.monetaryTiers || [];
      for (const t of tiers) {
        const min = t.minAmount ?? 0;
        const max = t.maxAmount ?? Infinity;
        if (amount >= min && amount <= max) {
          return { percent: Number(t.bonusPercent) || 0, tier: t };
        }
      }
      const fallback = typeof discountConfig.reloadDiscountPercent === 'number'
        ? discountConfig.reloadDiscountPercent
        : parseInt(String(discountConfig.reloadDiscountPercent || '').replace(/\D/g, ''), 10) || 0;
      return { percent: fallback, tier: null };
    };
  }, [discountConfig, isOneKlik]);

  // Generate dynamic preset chips strictly within the package's budget range and synchronized with Admin's monetaryTiers
  const topupPresets = useMemo(() => {
    const rawAmounts = new Set<number>();

    // 1. Always include the package minimum
    rawAmounts.add(topupMinBudget);

    // 2. Add tier thresholds from Admin's monetaryTiers that fall within the package bounds
    const tiers = discountConfig.monetaryTiers || [];
    tiers.forEach((t) => {
      const min = Number(t.minAmount) || 0;
      if (min >= topupMinBudget && min <= topupMaxBudget) {
        rawAmounts.add(min);
      }
      // If min is not a clean round 100k multiple (e.g. 500001), also add round equivalent if valid
      if (min > 0 && min < 1000000 && min % 100000 !== 0) {
        const roundStep = Math.ceil(min / 100000) * 100000;
        if (roundStep >= topupMinBudget && roundStep <= topupMaxBudget) {
          rawAmounts.add(roundStep);
        }
      }
    });

    // 3. Add sensible intermediate steps based on package range so user has balanced options
    const diff = topupMaxBudget - topupMinBudget;
    if (diff > 0) {
      if (topupMinBudget >= 500000) {
        // High budget topups (e.g. 500rb - 5jt, 1jt - 10jt)
        const commonSteps = [500000, 750000, 1000000, 1500000, 2000000, 3000000, 5000000, 7500000, 10000000];
        commonSteps.forEach((s) => {
          if (s >= topupMinBudget && s <= topupMaxBudget) {
            rawAmounts.add(s);
          }
        });
      } else if (topupMinBudget >= 180000 && topupMaxBudget <= 500000) {
        // Mid package (e.g. 200rb - 499.999)
        const midSteps = [200000, 250000, 300000, 400000];
        midSteps.forEach((s) => {
          if (s >= topupMinBudget && s <= topupMaxBudget) {
            rawAmounts.add(s);
          }
        });
      } else {
        // Low range package (< 200rb)
        const step = Math.max(10000, Math.round(diff / 3 / 10000) * 10000);
        for (let amt = topupMinBudget + step; amt < topupMaxBudget; amt += step) {
          rawAmounts.add(amt);
        }
      }
    }

    // 4. Always include package maximum if valid
    if (topupMaxBudget > topupMinBudget && topupMaxBudget < 100000000) {
      rawAmounts.add(topupMaxBudget);
    }

    // Sort ascending
    const sortedAmounts = Array.from(rawAmounts)
      .filter((a) => a >= topupMinBudget && a <= topupMaxBudget)
      .sort((a, b) => a - b);

    // Map to rich preset objects with synced bonus percent from admin rules
    return sortedAmounts.map((amt) => {
      const { percent, tier } = getBonusForAmount(amt);
      let tag = '';
      if (amt === topupMinBudget) tag = 'Min';
      else if (amt === topupMaxBudget) tag = 'Maks';

      return {
        amount: amt,
        label: `Rp ${amt.toLocaleString('id-ID')}`,
        bonusPercent: percent,
        tierLabel: tier?.label || '',
        tag,
      };
    });
  }, [topupMinBudget, topupMaxBudget, discountConfig, getBonusForAmount]);

  // Information about unlocking the next tier with higher bonus
  const nextTierInfo = useMemo(() => {
    if (isOneKlik) return null;
    if (!discountConfig.isPromoActive) return null;
    const tiers = discountConfig.monetaryTiers || [];
    if (tiers.length === 0) return null;

    // Filter tiers and sort by minAmount ascending
    const sorted = [...tiers].sort((a, b) => (Number(a.minAmount) || 0) - (Number(b.minAmount) || 0));
    
    // Find current active tier
    const currentTier = sorted.find((t) => {
      const min = t.minAmount ?? 0;
      const max = t.maxAmount ?? Infinity;
      return budgetAmount >= min && budgetAmount <= max;
    });

    const currentBonus = currentTier ? Number(currentTier.bonusPercent) || 0 : 0;
    const nextTier = sorted.find((t) => {
      const min = Number(t.minAmount) || 0;
      const bonus = Number(t.bonusPercent) || 0;
      return min > budgetAmount && bonus > currentBonus;
    });

    if (nextTier && (Number(nextTier.minAmount) || 0) <= topupMaxBudget) {
      const target = Number(nextTier.minAmount) || 0;
      const needed = Math.max(0, target - budgetAmount);
      return {
        nextTier,
        needed,
        targetAmount: target,
      };
    }
    return null;
  }, [discountConfig, budgetAmount, topupMaxBudget, isOneKlik]);

  // Keep budgetAmount clamped within package limits whenever currentPkg changes
  useEffect(() => {
    if (isTopupPackage) {
      setBudgetAmount((prev) => {
        if (prev < topupMinBudget) {
          setCustomBudgetInput(topupMinBudget.toString());
          return topupMinBudget;
        }
        if (prev > topupMaxBudget) {
          setCustomBudgetInput(topupMaxBudget.toString());
          return topupMaxBudget;
        }
        return prev;
      });
    }
  }, [isTopupPackage, topupMinBudget, topupMaxBudget]);

  // Ensure at least 1 valid channel is selected when campaignType changes
  useEffect(() => {
    if (availableChannels.length > 0) {
      setChannelQuantities((prev) => {
        const next: Record<string, number> = {};
        const availableIds = new Set(availableChannels.map((c) => c.id));
        let hasAny = false;

        // Keep existing selections that belong to the current available list
        for (const [id, qty] of Object.entries(prev)) {
          if (availableIds.has(id)) {
            next[id] = qty;
            hasAny = true;
          }
        }

        // If none selected, default to the first channel matching current package budget
        if (!hasAny) {
          const first = availableChannels[0];
          const { targetBudget } = getPackageBudgetRange(currentPkg);
          next[first.id] = Math.max(10, Math.floor(targetBudget / (first.ratePerUnit || 200)));
        }

        return next;
      });
    }
  }, [campaignType, availableChannels, currentPkg]);

  // Selected Channels Array
  const selectedChannelsList = useMemo(() => {
    return availableChannels.filter((c) => (channelQuantities[c.id] || 0) > 0);
  }, [availableChannels, channelQuantities]);

  // Calculate Subtotal & Total Reach across all selected channels
  const { totalSubtotal, totalSelectedCount, channelBreakdown } = useMemo(() => {
    let subtotal = 0;
    let count = 0;
    const breakdown: Array<{ channel: ChannelRate; qty: number; cost: number }> = [];

    for (const ch of availableChannels) {
      const qty = channelQuantities[ch.id] || 0;
      if (qty > 0) {
        const cost = qty * ch.ratePerUnit;
        subtotal += cost;
        count += qty;
        breakdown.push({ channel: ch, qty, cost });
      }
    }

    return {
      totalSubtotal: subtotal,
      totalSelectedCount: count,
      channelBreakdown: breakdown,
    };
  }, [availableChannels, channelQuantities]);

  const effectiveTotalSubtotal = isTopupPackage ? budgetAmount : totalSubtotal;

  // Calculate Bonus Saldo
  const bonusPercent = useMemo(() => {
    // Paket One Klik tidak ada bonus saldo
    if (isOneKlik) return 0;
    if (!discountConfig.isPromoActive) return 0;
    const tiers = discountConfig.monetaryTiers || [];
    for (const t of tiers) {
      const min = t.minAmount ?? 0;
      const max = t.maxAmount ?? Infinity;
      if (effectiveTotalSubtotal >= min && effectiveTotalSubtotal <= max) {
        return t.bonusPercent;
      }
    }
    const fallbackPercent = typeof discountConfig.reloadDiscountPercent === 'number'
      ? discountConfig.reloadDiscountPercent
      : parseInt(String(discountConfig.reloadDiscountPercent || '').replace(/\D/g, ''), 10) || 20;
    return fallbackPercent;
  }, [isOneKlik, effectiveTotalSubtotal, discountConfig]);

  const bonusAmount = isOneKlik ? 0 : Math.round((effectiveTotalSubtotal * bonusPercent) / 100);
  const effectiveTotalPayment = effectiveTotalSubtotal;

  // Total reach estimate (including bonus reach proportion)
  const effectiveReach = useMemo(() => {
    if (isTopupPackage) {
      return Math.floor((effectiveTotalSubtotal + bonusAmount) / 200);
    }
    if (totalSubtotal <= 0) return 0;
    const avgRate = totalSubtotal / (totalSelectedCount || 1);
    const bonusReach = isOneKlik ? 0 : Math.floor(bonusAmount / (avgRate || 200));
    return totalSelectedCount + bonusReach;
  }, [totalSubtotal, totalSelectedCount, bonusAmount, isTopupPackage, effectiveTotalSubtotal, isOneKlik]);

  // When modal opens: initialize state only once on open transition
  useEffect(() => {
    const wasOpen = prevIsOpenRef.current;
    prevIsOpenRef.current = isOrderModalOpen;

    if (isOrderModalOpen && !wasOpen) {
      trackRealVisitor('/formulir-pemesanan', 'pageview', companyConfig.spreadsheetUrl);
      setStep('FORM');
      setCopiedAccount(false);
      setCopiedSummary(false);
      setCopiedBankId(null);
      setCreatedOrder(null);
      setSelectedBankAccountId(null);

      if (selectedPackageForOrder) {
        setSelectedPackageId(selectedPackageForOrder.id);
        const { targetBudget } = getPackageBudgetRange(selectedPackageForOrder);
        setBudgetAmount(targetBudget);
        setCustomBudgetInput(targetBudget.toString());

        const defaultCh = availableChannels[0] || channelRates[0];
        if (defaultCh) {
          const qty = Math.max(10, Math.floor(targetBudget / (defaultCh.ratePerUnit || 200)));
          setChannelQuantities({ [defaultCh.id]: qty });
        }
      } else if (packages.length > 0) {
        setSelectedPackageId(packages[0].id);
        const { targetBudget } = getPackageBudgetRange(packages[0]);
        setBudgetAmount(targetBudget);
        setCustomBudgetInput(targetBudget.toString());

        const defaultCh = availableChannels[0] || channelRates[0];
        if (defaultCh) {
          const qty = Math.max(10, Math.floor(targetBudget / (defaultCh.ratePerUnit || 200)));
          setChannelQuantities({ [defaultCh.id]: qty });
        }
      }
    }
  }, [isOrderModalOpen, selectedPackageForOrder, packages, companyConfig.spreadsheetUrl, availableChannels, channelRates]);

  if (!isOrderModalOpen) return null;

  // Handler for selecting package from dropdown
  const handleSelectPackage = (packageId: string) => {
    setSelectedPackageId(packageId);
    const found = packages.find((p) => p.id === packageId);
    if (!found) return;

    const { targetBudget } = getPackageBudgetRange(found);
    setBudgetAmount(targetBudget);
    setCustomBudgetInput(targetBudget.toString());

    const isTopup = found.name.toLowerCase().includes('mandiri') ||
      found.name.toLowerCase().includes('jawara') ||
      found.name.toLowerCase().includes('enterprise') ||
      found.category === 'MANDIRI';

    if (!isTopup) {
      // Recalibrate selected channel quantities according to this package budget!
      setChannelQuantities((prev) => {
        const selectedIds = Object.keys(prev).filter((k) => prev[k] > 0);
        const activeIds = selectedIds.length > 0 
          ? selectedIds 
          : [availableChannels[0]?.id || channelRates[0]?.id].filter(Boolean);

        const count = activeIds.length || 1;
        const budgetPerChannel = Math.floor(targetBudget / count);
        const next: Record<string, number> = {};

        activeIds.forEach((id) => {
          const ch = availableChannels.find((c) => c.id === id) || channelRates.find((c) => c.id === id);
          const rate = ch?.ratePerUnit || 200;
          const newQty = Math.max(10, Math.floor(budgetPerChannel / rate));
          next[id] = newQty;
        });

        return next;
      });
    }
  };

  // Toggle channel selection
  const handleToggleChannel = (channel: ChannelRate) => {
    setChannelQuantities((prev) => {
      const next = { ...prev };
      const currentKeys = Object.keys(next).filter((k) => (next[k] || 0) > 0);

      if (next[channel.id] && next[channel.id] > 0) {
        // Uncheck - but ensure at least 1 remains if only 1 is selected
        if (currentKeys.length > 1) {
          delete next[channel.id];
          const remainingIds = Object.keys(next).filter((k) => (next[k] || 0) > 0);
          // If only 1 channel left, give it the full package budget
          if (remainingIds.length === 1) {
            const onlyId = remainingIds[0];
            const { targetBudget } = getPackageBudgetRange(currentPkg);
            const onlyCh = availableChannels.find((c) => c.id === onlyId) || channelRates.find((c) => c.id === onlyId);
            const rate = onlyCh?.ratePerUnit || 200;
            next[onlyId] = Math.max(10, Math.floor(targetBudget / rate));
          }
        }
      } else {
        // Select channel - distribute package budget evenly among all active channels
        const activeIds = [...currentKeys.filter((k) => k !== channel.id), channel.id];
        const { targetBudget } = getPackageBudgetRange(currentPkg);
        const budgetPerCh = Math.floor(targetBudget / activeIds.length);
        
        activeIds.forEach((id) => {
          const ch = availableChannels.find((c) => c.id === id) || channelRates.find((c) => c.id === id);
          const rate = ch?.ratePerUnit || 200;
          next[id] = Math.max(10, Math.floor(budgetPerCh / rate));
        });
      }
      return next;
    });
  };

  // Update specific channel quantity via slider or input, strictly bounded by package budget
  const handleChannelQtyChange = (channelId: string, qty: number) => {
    setChannelQuantities((prev) => {
      const ch = availableChannels.find((c) => c.id === channelId) || channelRates.find((c) => c.id === channelId);
      if (!ch) return prev;

      const rate = ch.ratePerUnit || 200;
      const { maxBudget } = getPackageBudgetRange(currentPkg);

      // Sum of all other channels' cost
      let otherChannelsCost = 0;
      Object.keys(prev).forEach((id) => {
        if (id !== channelId && (prev[id] || 0) > 0) {
          const otherCh = availableChannels.find((c) => c.id === id) || channelRates.find((c) => c.id === id);
          const otherRate = otherCh?.ratePerUnit || 200;
          otherChannelsCost += (prev[id] || 0) * otherRate;
        }
      });

      // Maximum allowable budget for this channel
      const allowedBudgetForThis = Math.max(0, maxBudget - otherChannelsCost);
      const maxAllowedQty = Math.floor(allowedBudgetForThis / rate);

      // Clamp requested qty so it can never exceed maxAllowedQty
      const safeQty = Math.max(0, Math.min(qty, maxAllowedQty));

      return {
        ...prev,
        [channelId]: safeQty,
      };
    });
  };

  const handleTopupSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Number(e.target.value);
    let finalVal = val;
    if (val >= topupMaxBudget - topupSliderStep / 2) {
      finalVal = topupMaxBudget;
    } else if (val <= topupMinBudget + topupSliderStep / 2) {
      finalVal = topupMinBudget;
    }
    setBudgetAmount(finalVal);
    setCustomBudgetInput(finalVal.toString());
  };

  const handleBudgetSelect = (amt: number) => {
    const clamped = Math.min(topupMaxBudget, Math.max(topupMinBudget, amt));
    setBudgetAmount(clamped);
    setCustomBudgetInput(clamped.toString());
  };

  const handleCustomBudgetChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, '');
    setCustomBudgetInput(raw);
    const num = parseInt(raw, 10);
    if (!isNaN(num) && num > 0) {
      setBudgetAmount(num);
    }
  };

  const handleCopyAccount = (accountNumber?: string, bankId?: string) => {
    const acc = accountNumber || currentBankAccount?.accountNumber || companyConfig.bankAccountNumber || '0188-3333-7157';
    navigator.clipboard.writeText(acc.replace(/\s+/g, ''));
    setCopiedAccount(true);
    if (bankId) setCopiedBankId(bankId);
    setTimeout(() => {
      setCopiedAccount(false);
      setCopiedBankId(null);
    }, 2500);
  };

  const handleSaveGpsLocation = (result: {
    latitude: number;
    longitude: number;
    radiusMeters: number;
    streetAddress: string;
    cityName: string;
    formattedTargetArea: string;
  }) => {
    setGpsLatitude(result.latitude);
    setGpsLongitude(result.longitude);
    setGpsRadiusMeters(result.radiusMeters);
    setStreetAddress(result.streetAddress);
    setTargetCityOrArea(result.formattedTargetArea);
  };

  const handleCopySummary = () => {
    if (!createdOrder) return;
    const targetBank = currentBankAccount || {
      bankName: companyConfig.bankName || 'BCA (Bank Central Asia)',
      accountNumber: companyConfig.bankAccountNumber || '0188-3333-7157',
      accountHolder: companyConfig.bankAccountHolder || 'PT Akardaya Telekomunikasi Indonesia',
    };

    const text =
      `*RINCIAN PESANAN & PEMBAYARAN AKARDAYA MYADS*\n` +
      `----------------------------------------\n` +
      `No. Pesanan: ${createdOrder.id}\n` +
      `Nama Pemesan: ${createdOrder.customerName}\n` +
      `Nama Usaha: ${createdOrder.businessName || '-'}\n` +
      `No. WhatsApp: ${createdOrder.whatsapp}\n` +
      (createdOrder.myAdsEmail ? `Email Akun MyAds: ${createdOrder.myAdsEmail}\n` : '') +
      `Paket: ${createdOrder.selectedPackageName}\n` +
      `Tipe Kampanye: ${createdOrder.campaignType}\n` +
      `Saluran Media: ${createdOrder.channelName}\n` +
      `Estimasi Jangkauan: ~${createdOrder.estimatedReach?.toLocaleString('id-ID')} Penerima\n` +
      `Target Lokasi: ${createdOrder.targetCityOrArea || 'Nasional'}\n` +
      (!isTopupPackage && (createdOrder.campaignType === 'TARGETED' || createdOrder.targetAgeGroup)
        ? `--- KAPABILITAS TARGETING ---\n` +
          `• Rentang Usia: ${createdOrder.targetAgeGroup || 'Semua Usia'}\n` +
          `• Segmentasi Religi: ${createdOrder.targetReligion || 'Semua Agama'}\n` +
          `• Jenis Kelamin: ${createdOrder.targetGender || 'Semua Gender'}\n` +
          `• ARPU Spending: ${createdOrder.targetArpuSpending || 'Semua ARPU'}\n` +
          `• Status SES: ${createdOrder.targetSes || 'Semua SES'}\n` +
          `• Device & OS: ${createdOrder.targetDeviceOs || 'Semua Device'}\n` +
          `• Status Pernikahan: ${createdOrder.targetMaritalStatus || 'Semua Status'}\n` +
          (createdOrder.targetInterests && createdOrder.targetInterests.length > 0
            ? `• Minat / Perilaku: ${createdOrder.targetInterests.join(', ')}\n`
            : ''
          )
        : ''
      ) +
      (!isTopupPackage && createdOrder.latitude && createdOrder.longitude
        ? `Titik GPS & Radius: Lat: ${createdOrder.latitude}, Lng: ${createdOrder.longitude} (Radius: ${createdOrder.radiusMeters >= 1000 ? `${(createdOrder.radiusMeters / 1000).toFixed(1)} km` : `${createdOrder.radiusMeters} Meter`})\n` +
          (createdOrder.streetAddress ? `Alamat Jalan: ${createdOrder.streetAddress}\n` : '')
        : ''
      ) +
      (!isTopupPackage && createdOrder.uploadedListFileName
        ? `File List Kontak: ${createdOrder.uploadedListFileName} (${createdOrder.uploadedListFileSize || ''}${createdOrder.uploadedListFileCount ? ` • ~${createdOrder.uploadedListFileCount} Nomor` : ''})\n`
        : ''
      ) +
      (!isTopupPackage && createdOrder.broadcastDate ? `Tanggal Broadcast (H+3): ${createdOrder.broadcastDate}\n` : '') +
      (!isTopupPackage && createdOrder.senderName ? `Sender ID / Masking: ${createdOrder.senderName}\n` : '') +
      (!isTopupPackage && createdOrder.adMessageContent ? `Isi Pesan Iklan: "${createdOrder.adMessageContent}"\n` : '') +
      (!isTopupPackage && createdOrder.webLink ? `Link Web / Promo: ${createdOrder.webLink}\n` : '') +
      (isOneKlik
        ? `Bonus Saldo: Tidak Ada (Paket One Klik Terima Jadi)\n`
        : `Bonus Saldo: +${bonusPercent}%${bonusAmount > 0 ? ` (+Rp ${bonusAmount.toLocaleString('id-ID')})` : ''}\n` +
          (bonusAmount > 0 ? `Total Saldo Masuk Akun: Rp ${(effectiveTotalSubtotal + bonusAmount).toLocaleString('id-ID')}\n` : '')
      ) +
      `----------------------------------------\n` +
      `TOTAL PEMBAYARAN TRANSFER: Rp ${createdOrder.totalPayment?.toLocaleString('id-ID')}\n` +
      `----------------------------------------\n` +
      `REKENING TUJUAN TRANSFER:\n` +
      `Bank: ${targetBank.bankName}\n` +
      `No. Rekening: ${targetBank.accountNumber}\n` +
      `Atas Nama: ${targetBank.accountHolder}\n\n` +
      `Panduan: ${companyConfig.paymentInstructions || 'Transfer sesuai total estimasi, lalu kirim bukti transfer ke WhatsApp admin.'}`;

    navigator.clipboard.writeText(text);
    setCopiedSummary(true);
    setTimeout(() => setCopiedSummary(false), 2500);
  };

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim() || !whatsapp.trim()) return;
    if (isTopupPackage && !myAdsEmail.trim()) {
      alert('Mohon masukkan email Akun Telkomsel MyAds Anda.');
      return;
    }
    if (!isTopupPackage && selectedChannelsList.length === 0) {
      alert('Pilih minimal 1 jenis saluran media iklan.');
      return;
    }

    setIsSubmitting(true);

    let cleanWa = whatsapp.replace(/\D/g, '');
    if (cleanWa.startsWith('0')) {
      cleanWa = '62' + cleanWa.substring(1);
    }

    // Format selected channels summary for WA and payload
    const channelNames = isTopupPackage 
      ? 'Top-Up Saldo Bebas (Media dipilih via Dashboard)'
      : selectedChannelsList
          .map(ch => `${ch.facility} (${channelQuantities[ch.id] || 0} ${ch.unit})`)
          .join(', ');

    const finalTargetCityOrArea = campaignType === 'TARGETED'
      ? formattedTargetedAdministrativeArea
      : (targetCityOrArea.trim() || 'Nasional / Seluruh Indonesia');

    const payload = {
      customerName: customerName.trim(),
      whatsapp: cleanWa,
      businessName: businessName.trim(),
      myAdsEmail: myAdsEmail.trim(),
      selectedPackageId: currentPkg?.id || 'custom',
      selectedPackageName: currentPkg?.name || 'Paket Promosi Iklan',
      estimatedBudget: `Rp ${effectiveTotalPayment.toLocaleString('id-ID')}`,
      targetCityOrArea: finalTargetCityOrArea,
      // Target Administrative breakdown for TARGETED
      targetProvince: selectedProvinceObj?.nama,
      targetCity: selectedKotaObj?.nama,
      targetDistrict: selectedKecamatanObj?.nama,
      targetVillage: selectedKelurahanObj?.nama,
      notes: notes.trim(),
      campaignType: isTopupPackage ? 'FLEXI TOP-UP' : campaignType,
      channelName: channelNames,
      channelRate: selectedChannelsList[0]?.ratePerUnit || 200, // Legacy fallback
      estimatedReach: effectiveReach,
      totalPayment: effectiveTotalPayment,
      // Sasaran GPS LBA & Parameter Kampanye
      latitude: gpsLatitude,
      longitude: gpsLongitude,
      radiusMeters: gpsRadiusMeters,
      streetAddress: streetAddress.trim(),
      broadcastDate: broadcastDate.trim(),
      adMessageContent: adMessageContent.trim(),
      webLink: webLink.trim(),
      senderName: senderName.trim().toUpperCase(),
      // 8 Kapabilitas Targeting
      targetAgeGroup: targetAgeGroup.trim(),
      targetReligion: targetReligion.trim(),
      targetGender: targetGender.trim(),
      targetArpuSpending: targetArpuSpending.trim(),
      targetSes: targetSes.trim(),
      targetDeviceOs: targetDeviceOs.trim(),
      targetMaritalStatus: targetMaritalStatus.trim(),
      targetInterests: targetInterests,
      // Upload List Kontak Excel/CSV (BROADCAST)
      uploadedListFileName: uploadedListFileName.trim(),
      uploadedListFileCount: uploadedListFileCount,
      uploadedListFileSize: uploadedListFileSize.trim(),
    };

    const newOrder = await submitOrder(payload);

    confetti({
      particleCount: 85,
      spread: 60,
      origin: { y: 0.6 },
    });

    setIsSubmitting(false);

    if (newOrder && typeof newOrder === 'object') {
      setCreatedOrder(newOrder);
    } else {
      setCreatedOrder({
        id: `ORD-${Date.now().toString().slice(-6)}`,
        createdAt: new Date().toISOString(),
        status: 'PENDING',
        ...payload,
      });
    }

    // Move to payment step & scroll container to top so customer immediately sees payment details
    setStep('PAYMENT');
    setTimeout(() => {
      const container = document.getElementById('order-modal-scroll-container');
      if (container) {
        container.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }, 80);
  };

  const handleOpenWhatsAppConfirmation = () => {
    if (!createdOrder) return;
    const targetBank = currentBankAccount || {
      bankName: companyConfig.bankName || 'BCA (Bank Central Asia)',
      accountNumber: companyConfig.bankAccountNumber || '0188-3333-7157',
      accountHolder: companyConfig.bankAccountHolder || 'PT Akardaya Telekomunikasi Indonesia',
    };

    const waText = isTopupPackage
      ? `Halo Admin ${companyConfig.brandName}, saya telah melakukan pemesanan Top-Up Saldo MyAds melalui aplikasi:\n\n` +
        `📋 *DETAIL PESANAN TOP-UP SALDO*\n` +
        `• No. Order: *${createdOrder.id}*\n` +
        `• Nama Pemesan: *${createdOrder.customerName}*\n` +
        `• Nama Usaha/Brand: *${createdOrder.businessName || '-'}*\n` +
        `• No. WhatsApp: *${createdOrder.whatsapp}*\n` +
        `• Email Akun MyAds: *${createdOrder.myAdsEmail || '-'}*\n` +
        `• Sasaran Lokasi/Area: *${createdOrder.targetCityOrArea || 'Nasional'}*\n\n` +
        `💰 *RINCIAN DEPOSIT SALDO*\n` +
        `• Paket Pilihan: *${createdOrder.selectedPackageName}*\n` +
        `• Nominal Top-Up: *Rp ${createdOrder.totalPayment?.toLocaleString('id-ID')}*\n` +
        `• Bonus Saldo: *+${bonusPercent}%${bonusAmount > 0 ? ` (+Rp ${bonusAmount.toLocaleString('id-ID')})` : ''}*\n` +
        `• Total Saldo Masuk Akun: *Rp ${((createdOrder.totalPayment || 0) + bonusAmount).toLocaleString('id-ID')}*\n` +
        `• Saluran Media: *Bebas Digunakan untuk Seluruh Saluran MyAds*\n` +
        (createdOrder.notes ? `• Catatan: ${createdOrder.notes}\n\n` : '\n') +
        `💳 *PEMBAYARAN RESMI*\n` +
        `• Total Transfer: *Rp ${createdOrder.totalPayment?.toLocaleString('id-ID')}*\n` +
        `• Bank Tujuan: *${targetBank.bankName}*\n` +
        `• No. Rekening: *${targetBank.accountNumber}*\n` +
        `• Atas Nama: *${targetBank.accountHolder}*\n\n` +
        `Bukti transfer pembayaran akan saya lampirkan di chat ini. Mohon verifikasi & pengisian saldo akun MyAds saya. Terima kasih!`
      : `Halo Admin ${companyConfig.brandName}, saya telah melakukan pemesanan iklan melalui aplikasi:\n\n` +
        `📋 *DETAIL PESANAN*\n` +
        `• No. Order: *${createdOrder.id}*\n` +
        `• Nama Pemesan: *${createdOrder.customerName}*\n` +
        `• Nama Usaha/Brand: *${createdOrder.businessName || '-'}*\n` +
        `• No. WhatsApp: *${createdOrder.whatsapp}*\n\n` +
        `🎯 *KONFIGURASI KAMPANYE*\n` +
        `• Paket Pilihan: *${createdOrder.selectedPackageName}*\n` +
        `• Tipe Kampanye: *${createdOrder.campaignType}*\n` +
        `• Saluran Media: *${createdOrder.channelName}*\n` +
        `• Target Lokasi/Area: *${createdOrder.targetCityOrArea || 'Nasional'}*\n` +
        (createdOrder.campaignType === 'TARGETED' || createdOrder.targetAgeGroup
          ? `\n🎯 *KAPABILITAS TARGETING*\n` +
            `• Rentang Usia: *${createdOrder.targetAgeGroup || 'Semua Usia'}*\n` +
            `• Segmentasi Religi: *${createdOrder.targetReligion || 'Semua Agama'}*\n` +
            `• Jenis Kelamin: *${createdOrder.targetGender || 'Semua Gender'}*\n` +
            `• ARPU Spending: *${createdOrder.targetArpuSpending || 'Semua ARPU'}*\n` +
            `• Status SES: *${createdOrder.targetSes || 'Semua SES'}*\n` +
            `• Device & OS: *${createdOrder.targetDeviceOs || 'Semua Device'}*\n` +
            `• Status Pernikahan: *${createdOrder.targetMaritalStatus || 'Semua Status'}*\n` +
            (createdOrder.targetInterests && createdOrder.targetInterests.length > 0
              ? `• Minat & Perilaku: *${createdOrder.targetInterests.join(', ')}*\n`
              : ''
            ) + '\n'
          : ''
        ) +
        (createdOrder.latitude && createdOrder.longitude
          ? `• Titik GPS & Radius: *Lat: ${createdOrder.latitude}, Lng: ${createdOrder.longitude} (Radius: ${createdOrder.radiusMeters >= 1000 ? `${(createdOrder.radiusMeters / 1000).toFixed(1)} km` : `${createdOrder.radiusMeters} Meter`})*\n` +
            (createdOrder.streetAddress ? `• Alamat Jalan: *${createdOrder.streetAddress}*\n` : '')
          : ''
        ) +
        (createdOrder.uploadedListFileName
          ? `• File List Kontak: *${createdOrder.uploadedListFileName}* (${createdOrder.uploadedListFileSize || ''}${createdOrder.uploadedListFileCount ? ` • ~${createdOrder.uploadedListFileCount} Nomor` : ''})\n`
          : ''
        ) +
        (createdOrder.broadcastDate ? `• Tanggal Broadcast (H+3): *${createdOrder.broadcastDate}*\n` : '') +
        (createdOrder.senderName ? `• Sender / Masking: *${createdOrder.senderName}*\n` : '') +
        (createdOrder.adMessageContent ? `• Isi Pesan Iklan (160 char): *"${createdOrder.adMessageContent}"*\n` : '') +
        (createdOrder.webLink ? `• Link Web/Promo: *${createdOrder.webLink}*\n` : '') +
        `• Estimasi Jangkauan: *~${createdOrder.estimatedReach?.toLocaleString('id-ID')} Penerima*\n` +
        (isOneKlik
          ? `• Bonus Saldo: *Tidak Ada (Paket One Klik Terima Jadi)*\n`
          : `• Bonus Saldo: *+${bonusPercent}%${bonusAmount > 0 ? ` (+Rp ${bonusAmount.toLocaleString('id-ID')})` : ''}*\n` +
            (bonusAmount > 0 ? `• Total Saldo Masuk Akun: *Rp ${(effectiveTotalSubtotal + bonusAmount).toLocaleString('id-ID')}*\n` : '')
        ) +
        (createdOrder.notes ? `• Catatan Khusus: ${createdOrder.notes}\n\n` : '\n') +
        `💳 *PEMBAYARAN RESMI*\n` +
        `• Total Transfer: *Rp ${createdOrder.totalPayment?.toLocaleString('id-ID')}*\n` +
        `• Bank Tujuan: *${targetBank.bankName}*\n` +
        `• No. Rekening: *${targetBank.accountNumber}*\n` +
        `• Atas Nama: *${targetBank.accountHolder}*\n\n` +
        `Bukti transfer pembayaran akan saya lampirkan di chat ini. Mohon verifikasi & aktivasi jadwal kampanye iklan. Terima kasih!`;

    const waUrl = `https://wa.me/${companyConfig.waNumber}?text=${encodeURIComponent(waText)}`;
    window.open(waUrl, '_blank');
  };

  return (
    <div
      id="modal-order-consultation"
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in"
    >
      <div
        id="order-modal-scroll-container"
        className="w-full max-w-2xl max-h-[92vh] sm:max-h-[90vh] overflow-y-auto rounded-t-3xl sm:rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl animate-in slide-in-from-bottom sm:zoom-in-95 flex flex-col"
      >
        {/* Mobile Drag Indicator Handle */}
        <div className="sm:hidden pt-2.5 pb-1 flex justify-center">
          <div className="w-12 h-1.5 bg-slate-300 dark:bg-slate-700 rounded-full"></div>
        </div>

        {/* Header */}
        <div className="sticky top-0 z-20 flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xs">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 shrink-0">
              {step === 'FORM' ? <Target className="w-5 h-5" /> : <CreditCard className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white leading-tight">
                  {step === 'FORM' ? 'Formulir Pemesanan Iklan' : 'Detail & Petunjuk Pembayaran'}
                </h3>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  step === 'FORM'
                    ? 'bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800'
                    : 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                }`}>
                  {step === 'FORM' ? 'Langkah 1/2' : 'Langkah 2/2'}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                {step === 'FORM'
                  ? 'Pilih tipe kampanye, jenis saluran media & estimasi jangkauan audiens'
                  : 'Selesaikan transfer bank ke rekening resmi admin di bawah ini'}
              </p>
            </div>
          </div>
          <button
            id="btn-close-order-modal"
            onClick={() => setIsOrderModalOpen(false)}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 active:scale-95 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* STEP 1: FORM PEMESANAN */}
        {step === 'FORM' && (
          <form onSubmit={handleSubmitOrder} className="p-4 sm:p-6 space-y-5 overflow-y-auto">
            {/* Selected Package Highlight Bar */}
            {currentPkg && (
              <div className="p-3.5 rounded-2xl bg-gradient-to-r from-blue-50 to-indigo-50/70 dark:from-blue-950/40 dark:to-indigo-950/30 border border-blue-200/80 dark:border-blue-900/60 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center font-black text-sm shrink-0 shadow-xs">
                    1
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] uppercase font-extrabold tracking-wider text-blue-700 dark:text-blue-300">
                        Paket Dasar
                      </span>
                      <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400">
                        ({currentPkg.categoryTitle})
                      </span>
                    </div>
                    <strong className="text-slate-900 dark:text-white font-bold text-sm sm:text-base">
                      {currentPkg.name}
                    </strong>
                    <p className="text-[11px] text-slate-600 dark:text-slate-400">
                      Termasuk gratis {currentPkg.freeContentPerMonth}x Desain Promosi
                      {currentPkg.freeWebsiteMonths > 0 ? ' + Web 3 Bulan' : ''} & Dashboard Laporan
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 sm:self-center">
                  <select
                    value={selectedPackageId}
                    onChange={(e) => handleSelectPackage(e.target.value)}
                    className="text-xs px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-medium cursor-pointer"
                  >
                    {packages.map((pkg) => (
                      <option key={pkg.id} value={pkg.id}>
                        Ganti: {pkg.name} ({pkg.priceDisplay})
                      </option>
                    ))}
                  </select>
                  {isOneKlik ? (
                    <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-[10px] shrink-0 border border-slate-200 dark:border-slate-700">
                      Terima Jadi (Tanpa Bonus)
                    </span>
                  ) : bonusPercent > 0 ? (
                    <span className="px-2.5 py-1 rounded-lg bg-emerald-600 text-white font-extrabold text-[10px] shrink-0">
                      Bonus +{bonusPercent}%
                    </span>
                  ) : null}
                </div>
              </div>
            )}

            {/* HIDE SECTION 1 & 2 FOR TOPUP PACKAGES */}
            {!isTopupPackage && (
              <>
                {/* Section 1: PILIHAN TIPE KAMPANYE (LBA / BROADCAST / TARGETED) */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                      <span>1. Pilih Tipe Kampanye Iklan</span>
                      <span className="text-rose-500">*</span>
                    </label>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400">
                      Klik salah satu tipe:
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    {/* LBA Card */}
                    <button
                      type="button"
                      onClick={() => setCampaignType('LBA')}
                      className={`p-3.5 rounded-xl text-left border transition-all relative flex flex-col justify-between min-h-[96px] ${
                        campaignType === 'LBA'
                          ? 'border-blue-600 bg-blue-50/80 dark:bg-blue-950/40 ring-2 ring-blue-600/30'
                          : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-850 hover:border-slate-300 dark:hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300">
                          <MapPin className="w-4 h-4" />
                        </div>
                        {campaignType === 'LBA' && (
                          <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center">
                            <Check className="w-3 h-3" />
                          </span>
                        )}
                      </div>
                      <div className="mt-2">
                        <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white leading-tight">
                          LBA (Location Based)
                        </h4>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">
                          Target radius toko / outlet real-time (500m - 5km).
                        </p>
                      </div>
                    </button>

                    {/* BROADCAST Card */}
                    <button
                      type="button"
                      onClick={() => setCampaignType('BROADCAST')}
                      className={`p-3.5 rounded-xl text-left border transition-all relative flex flex-col justify-between min-h-[96px] ${
                        campaignType === 'BROADCAST'
                          ? 'border-purple-600 bg-purple-50/80 dark:bg-purple-950/40 ring-2 ring-purple-600/30'
                          : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-850 hover:border-slate-300 dark:hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/60 text-purple-700 dark:text-purple-300">
                          <Megaphone className="w-4 h-4" />
                        </div>
                        {campaignType === 'BROADCAST' && (
                          <span className="w-5 h-5 rounded-full bg-purple-600 text-white flex items-center justify-center">
                            <Check className="w-3 h-3" />
                          </span>
                        )}
                      </div>
                      <div className="mt-2">
                        <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white leading-tight">
                          Broadcast (Massal)
                        </h4>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">
                          Pesan serentak volume tinggi ke ribuan nomor HP pelanggan.
                        </p>
                      </div>
                    </button>

                    {/* TARGETED Card */}
                    <button
                      type="button"
                      onClick={() => setCampaignType('TARGETED')}
                      className={`p-3.5 rounded-xl text-left border transition-all relative flex flex-col justify-between min-h-[96px] ${
                        campaignType === 'TARGETED'
                          ? 'border-emerald-600 bg-emerald-50/80 dark:bg-emerald-950/40 ring-2 ring-emerald-600/30'
                          : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-850 hover:border-slate-300 dark:hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300">
                          <Users className="w-4 h-4" />
                        </div>
                        {campaignType === 'TARGETED' && (
                          <span className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center">
                            <Check className="w-3 h-3" />
                          </span>
                        )}
                      </div>
                      <div className="mt-2">
                        <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white leading-tight">
                          Targeted (Profil Khusus)
                        </h4>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">
                          Filter gender, usia, minat & daya beli pulsa (ARPU).
                        </p>
                      </div>
                    </button>
                  </div>
                </div>

                {/* Section 2: PILIHAN JENIS SALURAN MEDIA */}
                <div>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-2">
                    <label className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                      <span>2. Pilih Jenis Saluran Media ({campaignType})</span>
                      <span className="text-rose-500">*</span>
                    </label>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-300">
                        Budget Paket: Rp {getPackageBudgetRange(currentPkg).maxBudget.toLocaleString('id-ID')}
                      </span>
                      <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                        ({availableChannels.length} Media Tersedia)
                      </span>
                    </div>
                  </div>

                  {/* Real-time Budget Allocation Tracker Bar */}
                  {selectedChannelsList.length > 0 && (
                    <div className="mb-2.5 px-3 py-2 bg-slate-50 dark:bg-slate-850 rounded-xl border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[11px] font-medium text-slate-600 dark:text-slate-400">
                          Total Terpakai ({selectedChannelsList.length} Saluran):
                        </span>
                        <span className="font-bold text-slate-900 dark:text-white">
                          Rp {totalSubtotal.toLocaleString('id-ID')}
                        </span>
                        <span className="text-slate-400 text-[10px]">/</span>
                        <span className="text-[11px] text-slate-500 dark:text-slate-400">
                          Rp {getPackageBudgetRange(currentPkg).maxBudget.toLocaleString('id-ID')}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        {totalSubtotal >= getPackageBudgetRange(currentPkg).maxBudget ? (
                          <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-100/80 dark:bg-emerald-950/60 px-2.5 py-0.5 rounded-full border border-emerald-300 dark:border-emerald-800">
                            ✓ 100% Pas Sesuai Paket
                          </span>
                        ) : (
                          <span className="text-[10px] font-medium text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded-full border border-amber-200 dark:border-amber-800">
                            Sisa Budget: Rp {(getPackageBudgetRange(currentPkg).maxBudget - totalSubtotal).toLocaleString('id-ID')}
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-[460px] overflow-y-auto p-1">
                    {availableChannels.map((ch) => {
                      const qty = channelQuantities[ch.id];
                      const isSelected = qty !== undefined && qty > 0;
                      const cost = (qty || 0) * ch.ratePerUnit;

                      return (
                        <div
                          key={ch.id}
                          className={`rounded-xl border transition-all overflow-hidden flex flex-col justify-between ${
                            isSelected
                              ? 'border-blue-600 bg-blue-50/30 dark:bg-blue-950/20 ring-1 ring-blue-500 shadow-xs'
                              : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-850 hover:border-slate-300'
                          }`}
                        >
                          {/* Card Header / Toggle Button */}
                          <button
                            type="button"
                            onClick={() => handleToggleChannel(ch)}
                            className="w-full p-2.5 sm:p-3 flex items-start justify-between gap-2 text-left flex-1"
                          >
                            <div className="flex items-start gap-2.5 flex-1 min-w-0">
                              <div className={`mt-0.5 w-4 h-4 sm:w-5 sm:h-5 rounded border flex items-center justify-center shrink-0 transition-colors ${
                                isSelected 
                                  ? 'bg-blue-600 border-blue-600 text-white' 
                                  : 'bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 text-transparent'
                              }`}>
                                <Check className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                              </div>
                              <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-1.5 flex-wrap">
                                  <span className="text-xs font-bold text-slate-900 dark:text-white truncate">
                                    {ch.facility}
                                  </span>
                                  <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 uppercase">
                                    {ch.unit}
                                  </span>
                                </div>
                                <p className="text-[10px] text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">
                                  {ch.description}
                                </p>
                              </div>
                            </div>
                            <div className="text-right shrink-0">
                              <span className="text-xs font-extrabold text-emerald-600 dark:text-emerald-400 block">
                                {ch.rateDisplay}
                              </span>
                              <span className="text-[9px] text-slate-400 dark:text-slate-500">
                                {ch.unit}
                              </span>
                            </div>
                          </button>

                          {/* Expanded Slider & Quantity Section */}
                          {isSelected && (() => {
                            const pkgRange = getPackageBudgetRange(currentPkg);
                            const channelMaxBudget = pkgRange.maxBudget;
                            
                            // Other channels' cost
                            const otherCost = totalSubtotal - (cost || 0);
                            const remainingBudgetForThis = Math.max(0, channelMaxBudget - otherCost);
                            const maxQtyForChannel = Math.floor(remainingBudgetForThis / (ch.ratePerUnit || 200));
                            const effectiveSliderMax = Math.max(0, maxQtyForChannel);

                            return (
                              <div className="px-3 pb-3 pt-2 bg-blue-50/50 dark:bg-blue-950/40 border-t border-blue-100 dark:border-blue-900/50 space-y-2">
                                <div className="flex items-center justify-between gap-2">
                                  <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                                    Jumlah {ch.unit}:
                                  </label>
                                  <div className="flex items-center gap-1">
                                    <input
                                      type="number"
                                      min="0"
                                      max={maxQtyForChannel}
                                      value={qty || 0}
                                      onChange={(e) => handleChannelQtyChange(ch.id, parseInt(e.target.value) || 0)}
                                      className="w-20 text-right px-2 py-1 text-xs font-bold rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-blue-700 dark:text-blue-400 focus:ring-1 focus:ring-blue-500 shadow-2xs"
                                    />
                                  </div>
                                </div>
                                
                                <div className="py-0.5">
                                  <input
                                    type="range"
                                    min="0"
                                    max={effectiveSliderMax}
                                    step="10"
                                    value={qty || 0}
                                    onChange={(e) => handleChannelQtyChange(ch.id, parseInt(e.target.value))}
                                    className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-600 block"
                                  />
                                  <div className="flex items-center justify-between text-[9px] text-slate-400 dark:text-slate-500 font-medium mt-1">
                                    <span>Min: 0</span>
                                    <span className={selectedChannelsList.length > 1 ? "text-blue-600 dark:text-blue-400 font-semibold" : "text-blue-600 dark:text-blue-400 font-semibold"}>
                                      {selectedChannelsList.length > 1
                                        ? `Batas Saluran: ${maxQtyForChannel.toLocaleString('id-ID')} ${ch.unit} (Maks: Rp ${remainingBudgetForThis.toLocaleString('id-ID')})`
                                        : `Maks Paket: ${maxQtyForChannel.toLocaleString('id-ID')} ${ch.unit} (Rp ${channelMaxBudget.toLocaleString('id-ID')})`}
                                    </span>
                                  </div>
                                </div>
                                
                                <div className="flex items-center justify-between pt-1.5 border-t border-blue-100/70 dark:border-blue-900/50">
                                  <span className="text-[10px] text-slate-500 dark:text-slate-400">Subtotal:</span>
                                  <span className="text-xs font-bold text-slate-900 dark:text-white">
                                    Rp {cost.toLocaleString('id-ID')}
                                  </span>
                                </div>
                              </div>
                            );
                          })()}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </>
            )}

            {/* Section 3: ESTIMASI PEMBAYARAN & KALKULASI JANGKAUAN */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-750">
              <div className="flex items-center justify-between mb-3">
                <label className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <Coins className="w-4 h-4 text-amber-500" />
                  <span>
                    {isTopupPackage ? '1. Pilihan Top-Up Saldo Iklan' : '3. Estimasi Total Pembayaran'}
                  </span>
                </label>
                {isOneKlik ? (
                  <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2.5 py-0.5 rounded-md border border-slate-200 dark:border-slate-700">
                    Paket Terima Jadi (Tanpa Bonus Saldo)
                  </span>
                ) : bonusPercent > 0 ? (
                  <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                    Bonus Saldo +{bonusPercent}%
                  </span>
                ) : null}
              </div>

              {isTopupPackage ? (
                <div className="space-y-3.5 mb-3">
                  {/* Top-up Budget Highlight Card with Slider */}
                  <div className="p-3.5 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-2xs">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div>
                        <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 block">
                          Nominal Top-Up Dipilih:
                        </span>
                        <div className="text-xl sm:text-2xl font-black text-blue-600 dark:text-blue-400 tracking-tight flex items-baseline gap-1">
                          <span>Rp {budgetAmount.toLocaleString('id-ID')}</span>
                        </div>
                        {bonusPercent > 0 && bonusAmount > 0 && (
                          <div className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1 mt-0.5">
                            <span>Total Saldo Masuk:</span>
                            <span className="font-extrabold">Rp {(budgetAmount + bonusAmount).toLocaleString('id-ID')}</span>
                            <span className="text-[10px] bg-emerald-100 dark:bg-emerald-950 px-1.5 py-0.5 rounded-full font-bold">
                              +Rp {bonusAmount.toLocaleString('id-ID')} ({bonusPercent}%)
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="text-right">
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 text-xs font-bold border border-blue-100 dark:border-blue-900/60">
                          {currentPkg?.tierName?.includes('≥') || currentPkg?.priceDisplay?.includes('≥') || currentPkg?.tierName?.includes('>=') || currentPkg?.priceDisplay?.includes('>=')
                            ? `Batas Paket: ≥ Rp ${topupMinBudget.toLocaleString('id-ID')}`
                            : `Batas Paket: Rp ${topupMinBudget.toLocaleString('id-ID')} - Rp ${topupMaxBudget.toLocaleString('id-ID')}`}
                        </span>
                        <span className="text-[10px] text-slate-400 block mt-0.5 font-medium">
                          {currentPkg?.name || 'Paket Mandiri'}
                        </span>
                      </div>
                    </div>

                    {/* Interactive Range Slider */}
                    <div className="mt-3.5 pt-3 border-t border-slate-100 dark:border-slate-700/60">
                      <div className="flex items-center justify-between text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-2">
                        <span className="flex items-center gap-1">
                          <span>Geser Slider Anggaran:</span>
                          <span className="text-[10px] font-normal text-slate-400">(Sesuai Batas Paket)</span>
                        </span>
                        <span className="text-blue-600 dark:text-blue-400 font-extrabold text-xs sm:text-sm">
                          Rp {budgetAmount.toLocaleString('id-ID')}
                        </span>
                      </div>
                      
                      {(() => {
                        const percent = Math.min(
                          100,
                          Math.max(0, Math.round(((budgetAmount - topupMinBudget) / Math.max(1, topupMaxBudget - topupMinBudget)) * 100))
                        );
                        return (
                          <div className="relative py-1">
                            <input
                              type="range"
                              min={topupMinBudget}
                              max={topupMaxBudget}
                              step={topupSliderStep}
                              value={Math.min(topupMaxBudget, Math.max(topupMinBudget, budgetAmount))}
                              onChange={handleTopupSliderChange}
                              style={{
                                background: `linear-gradient(to right, #2563eb 0%, #2563eb ${percent}%, #cbd5e1 ${percent}%, #cbd5e1 100%)`
                              }}
                              className="w-full h-2.5 rounded-lg appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                            />
                            <div className="flex justify-between items-center text-[10px] font-semibold text-slate-400 dark:text-slate-500 mt-2">
                              <span className="text-slate-600 dark:text-slate-400">
                                Min: Rp {topupMinBudget.toLocaleString('id-ID')}
                              </span>
                              <span className="px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 font-extrabold text-[10px] border border-blue-200/60 dark:border-blue-800/60">
                                {percent}%
                              </span>
                              <span className="text-slate-900 dark:text-slate-200 font-bold">
                                {currentPkg?.tierName?.includes('≥') || currentPkg?.priceDisplay?.includes('≥') || currentPkg?.tierName?.includes('>=') || currentPkg?.priceDisplay?.includes('>=')
                                  ? `Maks Slider: Rp ${topupMaxBudget.toLocaleString('id-ID')}`
                                  : `Maks: Rp ${topupMaxBudget.toLocaleString('id-ID')}`}
                              </span>
                            </div>
                          </div>
                        );
                      })()}
                    </div>
                  </div>

                  {/* Skema Aturan Bonus Saldo (Sinkron Admin Dashboard) */}
                  {discountConfig.isPromoActive && discountConfig.monetaryTiers && discountConfig.monetaryTiers.length > 0 && (
                    <div className="p-3 rounded-xl bg-gradient-to-br from-emerald-50/80 via-teal-50/50 to-blue-50/60 dark:from-emerald-950/30 dark:via-teal-950/20 dark:to-blue-950/20 border border-emerald-200/80 dark:border-emerald-800/60">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-1.5">
                          <Sparkles className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                          <span className="text-[11px] font-bold text-slate-800 dark:text-slate-200">
                            Aturan Bonus Saldo (Sinkron Dashboard Admin):
                          </span>
                        </div>
                        <span className="text-[10px] font-extrabold text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-900/80 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
                          Aktif: +{bonusPercent}% Bonus
                        </span>
                      </div>

                      {/* Tier chips grid */}
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                        {discountConfig.monetaryTiers.map((tier) => {
                          const min = tier.minAmount ?? 0;
                          const max = tier.maxAmount ?? Infinity;
                          const isCurrentTierActive = budgetAmount >= min && budgetAmount <= max;
                          const canSelectTier = tier.minAmount !== null && tier.minAmount >= topupMinBudget && tier.minAmount <= topupMaxBudget;

                          return (
                            <button
                              key={tier.id}
                              type="button"
                              onClick={() => {
                                if (canSelectTier && tier.minAmount) {
                                  handleBudgetSelect(tier.minAmount);
                                }
                              }}
                              disabled={!canSelectTier}
                              title={canSelectTier ? `Klik untuk pilih nominal Rp ${tier.minAmount?.toLocaleString('id-ID')}` : 'Di luar batas paket ini'}
                              className={`p-2 rounded-lg text-left transition-all relative border text-xs ${
                                isCurrentTierActive
                                  ? 'bg-white dark:bg-slate-800 border-emerald-500 shadow-xs ring-2 ring-emerald-500/25'
                                  : 'bg-white/60 dark:bg-slate-800/60 border-slate-200/80 dark:border-slate-700/80 hover:bg-white dark:hover:bg-slate-800'
                              } ${!canSelectTier ? 'opacity-65 cursor-default' : 'cursor-pointer'}`}
                            >
                              <div className="flex items-center justify-between gap-1">
                                <span className="text-[10px] font-bold text-slate-600 dark:text-slate-300 truncate">
                                  {tier.label || `Rp ${tier.minAmount?.toLocaleString('id-ID')}`}
                                </span>
                                {isCurrentTierActive && (
                                  <span className="flex h-2 w-2 relative">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                                  </span>
                                )}
                              </div>
                              <div className="mt-0.5 flex items-baseline justify-between">
                                <span className="text-xs font-black text-emerald-600 dark:text-emerald-400">
                                  +{tier.bonusPercent}% Saldo
                                </span>
                                {isCurrentTierActive && (
                                  <span className="text-[9px] font-extrabold text-emerald-700 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-950 px-1 py-0.2 rounded">
                                    ✓ Aktif
                                  </span>
                                )}
                              </div>
                            </button>
                          );
                        })}
                      </div>

                      {/* Next tier incentive notice */}
                      {nextTierInfo ? (
                        <div className="mt-2.5 pt-2 border-t border-emerald-200/60 dark:border-emerald-800/40 flex flex-wrap items-center justify-between gap-2">
                          <div className="text-[11px] text-slate-700 dark:text-slate-300">
                            <span>💡 Tambah </span>
                            <strong className="text-emerald-700 dark:text-emerald-300 font-bold">
                              Rp {nextTierInfo.needed.toLocaleString('id-ID')}
                            </strong>
                            <span> lagi untuk membuka </span>
                            <strong className="text-emerald-700 dark:text-emerald-300 font-bold">
                              Bonus Saldo +{nextTierInfo.nextTier.bonusPercent}%!
                            </strong>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleBudgetSelect(nextTierInfo.targetAmount)}
                            className="px-2.5 py-1 rounded-lg text-[11px] font-extrabold bg-emerald-600 hover:bg-emerald-700 text-white transition-all shadow-xs flex items-center gap-1 cursor-pointer"
                          >
                            <span>Ambil Bonus +{nextTierInfo.nextTier.bonusPercent}%</span>
                            <ArrowRight className="w-3 h-3" />
                          </button>
                        </div>
                      ) : bonusPercent > 0 ? (
                        <div className="mt-2.5 pt-2 border-t border-emerald-200/60 dark:border-emerald-800/40 text-[11px] text-emerald-800 dark:text-emerald-300 font-semibold flex items-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                          <span>
                            Selamat! Anda menikmati bonus saldo tertinggi saat ini: <strong>+{bonusPercent}% (+Rp {bonusAmount.toLocaleString('id-ID')})</strong>.
                          </span>
                        </div>
                      ) : null}
                    </div>
                  )}

                  {/* Quick Presets matching package boundaries & bonus tiers */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-400">
                        Pilihan Cepat Nominal Top-Up:
                      </span>
                      <span className="text-[10px] text-slate-400">
                        (Tersinkron dengan Aturan Bonus Admin)
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 overflow-x-auto pb-1.5">
                      {topupPresets.map((bp) => {
                        const isSelected = budgetAmount === bp.amount;
                        return (
                          <button
                            key={bp.amount}
                            type="button"
                            onClick={() => handleBudgetSelect(bp.amount)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${
                              isSelected
                                ? 'bg-blue-600 text-white shadow-xs ring-2 ring-blue-600/30'
                                : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-750'
                            }`}
                          >
                            <span>{bp.label}</span>
                            {bp.bonusPercent > 0 && (
                              <span
                                className={`px-1.5 py-0.5 rounded text-[10px] font-extrabold ${
                                  isSelected
                                    ? 'bg-emerald-500 text-white'
                                    : 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                                }`}
                              >
                                +{bp.bonusPercent}%
                              </span>
                            )}
                            {bp.tag && (
                              <span
                                className={`text-[9px] font-medium ${
                                  isSelected ? 'text-blue-100' : 'text-slate-400'
                                }`}
                              >
                                ({bp.tag})
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Custom Input */}
                  <div className="pt-2 border-t border-slate-200 dark:border-slate-750">
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400">
                        Atau Ketik Nominal Kustom (Rp):
                      </label>
                      <span className="text-[10px] text-slate-400">
                        Batas: Rp {topupMinBudget.toLocaleString('id-ID')} - Rp {topupMaxBudget.toLocaleString('id-ID')}
                      </span>
                    </div>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                        Rp
                      </span>
                      <input
                        type="text"
                        value={customBudgetInput}
                        onChange={handleCustomBudgetChange}
                        className="w-full pl-9 pr-3 py-2 text-sm font-bold rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500/30"
                        placeholder={topupMinBudget.toString()}
                      />
                    </div>
                    {budgetAmount > topupMaxBudget && (
                      <p className="text-[11px] text-amber-600 dark:text-amber-400 font-medium mt-1">
                        *Nominal melebihi batas maksimal paket ini (Maks. Rp {topupMaxBudget.toLocaleString('id-ID')}).
                      </p>
                    )}
                  </div>
                </div>
              ) : (
                /* Selected Channels Breakdown Summary */
                selectedChannelsList.length > 0 ? (
                  <div className="mb-3 space-y-1.5 bg-white dark:bg-slate-800 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700">
                    {selectedChannelsList.map(ch => {
                      const qty = channelQuantities[ch.id] || 0;
                      return (
                        <div key={ch.id} className="flex justify-between items-center text-[11px]">
                          <span className="text-slate-600 dark:text-slate-300">
                            {ch.facility} <span className="text-slate-400">x {qty.toLocaleString('id-ID')}</span>
                          </span>
                          <span className="font-semibold text-slate-800 dark:text-slate-200">
                            Rp {(qty * ch.ratePerUnit).toLocaleString('id-ID')}
                          </span>
                        </div>
                      );
                    })}
                    {bonusPercent > 0 && !isOneKlik && (
                      <div className="pt-1.5 mt-1.5 border-t border-slate-100 dark:border-slate-700 flex justify-between items-center text-[11px]">
                        <span className="text-slate-500">Nilai Bonus Saldo ({bonusPercent}%):</span>
                        <span className="font-bold text-emerald-600">
                          + Rp {bonusAmount.toLocaleString('id-ID')}
                        </span>
                      </div>
                    )}
                    {isOneKlik && (
                      <div className="pt-1.5 mt-1.5 border-t border-slate-100 dark:border-slate-700 flex justify-between items-center text-[11px] text-slate-500 dark:text-slate-400">
                        <span>Fasilitas Paket One Klik:</span>
                        <span className="font-semibold text-slate-700 dark:text-slate-300">
                          Layanan Terima Jadi (Tanpa Bonus Saldo)
                        </span>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="mb-3 text-center p-3 border border-dashed border-rose-200 bg-rose-50 rounded-xl text-rose-600 text-xs font-medium">
                    Belum ada saluran media yang dipilih.
                  </div>
                )
              )}

              {/* Live Highlight: Estimated Reach & Total Payment */}
              <div className="p-3.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-700 text-white flex items-center justify-between shadow-xs">
                <div>
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-100 block">
                    Total Estimasi Jangkauan
                  </span>
                  <div className="text-xl sm:text-2xl font-black leading-tight flex items-baseline gap-1.5">
                    <span>~{effectiveReach.toLocaleString('id-ID')}</span>
                    <span className="text-xs font-medium text-emerald-100">Penerima</span>
                  </div>
                  <p className="text-[10px] text-emerald-100/90 mt-0.5">
                    {isOneKlik
                      ? '*Estimasi total jangkauan penerima iklan'
                      : '*Total akumulasi semua media + bonus saldo'}
                  </p>
                </div>

                <div className="text-right pl-3 border-l border-white/20">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-100 block">
                    Total Pembayaran
                  </span>
                  <div className="text-lg sm:text-xl font-black">
                    Rp {effectiveTotalPayment.toLocaleString('id-ID')}
                  </div>
                </div>
              </div>
            </div>

            {/* Section 4: DATA PEMESAN & LOKASI TARGET */}
            <div className="space-y-3 pt-1">
              <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                {isTopupPackage ? '2. Data Pemesan & Sasaran Lokasi' : '4. Data Pemesan & Sasaran Lokasi'}
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Nama Lengkap Anda <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      placeholder="Contoh: Rian Pratama"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      className="w-full pl-9 pr-3.5 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500/20"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Nomor WhatsApp Aktif <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <PhoneCall className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="tel"
                      required
                      placeholder="Contoh: 081333337157"
                      value={whatsapp}
                      onChange={(e) => setWhatsapp(e.target.value)}
                      className="w-full pl-9 pr-3.5 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500/20 font-mono font-medium"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Nama Toko / Usaha / Brand
                  </label>
                  <div className="relative">
                    <Building2 className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Contoh: Toko Berkah Jaya"
                      value={businessName}
                      onChange={(e) => setBusinessName(e.target.value)}
                      className="w-full pl-9 pr-3.5 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500/20"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                      <span>Target Lokasi / Sasaran Area</span>
                      {!isTopupPackage && campaignType === 'LBA' ? (
                        <span className="text-[10px] text-blue-600 dark:text-blue-400 font-bold bg-blue-50 dark:bg-blue-900/40 px-1.5 py-0.5 rounded">
                          Wajib Titik GPS LBA
                        </span>
                      ) : !isTopupPackage && campaignType === 'TARGETED' ? (
                        <span className="text-[10px] text-rose-600 dark:text-rose-400 font-bold bg-rose-50 dark:bg-rose-900/40 px-1.5 py-0.5 rounded">
                          Wilayah Administratif Nasional
                        </span>
                      ) : null}
                    </label>
                    {!isTopupPackage && campaignType === 'LBA' && (
                      <button
                        type="button"
                        onClick={() => setIsMapModalOpen(true)}
                        className="text-[11px] font-bold text-blue-600 dark:text-blue-400 hover:text-blue-700 flex items-center gap-1 hover:underline transition-all"
                      >
                        <Compass className="w-3.5 h-3.5" />
                        <span>{gpsLatitude ? 'Ubah Titik GPS' : 'Pilih di Peta (GPS)'}</span>
                      </button>
                    )}
                  </div>

                  {!isTopupPackage && campaignType === 'TARGETED' ? (
                    /* TARGETED: Pilih Provinsi, Kota, Kecamatan, Kelurahan (Data Wilayah Nasional) */
                    <div className="space-y-2 p-3 bg-rose-50/50 dark:bg-slate-850/60 rounded-xl border border-rose-200/80 dark:border-rose-900/40">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold text-rose-700 dark:text-rose-400 flex items-center gap-1.5">
                          <Landmark className="w-3.5 h-3.5 text-rose-600" />
                          <span>Pilihan Wilayah Sasaran Profiling:</span>
                        </span>
                        <span className="text-[10px] text-slate-500 font-medium">Data Nasional Kemendagri / BPS</span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {/* 1. Provinsi */}
                        <div>
                          <label className="block text-[10px] font-bold text-slate-700 dark:text-slate-300 mb-0.5">
                            Provinsi:
                          </label>
                          <select
                            value={targetProvinceId}
                            onChange={(e) => {
                              const newProv = e.target.value;
                              setTargetProvinceId(newProv);
                              // Auto pick first kota for this prov
                              const matchedKotas = DAFTAR_KOTA.filter(k => k.provinsiId === newProv);
                              const defaultKotaId = matchedKotas[0]?.id || '';
                              setTargetCityId(defaultKotaId);
                              setTargetDistrictId('');
                              setTargetVillageId('');
                            }}
                            className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-medium focus:ring-1 focus:ring-rose-500"
                          >
                            <option value="">Semua Provinsi (Nasional)</option>
                            {DAFTAR_PROVINSI.map((p) => (
                              <option key={p.id} value={p.id}>
                                {p.nama}
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* 2. Kota / Kabupaten */}
                        <div>
                          <label className="block text-[10px] font-bold text-slate-700 dark:text-slate-300 mb-0.5">
                            Kota / Kabupaten:
                          </label>
                          <select
                            value={targetCityId}
                            onChange={(e) => {
                              const newKota = e.target.value;
                              setTargetCityId(newKota);
                              setTargetDistrictId('');
                              setTargetVillageId('');
                            }}
                            className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-medium focus:ring-1 focus:ring-rose-500"
                          >
                            <option value="">Semua Kota/Kabupaten ({selectedProvinceObj?.nama || 'Nasional'})</option>
                            {filteredKotaList.map((k) => (
                              <option key={k.id} value={k.id}>
                                {k.nama}
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* 3. Kecamatan */}
                        <div>
                          <label className="block text-[10px] font-bold text-slate-700 dark:text-slate-300 mb-0.5">
                            Kecamatan:
                          </label>
                          <select
                            value={targetDistrictId}
                            onChange={(e) => {
                              const newDistrict = e.target.value;
                              setTargetDistrictId(newDistrict);
                              setTargetVillageId('');
                            }}
                            disabled={!targetCityId}
                            className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-medium focus:ring-1 focus:ring-rose-500 disabled:opacity-50"
                          >
                            <option value="">Semua Kecamatan ({selectedKotaObj?.nama || 'Pilih Kota Terlebih Dahulu'})</option>
                            {filteredKecamatanList.map((kc) => (
                              <option key={kc.id} value={kc.id}>
                                Kec. {kc.nama}
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* 4. Kelurahan / Desa */}
                        <div>
                          <label className="block text-[10px] font-bold text-slate-700 dark:text-slate-300 mb-0.5">
                            Kelurahan / Desa:
                          </label>
                          <select
                            value={targetVillageId}
                            onChange={(e) => setTargetVillageId(e.target.value)}
                            disabled={!targetDistrictId}
                            className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-medium focus:ring-1 focus:ring-rose-500 disabled:opacity-50"
                          >
                            <option value="">Semua Kelurahan ({selectedKecamatanObj ? `Kec. ${selectedKecamatanObj.nama}` : 'Pilih Kecamatan Terlebih Dahulu'})</option>
                            {filteredKelurahanList.map((kl) => (
                              <option key={kl.id} value={kl.id}>
                                Kel. {kl.nama} {kl.kodePos ? `(${kl.kodePos})` : ''}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      {/* Summary Tag Wilayah Terpilih */}
                      <div className="pt-2 mt-1 border-t border-rose-200/60 dark:border-rose-900/40 flex items-center gap-1.5 text-[11px] text-slate-700 dark:text-slate-300">
                        <MapPin className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                        <span className="text-slate-500 text-[10px]">Sasaran Terkonfigurasi:</span>
                        <strong className="text-rose-700 dark:text-rose-400 font-bold truncate">
                          {formattedTargetedAdministrativeArea}
                        </strong>
                      </div>
                    </div>
                  ) : (
                    /* LBA / BROADCAST / TOPUP / DEFAULT VIEW */
                    <div className="relative">
                      <MapPin className="w-4 h-4 text-blue-600 dark:text-blue-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        placeholder={!isTopupPackage && campaignType === 'LBA' ? 'Klik untuk memilih titik GPS di Peta & radius...' : 'Contoh: Kota Surabaya, Jawa Timur, atau Seluruh Indonesia'}
                        value={targetCityOrArea}
                        onClick={() => {
                          if (!isTopupPackage && (campaignType === 'LBA' || !targetCityOrArea)) {
                            setIsMapModalOpen(true);
                          }
                        }}
                        onChange={(e) => setTargetCityOrArea(e.target.value)}
                        className={`w-full pl-9 ${!isTopupPackage && campaignType === 'LBA' ? 'pr-24 cursor-pointer' : 'pr-3.5'} py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500/20`}
                      />
                      {!isTopupPackage && campaignType === 'LBA' && (
                        <button
                          type="button"
                          onClick={() => setIsMapModalOpen(true)}
                          className="absolute right-1.5 top-1/2 -translate-y-1/2 px-2.5 py-1 text-[10px] font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all flex items-center gap-1 shadow-xs"
                        >
                          <MapPin className="w-3 h-3" />
                          <span>Peta GPS</span>
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Email Akun My ads (Khusus Pilihan Topup Saldo) */}
              {isTopupPackage && (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Email Akun My ads <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      required
                      placeholder="Contoh: akun@bisnisanda.com"
                      value={myAdsEmail}
                      onChange={(e) => setMyAdsEmail(e.target.value)}
                      className="w-full pl-9 pr-3.5 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500/20"
                    />
                  </div>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">
                    Email akun Telkomsel MyAds tujuan untuk pengisian dan penambahan deposit saldo.
                  </p>
                </div>
              )}

              {/* KAPABILITAS TARGETING KHUSUS (Tampil saat tipe kampanye TARGETED) */}
              {!isTopupPackage && campaignType === 'TARGETED' && (
                <div className="p-4 rounded-2xl bg-gradient-to-br from-rose-50/90 via-slate-50 to-red-50/40 dark:from-slate-850 dark:via-slate-850 dark:to-rose-950/20 border-2 border-rose-500/30 dark:border-rose-500/30 shadow-xs space-y-4">
                  {/* Header Objektif sesuai gambar referensi */}
                  <div className="border-b border-rose-200/80 dark:border-rose-900/40 pb-3">
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-0.5 rounded-md bg-rose-600 text-white text-[11px] font-black uppercase tracking-wider shadow-xs">
                          TARGETED
                        </span>
                        <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1">
                          <Target className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
                          <span>Kapabilitas Parameter Profiling Pelanggan</span>
                        </span>
                      </div>
                      <span className="text-[10px] font-bold text-rose-600 dark:text-rose-400 bg-rose-100 dark:bg-rose-950/60 px-2 py-0.5 rounded-full">
                        8 Filter Aktif
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed bg-white/80 dark:bg-slate-800/80 p-2.5 rounded-xl border border-rose-100 dark:border-slate-700">
                      <strong className="text-rose-700 dark:text-rose-400 block font-bold text-[11px] mb-0.5 uppercase tracking-wide">
                        OBJEKTIF:
                      </strong>
                      Menjangkau pelanggan yang tepat berdasarkan minat dan perilaku yang relevan, ideal untuk penawaran produk spesifik.
                    </div>
                  </div>

                  {/* 8 Grid Kartu Kapabilitas Targeting */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* 1. Grup Usia */}
                    <div className="p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-2xs">
                      <label className="block text-[11px] font-bold text-slate-800 dark:text-slate-200 mb-1 flex items-center gap-1.5">
                        <Users className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400 shrink-0" />
                        <span>1. Grup Usia (Rentang Umur)</span>
                      </label>
                      <select
                        value={targetAgeGroup}
                        onChange={(e) => setTargetAgeGroup(e.target.value)}
                        className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white font-medium focus:ring-1 focus:ring-rose-500"
                      >
                        <option value="Semua Rentang Usia">Semua Rentang Usia (Mass)</option>
                        <option value="18 - 24 Tahun (Gen Z / Pelajar / First Jobber)">18 - 24 Tahun (Gen Z / Pelajar / First Jobber)</option>
                        <option value="25 - 34 Tahun (Milenial / Profesional Muda)">25 - 34 Tahun (Milenial / Profesional Muda)</option>
                        <option value="35 - 44 Tahun (Dewasa Mapan / Keluarga)">35 - 44 Tahun (Dewasa Mapan / Keluarga)</option>
                        <option value="45+ Tahun (Mature / Senior)">45+ Tahun (Mature / Senior)</option>
                      </select>
                      <span className="text-[10px] text-slate-400 mt-1 block">Segmentasi umur target penerima</span>
                    </div>

                    {/* 2. Agama / Religi */}
                    <div className="p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-2xs">
                      <label className="block text-[11px] font-bold text-slate-800 dark:text-slate-200 mb-1 flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400 shrink-0" />
                        <span>2. Agama (Segmentasi Religi)</span>
                      </label>
                      <select
                        value={targetReligion}
                        onChange={(e) => setTargetReligion(e.target.value)}
                        className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white font-medium focus:ring-1 focus:ring-rose-500"
                      >
                        <option value="Semua Agama">Semua Agama (Nasional)</option>
                        <option value="Islam / Muslim">Islam / Muslim (Mayoritas)</option>
                        <option value="Kristen / Katolik">Kristen / Katolik</option>
                        <option value="Hindu / Buddha">Hindu / Buddha</option>
                        <option value="Momen Hari Raya Keagamaan Khusus">Momen Hari Raya Keagamaan Khusus</option>
                      </select>
                      <span className="text-[10px] text-slate-400 mt-1 block">Segmentasi religi / momen hari raya</span>
                    </div>

                    {/* 3. Jenis Kelamin */}
                    <div className="p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-2xs">
                      <label className="block text-[11px] font-bold text-slate-800 dark:text-slate-200 mb-1 flex items-center gap-1.5">
                        <Sliders className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400 shrink-0" />
                        <span>3. Jenis Kelamin (Gender)</span>
                      </label>
                      <select
                        value={targetGender}
                        onChange={(e) => setTargetGender(e.target.value)}
                        className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white font-medium focus:ring-1 focus:ring-rose-500"
                      >
                        <option value="Semua Gender (Pria & Wanita)">Semua Gender (Pria & Wanita)</option>
                        <option value="Pria (Male Only)">Pria Saja (Male Only)</option>
                        <option value="Wanita (Female Only)">Wanita Saja (Female Only)</option>
                      </select>
                      <span className="text-[10px] text-slate-400 mt-1 block">Filter jenis kelamin spesifik</span>
                    </div>

                    {/* 4. ARPU Spending */}
                    <div className="p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-2xs">
                      <label className="block text-[11px] font-bold text-slate-800 dark:text-slate-200 mb-1 flex items-center gap-1.5">
                        <DollarSign className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400 shrink-0" />
                        <span>4. ARPU Spending (Pengeluaran Pulsa)</span>
                      </label>
                      <select
                        value={targetArpuSpending}
                        onChange={(e) => setTargetArpuSpending(e.target.value)}
                        className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white font-medium focus:ring-1 focus:ring-rose-500"
                      >
                        <option value="Semua ARPU (Standard)">Semua ARPU (Daya Beli Massal)</option>
                        <option value="Low (< Rp 50.000 / Bulan)">Low (&lt; Rp 50.000 / Bulan)</option>
                        <option value="Medium (Rp 50.000 - Rp 150.000 / Bulan)">Medium (Rp 50.000 - Rp 150.000 / Bulan)</option>
                        <option value="High / VIP (> Rp 150.000 - Rp 500.000+ / Bulan)">High / VIP (&gt; Rp 150.000+ / Bulan)</option>
                      </select>
                      <span className="text-[10px] text-slate-400 mt-1 block">Tingkat pengeluaran telko per nomor</span>
                    </div>

                    {/* 5. Status SES */}
                    <div className="p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-2xs">
                      <label className="block text-[11px] font-bold text-slate-800 dark:text-slate-200 mb-1 flex items-center gap-1.5">
                        <Layers className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400 shrink-0" />
                        <span>5. Status SES (Sosial Ekonomi)</span>
                      </label>
                      <select
                        value={targetSes}
                        onChange={(e) => setTargetSes(e.target.value)}
                        className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white font-medium focus:ring-1 focus:ring-rose-500"
                      >
                        <option value="Semua SES (Mass Market)">Semua SES (Mass Market)</option>
                        <option value="SES A (Atas / High Net Worth / Premium)">SES A (Atas / High Net Worth / Premium)</option>
                        <option value="SES B (Menengah ke Atas / Middle-Up)">SES B (Menengah ke Atas / Middle-Up)</option>
                        <option value="SES C (Menengah / Mass Middle)">SES C (Menengah / Mass Middle)</option>
                        <option value="SES D & E (Mass Basic)">SES D & E (Mass Basic)</option>
                      </select>
                      <span className="text-[10px] text-slate-400 mt-1 block">Kelas ekonomi dan daya beli profil</span>
                    </div>

                    {/* 6. Device & OS */}
                    <div className="p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-2xs">
                      <label className="block text-[11px] font-bold text-slate-800 dark:text-slate-200 mb-1 flex items-center gap-1.5">
                        <Smartphone className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400 shrink-0" />
                        <span>6. Device & OS (Android / iOS / Tipe)</span>
                      </label>
                      <select
                        value={targetDeviceOs}
                        onChange={(e) => setTargetDeviceOs(e.target.value)}
                        className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white font-medium focus:ring-1 focus:ring-rose-500"
                      >
                        <option value="Semua Device & OS">Semua Device & Handphone</option>
                        <option value="Android Only (Smartphone 4G/5G)">Android Smartphone (4G / 5G)</option>
                        <option value="Apple iOS Only (iPhone Users)">Apple iOS (iPhone Users / Premium)</option>
                        <option value="High-End Flagship Only">High-End Flagship Phones Only</option>
                      </select>
                      <span className="text-[10px] text-slate-400 mt-1 block">Tipe sistem operasi & perangkat target</span>
                    </div>

                    {/* 7. Pernikahan */}
                    <div className="p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-2xs">
                      <label className="block text-[11px] font-bold text-slate-800 dark:text-slate-200 mb-1 flex items-center gap-1.5">
                        <Heart className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400 shrink-0" />
                        <span>7. Pernikahan (Lajang / Menikah)</span>
                      </label>
                      <select
                        value={targetMaritalStatus}
                        onChange={(e) => setTargetMaritalStatus(e.target.value)}
                        className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white font-medium focus:ring-1 focus:ring-rose-500"
                      >
                        <option value="Semua Status">Semua Status Pernikahan</option>
                        <option value="Lajang / Single">Lajang / Single / Belum Menikah</option>
                        <option value="Menikah / Berkeluarga">Menikah / Berkeluarga</option>
                      </select>
                      <span className="text-[10px] text-slate-400 mt-1 block">Status marital sasaran audiens</span>
                    </div>

                    {/* 8. Minat / Perilaku */}
                    <div className="p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-2xs sm:col-span-2">
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="text-[11px] font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                          <ShoppingBag className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400 shrink-0" />
                          <span>8. Minat / Perilaku (Hobi & Gaya Hidup)</span>
                        </label>
                        <span className="text-[10px] text-slate-400">
                          {targetInterests.length} Kategori Dipilih
                        </span>
                      </div>

                      {/* Interactive Interest Chips */}
                      <div className="flex flex-wrap gap-1.5 mb-2">
                        {[
                          '🛒 Belanja Online & E-Commerce',
                          '🍔 Kuliner & Makanan (F&B)',
                          '🚗 Otomotif & Kendaraan',
                          '💼 Bisnis & Investasi / Finansial',
                          '💄 Kecantikan & Fashion',
                          '🏠 Properti & Hunian',
                          '🎮 Gaming & Hiburan Digital',
                          '✈️ Travel & Liburan',
                          '👶 Ibu & Bayi / Parenting',
                          '🏥 Kesehatan & Olahraga',
                          '📱 Gadget & Teknologi',
                          '🎓 Edukasi & Kursus Online',
                        ].map((interest) => {
                          const isSelected = targetInterests.includes(interest);
                          return (
                            <button
                              key={interest}
                              type="button"
                              onClick={() => {
                                if (isSelected) {
                                  setTargetInterests(targetInterests.filter((i) => i !== interest));
                                } else {
                                  setTargetInterests([...targetInterests, interest]);
                                }
                              }}
                              className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all flex items-center gap-1 cursor-pointer border ${
                                isSelected
                                  ? 'bg-rose-600 text-white border-rose-600 shadow-2xs'
                                  : 'bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800'
                              }`}
                            >
                              <span>{interest}</span>
                              {isSelected && <Check className="w-3 h-3" />}
                            </button>
                          );
                        })}
                      </div>

                      {/* Custom Interest Input */}
                      <div className="flex items-center gap-1.5 pt-1.5 border-t border-slate-100 dark:border-slate-750">
                        <input
                          type="text"
                          placeholder="Ketik minat kustom lainnya..."
                          value={customInterestInput}
                          onChange={(e) => setCustomInterestInput(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && customInterestInput.trim()) {
                              e.preventDefault();
                              if (!targetInterests.includes(customInterestInput.trim())) {
                                setTargetInterests([...targetInterests, customInterestInput.trim()]);
                              }
                              setCustomInterestInput('');
                            }
                          }}
                          className="flex-1 px-2.5 py-1 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            if (customInterestInput.trim()) {
                              if (!targetInterests.includes(customInterestInput.trim())) {
                                setTargetInterests([...targetInterests, customInterestInput.trim()]);
                              }
                              setCustomInterestInput('');
                            }
                          }}
                          className="px-2.5 py-1 text-xs font-bold bg-slate-800 dark:bg-slate-700 hover:bg-slate-900 text-white rounded-lg transition-all"
                        >
                          + Tambah
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* UPLOAD LIST NOMOR EXCEL / CSV (Tampil saat tipe kampanye BROADCAST) */}
              {!isTopupPackage && campaignType === 'BROADCAST' && (
                <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-50/90 via-slate-50 to-teal-50/40 dark:from-slate-850 dark:via-slate-850 dark:to-emerald-950/20 border-2 border-emerald-500/30 dark:border-emerald-500/30 shadow-xs space-y-3.5">
                  <div className="border-b border-emerald-200/80 dark:border-emerald-900/40 pb-2.5 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-md bg-emerald-600 text-white text-[11px] font-black uppercase tracking-wider shadow-xs">
                        BROADCAST
                      </span>
                      <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                        <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                        <span>Upload Database / List Nomor Pelanggan (Excel / CSV)</span>
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={handleDownloadSampleCsv}
                      className="px-2 py-1 rounded-lg text-[10px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-100/80 dark:bg-emerald-900/50 hover:bg-emerald-200 dark:hover:bg-emerald-800 transition-all flex items-center gap-1 cursor-pointer"
                      title="Unduh contoh template CSV"
                    >
                      <Download className="w-3 h-3" />
                      <span>Template CSV</span>
                    </button>
                  </div>

                  <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
                    Kirim broadcast langsung ke daftar nomor kontak pelanggan Anda. Format yang didukung: <strong>.xlsx, .xls, .csv, .txt</strong> (Kolom: Nomor HP / WhatsApp, Nama, Kota).
                  </p>

                  {/* Hidden file input */}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".xlsx,.xls,.csv,.txt"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        handleProcessFile(e.target.files[0]);
                      }
                    }}
                    className="hidden"
                  />

                  {/* File Upload Dropzone */}
                  {!uploadedListFileName ? (
                    <div
                      onDragOver={(e) => {
                        e.preventDefault();
                        setIsDraggingFile(true);
                      }}
                      onDragLeave={() => setIsDraggingFile(false)}
                      onDrop={(e) => {
                        e.preventDefault();
                        setIsDraggingFile(false);
                        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                          handleProcessFile(e.dataTransfer.files[0]);
                        }
                      }}
                      onClick={() => fileInputRef.current?.click()}
                      className={`p-4 sm:p-5 rounded-xl border-2 border-dashed transition-all text-center cursor-pointer ${
                        isDraggingFile
                          ? 'border-emerald-500 bg-emerald-100/70 dark:bg-emerald-900/40 scale-[1.01]'
                          : 'border-slate-300 dark:border-slate-700 bg-white/80 dark:bg-slate-800/80 hover:border-emerald-500 hover:bg-emerald-50/50 dark:hover:bg-slate-800'
                      }`}
                    >
                      <div className="w-10 h-10 mx-auto mb-2 rounded-full bg-emerald-100 dark:bg-emerald-900/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                        <UploadCloud className="w-5 h-5" />
                      </div>
                      <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                        Klik untuk Pilih File atau Tarik (Drag & Drop) File Excel / CSV
                      </p>
                      <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">
                        File Excel (.xlsx, .xls) atau CSV (.csv, .txt) • Maks. 25 MB
                      </p>
                    </div>
                  ) : (
                    /* Uploaded file preview card */
                    <div className="p-3 bg-white dark:bg-slate-800 rounded-xl border border-emerald-300 dark:border-emerald-800 shadow-2xs flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-9 h-9 rounded-lg bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 flex items-center justify-center shrink-0">
                          <FileCheck className="w-5 h-5" />
                        </div>
                        <div className="min-w-0">
                          <span className="text-xs font-bold text-slate-900 dark:text-white truncate block">
                            {uploadedListFileName}
                          </span>
                          <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold block">
                            {uploadedListFileSize}
                            {uploadedListFileCount !== undefined ? ` • ~${uploadedListFileCount.toLocaleString('id-ID')} Kontak Terdeteksi` : ' • File Siap Diproses'}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="px-2 py-1 text-[11px] font-semibold text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/50 rounded-lg transition-all"
                        >
                          Ganti File
                        </button>
                        <button
                          type="button"
                          onClick={handleRemoveUploadedFile}
                          className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 rounded-lg transition-all"
                          title="Hapus File"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* TAMPILAN AUTO-FILL GPS KETIKA SUDAH DIPILIH VIA PETA */}
              {!isTopupPackage && gpsLatitude !== undefined && gpsLongitude !== undefined && (
                <div className="p-3.5 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-slate-800 dark:to-slate-800/90 border border-blue-200 dark:border-blue-800 shadow-xs space-y-2">
                  <div className="flex items-center justify-between border-b border-blue-100 dark:border-slate-700 pb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs">
                        📍
                      </div>
                      <div>
                        <span className="text-[10px] uppercase font-extrabold text-blue-700 dark:text-blue-400 tracking-wider block">
                          Titik Lokasi GPS & Radius Aktif
                        </span>
                        <h5 className="text-xs font-bold text-slate-900 dark:text-white">
                          Radius {gpsRadiusMeters >= 1000 ? `${(gpsRadiusMeters / 1000).toFixed(1)} km` : `${gpsRadiusMeters} Meter`} dari Titik Koordinat
                        </h5>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsMapModalOpen(true)}
                      className="px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-white dark:bg-slate-700 border border-blue-200 dark:border-slate-600 text-blue-600 dark:text-blue-300 hover:bg-blue-50 transition-all flex items-center gap-1"
                    >
                      <Navigation className="w-3 h-3" />
                      <span>Atur Ulang Peta</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px]">
                    <div className="bg-white/80 dark:bg-slate-850/80 p-2 rounded-lg border border-blue-100/80 dark:border-slate-700">
                      <span className="text-[10px] text-slate-500 dark:text-slate-400 block font-medium">Titik GPS (Lat, Long):</span>
                      <strong className="text-slate-800 dark:text-slate-200 font-mono text-[11px]">
                        {gpsLatitude.toFixed(6)}, {gpsLongitude.toFixed(6)}
                      </strong>
                    </div>

                    <div className="bg-white/80 dark:bg-slate-850/80 p-2 rounded-lg border border-blue-100/80 dark:border-slate-700">
                      <span className="text-[10px] text-slate-500 dark:text-slate-400 block font-medium">Radius Jangkauan:</span>
                      <strong className="text-blue-600 dark:text-blue-400 font-bold">
                        {gpsRadiusMeters >= 1000 ? `${(gpsRadiusMeters / 1000).toFixed(1)} km (${gpsRadiusMeters} M)` : `${gpsRadiusMeters} Meter`}
                      </strong>
                    </div>

                    <div className="bg-white/80 dark:bg-slate-850/80 p-2 rounded-lg border border-blue-100/80 dark:border-slate-700">
                      <span className="text-[10px] text-slate-500 dark:text-slate-400 block font-medium">Alamat / Jalan:</span>
                      <span className="text-slate-800 dark:text-slate-200 font-medium truncate block" title={streetAddress}>
                        {streetAddress || 'Terdeteksi dari peta'}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* PARAMETER BROADCAST TAMBAHAN (Tanggal H+3, Sender ID, Isi Pesan 160 Karakter, Link Web) */}
              {!isTopupPackage && (
                <div className="p-3.5 sm:p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                      <h5 className="text-xs font-bold text-slate-900 dark:text-white">
                        Rincian Konten Siar & Jadwal Tayang
                      </h5>
                    </div>
                    <span className="text-[10px] font-semibold bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded-full">
                      Sesuai Standar Telko
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* Tanggal Broadcast (Bisa dipilih minimal H+3) */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center justify-between">
                        <span className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                          <span>Tanggal Siar Broadcast</span>
                          <span className="text-rose-500">*</span>
                        </span>
                        <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400">
                          Min. H+3
                        </span>
                      </label>
                      <input
                        type="date"
                        required
                        min={minBroadcastDate}
                        value={broadcastDate}
                        onChange={(e) => setBroadcastDate(e.target.value)}
                        className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500/20 font-medium"
                      />
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">
                        ℹ️ Jadwal siar tercepat: <strong>{minBroadcastDateFormatted}</strong> (Waktu moderasi operator & whitelist).
                      </p>
                    </div>

                    {/* Nama Sender Pengirim */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center justify-between">
                        <span className="flex items-center gap-1.5">
                          <Tag className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                          <span>Nama Sender / Masking Pengirim</span>
                        </span>
                        <span className="text-[10px] text-slate-400">Maks. 11 Karakter</span>
                      </label>
                      <input
                        type="text"
                        maxLength={11}
                        placeholder="Contoh: TOKOBERKAH"
                        value={senderName}
                        onChange={(e) => setSenderName(e.target.value.replace(/[^a-zA-Z0-9\s_-]/g, ''))}
                        className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500/20 font-mono uppercase tracking-wider"
                      />
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">
                        Identitas pengirim yang muncul di HP penerima iklan.
                      </p>
                    </div>
                  </div>

                  {/* Isi Pesan Siar Iklan (Maksimal 160 Karakter) */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                        <MessageSquare className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                        <span>Isi Pesan Siar Iklan</span>
                        <span className="text-rose-500">*</span>
                      </label>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        adMessageContent.length >= 150
                          ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300'
                          : 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300'
                      }`}>
                        {adMessageContent.length} / 160 Karakter
                      </span>
                    </div>
                    <textarea
                      rows={3}
                      required
                      maxLength={160}
                      placeholder="Contoh: PROMO SPESIAL AKHIR PEKAN! Diskon s/d 50% di Toko Berkah. Tunjukkan SMS ini ke kasir untuk klaim hadiah. Info lengkap kunjungi bit.ly/promo..."
                      value={adMessageContent}
                      onChange={(e) => setAdMessageContent(e.target.value)}
                      className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500/20"
                    ></textarea>
                    <div className="flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                      <span>💡 Pesan 1 SMS maksimal 160 karakter agar broadcast terkirim optimal & hemat kuota.</span>
                      <span>Sisa: {160 - adMessageContent.length}</span>
                    </div>
                  </div>

                  {/* Link Web / URL Promosi (Opsional) */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
                      <Globe className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                      <span>Kolom Link Web / URL Promosi (Opsional)</span>
                    </label>
                    <input
                      type="url"
                      placeholder="Contoh: https://tokoberkah.com/promo atau bit.ly/promo-spesial"
                      value={webLink}
                      onChange={(e) => setWebLink(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500/20"
                    />
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">
                      Link website, landing page, atau nomor WhatsApp yang akan disertakan dalam kampanye.
                    </p>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Catatan Tambahan atau Permintaan Khusus (Opsional)
                </label>
                <textarea
                  rows={2}
                  placeholder="Contoh: Jam tayang broadcast diutamakan pukul 10.00 - 12.00 siang..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500/20"
                ></textarea>
              </div>
            </div>

            {/* Action Submit Button */}
            <div className="pt-2">
              <button
                id="btn-submit-order-lead"
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 px-4 rounded-xl text-sm font-bold bg-blue-600 hover:bg-blue-700 active:scale-[0.99] text-white shadow-lg shadow-blue-600/25 transition-all flex items-center justify-center gap-2 disabled:opacity-50 min-h-[48px]"
              >
                <CreditCard className="w-4 h-4" />
                <span>{isSubmitting ? 'Membuat Pesanan...' : 'Kirim Pesanan & Dapatkan Petunjuk Pembayaran'}</span>
                <ArrowRight className="w-4 h-4 ml-1" />
              </button>
              <p className="text-[11px] text-center text-slate-500 dark:text-slate-400 mt-2">
                🔒 Setelah klik kirim, Anda akan mendapatkan nomor rekening resmi admin dan rincian instruksi transfer.
              </p>
            </div>
          </form>
        )}

        {/* STEP 2: CARA PEMBAYARAN & REKENING RESMI ADMIN */}
        {step === 'PAYMENT' && createdOrder && (
          <div className="p-4 sm:p-6 space-y-5 overflow-y-auto">
            {/* Celebratory Banner */}
            <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-sm mt-0.5">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h4 className="text-base font-extrabold text-slate-900 dark:text-white leading-tight">
                    Pesanan Anda Berhasil Dibuat!
                  </h4>
                  <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-300">
                    {createdOrder.id}
                  </span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">
                  Silakan selesaikan pembayaran ke rekening resmi di bawah ini untuk aktivasi jadwal siar iklan Anda.
                </p>
              </div>
            </div>

            {/* Total Payment Banner */}
            <div className="p-4 sm:p-5 rounded-2xl bg-slate-900 text-white border border-slate-800 shadow-md">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <span className="text-[10px] uppercase font-bold tracking-widest text-emerald-400 block">
                    Total Estimasi Pembayaran
                  </span>
                  <div className="text-2xl sm:text-3xl font-black text-white mt-0.5">
                    Rp {createdOrder.totalPayment?.toLocaleString('id-ID')}
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Paket: <strong className="text-slate-200">{createdOrder.selectedPackageName}</strong> • {createdOrder.campaignType} ({createdOrder.channelName})
                  </p>
                  {bonusAmount > 0 && !isOneKlik && (
                    <div className="mt-1.5 flex flex-wrap items-center gap-1.5 text-xs text-emerald-300 font-semibold">
                      <span>Total Saldo Masuk Akun:</span>
                      <strong className="text-white font-black">
                        Rp {((createdOrder.totalPayment || 0) + bonusAmount).toLocaleString('id-ID')}
                      </strong>
                      <span className="text-[10px] bg-emerald-500/30 text-emerald-200 px-1.5 py-0.5 rounded font-bold">
                        (+Rp {bonusAmount.toLocaleString('id-ID')} Saldo Gratis)
                      </span>
                    </div>
                  )}
                </div>

                <div className="sm:text-right border-t sm:border-t-0 sm:border-l border-slate-800 pt-2 sm:pt-0 sm:pl-4">
                  <span className="text-[10px] uppercase font-semibold text-slate-400 block">
                    Estimasi Jangkauan
                  </span>
                  <div className="text-base sm:text-lg font-bold text-emerald-400">
                    ~{createdOrder.estimatedReach?.toLocaleString('id-ID')} Penerima
                  </div>
                  {bonusPercent > 0 && !isOneKlik ? (
                    <span className="inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      Bonus Saldo +{bonusPercent}% Termasuk
                    </span>
                  ) : isOneKlik ? (
                    <span className="inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-bold bg-slate-700/60 text-slate-300 border border-slate-600">
                      Paket One Klik (Tanpa Bonus Saldo)
                    </span>
                  ) : null}
                </div>
              </div>
            </div>

            {/* RINGKASAN KONFIGURASI KAMPANYE & LOKASI GPS (Atau Akun My Ads jika Topup) */}
            <div className="p-3.5 sm:p-4 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-2.5 text-xs">
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 pb-2">
                <span className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  {createdOrder.campaignType === 'FLEXI TOP-UP' || createdOrder.myAdsEmail ? (
                    <>
                      <Mail className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                      <span>Rincian Akun & Data Pemesan Top-Up</span>
                    </>
                  ) : (
                    <>
                      <Target className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                      <span>Konfigurasi Target & Materi Iklan</span>
                    </>
                  )}
                </span>
                <span className="text-[10px] font-bold bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded">
                  {createdOrder.campaignType}
                </span>
              </div>

              {createdOrder.campaignType === 'FLEXI TOP-UP' || createdOrder.myAdsEmail ? (
                /* Tampilan Rincian Data Pesanan Khusus Top-Up */
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                  {createdOrder.myAdsEmail && (
                    <div className="sm:col-span-2 p-2.5 rounded-lg bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800/80 flex items-center justify-between">
                      <div>
                        <span className="text-[10px] text-blue-600 dark:text-blue-400 font-bold block uppercase tracking-wider">
                          Email Akun My ads Tujuan:
                        </span>
                        <strong className="text-xs font-bold text-slate-900 dark:text-white font-mono">
                          {createdOrder.myAdsEmail}
                        </strong>
                      </div>
                      <span className="text-[10px] font-bold bg-blue-600 text-white px-2 py-0.5 rounded-full">
                        Target Top-Up
                      </span>
                    </div>
                  )}

                  <div>
                    <span className="text-slate-500 dark:text-slate-400 block">Nama Pemesan:</span>
                    <strong className="text-slate-800 dark:text-slate-200">{createdOrder.customerName}</strong>
                  </div>

                  <div>
                    <span className="text-slate-500 dark:text-slate-400 block">Nomor WhatsApp:</span>
                    <strong className="text-slate-800 dark:text-slate-200 font-mono">{createdOrder.whatsapp}</strong>
                  </div>

                  {createdOrder.businessName && (
                    <div>
                      <span className="text-slate-500 dark:text-slate-400 block">Nama Usaha / Brand:</span>
                      <strong className="text-slate-800 dark:text-slate-200">{createdOrder.businessName}</strong>
                    </div>
                  )}

                  <div>
                    <span className="text-slate-500 dark:text-slate-400 block">Sasaran Kota / Wilayah:</span>
                    <strong className="text-slate-800 dark:text-slate-200">{createdOrder.targetCityOrArea || 'Nasional'}</strong>
                  </div>

                  {createdOrder.notes && (
                    <div className="sm:col-span-2 p-2 rounded-lg bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-700">
                      <span className="text-[10px] text-slate-500 dark:text-slate-400 block">Catatan Pemesan:</span>
                      <p className="text-slate-700 dark:text-slate-300 italic">"{createdOrder.notes}"</p>
                    </div>
                  )}
                </div>
              ) : (
                /* Tampilan Rincian Kampanye LBA / BROADCAST / TARGETED */
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                    <div>
                      <span className="text-slate-500 dark:text-slate-400 block">Sasaran Lokasi / Area:</span>
                      <strong className="text-slate-800 dark:text-slate-200">{createdOrder.targetCityOrArea || 'Nasional'}</strong>
                    </div>

                    {createdOrder.broadcastDate && (
                      <div>
                        <span className="text-slate-500 dark:text-slate-400 block">Jadwal Tanggal Siar (H+3):</span>
                        <strong className="text-blue-600 dark:text-blue-400">{createdOrder.broadcastDate}</strong>
                      </div>
                    )}

                    {createdOrder.senderName && (
                      <div>
                        <span className="text-slate-500 dark:text-slate-400 block">Nama Sender / Masking:</span>
                        <strong className="text-slate-800 dark:text-slate-200 font-mono uppercase">{createdOrder.senderName}</strong>
                      </div>
                    )}

                    {createdOrder.webLink && (
                      <div>
                        <span className="text-slate-500 dark:text-slate-400 block">Link Web / Landing Page:</span>
                        <span className="text-blue-600 dark:text-blue-400 underline truncate block">{createdOrder.webLink}</span>
                      </div>
                    )}

                    {createdOrder.uploadedListFileName && (
                      <div className="sm:col-span-2 p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/50 flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <FileSpreadsheet className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                          <div>
                            <span className="text-[10px] text-emerald-700 dark:text-emerald-300 font-bold block">
                              File List Kontak Diupload:
                            </span>
                            <span className="text-[11px] font-semibold text-slate-800 dark:text-slate-200">
                              {createdOrder.uploadedListFileName} ({createdOrder.uploadedListFileSize || ''}{createdOrder.uploadedListFileCount ? ` • ~${createdOrder.uploadedListFileCount.toLocaleString('id-ID')} Kontak` : ''})
                            </span>
                          </div>
                        </div>
                        <span className="text-[10px] font-bold bg-emerald-600 text-white px-2 py-0.5 rounded-full">
                          Terlampir
                        </span>
                      </div>
                    )}
                  </div>

                  {(createdOrder.campaignType === 'TARGETED' || createdOrder.targetAgeGroup) && (
                    <div className="p-2.5 rounded-lg bg-rose-50/80 dark:bg-rose-950/20 border border-rose-200/80 dark:border-rose-900/40 text-[11px] space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-rose-700 dark:text-rose-400 flex items-center gap-1">
                          <Target className="w-3.5 h-3.5" />
                          <span>Kapabilitas Targeting yang Diaktifkan:</span>
                        </span>
                        <span className="text-[10px] font-semibold bg-rose-200/70 dark:bg-rose-900/60 text-rose-800 dark:text-rose-300 px-1.5 py-0.2 rounded">
                          8 Parameter
                        </span>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 text-[10px]">
                        <div className="bg-white/90 dark:bg-slate-800/90 p-1.5 rounded border border-rose-100 dark:border-slate-700">
                          <span className="text-slate-400 block">Grup Usia:</span>
                          <strong className="text-slate-800 dark:text-slate-200 truncate block">{createdOrder.targetAgeGroup || 'Semua'}</strong>
                        </div>
                        <div className="bg-white/90 dark:bg-slate-800/90 p-1.5 rounded border border-rose-100 dark:border-slate-700">
                          <span className="text-slate-400 block">Religi:</span>
                          <strong className="text-slate-800 dark:text-slate-200 truncate block">{createdOrder.targetReligion || 'Semua'}</strong>
                        </div>
                        <div className="bg-white/90 dark:bg-slate-800/90 p-1.5 rounded border border-rose-100 dark:border-slate-700">
                          <span className="text-slate-400 block">Gender:</span>
                          <strong className="text-slate-800 dark:text-slate-200 truncate block">{createdOrder.targetGender || 'Semua'}</strong>
                        </div>
                        <div className="bg-white/90 dark:bg-slate-800/90 p-1.5 rounded border border-rose-100 dark:border-slate-700">
                          <span className="text-slate-400 block">ARPU Spending:</span>
                          <strong className="text-slate-800 dark:text-slate-200 truncate block">{createdOrder.targetArpuSpending || 'Semua'}</strong>
                        </div>
                        <div className="bg-white/90 dark:bg-slate-800/90 p-1.5 rounded border border-rose-100 dark:border-slate-700">
                          <span className="text-slate-400 block">Status SES:</span>
                          <strong className="text-slate-800 dark:text-slate-200 truncate block">{createdOrder.targetSes || 'Semua'}</strong>
                        </div>
                        <div className="bg-white/90 dark:bg-slate-800/90 p-1.5 rounded border border-rose-100 dark:border-slate-700">
                          <span className="text-slate-400 block">Device & OS:</span>
                          <strong className="text-slate-800 dark:text-slate-200 truncate block">{createdOrder.targetDeviceOs || 'Semua'}</strong>
                        </div>
                        <div className="bg-white/90 dark:bg-slate-800/90 p-1.5 rounded border border-rose-100 dark:border-slate-700">
                          <span className="text-slate-400 block">Pernikahan:</span>
                          <strong className="text-slate-800 dark:text-slate-200 truncate block">{createdOrder.targetMaritalStatus || 'Semua'}</strong>
                        </div>
                        <div className="bg-white/90 dark:bg-slate-800/90 p-1.5 rounded border border-rose-100 dark:border-slate-700">
                          <span className="text-slate-400 block">Minat/Perilaku:</span>
                          <strong className="text-slate-800 dark:text-slate-200 truncate block" title={createdOrder.targetInterests?.join(', ') || 'Semua'}>
                            {createdOrder.targetInterests && createdOrder.targetInterests.length > 0 ? `${createdOrder.targetInterests.length} Minat` : 'Semua'}
                          </strong>
                        </div>
                      </div>
                    </div>
                  )}

                  {createdOrder.latitude && createdOrder.longitude && (
                    <div className="p-2.5 rounded-lg bg-blue-50/70 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 text-[11px]">
                      <span className="font-bold text-blue-700 dark:text-blue-300 block mb-0.5">
                        📍 Titik Koordinat GPS & Radius:
                      </span>
                      <div className="text-slate-700 dark:text-slate-300">
                        Lat: {createdOrder.latitude}, Lng: {createdOrder.longitude} • Radius: {createdOrder.radiusMeters >= 1000 ? `${(createdOrder.radiusMeters / 1000).toFixed(1)} km` : `${createdOrder.radiusMeters} Meter`}
                        {createdOrder.streetAddress && (
                          <div className="mt-0.5 text-slate-600 dark:text-slate-400">
                            Alamat: {createdOrder.streetAddress}
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {createdOrder.adMessageContent && (
                    <div className="p-2.5 rounded-lg bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-700 text-[11px]">
                      <span className="font-semibold text-slate-500 dark:text-slate-400 block mb-0.5">
                        💬 Isi Pesan Siar ({createdOrder.adMessageContent.length} Karakter):
                      </span>
                      <p className="text-slate-800 dark:text-slate-200 italic">
                        "{createdOrder.adMessageContent}"
                      </p>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* REKENING RESMI PEMBAYARAN (Multi-Rekening Support) */}
            <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-850 border-2 border-emerald-500/40 dark:border-emerald-500/30 shadow-sm relative overflow-hidden">
              <div className="absolute top-0 right-0 px-3 py-1 bg-emerald-600 text-white font-extrabold text-[10px] rounded-bl-xl uppercase tracking-wider">
                Rekening Resmi Terverifikasi
              </div>

              <div className="flex items-center gap-2 mb-3">
                <CreditCard className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                    Tujuan Transfer Bank Resmi
                  </h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Pilih rekening bank tujuan yang sesuai dengan rekening m-Banking / ATM Anda.
                  </p>
                </div>
              </div>

              {/* Bank Account Selector Tabs / Chips if more than 1 account */}
              {activeBankAccounts.length > 1 && (
                <div className="mb-3">
                  <div className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1.5 flex items-center justify-between">
                    <span>Pilih Bank Tujuan Transfer:</span>
                    <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">
                      {activeBankAccounts.length} Rekening Tersedia
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {activeBankAccounts.map((b) => {
                      const isSelected = currentBankAccount?.id === b.id;
                      return (
                        <button
                          key={b.id}
                          type="button"
                          onClick={() => setSelectedBankAccountId(b.id)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 border ${
                            isSelected
                              ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                              : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700'
                          }`}
                        >
                          <span>{b.bankName.split(' ')[0]}</span>
                          {b.isPrimary && (
                            <Star className={`w-3 h-3 ${isSelected ? 'fill-white text-white' : 'text-amber-500 fill-amber-500'}`} />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* CURRENT SELECTED BANK ACCOUNT CARD */}
              <div className="space-y-3">
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                      Bank Tujuan Transfer:
                    </span>
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm font-black text-slate-900 dark:text-white">
                        {currentBankAccount?.bankName || companyConfig.bankName || 'BCA (Bank Central Asia)'}
                      </span>
                      {currentBankAccount?.isPrimary && (
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                          Utama
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 py-3 border-y border-slate-200 dark:border-slate-700">
                    <div>
                      <span className="text-[11px] text-slate-500 dark:text-slate-400 block">
                        Nomor Rekening:
                      </span>
                      <span className="text-xl sm:text-2xl font-mono font-black text-emerald-600 dark:text-emerald-400 tracking-wider">
                        {currentBankAccount?.accountNumber || companyConfig.bankAccountNumber || '0188-3333-7157'}
                      </span>
                    </div>

                    <button
                      type="button"
                      id="btn-copy-main-bank-account"
                      onClick={() => handleCopyAccount(currentBankAccount?.accountNumber, currentBankAccount?.id)}
                      className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-xs shrink-0 ${
                        copiedAccount && (!copiedBankId || copiedBankId === currentBankAccount?.id)
                          ? 'bg-emerald-600 text-white'
                          : 'bg-white dark:bg-slate-700 text-slate-700 dark:text-white border border-slate-300 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-650 active:scale-95'
                      }`}
                    >
                      {copiedAccount && (!copiedBankId || copiedBankId === currentBankAccount?.id) ? (
                        <Check className="w-4 h-4" />
                      ) : (
                        <Copy className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                      )}
                      <span>
                        {copiedAccount && (!copiedBankId || copiedBankId === currentBankAccount?.id)
                          ? 'Nomor Tersalin!'
                          : 'Salin No. Rekening'}
                      </span>
                    </button>
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <span className="text-xs text-slate-500 dark:text-slate-400">
                      Atas Nama (Pemilik Rekening):
                    </span>
                    <span className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                      {currentBankAccount?.accountHolder || companyConfig.bankAccountHolder || 'PT Akardaya Telekomunikasi Indonesia'}
                    </span>
                  </div>

                  {currentBankAccount?.notes && (
                    <div className="mt-2 pt-2 border-t border-slate-200/60 dark:border-slate-700/60 text-[11px] text-slate-500 dark:text-slate-400">
                      💡 {currentBankAccount.notes}
                    </div>
                  )}
                </div>

                {/* Additional alternative bank accounts if any */}
                {activeBankAccounts.length > 1 && (
                  <div className="space-y-1.5 pt-1">
                    <div className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
                      Rekening Resmi Lainnya yang Dapat Dipilih:
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {activeBankAccounts
                        .filter((b) => b.id !== currentBankAccount?.id)
                        .map((b) => (
                          <div
                            key={b.id}
                            onClick={() => setSelectedBankAccountId(b.id)}
                            className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-800/60 hover:bg-emerald-50/40 dark:hover:bg-emerald-950/30 hover:border-emerald-300 dark:hover:border-emerald-800 transition-all cursor-pointer flex items-center justify-between gap-2"
                          >
                            <div className="truncate">
                              <div className="text-xs font-bold text-slate-900 dark:text-white truncate">
                                {b.bankName}
                              </div>
                              <div className="font-mono text-xs text-emerald-600 dark:text-emerald-400 font-bold">
                                {b.accountNumber}
                              </div>
                              <div className="text-[10px] text-slate-500 truncate">
                                a/n {b.accountHolder}
                              </div>
                            </div>

                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleCopyAccount(b.accountNumber, b.id);
                              }}
                              className="px-2 py-1 rounded-lg text-[10px] font-bold border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 hover:bg-emerald-600 hover:text-white hover:border-emerald-600 transition-all shrink-0"
                            >
                              {copiedBankId === b.id ? 'Tersalin' : 'Salin'}
                            </button>
                          </div>
                        ))}
                    </div>
                  </div>
                )}

                {/* Panduan Pembayaran dari Admin */}
                <div className="text-xs text-slate-700 dark:text-slate-300 bg-emerald-50 dark:bg-emerald-950/30 p-3.5 rounded-xl border border-emerald-200 dark:border-emerald-900/60 leading-relaxed">
                  <strong className="text-emerald-800 dark:text-emerald-300 font-bold block mb-1 flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    <span>Petunjuk Pembayaran Resmi:</span>
                  </strong>
                  <p className="text-[11px] sm:text-xs">
                    {companyConfig.paymentInstructions ||
                      'Silakan transfer tepat sesuai estimasi total tagihan di atas ke rekening resmi kami. Setelah transfer berhasil, unggah bukti transfer di bawah atau kirim via WhatsApp agar kampanye iklan segera diaktifkan.'}
                  </p>
                </div>
              </div>
            </div>

            {/* Unggah Bukti Transfer Pembayaran (Opsional) */}
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-800 border-2 border-dashed border-emerald-500/40 dark:border-emerald-500/30 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                    <UploadCloud className="w-4 h-4" />
                  </div>
                  <div>
                    <h5 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white flex items-center gap-1.5">
                      <span>Unggah Bukti Transfer</span>
                      <span className="text-[10px] font-normal px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300">
                        {createdOrder?.paymentProofUrl ? 'Terlampir ✓' : 'Opsional'}
                      </span>
                    </h5>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      Lampirkan screenshot m-Banking atau foto struk ATM Anda
                    </p>
                  </div>
                </div>

                {createdOrder?.paymentProofUrl && (
                  <button
                    type="button"
                    onClick={() => {
                      if (createdOrder) {
                        const updated = {
                          ...createdOrder,
                          paymentProofUrl: undefined,
                          paymentProofFileName: undefined,
                          paymentProofUploadedAt: undefined,
                        };
                        setCreatedOrder(updated);
                        fetch('/api/orders', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify(updated),
                        }).catch(console.error);
                      }
                    }}
                    className="text-xs text-rose-500 hover:text-rose-600 font-semibold p-1"
                  >
                    Hapus
                  </button>
                )}
              </div>

              {createdOrder?.paymentProofUrl ? (
                <div className="flex items-center gap-3 p-3 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/60">
                  <img
                    src={createdOrder.paymentProofUrl}
                    alt="Bukti Transfer"
                    className="w-14 h-14 object-cover rounded-lg border border-emerald-300 dark:border-emerald-700 shadow-2xs shrink-0"
                  />
                  <div className="min-w-0 flex-1 text-xs">
                    <p className="font-bold text-slate-900 dark:text-white truncate">
                      {createdOrder.paymentProofFileName || 'Struk_Transfer.jpg'}
                    </p>
                    <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
                      ✓ Bukti transfer tersimpan & siap divalidasi admin
                    </p>
                    <p className="text-[10px] text-slate-400">
                      {createdOrder.paymentProofUploadedAt}
                    </p>
                  </div>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-850 hover:bg-emerald-50/50 dark:hover:bg-emerald-950/20 cursor-pointer transition-colors text-center">
                  <UploadCloud className="w-6 h-6 text-emerald-600 dark:text-emerald-400 mb-1.5" />
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    {isUploadingProof ? 'Sedang Memproses Foto...' : 'Pilih / Jepret Foto Bukti Transfer'}
                  </span>
                  <span className="text-[10px] text-slate-400 mt-0.5">
                    Format: JPG, PNG, WEBP (Otomatis Dioptimasi)
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleCustomerUploadProof(file);
                    }}
                  />
                </label>
              )}
            </div>

            {/* 3 Langkah Mudah Setelah Transfer */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 text-xs">
              <h5 className="font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <span>3 Langkah Mudah Setelah Transfer:</span>
              </h5>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-[11px] text-slate-600 dark:text-slate-300">
                <div className="p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                  <span className="font-bold text-blue-600 block mb-0.5">1. Transfer Dana</span>
                  Transfer ke rekening di atas lewat m-Banking / ATM / Teller.
                </div>
                <div className="p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                  <span className="font-bold text-blue-600 block mb-0.5">2. Simpan Bukti</span>
                  Simpan screenshot struk atau bukti transfer m-Banking.
                </div>
                <div className="p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                  <span className="font-bold text-blue-600 block mb-0.5">3. Kirim via WA</span>
                  Klik tombol hijau di bawah untuk terhubung ke WhatsApp Admin.
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2 pt-1">
              <button
                type="button"
                id="btn-confirm-whatsapp-payment"
                onClick={handleOpenWhatsAppConfirmation}
                className="w-full py-3.5 px-4 rounded-xl text-sm font-bold bg-emerald-600 hover:bg-emerald-700 active:scale-[0.99] text-white shadow-lg shadow-emerald-600/25 transition-all flex items-center justify-center gap-2 min-h-[48px]"
              >
                <Send className="w-4 h-4" />
                <span>Konfirmasi Pembayaran via WhatsApp Admin</span>
                <ExternalLink className="w-3.5 h-3.5 opacity-80" />
              </button>

              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={handleCopySummary}
                  className="py-2.5 px-3 rounded-xl text-xs font-semibold border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center justify-center gap-1.5"
                >
                  {copiedSummary ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedSummary ? 'Detail Tersalin!' : 'Salin Rincian Pesanan'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsOrderModalOpen(false)}
                  className="py-2.5 px-3 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 flex items-center justify-center gap-1"
                >
                  <span>Tutup / Selesai</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* GPS Leaflet Location Picker Modal */}
      <GpsLocationMapPickerModal
        isOpen={isMapModalOpen}
        onClose={() => setIsMapModalOpen(false)}
        onSave={handleSaveGpsLocation}
        initialLat={gpsLatitude}
        initialLng={gpsLongitude}
        initialRadius={gpsRadiusMeters}
        initialAddress={streetAddress}
      />
    </div>
  );
};
