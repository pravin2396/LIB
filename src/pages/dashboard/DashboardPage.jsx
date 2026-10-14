import React, { useState } from 'react';
import {
  BookOpen,
  Users,
  BookmarkCheck,
  CheckCircle2,
  AlertTriangle,
  Layers,
  DollarSign,
  ArrowUpRight,
  RotateCcw,
  Receipt,
  FolderPlus,
  BookPlus,
  Clock,
  Sparkles,
  RefreshCw,
  Activity,
  UserPlus,
  PlusCircle,
} from 'lucide-react';
import { toast } from 'react-toastify';
import { useAuth } from '../../context/AuthContext';
import { dashboardService } from '../../services/dashboardService';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import Input from '../../components/common/Input';
import SkeletonLoader from '../../components/common/SkeletonLoader';

const DashboardPage = () => {
  const { user } = useAuth();
  const [data, setData] = useState(() => dashboardService.getDashboardData());
  const [isLoading, setIsLoading] = useState(false);

  // Quick Action Modal states
  const [activeModal, setActiveModal] = useState(null); // 'issue' | 'return' | 'fine' | 'category' | 'book' | 'member'

  // Modal Form States
  const [issueForm, setIssueForm] = useState({
    memberName: 'Sophia Chen',
    memberRole: 'Student',
    bookTitle: '',
    category: 'Computer Science',
  });

  const [returnForm, setReturnForm] = useState({
    memberName: 'Sophia Chen',
    bookTitle: '',
    condition: 'Good',
    wasOverdue: false,
  });

  const [fineForm, setFineForm] = useState({
    memberName: '',
    amount: '5.00',
    reason: 'Overdue return penalty (3 days)',
  });

  const [categoryForm, setCategoryForm] = useState({
    name: '',
    code: 'CS-400',
  });

  const [bookForm, setBookForm] = useState({
    title: '',
    author: '',
    category: 'Computer Science',
    copies: 5,
  });

  const [memberForm, setMemberForm] = useState({
    name: '',
    role: 'Student',
    department: 'Computer Science',
    email: '',
  });

  const refreshData = () => {
    setData(dashboardService.getDashboardData());
  };

  const handleSimulateLoading = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      refreshData();
    }, 600);
  };

  // Quick Action Handlers (Replicate in Metrics & Persist in LocalStorage)
  const handleIssueSubmit = (e) => {
    e.preventDefault();
    if (!issueForm.bookTitle.trim()) {
      toast.warning('Please enter the book title to issue.');
      return;
    }
    const updated = dashboardService.issueBook(issueForm, user);
    setData(updated);
    setActiveModal(null);
    setIssueForm({ memberName: 'Sophia Chen', memberRole: 'Student', bookTitle: '', category: 'Computer Science' });
    toast.success(`Book "${issueForm.bookTitle}" issued! Books Issued +1, Books Available -1.`);
  };

  const handleReturnSubmit = (e) => {
    e.preventDefault();
    if (!returnForm.bookTitle.trim()) {
      toast.warning('Please specify the book being returned.');
      return;
    }
    const updated = dashboardService.returnBook(returnForm, user);
    setData(updated);
    setActiveModal(null);
    setReturnForm({ memberName: 'Sophia Chen', bookTitle: '', condition: 'Good', wasOverdue: false });
    toast.success(`Book "${returnForm.bookTitle}" returned! Books Issued -1, Books Available +1.`);
  };

  const handleFineSubmit = (e) => {
    e.preventDefault();
    if (!fineForm.memberName.trim() || !fineForm.amount) {
      toast.warning('Please enter member name and fine amount.');
      return;
    }
    const amountVal = parseFloat(fineForm.amount) || 0;
    const updated = dashboardService.collectFine(fineForm, user);
    setData(updated);
    setActiveModal(null);
    toast.success(`Fine of $${amountVal.toFixed(2)} recorded in LocalStorage! Overdue Books -1.`);
    setFineForm({ memberName: '', amount: '5.00', reason: 'Overdue return penalty' });
  };

  const handleCategorySubmit = (e) => {
    e.preventDefault();
    if (!categoryForm.name.trim()) {
      toast.warning('Please enter category title.');
      return;
    }
    const updated = dashboardService.addNewCategory(categoryForm.name.trim(), categoryForm.code.trim(), user);
    setData(updated);
    setActiveModal(null);
    toast.success(`Category "${categoryForm.name}" created! Total Categories +1.`);
    setCategoryForm({ name: '', code: 'CS-400' });
  };

  const handleBookSubmit = (e) => {
    e.preventDefault();
    if (!bookForm.title.trim() || !bookForm.author.trim()) {
      toast.warning('Please provide book title and author.');
      return;
    }
    const count = parseInt(bookForm.copies) || 1;
    const updated = dashboardService.addNewBook(bookForm, user);
    setData(updated);
    setActiveModal(null);
    toast.success(`"${bookForm.title}" added to inventory! Total Books +${count}, Available +${count}.`);
    setBookForm({ title: '', author: '', category: 'Computer Science', copies: 5 });
  };

  const handleMemberSubmit = (e) => {
    e.preventDefault();
    if (!memberForm.name.trim()) {
      toast.warning('Please enter member full name.');
      return;
    }
    const updated = dashboardService.registerMember(memberForm, user);
    setData(updated);
    setActiveModal(null);
    toast.success(`New member "${memberForm.name}" enrolled! Total Members +1.`);
    setMemberForm({ name: '', role: 'Student', department: 'Computer Science', email: '' });
  };

  // Stat metrics definition matching the 7 requested metrics
  const statCards = [
    {
      id: 'total-books',
      title: 'Total Books',
      value: (data.totalBooks || 0).toLocaleString(),
      subtext: 'Catalog inventory',
      icon: BookOpen,
      accent: 'bg-indigo-50 text-indigo-600 border-indigo-100',
      badge: 'All Volumes',
      badgeVariant: 'primary',
    },
    {
      id: 'total-members',
      title: 'Total Members',
      value: (data.totalMembers || 0).toLocaleString(),
      subtext: 'Active patron IDs',
      icon: Users,
      accent: 'bg-purple-50 text-purple-600 border-purple-100',
      badge: 'Enrolled',
      badgeVariant: 'purple',
    },
    {
      id: 'books-issued',
      title: 'Books Issued',
      value: (data.booksIssued || 0).toLocaleString(),
      subtext: 'Currently on loan',
      icon: BookmarkCheck,
      accent: 'bg-blue-50 text-blue-600 border-blue-100',
      badge: 'Active Loans',
      badgeVariant: 'default',
    },
    {
      id: 'books-available',
      title: 'Books Available',
      value: (data.booksAvailable || 0).toLocaleString(),
      subtext: 'Ready on library shelves',
      icon: CheckCircle2,
      accent: 'bg-emerald-50 text-emerald-600 border-emerald-100',
      badge: 'In Stock',
      badgeVariant: 'success',
    },
    {
      id: 'overdue-books',
      title: 'Overdue Books',
      value: (data.overdueBooks || 0).toLocaleString(),
      subtext: 'Past return deadline',
      icon: AlertTriangle,
      accent: 'bg-rose-50 text-rose-600 border-rose-100',
      badge: 'Action Needed',
      badgeVariant: 'danger',
    },
    {
      id: 'total-categories',
      title: 'Total Categories',
      value: (data.totalCategories || 0).toLocaleString(),
      subtext: 'Academic disciplines',
      icon: Layers,
      accent: 'bg-amber-50 text-amber-600 border-amber-100',
      badge: 'Genres',
      badgeVariant: 'warning',
    },
    {
      id: 'fine-collected',
      title: 'Fine Collected',
      value: `$${(parseFloat(data.fineCollected) || 0).toFixed(2)}`,
      subtext: 'Late fees & charges',
      icon: DollarSign,
      accent: 'bg-teal-50 text-teal-600 border-teal-100',
      badge: 'Receipts',
      badgeVariant: 'cyan',
    },
  ];

  const quickActions = [
    {
      id: 'issue',
      title: 'Issue New Book',
      description: 'Check out book (+1 Issued, -1 Available)',
      icon: BookPlus,
      color: 'bg-indigo-600 hover:bg-indigo-700 text-white',
      badge: 'Circulation',
      onClick: () => setActiveModal('issue'),
    },
    {
      id: 'return',
      title: 'Process Return',
      description: 'Check-in returned book (-1 Issued, +1 Available)',
      icon: RotateCcw,
      color: 'bg-emerald-600 hover:bg-emerald-700 text-white',
      badge: 'Check-in',
      onClick: () => setActiveModal('return'),
    },
    {
      id: 'fine',
      title: 'Collect Overdue Fine',
      description: 'Record penalty fee (+Fine, -1 Overdue)',
      icon: Receipt,
      color: 'bg-teal-600 hover:bg-teal-700 text-white',
      badge: 'Payment',
      onClick: () => setActiveModal('fine'),
    },
    {
      id: 'book',
      title: 'Add New Title',
      description: 'Register copies into catalog (+Total, +Available)',
      icon: PlusCircle,
      color: 'bg-slate-800 hover:bg-slate-900 text-white',
      badge: 'Accession',
      onClick: () => setActiveModal('book'),
    },
    {
      id: 'member',
      title: 'Enroll New Member',
      description: 'Register patron card (+1 Total Members)',
      icon: UserPlus,
      color: 'bg-purple-600 hover:bg-purple-700 text-white',
      badge: 'Patron',
      onClick: () => setActiveModal('member'),
    },
    {
      id: 'category',
      title: 'Add Category',
      description: 'Create new classification (+1 Total Categories)',
      icon: FolderPlus,
      color: 'bg-amber-600 hover:bg-amber-700 text-white',
      badge: 'Taxonomy',
      onClick: () => setActiveModal('category'),
    },
  ];

  const getActivityBadge = (type) => {
    switch (type) {
      case 'issue':
        return { label: 'Issued', variant: 'primary' };
      case 'return':
        return { label: 'Returned', variant: 'success' };
      case 'fine':
        return { label: 'Fine Paid', variant: 'cyan' };
      case 'catalog':
        return { label: 'Inventory', variant: 'purple' };
      case 'category':
        return { label: 'Category', variant: 'warning' };
      case 'member':
        return { label: 'Member', variant: 'default' };
      default:
        return { label: 'Log', variant: 'default' };
    }
  };

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-300">
      {/* 1. Welcome Header Banner in Body Content (Kept Intact as Requested) */}
      <div className="relative overflow-hidden bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-900 rounded-3xl p-6 sm:p-10 text-white shadow-xl">
        {/* Ambient background glow accents */}
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 rounded-full bg-indigo-500/15 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-64 h-64 rounded-full bg-blue-500/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-xs font-semibold text-indigo-200 mb-3 border border-white/10">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>BookStack Academic Portal</span>
          </div>

          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight">
            Hello, {user?.name || 'Scholar'}! 👋
          </h1>
          <p className="text-sm sm:text-base text-indigo-200 mt-2 leading-relaxed">
            Welcome to your library command center. Explore the digital repository, manage checkouts, and track due dates with ease.
          </p>
        </div>

        {/* Decorative graphic */}
        <div className="hidden md:block absolute right-6 bottom-4 opacity-15 pointer-events-none">
          <BookOpen className="w-64 h-64 text-white" />
        </div>
      </div>

      {/* 2. Key Library Metrics Overview (7 Core Requirements) */}
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Activity className="w-5 h-5 text-indigo-600" />
              <span>Library Performance Metrics</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Live circulation statistics persisted in LocalStorage
            </p>
          </div>

          <button
            type="button"
            onClick={handleSimulateLoading}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100/70 px-3 py-1.5 rounded-xl transition-colors self-start sm:self-auto"
            title="Preview skeleton loader state"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>{isLoading ? 'Loading Skeleton...' : 'Simulate Skeleton Load'}</span>
          </button>
        </div>

        {/* Responsive Grid for 7 Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {isLoading ? (
            <SkeletonLoader type="statCard" count={7} />
          ) : (
            statCards.map((stat) => {
              const Icon = stat.icon;
              return (
                <div
                  key={stat.id}
                  className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                        {stat.title}
                      </span>
                      <div className="text-2xl font-extrabold text-slate-900 tracking-tight mt-1">
                        {stat.value}
                      </div>
                    </div>
                    <div className={`w-11 h-11 rounded-xl flex items-center justify-center border shrink-0 ${stat.accent}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                    <span className="text-slate-500 truncate">{stat.subtext}</span>
                    <Badge variant={stat.badgeVariant} size="sm">
                      {stat.badge}
                    </Badge>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* 3. Lower Section: Recent Activities & Quick Action Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Recent Activities (7 cols on lg) */}
        <div className="lg:col-span-7">
          <Card
            title="Recent Activities"
            subtitle="Live feed of circulation operations, catalog accessions, and payments"
            action={
              <span className="inline-flex items-center gap-1.5 text-xs text-emerald-600 font-semibold bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>Live Feed</span>
              </span>
            }
          >
            {isLoading ? (
              <div className="space-y-4 py-2">
                <SkeletonLoader type="card" count={3} />
              </div>
            ) : data.recentActivities.length === 0 ? (
              <div className="py-12 text-center text-slate-400">
                <Clock className="w-10 h-10 mx-auto mb-2 opacity-50" />
                <p className="text-sm font-semibold text-slate-600">No recent activity recorded</p>
                <p className="text-xs text-slate-400 mt-1">Actions performed will appear here live.</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100 -mx-1">
                {data.recentActivities.map((act) => {
                  const badgeInfo = getActivityBadge(act.type);
                  return (
                    <div
                      key={act.id}
                      className="py-3.5 px-3 flex items-start justify-between gap-3 hover:bg-slate-50/70 rounded-xl transition-colors"
                    >
                      <div className="flex items-start gap-3 min-w-0">
                        {act.avatar ? (
                          <img
                            src={act.avatar}
                            alt={act.user}
                            className="w-10 h-10 rounded-full object-cover border border-slate-200 shrink-0 mt-0.5"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-xs shrink-0 mt-0.5">
                            {act.user.substring(0, 2).toUpperCase()}
                          </div>
                        )}

                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-bold text-sm text-slate-900 truncate">
                              {act.user}
                            </span>
                            <Badge variant={badgeInfo.variant} size="sm">
                              {act.action}
                            </Badge>
                          </div>

                          <p className="text-xs text-slate-600 mt-0.5 line-clamp-1 font-medium">
                            {act.detail}
                          </p>

                          <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-400">
                            <span>{act.category}</span>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              <span>{act.timestamp}</span>
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>
        </div>

        {/* Right Column: Quick Action Cards (5 cols on lg) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
            <div className="flex items-center justify-between mb-3 pb-3 border-b border-slate-100">
              <div>
                <h3 className="font-bold text-slate-900 text-base">Quick Action Cards</h3>
                <p className="text-xs text-slate-500 mt-0.5">Click to execute and update metrics live</p>
              </div>
              <Badge variant="purple" size="sm">
                Interactive
              </Badge>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-2.5">
              {quickActions.map((action) => {
                const Icon = action.icon;
                return (
                  <button
                    key={action.id}
                    type="button"
                    onClick={action.onClick}
                    className="w-full text-left p-3.5 rounded-xl border border-slate-200/70 hover:border-indigo-300 hover:bg-indigo-50/40 bg-slate-50/50 transition-all duration-150 flex items-center justify-between group active:scale-[0.99]"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-xs shrink-0 ${action.color}`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-slate-900 group-hover:text-indigo-600 transition-colors">
                            {action.title}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 line-clamp-1 mt-0.5">
                          {action.description}
                        </p>
                      </div>
                    </div>
                    <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all shrink-0 ml-2" />
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* MODAL 1: Issue Book */}
      <Modal
        isOpen={activeModal === 'issue'}
        onClose={() => setActiveModal(null)}
        title="Issue Book to Member"
        subtitle="Increments Books Issued (+1) & decrements Books Available (-1)"
      >
        <form onSubmit={handleIssueSubmit} className="space-y-4">
          <Input
            label="Member Name"
            placeholder="e.g. Sophia Chen"
            value={issueForm.memberName}
            onChange={(e) => setIssueForm({ ...issueForm, memberName: e.target.value })}
            required
          />

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 tracking-tight mb-1.5">
                Member Role
              </label>
              <select
                value={issueForm.memberRole}
                onChange={(e) => setIssueForm({ ...issueForm, memberRole: e.target.value })}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="Student">Student</option>
                <option value="Faculty">Faculty</option>
                <option value="Staff">Staff</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 tracking-tight mb-1.5">
                Category
              </label>
              <select
                value={issueForm.category}
                onChange={(e) => setIssueForm({ ...issueForm, category: e.target.value })}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="Computer Science">Computer Science</option>
                <option value="Literature">Literature</option>
                <option value="Engineering">Engineering</option>
                <option value="Mathematics">Mathematics</option>
                <option value="Physics">Physics</option>
              </select>
            </div>
          </div>

          <Input
            label="Book Title"
            placeholder="e.g. Clean Code: Agile Handbook"
            value={issueForm.bookTitle}
            onChange={(e) => setIssueForm({ ...issueForm, bookTitle: e.target.value })}
            required
          />

          <div className="pt-2 flex justify-end gap-2">
            <Button variant="outline" size="md" onClick={() => setActiveModal(null)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="md">
              Confirm Loan & Update
            </Button>
          </div>
        </form>
      </Modal>

      {/* MODAL 2: Process Return */}
      <Modal
        isOpen={activeModal === 'return'}
        onClose={() => setActiveModal(null)}
        title="Check-In Returned Book"
        subtitle="Decrements Books Issued (-1) & increments Books Available (+1)"
      >
        <form onSubmit={handleReturnSubmit} className="space-y-4">
          <Input
            label="Borrower Name"
            placeholder="e.g. Sophia Chen"
            value={returnForm.memberName}
            onChange={(e) => setReturnForm({ ...returnForm, memberName: e.target.value })}
            required
          />

          <Input
            label="Book Title"
            placeholder="e.g. Design Patterns: Reusable Elements"
            value={returnForm.bookTitle}
            onChange={(e) => setReturnForm({ ...returnForm, bookTitle: e.target.value })}
            required
          />

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 tracking-tight mb-1.5">
                Book Condition
              </label>
              <select
                value={returnForm.condition}
                onChange={(e) => setReturnForm({ ...returnForm, condition: e.target.value })}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="Good">Good / Like New</option>
                <option value="Minor Wear">Minor Wear</option>
                <option value="Damaged">Damaged</option>
              </select>
            </div>

            <div className="flex flex-col justify-end">
              <label className="flex items-center gap-2 cursor-pointer p-2.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-xs text-slate-700">
                <input
                  type="checkbox"
                  checked={returnForm.wasOverdue}
                  onChange={(e) => setReturnForm({ ...returnForm, wasOverdue: e.target.checked })}
                  className="rounded text-indigo-600 focus:ring-indigo-500"
                />
                <span>Was Overdue (-1 Overdue)</span>
              </label>
            </div>
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <Button variant="outline" size="md" onClick={() => setActiveModal(null)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="md">
              Complete Return & Update
            </Button>
          </div>
        </form>
      </Modal>

      {/* MODAL 3: Collect Fine */}
      <Modal
        isOpen={activeModal === 'fine'}
        onClose={() => setActiveModal(null)}
        title="Collect Overdue Fine"
        subtitle="Increments Fine Collected (+$) and clears Overdue Book (-1)"
      >
        <form onSubmit={handleFineSubmit} className="space-y-4">
          <Input
            label="Member Name"
            placeholder="e.g. David Miller"
            value={fineForm.memberName}
            onChange={(e) => setFineForm({ ...fineForm, memberName: e.target.value })}
            required
          />

          <Input
            label="Amount ($)"
            type="number"
            step="0.50"
            min="0.50"
            placeholder="5.00"
            value={fineForm.amount}
            onChange={(e) => setFineForm({ ...fineForm, amount: e.target.value })}
            required
          />

          <Input
            label="Reason / Item Details"
            placeholder="e.g. 3 days late return fee"
            value={fineForm.reason}
            onChange={(e) => setFineForm({ ...fineForm, reason: e.target.value })}
          />

          <div className="pt-2 flex justify-end gap-2">
            <Button variant="outline" size="md" onClick={() => setActiveModal(null)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="md">
              Record Payment & Update
            </Button>
          </div>
        </form>
      </Modal>

      {/* MODAL 4: Add New Title */}
      <Modal
        isOpen={activeModal === 'book'}
        onClose={() => setActiveModal(null)}
        title="Add New Book to Inventory"
        subtitle="Increments Total Books (+copies) and Books Available (+copies)"
      >
        <form onSubmit={handleBookSubmit} className="space-y-4">
          <Input
            label="Book Title"
            placeholder="e.g. Designing Data-Intensive Applications"
            value={bookForm.title}
            onChange={(e) => setBookForm({ ...bookForm, title: e.target.value })}
            required
          />

          <Input
            label="Author(s)"
            placeholder="e.g. Martin Kleppmann"
            value={bookForm.author}
            onChange={(e) => setBookForm({ ...bookForm, author: e.target.value })}
            required
          />

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 tracking-tight mb-1.5">
                Category
              </label>
              <select
                value={bookForm.category}
                onChange={(e) => setBookForm({ ...bookForm, category: e.target.value })}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="Computer Science">Computer Science</option>
                <option value="Literature">Literature</option>
                <option value="Engineering">Engineering</option>
                <option value="Science">Science</option>
                <option value="Economics">Economics</option>
              </select>
            </div>

            <Input
              label="Number of Copies"
              type="number"
              min="1"
              max="50"
              value={bookForm.copies}
              onChange={(e) => setBookForm({ ...bookForm, copies: e.target.value })}
              required
            />
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <Button variant="outline" size="md" onClick={() => setActiveModal(null)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="md">
              Save to Catalog & Update
            </Button>
          </div>
        </form>
      </Modal>

      {/* MODAL 5: Enroll New Member */}
      <Modal
        isOpen={activeModal === 'member'}
        onClose={() => setActiveModal(null)}
        title="Enroll New Library Member"
        subtitle="Increments Total Members count (+1) and adds to active roster"
      >
        <form onSubmit={handleMemberSubmit} className="space-y-4">
          <Input
            label="Full Name"
            placeholder="e.g. Liam Patel"
            value={memberForm.name}
            onChange={(e) => setMemberForm({ ...memberForm, name: e.target.value })}
            required
          />

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 tracking-tight mb-1.5">
                Role
              </label>
              <select
                value={memberForm.role}
                onChange={(e) => setMemberForm({ ...memberForm, role: e.target.value })}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="Student">Student</option>
                <option value="Faculty">Faculty</option>
                <option value="Staff">Staff</option>
              </select>
            </div>

            <Input
              label="Department"
              placeholder="e.g. Physics"
              value={memberForm.department}
              onChange={(e) => setMemberForm({ ...memberForm, department: e.target.value })}
            />
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <Button variant="outline" size="md" onClick={() => setActiveModal(null)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="md">
              Enroll Member & Update
            </Button>
          </div>
        </form>
      </Modal>

      {/* MODAL 6: Add Category */}
      <Modal
        isOpen={activeModal === 'category'}
        onClose={() => setActiveModal(null)}
        title="Add New Category"
        subtitle="Increments Total Categories (+1) in library taxonomy"
      >
        <form onSubmit={handleCategorySubmit} className="space-y-4">
          <Input
            label="Category Name"
            placeholder="e.g. Artificial Intelligence & Robotics"
            value={categoryForm.name}
            onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
            required
          />

          <Input
            label="Shelf / Section Code"
            placeholder="e.g. CS-AI-500"
            value={categoryForm.code}
            onChange={(e) => setCategoryForm({ ...categoryForm, code: e.target.value })}
          />

          <div className="pt-2 flex justify-end gap-2">
            <Button variant="outline" size="md" onClick={() => setActiveModal(null)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="md">
              Create Category & Update
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default DashboardPage;
