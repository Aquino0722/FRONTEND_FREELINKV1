"use client";

import { useEffect, useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import * as Dialog from "@radix-ui/react-dialog";
import { toast } from "sonner";
import {
  CreditCard,
  Plus,
  Trash2,
  Check,
  CheckCircle2,
  Calendar,
  Download,
  AlertTriangle,
  FileText,
  Lock,
  ShieldCheck,
  Wallet,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  Info,
  X,
  Search,
  ExternalLink
} from "lucide-react";

import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useTransactions } from "@/features/payments/hooks/use-payments";
import { useAuthStore } from "@/lib/auth/auth-store";
import { formatCurrency, formatDate } from "@/lib/utils/formatters";

// Types
interface SavedCard {
  id: string;
  brand: "visa" | "mastercard" | "amex" | "generic";
  last4: string;
  expiry: string;
  isDefault: boolean;
  status: "Active" | "Expired";
  cardholderName: string;
}

interface PayoutMethod {
  id: string;
  bankName: string;
  accountType: string;
  last4: string;
  isDefault: boolean;
  status: "Verificado" | "Pendiente";
}

// Utility to print simulated PDF
function downloadMockInvoicePDF(
  invoiceNumber: string,
  date: string,
  amount: number,
  concept: string,
  clientName: string,
  freelancerName: string
) {
  const invoiceHtml = `
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="UTF-8">
      <title>Factura ${invoiceNumber}</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif; padding: 40px; color: #1e293b; line-height: 1.5; background: #fff; }
        .header { display: flex; justify-content: space-between; border-bottom: 2px solid #f1f5f9; padding-bottom: 20px; }
        .logo { font-size: 24px; font-weight: 700; color: #4f46e5; }
        .invoice-title { font-size: 28px; font-weight: 800; text-align: right; }
        .details { margin-top: 40px; display: grid; grid-template-columns: 1fr 1fr; gap: 40px; }
        .section-title { font-size: 11px; font-weight: 700; text-transform: uppercase; color: #94a3b8; tracking: 0.05em; margin-bottom: 8px; }
        .table { width: 100%; border-collapse: collapse; margin-top: 40px; }
        .table th { border-bottom: 2px solid #e2e8f0; text-align: left; padding: 12px; font-size: 11px; color: #64748b; font-weight: 600; text-transform: uppercase; }
        .table td { border-bottom: 1px solid #f1f5f9; padding: 16px 12px; font-size: 14px; }
        .total-section { margin-top: 40px; text-align: right; font-size: 18px; font-weight: 700; }
        .footer { margin-top: 80px; font-size: 12px; color: #94a3b8; text-align: center; border-top: 1px solid #f1f5f9; padding-top: 20px; }
        @media print {
          body { padding: 0; }
          .no-print { display: none; }
        }
      </style>
    </head>
    <body>
      <div class="header">
        <div>
          <div class="logo">FreeLink</div>
          <p style="font-size: 14px; color: #64748b; margin-top: 4px;">Plataforma de Freelancing Premium</p>
        </div>
        <div class="invoice-title">
          FACTURA
          <p style="font-size: 14px; font-weight: 500; color: #64748b; margin-top: 4px;"># ${invoiceNumber}</p>
        </div>
      </div>
      <div class="details">
        <div>
          <div class="section-title">Emisor (Freelancer)</div>
          <strong>${freelancerName}</strong>
          <p style="font-size: 14px; color: #64748b; margin: 4px 0 0 0;">Desarrollador de Software Independiente<br>Medellín, Colombia</p>
        </div>
        <div>
          <div class="section-title">Receptor (Cliente)</div>
          <strong>${clientName}</strong>
          <p style="font-size: 14px; color: #64748b; margin: 4px 0 0 0;">PixelCraft Studios<br>Bogotá, Colombia</p>
        </div>
      </div>
      <div style="margin-top: 30px;">
        <span class="section-title">Fecha de Emisión:</span> <span style="font-size: 14px;">${date}</span>
      </div>
      <table class="table">
        <thead>
          <tr>
            <th>Descripción</th>
            <th style="text-align: right;">Total</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>${concept}</td>
            <td style="text-align: right; font-weight: 600;">$${amount.toLocaleString()} USD</td>
          </tr>
        </tbody>
      </table>
      <div class="total-section">
        Total Facturado: <span style="color: #4f46e5; font-size: 24px;">$${amount.toLocaleString()} USD</span>
      </div>
      <div class="footer">
        Esta es una factura simulada generada por FreeLink. Todos los fondos se gestionaron a través de nuestro servicio de custodia (Escrow).
      </div>
      <script>
        window.onload = function() {
          window.print();
        }
      </script>
    </body>
    </html>
  `;
  const blob = new Blob([invoiceHtml], { type: "text/html" });
  const url = URL.createObjectURL(blob);
  const win = window.open(url, "_blank");
  if (!win) {
    toast.error("Por favor, permite ventanas emergentes para imprimir la factura.");
  }
}

export default function PaymentsPage() {
  const user = useAuthStore((state) => state.session?.user);
  
  // Tab State
  const [activeTab, setActiveTab] = useState<"transactions" | "methods" | "invoices">("transactions");
  
  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("All");

  // Fetch transactions (enabled for both client and freelancer)
  const query = useTransactions({ page: 1, pageSize: 20 }, !!user);
  
  // Selected transaction for timeline view
  const [selectedTxId, setSelectedTxId] = useState<number | null>(null);

  // Client Credit Cards state
  const [cards, setCards] = useState<SavedCard[]>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("freelink_saved_cards");
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch {
          // Fallback
        }
      }
    }
    return [
      { id: "1", brand: "visa", last4: "4242", expiry: "12/29", isDefault: true, status: "Active", cardholderName: "Valentina Rojas" },
      { id: "2", brand: "mastercard", last4: "8899", expiry: "08/28", isDefault: false, status: "Active", cardholderName: "Valentina Rojas" }
    ];
  });

  // Freelancer Payout Methods state
  const [payouts, setPayouts] = useState<PayoutMethod[]>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("freelink_saved_payouts");
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch {
          // Fallback
        }
      }
    }
    return [
      { id: "1", bankName: "Bancolombia", accountType: "Ahorros", last4: "5512", isDefault: true, status: "Verificado" },
      { id: "2", bankName: "Daviplata", accountType: "Monedero", last4: "0188", isDefault: false, status: "Verificado" }
    ];
  });

  // Modal States
  const [isAddCardOpen, setIsAddCardOpen] = useState(false);
  const [isAddBankOpen, setIsAddBankOpen] = useState(false);
  const [isLinkingStripe, setIsLinkingStripe] = useState(false);

  // New Credit Card Form State
  const [newCardNumber, setNewCardNumber] = useState("");
  const [newCardName, setNewCardName] = useState("");
  const [newCardExpiry, setNewCardExpiry] = useState("");
  const [newCardCvc, setNewCardCvc] = useState("");

  // New Bank Account Form State
  const [newBankName, setNewBankName] = useState("");
  const [newAccountType, setNewAccountType] = useState("Ahorros");
  const [newAccountNumber, setNewAccountNumber] = useState("");

  // Persist cards
  useEffect(() => {
    localStorage.setItem("freelink_saved_cards", JSON.stringify(cards));
  }, [cards]);

  // Persist payouts
  useEffect(() => {
    localStorage.setItem("freelink_saved_payouts", JSON.stringify(payouts));
  }, [payouts]);

  // Dynamic calculations based on user role
  const transactions = useMemo(() => {
    return query.data?.items ?? [];
  }, [query.data]);

  // Filtered transactions
  const filteredTransactions = useMemo(() => {
    return transactions.filter((tx) => {
      const matchesSearch = tx.description?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false;
      const matchesStatus = statusFilter === "All" || tx.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [transactions, searchTerm, statusFilter]);

  // Set default selected transaction once loaded
  useEffect(() => {
    if (transactions.length > 0 && selectedTxId === null) {
      setSelectedTxId(transactions[0].id);
    }
  }, [transactions, selectedTxId]);

  const selectedTx = useMemo(() => {
    return transactions.find((tx) => tx.id === selectedTxId) || transactions[0] || null;
  }, [transactions, selectedTxId]);

  // Calculated metrics
  const metrics = useMemo(() => {
    let escrow = 0;
    let paid = 0;
    let pending = 0;
    let nextPayment = 0;

    transactions.forEach((tx) => {
      const amount = tx.amount;
      if (tx.status === "Escrow") {
        escrow += amount;
      } else if (tx.status === "Paid") {
        paid += amount;
      } else if (tx.status === "Pending") {
        pending += amount;
      } else if (tx.status === "In Review") {
        nextPayment += amount;
      }
    });

    return { escrow, paid, pending, nextPayment };
  }, [transactions]);

  // Format Card Number input
  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, "").slice(0, 16);
    const matches = value.match(/\d{1,4}/g);
    setNewCardNumber(matches ? matches.join(" ") : value);
  };

  // Format Expiry input
  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, "").slice(0, 4);
    if (value.length > 2) {
      value = `${value.slice(0, 2)}/${value.slice(2)}`;
    }
    setNewCardExpiry(value);
  };

  // Detect card brand
  const getCardBrand = (num: string): SavedCard["brand"] => {
    const cleanNum = num.replace(/\s+/g, "");
    if (cleanNum.startsWith("4")) return "visa";
    if (cleanNum.startsWith("5")) return "mastercard";
    if (cleanNum.startsWith("3")) return "amex";
    return "generic";
  };

  // Save Card Handler
  const handleAddCard = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanNumber = newCardNumber.replace(/\s+/g, "");
    if (cleanNumber.length < 16) {
      toast.error("Por favor, introduce un número de tarjeta válido de 16 dígitos.");
      return;
    }
    if (newCardExpiry.length < 5) {
      toast.error("Introduce una fecha de expiración válida (MM/AA).");
      return;
    }
    if (newCardCvc.length < 3) {
      toast.error("Introduce un CVC válido.");
      return;
    }
    if (!newCardName.trim()) {
      toast.error("El nombre del titular es requerido.");
      return;
    }

    const brand = getCardBrand(cleanNumber);
    const last4 = cleanNumber.slice(-4);

    const newCard: SavedCard = {
      id: Math.random().toString(36).substr(2, 9),
      brand,
      last4,
      expiry: newCardExpiry,
      isDefault: cards.length === 0,
      status: "Active",
      cardholderName: newCardName
    };

    setCards([...cards, newCard]);
    setIsAddCardOpen(false);
    toast.success("Tarjeta guardada exitosamente");

    // Reset Form
    setNewCardNumber("");
    setNewCardName("");
    setNewCardExpiry("");
    setNewCardCvc("");
  };

  // Default Card handler
  const handleSetDefaultCard = (id: string) => {
    setCards(cards.map((c) => ({ ...c, isDefault: c.id === id })));
    toast.success("Método de pago predeterminado actualizado");
  };

  // Delete Card handler
  const handleDeleteCard = (id: string) => {
    const cardToDelete = cards.find((c) => c.id === id);
    setCards(cards.filter((c) => c.id !== id));
    toast.success("Tarjeta eliminada correctamente");
    if (cardToDelete?.isDefault && cards.length > 1) {
      const remaining = cards.filter((c) => c.id !== id);
      remaining[0].isDefault = true;
      setCards(remaining);
    }
  };

  // Save Bank Account Handler
  const handleAddBank = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBankName.trim()) {
      toast.error("El nombre del banco es obligatorio.");
      return;
    }
    if (newAccountNumber.length < 4) {
      toast.error("Introduce un número de cuenta válido.");
      return;
    }

    const last4 = newAccountNumber.slice(-4);
    const newBank: PayoutMethod = {
      id: Math.random().toString(36).substr(2, 9),
      bankName: newBankName,
      accountType: newAccountType,
      last4,
      isDefault: payouts.length === 0,
      status: "Verificado"
    };

    setPayouts([...payouts, newBank]);
    setIsAddBankOpen(false);
    toast.success("Cuenta bancaria agregada para retiros");

    // Reset Form
    setNewBankName("");
    setNewAccountNumber("");
  };

  // Default Bank handler
  const handleSetDefaultBank = (id: string) => {
    setPayouts(payouts.map((p) => ({ ...p, isDefault: p.id === id })));
    toast.success("Cuenta de retiros predeterminada actualizada");
  };

  // Delete Bank handler
  const handleDeleteBank = (id: string) => {
    const bankToDelete = payouts.find((p) => p.id === id);
    setPayouts(payouts.filter((p) => p.id !== id));
    toast.success("Cuenta bancaria eliminada");
    if (bankToDelete?.isDefault && payouts.length > 1) {
      const remaining = payouts.filter((p) => p.id !== id);
      remaining[0].isDefault = true;
      setPayouts(remaining);
    }
  };

  // Link Stripe Payout Express (simulated onboarding)
  const handleLinkStripeExpress = () => {
    setIsLinkingStripe(true);
    setTimeout(() => {
      setIsLinkingStripe(false);
      toast.success("¡Cuenta de Stripe Express vinculada correctamente!");
    }, 2000);
  };

  // Timeline Step Generator based on status
  const getTimelineSteps = (status: string) => {
    const steps = [
      { key: "created", label: "Pago Creado", desc: "El cliente inició el depósito para el hito" },
      { key: "escrow", label: "Fondos Retenidos", desc: "Fondos depositados en custodia segura (Escrow)" },
      { key: "submitted", label: "Entregable Enviado", desc: "Freelancer envió el entregable para revisión" },
      { key: "review", label: "Aprobación Cliente", desc: "Cliente revisa entregable y aprueba la liberación" },
      { key: "released", label: "Pago Liberado", desc: "Fondos liberados y transferidos al freelancer" }
    ];

    return steps.map((step, idx) => {
      let state: "completed" | "current" | "pending" = "pending";
      
      if (status === "Escrow") {
        if (idx === 0) state = "completed";
        else if (idx === 1) state = "current";
      } else if (status === "Pending") {
        if (idx <= 1) state = "completed";
        else if (idx === 2) state = "current";
      } else if (status === "In Review") {
        if (idx <= 2) state = "completed";
        else if (idx === 3) state = "current";
      } else if (status === "Paid") {
        state = "completed";
      }

      return { ...step, state };
    });
  };

  // Loading Skeleton State
  if (query.isLoading) {
    return (
      <div className="space-y-8">
        <PageHeader
          eyebrow="Finanzas"
          title="Módulo de Pagos"
          description="Monitorea tus hitos, fondos en garantía e historial de transacciones."
        />
        {/* Metric skeletons */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton className="h-[120px] w-full" key={i} />
          ))}
        </div>
        {/* Table & timeline skeleton */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-4">
            <Skeleton className="h-[400px] w-full" />
          </div>
          <div className="lg:col-span-1">
            <Skeleton className="h-[400px] w-full" />
          </div>
        </div>
      </div>
    );
  }

  // Error State
  if (query.isError) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center">
        <AlertTriangle className="h-12 w-12 text-rose-500 mb-4" />
        <h3 className="text-lg font-semibold text-slate-900">Error al cargar finanzas</h3>
        <p className="text-sm text-slate-500 mt-2">
          No pudimos conectar con los servicios financieros. Revisa tu conexión.
        </p>
        <Button variant="secondary" className="mt-6" onClick={() => query.refetch()}>
          Reintentar Carga
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <PageHeader
          eyebrow="Finanzas"
          title={user?.role === "Cliente" ? "Pagos Enviados" : "Ingresos & Retiros"}
          description={
            user?.role === "Cliente"
              ? "Monitorea los fondos retenidos en Escrow, realiza pagos de hitos y descarga tus facturas."
              : "Consulta tus honorarios acumulados, estado de los hitos en revisión y solicita tus retiros."
          }
        />
        <div className="flex items-center gap-2 self-start sm:self-center">
          <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-xs font-medium text-slate-600">Simulación Stripe Lista</span>
        </div>
      </div>

      {/* Grid de Métricas */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Escrow */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Card className="hover:-translate-y-1 hover:border-slate-800 transition-all duration-300 shadow-md">
            <CardContent className="flex items-center gap-4 p-6">
              <div className="rounded-xl bg-violet-500/10 border border-violet-500/20 p-3 text-violet-400">
                <Lock className="h-6 w-6" />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Fondos en Escrow</p>
                <h3 className="mt-1 text-2xl font-bold text-slate-100">{formatCurrency(metrics.escrow)}</h3>
                <p className="text-[10px] text-slate-500 mt-0.5">En garantía del proyecto</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Paid */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.05 }}
        >
          <Card className="hover:-translate-y-1 hover:border-slate-800 transition-all duration-300 shadow-md">
            <CardContent className="flex items-center gap-4 p-6">
              <div className="rounded-xl bg-emerald-500/10 border border-emerald-500/20 p-3 text-emerald-400">
                <CheckCircle2 className="h-6 w-6" />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  {user?.role === "Cliente" ? "Pagado" : "Ganado"}
                </p>
                <h3 className="mt-1 text-2xl font-bold text-slate-100">{formatCurrency(metrics.paid)}</h3>
                <p className="text-[10px] text-slate-500 mt-0.5">Transacciones aprobadas</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Pending */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <Card className="hover:-translate-y-1 hover:border-slate-800 transition-all duration-300 shadow-md">
            <CardContent className="flex items-center gap-4 p-6">
              <div className="rounded-xl bg-amber-500/10 border border-amber-500/20 p-3 text-amber-400">
                <Clock className="h-6 w-6" />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Pendiente</p>
                <h3 className="mt-1 text-2xl font-bold text-slate-100">{formatCurrency(metrics.pending)}</h3>
                <p className="text-[10px] text-slate-500 mt-0.5">Hitos programados</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Next Payment */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.15 }}
        >
          <Card className="hover:-translate-y-1 hover:border-slate-800 transition-all duration-300 shadow-md">
            <CardContent className="flex items-center gap-4 p-6">
              <div className="rounded-xl bg-blue-500/10 border border-blue-500/20 p-3 text-blue-400">
                <Calendar className="h-6 w-6" />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Próximo Pago</p>
                <h3 className="mt-1 text-2xl font-bold text-slate-100">{formatCurrency(metrics.nextPayment)}</h3>
                <p className="text-[10px] text-slate-500 mt-0.5">Hitos en revisión</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Tabs de Navegación */}
      <div className="flex border-b border-line">
        <button
          onClick={() => setActiveTab("transactions")}
          className={`flex items-center gap-2 border-b-2 px-6 py-3.5 text-sm font-semibold transition ${
            activeTab === "transactions"
              ? "border-brand text-brand bg-brand/5"
              : "border-transparent text-slate-400 hover:border-slate-700 hover:text-slate-200"
          }`}
        >
          <Wallet className="h-4 w-4" />
          Transacciones y Flujo
        </button>
        <button
          onClick={() => setActiveTab("methods")}
          className={`flex items-center gap-2 border-b-2 px-6 py-3.5 text-sm font-semibold transition ${
            activeTab === "methods"
              ? "border-brand text-brand bg-brand/5"
              : "border-transparent text-slate-400 hover:border-slate-700 hover:text-slate-200"
          }`}
        >
          <CreditCard className="h-4 w-4" />
          {user?.role === "Cliente" ? "Métodos de Pago" : "Cuentas de Retiro"}
        </button>
        <button
          onClick={() => setActiveTab("invoices")}
          className={`flex items-center gap-2 border-b-2 px-6 py-3.5 text-sm font-semibold transition ${
            activeTab === "invoices"
              ? "border-brand text-brand bg-brand/5"
              : "border-transparent text-slate-400 hover:border-slate-700 hover:text-slate-200"
          }`}
        >
          <FileText className="h-4 w-4" />
          Facturación Histórica
        </button>
      </div>

      {/* Contenido de Tabs */}
      <div className="mt-2">
        <AnimatePresence mode="wait">
          {/* TAB 1: TRANSACCIONES & TIMELINE */}
          {activeTab === "transactions" && (
            <motion.div
              key="transactions-tab"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="grid grid-cols-1 gap-6 lg:grid-cols-3"
            >
              {/* Tabla de Transacciones */}
              <div className="lg:col-span-2 space-y-4">
                <Card className="overflow-hidden">
                  <CardHeader className="flex flex-col gap-4 border-b border-line bg-slate-950/20 p-5 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <h3 className="text-base font-bold text-slate-200">Historial de Hitos</h3>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Selecciona una transacción para inspeccionar su línea de tiempo actual.
                      </p>
                    </div>

                    {/* Filtros */}
                    <div className="flex flex-wrap items-center gap-2">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                        <input
                          type="text"
                          placeholder="Buscar concepto..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="h-9 rounded-lg border border-line bg-slate-950/40 text-slate-200 pl-9 pr-4 text-xs placeholder-slate-500 focus:border-brand focus:outline-none"
                        />
                      </div>
                      <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="h-9 rounded-lg border border-line bg-slate-950/40 px-3 text-xs text-slate-300 focus:border-brand focus:outline-none"
                      >
                        <option value="All" className="bg-slate-900 text-slate-200">Todos</option>
                        <option value="Paid" className="bg-slate-900 text-slate-200">Paid</option>
                        <option value="Pending" className="bg-slate-900 text-slate-200">Pending</option>
                        <option value="In Review" className="bg-slate-900 text-slate-200">In Review</option>
                        <option value="Escrow" className="bg-slate-900 text-slate-200">Escrow</option>
                      </select>
                    </div>
                  </CardHeader>

                  <div className="overflow-x-auto">
                    {filteredTransactions.length === 0 ? (
                      <div className="flex flex-col items-center justify-center p-14 text-center">
                        <div className="rounded-full bg-slate-950/60 border border-line p-4 mb-4">
                          <Wallet className="h-8 w-8 text-slate-500" />
                        </div>
                        <h4 className="text-sm font-semibold text-slate-200">No se encontraron pagos</h4>
                        <p className="text-xs text-slate-400 mt-2 max-w-sm">
                          No existen pagos que coincidan con la búsqueda o filtros aplicados actualmente.
                        </p>
                        <Button
                          variant="secondary"
                          size="sm"
                          className="mt-4"
                          onClick={() => {
                            setSearchTerm("");
                            setStatusFilter("All");
                          }}
                        >
                          Limpiar Filtros
                        </Button>
                      </div>
                    ) : (
                      <table className="w-full text-left text-sm border-collapse">
                        <thead>
                          <tr className="border-b border-line bg-slate-950/40 text-xs font-semibold uppercase tracking-wider text-slate-400">
                            <th className="px-5 py-3">Concepto</th>
                            <th className="px-5 py-3">Fecha</th>
                            <th className="px-5 py-3">Estado</th>
                            <th className="px-5 py-3">Monto</th>
                            <th className="px-5 py-3 text-right">Acción</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredTransactions.map((tx) => {
                            const isSelected = tx.id === selectedTxId;
                            return (
                              <motion.tr
                                key={tx.id}
                                layoutId={`row-${tx.id}`}
                                onClick={() => setSelectedTxId(tx.id)}
                                className={`group cursor-pointer border-b border-line last:border-0 hover:bg-slate-800/20 transition duration-150 ${
                                  isSelected ? "bg-brand/10 hover:bg-brand/20" : ""
                                }`}
                              >
                                <td className="px-5 py-4">
                                  <div className="flex items-center gap-3">
                                    <div
                                      className={`rounded-lg p-2 ${
                                        tx.status === "Paid"
                                          ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                                          : tx.status === "Escrow"
                                          ? "bg-violet-500/10 text-violet-400 border border-violet-500/20"
                                          : tx.status === "In Review"
                                          ? "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                                          : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                                      }`}
                                    >
                                      {tx.status === "Paid" ? (
                                        <ArrowDownRight className="h-4 w-4" />
                                      ) : (
                                        <ArrowUpRight className="h-4 w-4" />
                                      )}
                                    </div>
                                    <div>
                                      <p className="font-medium text-slate-200 leading-tight">
                                        {tx.description || "Milestone del Proyecto"}
                                      </p>
                                      <p className="text-[11px] text-slate-500 mt-0.5">
                                        Tipo: {tx.type === "EscrowRelease" ? "Liberación" : "Garantía de Depósito"}
                                      </p>
                                    </div>
                                  </div>
                                </td>
                                <td className="whitespace-nowrap px-5 py-4 text-xs text-slate-400">
                                  {formatDate(tx.createdAt)}
                                </td>
                                <td className="px-5 py-4">
                                  <StatusBadge status={tx.status} />
                                </td>
                                <td className="whitespace-nowrap px-5 py-4 font-bold text-slate-200">
                                  {formatCurrency(tx.amount)}
                                </td>
                                <td className="px-5 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                                  <div className="flex justify-end items-center gap-2">
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      onClick={() => setSelectedTxId(tx.id)}
                                      className="text-slate-400 group-hover:text-brand"
                                    >
                                      Detalles
                                    </Button>
                                    {tx.status === "Paid" && (
                                      <Button
                                        size="sm"
                                        variant="secondary"
                                        className="h-8 w-8 p-0"
                                        title="Imprimir Factura"
                                        onClick={() =>
                                          downloadMockInvoicePDF(
                                            `INV-2026-${tx.id}`,
                                            formatDate(tx.createdAt),
                                            tx.amount,
                                            tx.description || "Servicio Digital",
                                            "PixelCraft Studios (Cliente)",
                                            "Mateo Sánchez (Freelancer)"
                                          )
                                        }
                                      >
                                        <Download className="h-3.5 w-3.5" />
                                      </Button>
                                    )}
                                  </div>
                                </td>
                              </motion.tr>
                            );
                          })}
                        </tbody>
                      </table>
                    )}
                  </div>
                </Card>
              </div>

              {/* Payment Timeline Sidepanel */}
              <div className="lg:col-span-1">
                <Card className="sticky top-6 border border-line overflow-hidden shadow-md">
                  <div className="bg-slate-950/80 border-b border-line p-5 text-slate-200">
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="h-5 w-5 text-emerald-400" />
                      <h3 className="font-bold text-sm uppercase tracking-wider">Flujo de Garantía (Escrow)</h3>
                    </div>
                    {selectedTx ? (
                      <div className="mt-4">
                        <p className="text-xs text-slate-555 uppercase tracking-widest font-semibold text-slate-500">
                          Inspeccionando Hito
                        </p>
                        <h4 className="font-bold text-base mt-1 line-clamp-1 text-slate-200">{selectedTx.description}</h4>
                        <div className="flex items-baseline gap-2 mt-2">
                          <span className="text-2xl font-extrabold text-slate-100">{formatCurrency(selectedTx.amount)}</span>
                          <span className="text-xs text-slate-400">USD</span>
                        </div>
                      </div>
                    ) : (
                      <p className="text-xs text-slate-400 mt-4">
                        Ningún pago seleccionado. Elige uno en el historial.
                      </p>
                    )}
                  </div>

                  <CardContent className="p-5">
                    {selectedTx ? (
                      <div className="relative border-l border-line pl-6 ml-3 py-2 space-y-6">
                        {getTimelineSteps(selectedTx.status).map((step, idx) => (
                          <div className="relative" key={step.key}>
                            {/* Dot indicator */}
                            <div
                              className={`absolute -left-[37px] top-1.5 flex h-[22px] w-[22px] items-center justify-center rounded-full border text-[10px] font-bold transition duration-300 ${
                                step.state === "completed"
                                  ? "bg-emerald-500 border-emerald-500 text-white"
                                  : step.state === "current"
                                  ? "bg-brand border-brand text-white shadow-[0_0_10px_rgba(99,102,241,0.4)] animate-pulse"
                                  : "bg-slate-900 border-line text-slate-555 text-slate-500"
                              }`}
                            >
                              {step.state === "completed" ? (
                                <Check className="h-3 w-3" />
                              ) : (
                                idx + 1
                              )}
                            </div>

                            {/* Node Details */}
                            <div>
                              <h5
                                className={`text-xs font-bold transition ${
                                  step.state === "completed"
                                    ? "text-slate-300"
                                    : step.state === "current"
                                    ? "text-brand"
                                    : "text-slate-500"
                                }`}
                              >
                                {step.label}
                              </h5>
                              <p className="text-[11px] text-slate-400 mt-0.5 leading-normal">{step.desc}</p>
                              {step.state === "current" && (
                                <div className="mt-2 flex gap-2">
                                  {step.key === "review" && user?.role === "Cliente" && (
                                    <Button
                                      size="sm"
                                      className="h-7 text-[10px] bg-emerald-600 hover:bg-emerald-700 text-white rounded-md"
                                      onClick={() => {
                                        toast.success("¡Pago aprobado y liberado!");
                                        // Update status to Paid in view
                                        selectedTx.status = "Paid";
                                        setSelectedTxId(selectedTx.id);
                                      }}
                                    >
                                      Liberar Pago
                                    </Button>
                                  )}
                                  {step.key === "submitted" && user?.role === "Freelancer" && (
                                    <Button
                                      size="sm"
                                      className="h-7 text-[10px] bg-brand hover:bg-[#5149ed] text-white rounded-md"
                                      onClick={() => {
                                        toast.success("Entregable enviado al cliente.");
                                        // Update status to In Review
                                        selectedTx.status = "In Review";
                                        setSelectedTxId(selectedTx.id);
                                      }}
                                    >
                                      Enviar Entregable
                                    </Button>
                                  )}
                                  <span className="inline-flex items-center gap-1 rounded bg-slate-950/60 border border-line px-2 py-0.5 text-[9px] font-semibold text-slate-400 font-medium">
                                    A la espera
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-6 text-slate-500 text-xs flex flex-col items-center">
                        <Info className="h-6 w-6 text-slate-400 mb-2" />
                        Selecciona un pago para ver el flujo.
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </motion.div>
          )}

          {/* TAB 2: METODOS DE PAGO */}
          {activeTab === "methods" && (
            <motion.div
              key="methods-tab"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="space-y-6"
            >
              {/* CLIENT VIEW: Saved Credit Cards */}
              {user?.role === "Cliente" && (
                <div className="space-y-6">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <h3 className="text-lg font-bold text-slate-200">Tarjetas de Crédito Guardadas</h3>
                      <p className="text-sm text-slate-400 mt-0.5">
                        Administra tus medios de pago seguros (Stripe Elements Sandbox).
                      </p>
                    </div>

                    <Dialog.Root open={isAddCardOpen} onOpenChange={setIsAddCardOpen}>
                      <Dialog.Trigger asChild>
                        <Button className="flex items-center gap-2">
                          <Plus className="h-4 w-4" /> Agregar Tarjeta
                        </Button>
                      </Dialog.Trigger>
                      <Dialog.Portal>
                        <Dialog.Overlay className="fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-sm" />
                        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-[calc(100%-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-line bg-panel p-6 shadow-2xl focus:outline-none">
                          <div className="flex items-center justify-between">
                            <Dialog.Title className="text-base font-bold text-slate-200">
                              Nuevo Método de Pago (Stripe Checkout)
                            </Dialog.Title>
                            <Dialog.Close className="text-slate-400 hover:text-slate-200">
                              <X className="h-5 w-5" />
                            </Dialog.Close>
                          </div>
                          <Dialog.Description className="text-xs text-slate-400 mt-1">
                            Introduce tus datos de forma segura. La conexión está cifrada.
                          </Dialog.Description>

                          {/* Interactive Credit Card Preview */}
                          <div className="mt-5 rounded-2xl bg-gradient-to-r from-slate-950 to-slate-900 border border-line p-5 text-white shadow-lg relative overflow-hidden">
                            {/* Card Brand */}
                            <div className="absolute right-5 top-5">
                              {getCardBrand(newCardNumber) === "visa" && (
                                <span className="font-extrabold italic text-2xl text-blue-300">VISA</span>
                              )}
                              {getCardBrand(newCardNumber) === "mastercard" && (
                                <span className="font-extrabold italic text-2xl text-amber-500">MC</span>
                              )}
                              {getCardBrand(newCardNumber) === "amex" && (
                                <span className="font-extrabold italic text-2xl text-emerald-400">AMEX</span>
                              )}
                              {getCardBrand(newCardNumber) === "generic" && (
                                <CreditCard className="h-6 w-6 text-slate-400" />
                              )}
                            </div>
                            <div className="h-6 w-9 rounded bg-yellow-500/80 mb-6" /> {/* Chip */}
                            <p className="text-base font-bold tracking-widest text-slate-200">
                              {newCardNumber || "•••• •••• •••• ••••"}
                            </p>
                            <div className="mt-6 flex justify-between">
                              <div>
                                <p className="text-[9px] uppercase tracking-wider text-slate-400">Titular</p>
                                <p className="text-xs font-bold truncate max-w-[200px] text-slate-200">
                                  {newCardName.toUpperCase() || "NOMBRE DEL TITULAR"}
                                </p>
                              </div>
                              <div>
                                <p className="text-[9px] uppercase tracking-wider text-slate-400">Expiración</p>
                                <p className="text-xs font-bold text-slate-200">{newCardExpiry || "MM/AA"}</p>
                              </div>
                            </div>
                          </div>

                          {/* Card Input Form */}
                          <form onSubmit={handleAddCard} className="mt-6 space-y-4">
                            <div>
                              <label className="block text-xs font-semibold text-slate-355 text-slate-300">Nombre en la tarjeta</label>
                              <input
                                type="text"
                                required
                                value={newCardName}
                                onChange={(e) => setNewCardName(e.target.value)}
                                className="mt-1 h-10 w-full rounded-xl border border-line bg-slate-950/40 text-slate-255 text-slate-200 px-3 text-sm focus:border-brand focus:outline-none"
                                placeholder="Juan Pérez"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-semibold text-slate-355 text-slate-300">Número de Tarjeta</label>
                              <div className="relative">
                                <input
                                  type="text"
                                  required
                                  value={newCardNumber}
                                  onChange={handleCardNumberChange}
                                  className="mt-1 h-10 w-full rounded-xl border border-line bg-slate-950/40 text-slate-255 text-slate-200 px-3 text-sm focus:border-brand focus:outline-none"
                                  placeholder="4000 1234 5678 9010"
                                />
                                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                  <Lock className="h-4 w-4 text-slate-500" />
                                </div>
                              </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <label className="block text-xs font-semibold text-slate-355 text-slate-300">Vencimiento</label>
                                <input
                                  type="text"
                                  required
                                  value={newCardExpiry}
                                  onChange={handleExpiryChange}
                                  className="mt-1 h-10 w-full rounded-xl border border-line bg-slate-950/40 text-slate-255 text-slate-200 px-3 text-sm focus:border-brand focus:outline-none"
                                  placeholder="MM/AA"
                                />
                              </div>
                              <div>
                                <label className="block text-xs font-semibold text-slate-355 text-slate-300">CVC / CVV</label>
                                <input
                                  type="password"
                                  required
                                  maxLength={4}
                                  value={newCardCvc}
                                  onChange={(e) => setNewCardCvc(e.target.value.replace(/\D/g, ""))}
                                  className="mt-1 h-10 w-full rounded-xl border border-line bg-slate-950/40 text-slate-255 text-slate-200 px-3 text-sm focus:border-brand focus:outline-none"
                                  placeholder="•••"
                                />
                              </div>
                            </div>

                            <div className="mt-6 flex justify-end gap-3 pt-3 border-t border-line">
                              <Dialog.Close asChild>
                                <Button variant="secondary" type="button">
                                  Cancelar
                                </Button>
                              </Dialog.Close>
                              <Button type="submit">Guardar Tarjeta</Button>
                            </div>
                          </form>
                        </Dialog.Content>
                      </Dialog.Portal>
                    </Dialog.Root>
                  </div>

                  {cards.length === 0 ? (
                    <Card className="flex flex-col items-center justify-center p-14 text-center">
                      <div className="rounded-full bg-slate-950/60 border border-line p-4 mb-4">
                        <CreditCard className="h-8 w-8 text-slate-500" />
                      </div>
                      <h4 className="text-sm font-semibold text-slate-200">No tienes tarjetas registradas</h4>
                      <p className="text-xs text-slate-400 mt-2 max-w-sm">
                        Agrega un método de pago seguro para financiar tus contratos de freelancers con total garantía.
                      </p>
                      <Button className="mt-4" onClick={() => setIsAddCardOpen(true)}>
                        Agregar Tarjeta
                      </Button>
                    </Card>
                  ) : (
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                      {cards.map((card) => (
                        <motion.div
                          key={card.id}
                          layout
                          className={`relative flex flex-col justify-between rounded-2xl border p-5 bg-panel/40 transition hover:shadow-md ${
                            card.isDefault ? "border-brand ring-1 ring-brand" : "border-line"
                          }`}
                        >
                          {/* Card Top */}
                          <div className="flex items-start justify-between">
                            <div className="flex items-center gap-3">
                              <div
                                className={`rounded-lg p-2.5 ${
                                  card.brand === "visa"
                                    ? "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                                    : card.brand === "mastercard"
                                    ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                                    : card.brand === "amex"
                                    ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                                    : "bg-slate-800/40 text-slate-400 border border-line"
                                }`}
                              >
                                <CreditCard className="h-5 w-5" />
                              </div>
                              <div>
                                <p className="text-sm font-bold text-slate-200 capitalize">
                                  {card.brand} •••• {card.last4}
                                </p>
                                <p className="text-xs text-slate-555 text-slate-500 mt-0.5">Expira: {card.expiry}</p>
                              </div>
                            </div>
                            {card.isDefault && (
                              <span className="rounded bg-brand-soft px-2 py-0.5 text-[9px] font-semibold text-brand">
                                Predeterminado
                              </span>
                            )}
                          </div>

                          {/* Card Bottom */}
                          <div className="mt-6 flex items-center justify-between border-t border-line pt-3">
                            <p className="text-[10px] text-slate-400 truncate max-w-[130px]" title={card.cardholderName}>
                              {card.cardholderName}
                            </p>
                            <div className="flex items-center gap-2">
                              {!card.isDefault && (
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => handleSetDefaultCard(card.id)}
                                  className="text-xs h-8 px-2"
                                >
                                  Hacer Principal
                                </Button>
                              )}
                              <Button
                                size="sm"
                                variant="danger"
                                onClick={() => handleDeleteCard(card.id)}
                                className="h-8 w-8 p-0"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}

                  {/* Security Badge */}
                  <div className="rounded-2xl bg-slate-950/40 p-4 flex items-center gap-3 border border-line">
                    <ShieldCheck className="h-5 w-5 text-emerald-555 text-emerald-500 flex-shrink-0" />
                    <p className="text-xs text-slate-400 leading-normal">
                      Tus transacciones están respaldadas por la infraestructura sandbox de Stripe. Ningún número de tarjeta físico es almacenado en nuestros servidores.
                    </p>
                  </div>
                </div>
              )}

              {/* FREELANCER VIEW: Payout Accounts */}
              {user?.role === "Freelancer" && (
                <div className="space-y-6">
                  {/* Stripe Express Link Action */}
                  <Card className="border border-indigo-500/20 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 p-6">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="rounded-full bg-indigo-500/20 border border-indigo-500/20 px-2.5 py-0.5 text-xs font-semibold text-indigo-400">
                            Recomendado
                          </span>
                          <h4 className="font-bold text-sm text-slate-100">Vincular con Stripe Connect</h4>
                        </div>
                        <p className="text-xs text-slate-400 max-w-xl leading-normal">
                          Configura retiros instantáneos y automáticos a tu banco o tarjeta de débito en más de 120 países con Stripe Connect Express.
                        </p>
                      </div>
                      <Button
                        onClick={handleLinkStripeExpress}
                        disabled={isLinkingStripe}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs whitespace-nowrap self-start sm:self-center"
                      >
                        {isLinkingStripe ? "Conectando con Stripe..." : "Conectar Stripe Express"}
                        <ExternalLink className="ml-1 h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </Card>

                  {/* Bank Accounts Section */}
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <h3 className="text-lg font-bold text-slate-200">Cuentas Bancarias Locales</h3>
                      <p className="text-sm text-slate-400 mt-0.5">
                        Agrega cuentas locales para transferencias programadas.
                      </p>
                    </div>

                    <Dialog.Root open={isAddBankOpen} onOpenChange={setIsAddBankOpen}>
                      <Dialog.Trigger asChild>
                        <Button className="flex items-center gap-2">
                          <Plus className="h-4 w-4" /> Agregar Cuenta
                        </Button>
                      </Dialog.Trigger>
                      <Dialog.Portal>
                        <Dialog.Overlay className="fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-sm" />
                        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-[calc(100%-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-line bg-panel p-6 shadow-2xl focus:outline-none">
                          <div className="flex items-center justify-between">
                            <Dialog.Title className="text-base font-bold text-slate-200">
                              Nueva Cuenta de Retiro
                            </Dialog.Title>
                            <Dialog.Close className="text-slate-400 hover:text-slate-200">
                              <X className="h-5 w-5" />
                            </Dialog.Close>
                          </div>
                          <Dialog.Description className="text-xs text-slate-400 mt-1">
                            Tus ingresos se transferirán a esta cuenta al solicitar el cobro.
                          </Dialog.Description>

                          <form onSubmit={handleAddBank} className="mt-5 space-y-4">
                            <div>
                              <label className="block text-xs font-semibold text-slate-300">Entidad Bancaria</label>
                              <input
                                type="text"
                                required
                                value={newBankName}
                                onChange={(e) => setNewBankName(e.target.value)}
                                className="mt-1 h-10 w-full rounded-xl border border-line bg-slate-950/40 text-slate-200 px-3 text-sm focus:border-brand focus:outline-none"
                                placeholder="Bancolombia, BBVA, etc."
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-semibold text-slate-300">Tipo de Cuenta</label>
                              <select
                                value={newAccountType}
                                onChange={(e) => setNewAccountType(e.target.value)}
                                className="mt-1 h-10 w-full rounded-xl border border-line bg-slate-950/40 text-slate-200 px-3 text-sm focus:border-brand focus:outline-none"
                              >
                                <option value="Ahorros" className="bg-slate-900">Cuenta de Ahorros</option>
                                <option value="Corriente" className="bg-slate-900">Cuenta Corriente</option>
                                <option value="Monedero" className="bg-slate-900">Monedero Electrónico</option>
                              </select>
                            </div>
                            <div>
                              <label className="block text-xs font-semibold text-slate-300">Número de Cuenta</label>
                              <input
                                type="text"
                                required
                                value={newAccountNumber}
                                onChange={(e) => setNewAccountNumber(e.target.value.replace(/\D/g, ""))}
                                className="mt-1 h-10 w-full rounded-xl border border-line bg-slate-950/40 text-slate-200 px-3 text-sm focus:border-brand focus:outline-none"
                                placeholder="1234567890"
                              />
                            </div>

                            <div className="mt-6 flex justify-end gap-3 pt-3 border-t border-line">
                              <Dialog.Close asChild>
                                <Button variant="secondary" type="button">
                                  Cancelar
                                </Button>
                              </Dialog.Close>
                              <Button type="submit">Guardar Cuenta</Button>
                            </div>
                          </form>
                        </Dialog.Content>
                      </Dialog.Portal>
                    </Dialog.Root>
                  </div>

                  {payouts.length === 0 ? (
                    <Card className="flex flex-col items-center justify-center p-14 text-center">
                      <div className="rounded-full bg-slate-950/60 border border-line p-4 mb-4">
                        <Wallet className="h-8 w-8 text-slate-500" />
                      </div>
                      <h4 className="text-sm font-semibold text-slate-200">No tienes cuentas de retiro asociadas</h4>
                      <p className="text-xs text-slate-400 mt-2 max-w-sm">
                        Asocia una cuenta bancaria o utiliza Stripe Connect para poder retirar tus ganancias acumuladas.
                      </p>
                      <Button className="mt-4" onClick={() => setIsAddBankOpen(true)}>
                        Agregar Cuenta Bancaria
                      </Button>
                    </Card>
                  ) : (
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                      {payouts.map((payout) => (
                        <div
                          key={payout.id}
                          className={`relative flex flex-col justify-between rounded-2xl border p-5 bg-panel/40 transition hover:shadow-md ${
                            payout.isDefault ? "border-brand ring-1 ring-brand" : "border-line"
                          }`}
                        >
                          <div className="flex items-start justify-between">
                            <div>
                              <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest">
                                {payout.accountType}
                              </span>
                              <h4 className="font-bold text-base text-slate-200 mt-1">{payout.bankName}</h4>
                              <p className="text-xs text-slate-400 mt-0.5">Nº de cuenta: •••• {payout.last4}</p>
                            </div>
                            <div className="flex flex-col items-end gap-2">
                              <span
                                className={`rounded px-1.5 py-0.5 text-[9px] font-semibold ${
                                  payout.status === "Verificado"
                                    ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                                    : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                                }`}
                              >
                                {payout.status}
                              </span>
                              {payout.isDefault && (
                                <span className="rounded bg-brand-soft px-1.5 py-0.5 text-[9px] font-semibold text-brand">
                                  Predeterminado
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="mt-6 flex items-center justify-end border-t border-line pt-3 gap-2">
                            {!payout.isDefault && (
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleSetDefaultBank(payout.id)}
                                className="text-xs h-8 px-2"
                              >
                                Hacer Principal
                              </Button>
                            )}
                            <Button
                              size="sm"
                              variant="danger"
                              onClick={() => handleDeleteBank(payout.id)}
                              className="h-8 w-8 p-0"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          )}

          {/* TAB 3: FACTURACION HISTORICA */}
          {activeTab === "invoices" && (
            <motion.div
              key="invoices-tab"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="space-y-4"
            >
              <Card className="overflow-hidden">
                <CardHeader className="p-5 border-b border-line bg-slate-950/20">
                  <h3 className="text-base font-bold text-slate-200">Historial de Facturas</h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Descarga comprobantes en formato PDF para contabilidad. Generado automáticamente por transacción aprobada.
                  </p>
                </CardHeader>

                {transactions.filter((t) => t.status === "Paid").length === 0 ? (
                  <div className="flex flex-col items-center justify-center p-14 text-center">
                    <div className="rounded-full bg-slate-950/60 border border-line p-4 mb-4">
                      <FileText className="h-8 w-8 text-slate-500" />
                    </div>
                    <h4 className="text-sm font-semibold text-slate-200">Sin facturas emitidas</h4>
                    <p className="text-xs text-slate-400 mt-2 max-w-sm">
                      Las facturas se generan únicamente cuando los hitos han sido aprobados y liberados (Estado: Paid).
                    </p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm border-collapse">
                      <thead>
                        <tr className="border-b border-line bg-slate-950/40 text-xs font-semibold uppercase tracking-wider text-slate-400">
                          <th className="px-5 py-3">Número de Factura</th>
                          <th className="px-5 py-3">Proyecto / Hito</th>
                          <th className="px-5 py-3">Fecha de Emisión</th>
                          <th className="px-5 py-3">Monto</th>
                          <th className="px-5 py-3 text-right">Comprobante</th>
                        </tr>
                      </thead>
                      <tbody>
                        {transactions
                          .filter((t) => t.status === "Paid")
                          .map((tx) => (
                            <tr key={tx.id} className="border-b border-line last:border-0 hover:bg-slate-800/20 transition">
                              <td className="px-5 py-4 font-mono text-xs font-bold text-slate-400">
                                INV-2026-{tx.id}
                              </td>
                              <td className="px-5 py-4 font-medium text-slate-200">{tx.description}</td>
                              <td className="px-5 py-4 text-xs text-slate-400">{formatDate(tx.createdAt)}</td>
                              <td className="px-5 py-4 font-semibold text-slate-200">{formatCurrency(tx.amount)}</td>
                              <td className="px-5 py-4 text-right">
                                <Button
                                  size="sm"
                                  variant="secondary"
                                  onClick={() =>
                                    downloadMockInvoicePDF(
                                      `INV-2026-${tx.id}`,
                                      formatDate(tx.createdAt),
                                      tx.amount,
                                      tx.description || "Hito Final del Proyecto",
                                      "PixelCraft Studios (Cliente)",
                                      "Mateo Sánchez (Freelancer)"
                                    )
                                  }
                                  className="inline-flex items-center gap-1.5"
                                >
                                  <Download className="h-3.5 w-3.5" /> Descargar PDF
                                </Button>
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
