import React, { useState, useEffect, useMemo } from 'react';
import {
  BarChart3,
  BookOpen,
  BookmarkCheck,
  CheckCircle2,
  Users,
  AlertTriangle,
  RotateCcw,
  Layers,
  Calendar,
  ArrowUpRight,
  TrendingUp,
  Download,
  Printer,
  FileText,
  PieChart,
  Activity,
  ChevronRight,
  Filter,
} from 'lucide-react';
import { reportService } from '../../services/reportService';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';

const COLOR_MAP = {
  indigo: { bg: 'bg-indigo-500', light: 'bg-indigo-50', text: 'text-indigo-700', border: 'border-indigo-200' },
  emerald: { bg: 'bg-emerald-500', light: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' },
  blue: { bg: 'bg-blue-500', light: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
  purple: { bg: 'bg-purple-500', light: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200' },
  amber: { bg: 'bg-amber-500', light: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' },
  teal: { bg: 'bg-teal-500', light: 'bg-teal-50', text: 'text-teal-700', border: 'border-teal-200' },
  cyan: { bg: 'bg-cyan-500', light: 'bg-cyan-50', text: 'text-cyan-700', border: 'border-cyan-200' },
  rose: { bg: 'bg-rose-500', light: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200' },
};

const ReportsPage = () => {
  const [data, setData] = useState(() => reportService.getReportData());
  const [activeQuarter, setActiveQuarter] = useState('ALL'); // 'ALL' | 'Q1' | 'Q2' | 'Q3' | 'Q4'
  const [hoveredMonth, setHoveredMonth] = useState(null);

  useEffect(() => {
    setData(reportService.getReportData());
  }, []);

  // Filtered monthly report based on Quarter
  const filteredMonthly = useMemo(() => {
    if (activeQuarter === 'Q1') return data.monthlyReport.slice(0, 3);
    if (activeQuarter === 'Q2') return data.monthlyReport.slice(3, 6);
    if (activeQuarter === 'Q3') return data.monthlyReport.slice(6, 9);
    if (activeQuarter === 'Q4') return data.monthlyReport.slice(9, 10);
    return data.monthlyReport;
  }, [data.monthlyReport, activeQuarter]);

  // Max circulation value for chart normalization
  const maxMonthlyVal = useMemo(() => {
    return Math.max(...data.monthlyReport.map((m) => Math.max(m.issued, m.returned)), 120);
  }, [data.monthlyReport]);

  const handlePrint = () => {
    window.print();
  };

  const handleExportCSV = () => {
    const headers = ['Month', 'Books Issued', 'Books Returned', 'Overdue Books', 'New Members'];
    const rows = data.monthlyReport.map((r) => [
      r.monthFull,
      r.issued,
      r.returned,
      r.overdue,
      r.newMembers,
    ]);
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `bookstack-circulation-report-2026.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-300">
      {/* 1. Header Banner with Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-xs font-semibold text-indigo-700 mb-2">
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Library Analytics & Reporting Intelligence</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Library Reports & Dashboard Charts
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Real-time circulation metrics, category distributions, monthly issue logs, and interactive performance charts.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <Button
            variant="outline"
            size="md"
            icon={Printer}
            onClick={handlePrint}
            title="Print Official Report"
          >
            Print Report
          </Button>
          <Button
            variant="primary"
            size="md"
            icon={Download}
            onClick={handleExportCSV}
            title="Export Monthly Data as CSV"
          >
            Export CSV
          </Button>
        </div>
      </div>

      {/* 2. Top 5 Core Report Metrics (Required: Total Books, Books Issued, Books Returned, Active Members, Overdue Books) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Metric 1: Total Books */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Total Books
            </span>
            <div className="w-9 h-9 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
              <BookOpen className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 block tracking-tight">
              {data.metrics.totalBooks.toLocaleString()}
            </span>
            <span className="text-[11px] text-slate-500 mt-0.5 block">
              Accessioned library titles
            </span>
          </div>
          <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px]">
            <span className="text-indigo-600 font-semibold flex items-center gap-0.5">
              <TrendingUp className="w-3 h-3" /> +12 this month
            </span>
            <Badge variant="primary" size="sm">
              Collection
            </Badge>
          </div>
        </div>

        {/* Metric 2: Books Issued */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Books Issued
            </span>
            <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
              <BookmarkCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl sm:text-3xl font-extrabold text-blue-600 block tracking-tight">
              {data.metrics.booksIssued.toLocaleString()}
            </span>
            <span className="text-[11px] text-slate-500 mt-0.5 block">
              Active borrowed loans
            </span>
          </div>
          <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px]">
            <span className="text-blue-600 font-semibold flex items-center gap-0.5">
              <TrendingUp className="w-3 h-3" /> +8.4% YoY
            </span>
            <Badge variant="cyan" size="sm">
              In Circulation
            </Badge>
          </div>
        </div>

        {/* Metric 3: Books Returned */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Books Returned
            </span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl sm:text-3xl font-extrabold text-emerald-600 block tracking-tight">
              {data.metrics.booksReturned.toLocaleString()}
            </span>
            <span className="text-[11px] text-slate-500 mt-0.5 block">
              Successfully checked in
            </span>
          </div>
          <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px]">
            <span className="text-emerald-600 font-semibold">
              {data.metrics.returnRate}% Return Rate
            </span>
            <Badge variant="success" size="sm">
              Restocked
            </Badge>
          </div>
        </div>

        {/* Metric 4: Active Members */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Active Members
            </span>
            <div className="w-9 h-9 rounded-xl bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-600">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl sm:text-3xl font-extrabold text-purple-600 block tracking-tight">
              {data.metrics.activeMembers.toLocaleString()}
            </span>
            <span className="text-[11px] text-slate-500 mt-0.5 block">
              Registered cardholders
            </span>
          </div>
          <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px]">
            <span className="text-purple-600 font-semibold flex items-center gap-0.5">
              <TrendingUp className="w-3 h-3" /> 98% Active
            </span>
            <Badge variant="purple" size="sm">
              Patrons
            </Badge>
          </div>
        </div>

        {/* Metric 5: Overdue Books */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Overdue Books
            </span>
            <div className="w-9 h-9 rounded-xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-600">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl sm:text-3xl font-extrabold text-rose-600 block tracking-tight">
              {data.metrics.overdueBooks.toLocaleString()}
            </span>
            <span className="text-[11px] text-slate-500 mt-0.5 block">
              Past deadline penalty
            </span>
          </div>
          <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px]">
            <span className="text-rose-600 font-semibold">
              Action Required
            </span>
            <Badge variant="danger" size="sm">
              Penalized
            </Badge>
          </div>
        </div>
      </div>

      {/* 3. Dashboard Charts Section (Required: Dashboard Charts) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Chart 1: Monthly Circulation Comparison (8 Cols) */}
        <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
              <div>
                <div className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-indigo-600" />
                  <h3 className="font-bold text-slate-900 text-base">
                    Monthly Circulation Comparison Chart
                  </h3>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Monthly comparative volume of books issued vs books returned (2026)
                </p>
              </div>

              {/* Chart Legend */}
              <div className="flex items-center gap-4 text-xs font-semibold self-start sm:self-auto">
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-md bg-indigo-600"></span>
                  <span className="text-slate-700">Issued</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-md bg-emerald-500"></span>
                  <span className="text-slate-700">Returned</span>
                </span>
              </div>
            </div>

            {/* Interactive Bar Chart Visualization */}
            <div className="pt-6 pb-2">
              <div className="h-64 sm:h-72 flex items-end justify-between gap-2 sm:gap-4 px-2">
                {data.monthlyReport.map((m) => {
                  const issuedHeight = Math.round((m.issued / maxMonthlyVal) * 100);
                  const returnedHeight = Math.round((m.returned / maxMonthlyVal) * 100);
                  const isHovered = hoveredMonth === m.month;

                  return (
                    <div
                      key={m.month}
                      onMouseEnter={() => setHoveredMonth(m.month)}
                      onMouseLeave={() => setHoveredMonth(null)}
                      className="flex-1 flex flex-col items-center h-full justify-end group relative cursor-pointer"
                    >
                      {/* Tooltip Popup on Hover */}
                      {isHovered && (
                        <div className="absolute -top-16 bg-slate-900 text-white rounded-xl px-2.5 py-1.5 text-[11px] shadow-xl z-20 whitespace-nowrap animate-in fade-in zoom-in-95 pointer-events-none">
                          <p className="font-bold border-b border-slate-700 pb-0.5">{m.monthFull}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-indigo-300">Issued: {m.issued}</span>
                            <span>•</span>
                            <span className="text-emerald-300">Returned: {m.returned}</span>
                          </div>
                        </div>
                      )}

                      {/* Side-by-side comparative bars */}
                      <div className="w-full flex items-end justify-center gap-1 sm:gap-1.5 h-full">
                        {/* Issued Bar */}
                        <div
                          style={{ height: `${issuedHeight}%` }}
                          className={`w-1/2 max-w-[18px] rounded-t-md transition-all duration-300 ${
                            isHovered ? 'bg-indigo-700 shadow-md scale-y-105 origin-bottom' : 'bg-indigo-600'
                          }`}
                        />
                        {/* Returned Bar */}
                        <div
                          style={{ height: `${returnedHeight}%` }}
                          className={`w-1/2 max-w-[18px] rounded-t-md transition-all duration-300 ${
                            isHovered ? 'bg-emerald-600 shadow-md scale-y-105 origin-bottom' : 'bg-emerald-500'
                          }`}
                        />
                      </div>

                      {/* X-Axis Label */}
                      <span
                        className={`text-[11px] font-bold mt-2 transition-colors ${
                          isHovered ? 'text-indigo-600' : 'text-slate-500'
                        }`}
                      >
                        {m.month}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>
              Year-to-date Loans: <strong className="text-slate-900">{data.totalYearlyIssued}</strong>
            </span>
            <span>
              Year-to-date Returns: <strong className="text-slate-900">{data.totalYearlyReturned}</strong>
            </span>
            <span className="hidden sm:inline">
              Peak Month: <strong className="text-indigo-600">September (118)</strong>
            </span>
          </div>
        </div>

        {/* Chart 2: Category Distribution Radial / Progress Chart (4 Cols) */}
        <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <PieChart className="w-5 h-5 text-indigo-600" />
                <h3 className="font-bold text-slate-900 text-base">
                  Catalog Distribution
                </h3>
              </div>
              <Badge variant="purple" size="sm">
                Genres
              </Badge>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Shelf proportion by academic subject & genre
            </p>

            {/* Category breakdown bars */}
            <div className="space-y-3.5 mt-5">
              {data.categoryStats.slice(0, 6).map((cat) => {
                const color = COLOR_MAP[cat.color] || COLOR_MAP.indigo;
                return (
                  <div key={cat.id} className="space-y-1">
                    <div className="flex items-center justify-between text-xs font-semibold">
                      <span className="text-slate-800 flex items-center gap-1.5">
                        <span className={`w-2.5 h-2.5 rounded-full ${color.bg}`}></span>
                        <span>{cat.name}</span>
                      </span>
                      <span className="text-slate-600 font-mono">
                        {cat.bookCount} ({cat.percentage}%)
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${color.bg}`}
                        style={{ width: `${Math.max(5, cat.percentage)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Primary Focus:</span>
            <span className="font-bold text-indigo-600">
              {data.topCategory ? `${data.topCategory.name} (${data.topCategory.bookCount})` : 'Computer Science'}
            </span>
          </div>
        </div>
      </div>

      {/* 4. Category-wise Book Count Section (Required: Category-wise Book Count) */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="px-6 py-4.5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-indigo-600" />
            <div>
              <h3 className="font-bold text-slate-900 text-base">
                Category-wise Book Count & Inventory Analysis
              </h3>
              <p className="text-xs text-slate-500">
                Detailed catalog inventory breakdown across all library academic disciplines
              </p>
            </div>
          </div>
          <span className="text-xs font-semibold text-slate-400 bg-slate-50 px-3 py-1 rounded-xl border border-slate-200">
            {data.categoryStats.length} Total Categories
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-slate-50/75 border-b border-slate-100 text-slate-500 uppercase text-[11px] font-bold tracking-wider">
              <tr>
                <th className="px-6 py-3.5">Category Name</th>
                <th className="px-6 py-3.5">Code</th>
                <th className="px-6 py-3.5 text-center">Titles Count</th>
                <th className="px-6 py-3.5 text-center">Total Physical Copies</th>
                <th className="px-6 py-3.5 text-center">Available on Shelf</th>
                <th className="px-6 py-3.5 text-right">% of Catalog</th>
                <th className="px-6 py-3.5 text-center">Stock Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {data.categoryStats.map((cat) => {
                const color = COLOR_MAP[cat.color] || COLOR_MAP.indigo;
                return (
                  <tr key={cat.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-6 py-3.5 font-bold text-slate-900">
                      <div className="flex items-center gap-2">
                        <span className={`w-2.5 h-2.5 rounded-full ${color.bg}`} />
                        <span>{cat.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-3.5 font-mono text-xs text-slate-500">
                      {cat.code}
                    </td>
                    <td className="px-6 py-3.5 text-center font-bold text-indigo-600">
                      {cat.bookCount}
                    </td>
                    <td className="px-6 py-3.5 text-center font-semibold text-slate-700">
                      {cat.totalCopies}
                    </td>
                    <td className="px-6 py-3.5 text-center font-semibold text-emerald-600">
                      {cat.availableCopies}
                    </td>
                    <td className="px-6 py-3.5 text-right font-extrabold text-slate-900">
                      {cat.percentage}%
                    </td>
                    <td className="px-6 py-3.5 text-center">
                      <Badge
                        variant={cat.availableCopies > 0 ? 'success' : 'danger'}
                        size="sm"
                      >
                        {cat.availableCopies > 0 ? 'In Stock' : 'Depleted'}
                      </Badge>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* 5. Monthly Issue Report Section (Required: Monthly Issue Report) */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="px-6 py-4.5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-indigo-600" />
            <div>
              <h3 className="font-bold text-slate-900 text-base">
                Monthly Issue & Circulation Report (2026)
              </h3>
              <p className="text-xs text-slate-500">
                Detailed audit ledger of monthly loan checkouts, check-ins, overdue rates, and membership growth
              </p>
            </div>
          </div>

          {/* Quarter Filter Chips */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
            {[
              { id: 'ALL', label: 'All Year' },
              { id: 'Q1', label: 'Q1' },
              { id: 'Q2', label: 'Q2' },
              { id: 'Q3', label: 'Q3' },
              { id: 'Q4', label: 'Q4' },
            ].map((q) => (
              <button
                key={q.id}
                onClick={() => setActiveQuarter(q.id)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                  activeQuarter === q.id
                    ? 'bg-white text-indigo-600 shadow-2xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {q.label}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-slate-50/75 border-b border-slate-100 text-slate-500 uppercase text-[11px] font-bold tracking-wider">
              <tr>
                <th className="px-6 py-3.5">Month</th>
                <th className="px-6 py-3.5 text-center">Books Issued</th>
                <th className="px-6 py-3.5 text-center">Books Returned</th>
                <th className="px-6 py-3.5 text-center">Net Circulation</th>
                <th className="px-6 py-3.5 text-center">Overdue Incidents</th>
                <th className="px-6 py-3.5 text-center">Return Efficiency</th>
                <th className="px-6 py-3.5 text-right">New Members</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredMonthly.map((m) => {
                const efficiency = Math.round((m.returned / m.issued) * 100);
                return (
                  <tr key={m.month} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-6 py-3.5 font-bold text-slate-900">
                      {m.monthFull}
                    </td>
                    <td className="px-6 py-3.5 text-center font-bold text-indigo-600">
                      {m.issued}
                    </td>
                    <td className="px-6 py-3.5 text-center font-bold text-emerald-600">
                      {m.returned}
                    </td>
                    <td className="px-6 py-3.5 text-center font-semibold text-slate-700">
                      +{m.issued - m.returned}
                    </td>
                    <td className="px-6 py-3.5 text-center font-bold text-rose-600">
                      {m.overdue}
                    </td>
                    <td className="px-6 py-3.5 text-center">
                      <span className="inline-flex items-center gap-1 font-semibold text-slate-700">
                        <span>{efficiency}%</span>
                        <span className={`w-2 h-2 rounded-full ${efficiency >= 85 ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                      </span>
                    </td>
                    <td className="px-6 py-3.5 text-right font-extrabold text-slate-900">
                      +{m.newMembers}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ReportsPage;
