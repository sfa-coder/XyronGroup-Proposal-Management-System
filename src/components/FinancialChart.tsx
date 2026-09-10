import React, { useState, useMemo } from "react";
import { Invoice, PaymentReceipt, CompanyProfile } from "../types";
import { formatCurrency } from "../utils/storage";
import {
  DollarSign,
  TrendingUp,
  CreditCard,
  Receipt,
  Calendar,
  CheckCircle2,
  ArrowUpRight,
  BarChart3,
  Layers,
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  Area,
  ComposedChart,
} from "recharts";

interface FinancialChartProps {
  invoices: Invoice[];
  receipts: PaymentReceipt[];
  company: CompanyProfile;
}

export const FinancialChart: React.FC<FinancialChartProps> = ({
  invoices,
  receipts,
  company,
}) => {
  const [timeRange, setTimeRange] = useState<"6m" | "12m" | "all">("6m");
  const [chartType, setChartType] = useState<"bar" | "area">("bar");

  // Calculate monthly aggregations
  const { monthlyData, totalInvoiced, totalCollected, totalPending, collectionRate } = useMemo(() => {
    const monthMap: {
      [key: string]: {
        monthKey: string;
        monthLabel: string;
        timestamp: number;
        invoicedRevenue: number;
        collectedRevenue: number;
        invoiceCount: number;
        receiptCount: number;
      };
    } = {};

    // Generate past 12 months keys as baseline to ensure smooth continuous timeline
    const now = new Date();
    const monthsToGenerate = timeRange === "6m" ? 6 : timeRange === "12m" ? 12 : 24;

    for (let i = monthsToGenerate - 1; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      const label = d.toLocaleDateString("en-US", { month: "short", year: "2-digit" });
      monthMap[key] = {
        monthKey: key,
        monthLabel: label,
        timestamp: d.getTime(),
        invoicedRevenue: 0,
        collectedRevenue: 0,
        invoiceCount: 0,
        receiptCount: 0,
      };
    }

    let sumInvoiced = 0;
    let sumCollected = 0;

    // Process Invoices (Paid or Completed)
    invoices.forEach((inv) => {
      const isCompletedOrPaid = inv.status === "Paid" || inv.isCompleted || (inv.amountPaid || 0) > 0;
      const invDate = new Date(inv.issueDate || inv.createdAt || Date.now());
      if (!isNaN(invDate.getTime())) {
        const key = `${invDate.getFullYear()}-${String(invDate.getMonth() + 1).padStart(2, "0")}`;
        const amount = isCompletedOrPaid ? inv.grandTotal : (inv.amountPaid || 0);

        if (amount > 0) {
          sumInvoiced += amount;
          if (!monthMap[key]) {
            monthMap[key] = {
              monthKey: key,
              monthLabel: invDate.toLocaleDateString("en-US", { month: "short", year: "2-digit" }),
              timestamp: new Date(invDate.getFullYear(), invDate.getMonth(), 1).getTime(),
              invoicedRevenue: 0,
              collectedRevenue: 0,
              invoiceCount: 0,
              receiptCount: 0,
            };
          }
          monthMap[key].invoicedRevenue += amount;
          monthMap[key].invoiceCount += 1;
        }
      }
    });

    // Process Payment Receipts (Settled)
    receipts.forEach((rec) => {
      if (rec.status === "Settled" || !rec.status) {
        const recDate = new Date(rec.paymentDate || rec.createdAt || Date.now());
        if (!isNaN(recDate.getTime())) {
          const key = `${recDate.getFullYear()}-${String(recDate.getMonth() + 1).padStart(2, "0")}`;
          const amount = rec.amountPaid || 0;

          if (amount > 0) {
            sumCollected += amount;
            if (!monthMap[key]) {
              monthMap[key] = {
                monthKey: key,
                monthLabel: recDate.toLocaleDateString("en-US", { month: "short", year: "2-digit" }),
                timestamp: new Date(recDate.getFullYear(), recDate.getMonth(), 1).getTime(),
                invoicedRevenue: 0,
                collectedRevenue: 0,
                invoiceCount: 0,
                receiptCount: 0,
              };
            }
            monthMap[key].collectedRevenue += amount;
            monthMap[key].receiptCount += 1;
          }
        }
      }
    });

    // Sort by timestamp
    const sortedList = Object.values(monthMap).sort((a, b) => a.timestamp - b.timestamp);

    // Filter to selected time range window
    const filtered =
      timeRange === "6m"
        ? sortedList.slice(-6)
        : timeRange === "12m"
        ? sortedList.slice(-12)
        : sortedList;

    const rate = sumInvoiced > 0 ? Math.min(100, Math.round((sumCollected / sumInvoiced) * 100)) : sumCollected > 0 ? 100 : 0;
    const pending = Math.max(0, sumInvoiced - sumCollected);

    return {
      monthlyData: filtered,
      totalInvoiced: sumInvoiced,
      totalCollected: sumCollected,
      totalPending: pending,
      collectionRate: rate,
    };
  }, [invoices, receipts, timeRange]);

  return (
    <div className="bg-white dark:bg-slate-900 p-6 sm:p-7 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white tracking-tight">
                Financial Revenue Overview
              </h2>
              <p className="text-xs text-slate-400">
                Monthly revenue performance based on completed invoices & settled payment receipts
              </p>
            </div>
          </div>
        </div>

        {/* Range & View Toggles */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Time range selector */}
          <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
            <button
              type="button"
              onClick={() => setTimeRange("6m")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                timeRange === "6m"
                  ? "bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm"
                  : "text-slate-500 hover:text-slate-900 dark:hover:text-slate-200"
              }`}
            >
              6 Months
            </button>
            <button
              type="button"
              onClick={() => setTimeRange("12m")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                timeRange === "12m"
                  ? "bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm"
                  : "text-slate-500 hover:text-slate-900 dark:hover:text-slate-200"
              }`}
            >
              12 Months
            </button>
            <button
              type="button"
              onClick={() => setTimeRange("all")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                timeRange === "all"
                  ? "bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm"
                  : "text-slate-500 hover:text-slate-900 dark:hover:text-slate-200"
              }`}
            >
              All Time
            </button>
          </div>

          {/* Chart Type Selector */}
          <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
            <button
              type="button"
              onClick={() => setChartType("bar")}
              className={`p-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                chartType === "bar"
                  ? "bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm"
                  : "text-slate-500 hover:text-slate-900 dark:hover:text-slate-200"
              }`}
              title="Bar Chart View"
            >
              <BarChart3 className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setChartType("area")}
              className={`p-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                chartType === "area"
                  ? "bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm"
                  : "text-slate-500 hover:text-slate-900 dark:hover:text-slate-200"
              }`}
              title="Area Curve View"
            >
              <Layers className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* 4 Key Financial Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {/* Total Invoiced */}
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-bold uppercase tracking-wider text-[10px]">Invoiced Revenue</span>
            <CreditCard className="w-3.5 h-3.5 text-indigo-500" />
          </div>
          <p className="text-base sm:text-lg font-black text-slate-900 dark:text-white mt-1 truncate">
            {formatCurrency(totalInvoiced, company.currency)}
          </p>
          <span className="text-[11px] text-slate-400 mt-0.5 block">{invoices.length} invoices generated</span>
        </div>

        {/* Total Cash Collected */}
        <div className="p-4 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/40">
          <div className="flex items-center justify-between text-xs text-emerald-600 dark:text-emerald-400">
            <span className="font-bold uppercase tracking-wider text-[10px]">Cash Realized</span>
            <DollarSign className="w-3.5 h-3.5" />
          </div>
          <p className="text-base sm:text-lg font-black text-emerald-700 dark:text-emerald-300 mt-1 truncate">
            {formatCurrency(totalCollected, company.currency)}
          </p>
          <span className="text-[11px] text-emerald-600/80 dark:text-emerald-400/80 mt-0.5 block">
            {receipts.length} settled receipts
          </span>
        </div>

        {/* Outstanding Pending */}
        <div className="p-4 rounded-2xl bg-amber-50/50 dark:bg-amber-950/30 border border-amber-100 dark:border-amber-900/40">
          <div className="flex items-center justify-between text-xs text-amber-700 dark:text-amber-400">
            <span className="font-bold uppercase tracking-wider text-[10px]">Outstanding Balance</span>
            <Calendar className="w-3.5 h-3.5" />
          </div>
          <p className="text-base sm:text-lg font-black text-amber-700 dark:text-amber-400 mt-1 truncate">
            {formatCurrency(totalPending, company.currency)}
          </p>
          <span className="text-[11px] text-amber-600/80 dark:text-amber-400/80 mt-0.5 block">
            Awaiting settlement
          </span>
        </div>

        {/* Collection Efficiency */}
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-bold uppercase tracking-wider text-[10px]">Collection Rate</span>
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
          </div>
          <p className="text-base sm:text-lg font-black text-indigo-600 dark:text-indigo-400 mt-1">
            {collectionRate}%
          </p>
          <span className="text-[11px] text-slate-400 mt-0.5 block">Receipts vs Invoices</span>
        </div>
      </div>

      {/* Recharts Main Interactive Chart */}
      <div className="h-64 sm:h-72 w-full pt-2">
        <ResponsiveContainer width="100%" height="100%">
          {chartType === "bar" ? (
            <BarChart data={monthlyData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" opacity={0.5} />
              <XAxis
                dataKey="monthLabel"
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 11, fill: "#94A3B8" }}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 11, fill: "#94A3B8" }}
                tickFormatter={(val) =>
                  val >= 1000000
                    ? `${(val / 1000000).toFixed(1)}M`
                    : val >= 1000
                    ? `${(val / 1000).toFixed(0)}k`
                    : `${val}`
                }
              />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="bg-slate-900 text-white p-3.5 rounded-2xl shadow-xl border border-slate-800 text-xs space-y-1.5 min-w-[190px]">
                        <p className="font-bold text-slate-300 border-b border-slate-800 pb-1">{label}</p>
                        <div className="flex justify-between items-center text-indigo-400">
                          <span>Invoiced:</span>
                          <span className="font-mono font-bold">
                            {formatCurrency(data.invoicedRevenue, company.currency)}
                          </span>
                        </div>
                        <div className="flex justify-between items-center text-emerald-400">
                          <span>Collected / Cash:</span>
                          <span className="font-mono font-bold">
                            {formatCurrency(data.collectedRevenue, company.currency)}
                          </span>
                        </div>
                        <div className="flex justify-between items-center text-slate-400 text-[11px] pt-1 border-t border-slate-800">
                          <span>Activity:</span>
                          <span>{data.invoiceCount} Invoices, {data.receiptCount} Receipts</span>
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Legend
                wrapperStyle={{ paddingTop: 14, fontSize: 12 }}
                formatter={(value) => (
                  <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                    {value === "invoicedRevenue" ? "Completed Invoiced Revenue" : "Settled Cash Receipts"}
                  </span>
                )}
              />
              <Bar
                name="invoicedRevenue"
                dataKey="invoicedRevenue"
                fill="#4F46E5"
                radius={[6, 6, 0, 0]}
                maxBarSize={32}
              />
              <Bar
                name="collectedRevenue"
                dataKey="collectedRevenue"
                fill="#059669"
                radius={[6, 6, 0, 0]}
                maxBarSize={32}
              />
            </BarChart>
          ) : (
            <ComposedChart data={monthlyData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" opacity={0.5} />
              <XAxis
                dataKey="monthLabel"
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 11, fill: "#94A3B8" }}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 11, fill: "#94A3B8" }}
                tickFormatter={(val) =>
                  val >= 1000000
                    ? `${(val / 1000000).toFixed(1)}M`
                    : val >= 1000
                    ? `${(val / 1000).toFixed(0)}k`
                    : `${val}`
                }
              />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="bg-slate-900 text-white p-3.5 rounded-2xl shadow-xl border border-slate-800 text-xs space-y-1.5 min-w-[190px]">
                        <p className="font-bold text-slate-300 border-b border-slate-800 pb-1">{label}</p>
                        <div className="flex justify-between items-center text-indigo-400">
                          <span>Invoiced:</span>
                          <span className="font-mono font-bold">
                            {formatCurrency(data.invoicedRevenue, company.currency)}
                          </span>
                        </div>
                        <div className="flex justify-between items-center text-emerald-400">
                          <span>Collected / Cash:</span>
                          <span className="font-mono font-bold">
                            {formatCurrency(data.collectedRevenue, company.currency)}
                          </span>
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Legend
                wrapperStyle={{ paddingTop: 14, fontSize: 12 }}
                formatter={(value) => (
                  <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                    {value === "invoicedRevenue" ? "Completed Invoiced Revenue" : "Settled Cash Receipts"}
                  </span>
                )}
              />
              <Area
                type="monotone"
                name="invoicedRevenue"
                dataKey="invoicedRevenue"
                fill="#4F46E5"
                fillOpacity={0.15}
                stroke="#4F46E5"
                strokeWidth={2}
              />
              <Line
                type="monotone"
                name="collectedRevenue"
                dataKey="collectedRevenue"
                stroke="#059669"
                strokeWidth={3}
                dot={{ fill: "#059669", r: 4 }}
              />
            </ComposedChart>
          )}
        </ResponsiveContainer>
      </div>
    </div>
  );
};
