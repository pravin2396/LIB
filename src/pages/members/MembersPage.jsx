import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  Search,
  Plus,
  Edit2,
  Trash2,
  Eye,
  Calendar,
  Mail,
  Phone,
  MapPin,
  IdCard,
  LayoutGrid,
  List,
  AlertCircle,
  RefreshCw,
  X,
  CheckCircle,
  ShieldCheck,
  UserCheck,
  UserX,
  Sparkles,
} from 'lucide-react';
import { toast } from 'react-toastify';
import { memberService } from '../../services/memberService';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import SkeletonLoader from '../../components/common/SkeletonLoader';

// Form validation helper for all required fields
export const validateMemberForm = (values) => {
  const errors = {};

  // 1. Full Name
  if (!values.fullName || !values.fullName.trim()) {
    errors.fullName = 'Full Name is required.';
  } else if (values.fullName.trim().length < 3) {
    errors.fullName = 'Full Name must be at least 3 characters.';
  }

  // 2. Email
  if (!values.email || !values.email.trim()) {
    errors.email = 'Email address is required.';
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email.trim())) {
    errors.email = 'Please provide a valid email address.';
  }

  // 3. Mobile Number
  if (!values.mobileNumber || !values.mobileNumber.trim()) {
    errors.mobileNumber = 'Mobile Number is required.';
  } else {
    const digitsOnly = values.mobileNumber.replace(/\D/g, '');
    if (digitsOnly.length < 7 || digitsOnly.length > 15) {
      errors.mobileNumber = 'Please enter a valid mobile number (7–15 digits).';
    }
  }

  // 4. Address
  if (!values.address || !values.address.trim()) {
    errors.address = 'Physical Address is required.';
  } else if (values.address.trim().length < 5) {
    errors.address = 'Address must be at least 5 characters.';
  }

  // 5. Membership ID
  if (!values.membershipId || !values.membershipId.trim()) {
    errors.membershipId = 'Membership ID is required.';
  }

  // 6. Membership Date
  if (!values.membershipDate) {
    errors.membershipDate = 'Membership Date is required.';
  }

  return errors;
};

const MembersPage = () => {
  const navigate = useNavigate();

  // State: Initialize with stored members immediately for instant first-frame render
  const [members, setMembers] = useState(() => memberService.getStoredMembers());
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState(null);

  // Filters & Controls
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL'); // 'ALL' | 'Active' | 'Inactive'
  const [roleFilter, setRoleFilter] = useState('ALL'); // 'ALL' | 'Student' | 'Faculty' | 'Researcher'
  const [sortBy, setSortBy] = useState('name-asc'); // 'name-asc' | 'name-desc' | 'date-desc' | 'date-asc'
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'table'

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState(null);
  const [deletingMember, setDeletingMember] = useState(null);

  // Form State & Validation Errors
  const initialFormState = {
    fullName: '',
    email: '',
    mobileNumber: '',
    address: '',
    membershipId: '',
    membershipDate: new Date().toISOString().split('T')[0],
    status: 'Active',
    role: 'Student',
    department: 'General Studies',
  };
  const [formData, setFormData] = useState(initialFormState);
  const [formErrors, setFormErrors] = useState({});
  const [touchedFields, setTouchedFields] = useState({});

  // Sync API / Load members
  const loadMembers = async (force = false) => {
    if (force) setIsLoading(true);
    setError(null);
    try {
      const data = await memberService.getMembers(force);
      setMembers(data);
      if (force) {
        toast.success('Members synchronized with Third-Party API!');
      }
    } catch (err) {
      console.error(err);
      setError('Failed to fetch members directory. Using stored data.');
      toast.error('Could not load members directory.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadMembers(false);
  }, []);

  // Filter & Search Logic
  const filteredAndSortedMembers = useMemo(() => {
    let result = [...members];

    // Search: Full Name, Email, Mobile Number, Membership ID, Address
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (m) =>
          m.fullName?.toLowerCase().includes(q) ||
          m.email?.toLowerCase().includes(q) ||
          m.mobileNumber?.toLowerCase().includes(q) ||
          m.membershipId?.toLowerCase().includes(q) ||
          m.address?.toLowerCase().includes(q)
      );
    }

    // Filter by Status
    if (statusFilter !== 'ALL') {
      result = result.filter((m) => m.status === statusFilter);
    }

    // Filter by Role
    if (roleFilter !== 'ALL') {
      result = result.filter((m) => m.role === roleFilter);
    }

    // Sort
    result.sort((a, b) => {
      if (sortBy === 'name-asc') {
        return (a.fullName || '').localeCompare(b.fullName || '');
      }
      if (sortBy === 'name-desc') {
        return (b.fullName || '').localeCompare(a.fullName || '');
      }
      if (sortBy === 'date-desc') {
        return new Date(b.membershipDate || 0) - new Date(a.membershipDate || 0);
      }
      if (sortBy === 'date-asc') {
        return new Date(a.membershipDate || 0) - new Date(b.membershipDate || 0);
      }
      return 0;
    });

    return result;
  }, [members, searchQuery, statusFilter, roleFilter, sortBy]);

  // Pagination calculation
  const totalPages = Math.ceil(filteredAndSortedMembers.length / itemsPerPage) || 1;
  const paginatedMembers = useMemo(() => {
    const validPage = Math.min(Math.max(1, currentPage), totalPages);
    const start = (validPage - 1) * itemsPerPage;
    return filteredAndSortedMembers.slice(start, start + itemsPerPage);
  }, [filteredAndSortedMembers, currentPage, itemsPerPage, totalPages]);

  // Reset page on search or filter change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, statusFilter, roleFilter, sortBy]);

  // Form field change handler with dynamic validation
  const handleInputChange = (field, value) => {
    const updated = { ...formData, [field]: value };
    setFormData(updated);

    if (touchedFields[field]) {
      const errors = validateMemberForm(updated);
      setFormErrors((prev) => ({ ...prev, [field]: errors[field] }));
    }
  };

  const handleInputBlur = (field) => {
    setTouchedFields((prev) => ({ ...prev, [field]: true }));
    const errors = validateMemberForm(formData);
    setFormErrors((prev) => ({ ...prev, [field]: errors[field] }));
  };

  // Open Add Modal
  const handleOpenAdd = () => {
    const randomId = `LIB-MEM-${Math.floor(1000 + Math.random() * 9000)}`;
    setFormData({
      ...initialFormState,
      membershipId: randomId,
      membershipDate: new Date().toISOString().split('T')[0],
    });
    setFormErrors({});
    setTouchedFields({});
    setIsAddModalOpen(true);
  };

  // Save New Member
  const handleSaveAdd = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;

    // Validate all fields
    const errors = validateMemberForm(formData);
    setFormErrors(errors);
    setTouchedFields({
      fullName: true,
      email: true,
      mobileNumber: true,
      address: true,
      membershipId: true,
      membershipDate: true,
    });

    if (Object.keys(errors).length > 0) {
      toast.warning('Please resolve highlighted form validation errors.');
      return;
    }

    setIsSubmitting(true);
    try {
      const created = await memberService.addMember(formData);
      setMembers((prev) => [created, ...prev]);
      setIsAddModalOpen(false);
      toast.success(`Member "${created.fullName}" successfully enrolled!`);
    } catch (err) {
      console.error(err);
      toast.error('Failed to add member to registry.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Open Edit Modal
  const handleOpenEdit = (member, e) => {
    if (e) e.stopPropagation();
    setEditingMember(member);
    setFormData({
      fullName: member.fullName || '',
      email: member.email || '',
      mobileNumber: member.mobileNumber || '',
      address: member.address || '',
      membershipId: member.membershipId || '',
      membershipDate: member.membershipDate || new Date().toISOString().split('T')[0],
      status: member.status || 'Active',
      role: member.role || 'Student',
      department: member.department || 'General Studies',
    });
    setFormErrors({});
    setTouchedFields({});
  };

  // Save Edit Member
  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!editingMember || isSubmitting) return;

    const errors = validateMemberForm(formData);
    setFormErrors(errors);
    setTouchedFields({
      fullName: true,
      email: true,
      mobileNumber: true,
      address: true,
      membershipId: true,
      membershipDate: true,
    });

    if (Object.keys(errors).length > 0) {
      toast.warning('Please resolve highlighted form validation errors.');
      return;
    }

    setIsSubmitting(true);
    try {
      const updated = await memberService.updateMember(editingMember.id, formData);
      setMembers((prev) => prev.map((m) => (m.id === updated.id ? updated : m)));
      setEditingMember(null);
      toast.success(`Member "${updated.fullName}" updated successfully!`);
    } catch (err) {
      console.error(err);
      toast.error('Failed to update member record.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete Member
  const handleOpenDelete = (member, e) => {
    if (e) e.stopPropagation();
    setDeletingMember(member);
  };

  const handleConfirmDelete = async () => {
    if (!deletingMember || isDeleting) return;

    setIsDeleting(true);
    try {
      await memberService.deleteMember(deletingMember.id);
      setMembers((prev) => prev.filter((m) => m.id !== deletingMember.id));
      toast.success(`Member "${deletingMember.fullName}" was removed from the system.`);
      setDeletingMember(null);
    } catch (err) {
      console.error(err);
      toast.error('Failed to delete member.');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setStatusFilter('ALL');
    setRoleFilter('ALL');
    setSortBy('name-asc');
  };

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-300">
      {/* 1. Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-xs font-semibold text-indigo-700 mb-2">
            <Users className="w-3.5 h-3.5" />
            <span>Circulation & Membership Records</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Member Management
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Enrol, monitor, search, and manage registered library cardholders and patrons.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <Button
            variant="outline"
            size="md"
            icon={RefreshCw}
            onClick={() => loadMembers(true)}
            title="Reload from API"
          >
            Sync API
          </Button>

          <Button
            variant="primary"
            size="md"
            icon={Plus}
            onClick={handleOpenAdd}
          >
            Add New Member
          </Button>
        </div>
      </div>

      {/* 2. Search, Filter, Sort & View Controls */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-4 sm:p-5 shadow-xs space-y-4">
        {/* Top Control Row: Search + View Mode */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by full name, email, phone, address, or membership ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-10 py-2.5 text-xs sm:text-sm bg-slate-50/80 hover:bg-slate-50 focus:bg-white border border-slate-200/90 rounded-xl placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-600 transition-all shadow-2xs"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* View Mode Toggle Buttons */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl self-end sm:self-auto border border-slate-200/60">
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                viewMode === 'grid'
                  ? 'bg-white text-indigo-600 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title="Grid Card View"
            >
              <LayoutGrid className="w-4 h-4" />
              <span className="hidden md:inline">Grid</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('table')}
              className={`p-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                viewMode === 'table'
                  ? 'bg-white text-indigo-600 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title="Table List View"
            >
              <List className="w-4 h-4" />
              <span className="hidden md:inline">Table</span>
            </button>
          </div>
        </div>

        {/* Bottom Control Row: Status Filter + Role Filter + Sort by */}
        <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-4 gap-3 pt-2 border-t border-slate-100">
          {/* Status Filter */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
              Membership Status
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50/70 hover:bg-slate-50 focus:bg-white px-3 py-2 text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-600"
            >
              <option value="ALL">All Statuses</option>
              <option value="Active">Active Cardholders</option>
              <option value="Inactive">Inactive / Suspended</option>
            </select>
          </div>

          {/* Role Filter */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
              Member Category / Role
            </label>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50/70 hover:bg-slate-50 focus:bg-white px-3 py-2 text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-600"
            >
              <option value="ALL">All Roles</option>
              <option value="Student">Student</option>
              <option value="Faculty">Faculty</option>
              <option value="Researcher">Researcher</option>
            </select>
          </div>

          {/* Sort By */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
              Sort By
            </label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50/70 hover:bg-slate-50 focus:bg-white px-3 py-2 text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-600"
            >
              <option value="name-asc">Full Name: A to Z</option>
              <option value="name-desc">Full Name: Z to A</option>
              <option value="date-desc">Newest Enrolled First</option>
              <option value="date-asc">Oldest Enrolled First</option>
            </select>
          </div>

          {/* Reset Filters */}
          <div className="flex items-end">
            <button
              type="button"
              onClick={handleResetFilters}
              className="w-full py-2 px-3 text-xs font-semibold text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl border border-slate-200 hover:border-indigo-200 transition-colors"
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {/* 3. Error Banner */}
      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-center justify-between text-rose-800 text-xs sm:text-sm">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
            <span>{error}</span>
          </div>
          <button
            onClick={() => loadMembers(true)}
            className="font-bold underline hover:no-underline ml-4"
          >
            Retry
          </button>
        </div>
      )}

      {/* 4. Member List Content: Grid or Table */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-4 animate-pulse">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-slate-200 rounded-full" />
                <div className="space-y-2 flex-1">
                  <div className="h-4 bg-slate-200 rounded w-3/4" />
                  <div className="h-3 bg-slate-200 rounded w-1/2" />
                </div>
              </div>
              <div className="space-y-2 pt-2">
                <div className="h-3 bg-slate-200 rounded w-full" />
                <div className="h-3 bg-slate-200 rounded w-4/5" />
              </div>
            </div>
          ))}
        </div>
      ) : filteredAndSortedMembers.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200/80 p-12 text-center">
          <Users className="w-14 h-14 text-slate-300 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-slate-800">No matching members found</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Try adjusting your search criteria, selecting another role, or clearing your active filters.
          </p>
          <Button
            variant="outline"
            size="sm"
            className="mt-4"
            onClick={handleResetFilters}
          >
            Reset Filters
          </Button>
        </div>
      ) : viewMode === 'grid' ? (
        /* GRID VIEW OF MEMBER CARDS */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {paginatedMembers.map((member) => {
            const isActive = member.status === 'Active';
            return (
              <div
                key={member.id}
                onClick={() => navigate(`/members/${member.id}`)}
                className="bg-white rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-lg transition-all duration-200 flex flex-col justify-between overflow-hidden cursor-pointer group"
              >
                {/* Header card with ID pill and Status */}
                <div className="p-5 pb-4 border-b border-slate-100/80">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3.5">
                      <img
                        src={member.avatar || memberService.DEFAULT_MEMBER_AVATAR}
                        alt={member.fullName}
                        className="w-12 h-12 rounded-full object-cover ring-2 ring-indigo-50 shadow-2xs group-hover:scale-105 transition-transform"
                        onError={(e) => {
                          e.currentTarget.onerror = null;
                          e.currentTarget.src = memberService.DEFAULT_MEMBER_AVATAR;
                        }}
                      />
                      <div>
                        <h3 className="font-bold text-slate-900 text-sm group-hover:text-indigo-600 transition-colors">
                          {member.fullName}
                        </h3>
                        <span className="text-[11px] font-semibold text-slate-500 flex items-center gap-1 mt-0.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
                          {member.role || 'Member'} • {member.department || 'General'}
                        </span>
                      </div>
                    </div>

                    <span
                      className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full shrink-0 ${
                        isActive
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-slate-100 text-slate-600 border border-slate-200'
                      }`}
                    >
                      {member.status || 'Active'}
                    </span>
                  </div>
                </div>

                {/* Member Specifications (All required fields) */}
                <div className="p-5 py-4 space-y-2.5 text-xs text-slate-600 flex-1">
                  {/* Membership ID */}
                  <div className="flex items-center justify-between font-mono bg-slate-50 px-2.5 py-1.5 rounded-lg border border-slate-100">
                    <span className="text-slate-400 font-sans text-[11px] font-medium flex items-center gap-1.5">
                      <IdCard className="w-3.5 h-3.5 text-indigo-500" />
                      ID:
                    </span>
                    <span className="font-bold text-slate-800">{member.membershipId}</span>
                  </div>

                  {/* Email */}
                  <div className="flex items-center gap-2 truncate">
                    <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{member.email}</span>
                  </div>

                  {/* Mobile Number */}
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>{member.mobileNumber}</span>
                  </div>

                  {/* Address */}
                  <div className="flex items-start gap-2">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                    <span className="line-clamp-1">{member.address}</span>
                  </div>

                  {/* Membership Date */}
                  <div className="flex items-center gap-2 text-slate-400 text-[11px] pt-1">
                    <Calendar className="w-3.5 h-3.5 shrink-0" />
                    <span>Joined: {member.membershipDate}</span>
                  </div>
                </div>

                {/* Card Actions */}
                <div className="p-4 pt-3 border-t border-slate-100 bg-slate-50/40 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/members/${member.id}`);
                    }}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-600 hover:text-indigo-800 p-1.5 rounded-lg hover:bg-indigo-50 transition-colors"
                  >
                    <Eye className="w-4 h-4" />
                    <span>View Profile</span>
                  </button>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={(e) => handleOpenEdit(member, e)}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                      title="Edit Member"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={(e) => handleOpenDelete(member, e)}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                      title="Delete Member"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* TABLE VIEW OF MEMBERS */
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200/80 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  <th className="py-3.5 px-4">Member Name & ID</th>
                  <th className="py-3.5 px-4">Email Address</th>
                  <th className="py-3.5 px-4">Mobile Number</th>
                  <th className="py-3.5 px-4">Address</th>
                  <th className="py-3.5 px-4">Membership Date</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {paginatedMembers.map((member) => (
                  <tr
                    key={member.id}
                    onClick={() => navigate(`/members/${member.id}`)}
                    className="hover:bg-slate-50/70 cursor-pointer transition-colors"
                  >
                    {/* Full Name & Avatar */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={member.avatar || memberService.DEFAULT_MEMBER_AVATAR}
                          alt={member.fullName}
                          className="w-9 h-9 rounded-full object-cover shrink-0 shadow-2xs"
                          onError={(e) => {
                            e.currentTarget.onerror = null;
                            e.currentTarget.src = memberService.DEFAULT_MEMBER_AVATAR;
                          }}
                        />
                        <div>
                          <span className="font-bold text-slate-900 block text-xs sm:text-sm">
                            {member.fullName}
                          </span>
                          <span className="font-mono text-[10px] text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                            {member.membershipId}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Email */}
                    <td className="py-3.5 px-4 font-medium text-slate-700">
                      {member.email}
                    </td>

                    {/* Mobile Number */}
                    <td className="py-3.5 px-4 font-medium text-slate-700">
                      {member.mobileNumber}
                    </td>

                    {/* Address */}
                    <td className="py-3.5 px-4 text-slate-600 max-w-[200px] truncate">
                      {member.address}
                    </td>

                    {/* Membership Date */}
                    <td className="py-3.5 px-4 text-slate-500">
                      {member.membershipDate}
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-4">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          member.status === 'Active'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-slate-100 text-slate-600 border border-slate-200'
                        }`}
                      >
                        {member.status || 'Active'}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
                        <button
                          type="button"
                          onClick={() => navigate(`/members/${member.id}`)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                          title="View Profile"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={(e) => handleOpenEdit(member, e)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                          title="Edit Member"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={(e) => handleOpenDelete(member, e)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                          title="Delete Member"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 5. Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between bg-white rounded-2xl border border-slate-200/80 px-4 py-3 shadow-xs">
          <div className="text-xs text-slate-500">
            Showing <span className="font-semibold text-slate-800">{(currentPage - 1) * itemsPerPage + 1}</span> to{' '}
            <span className="font-semibold text-slate-800">
              {Math.min(currentPage * itemsPerPage, filteredAndSortedMembers.length)}
            </span>{' '}
            of <span className="font-semibold text-slate-800">{filteredAndSortedMembers.length}</span> members
          </div>

          <div className="flex items-center gap-1.5">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              disabled={currentPage === 1}
            >
              Previous
            </Button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                type="button"
                onClick={() => setCurrentPage(page)}
                className={`w-8 h-8 rounded-lg text-xs font-semibold transition-all ${
                  currentPage === page
                    ? 'bg-indigo-600 text-white shadow-2xs'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                {page}
              </button>
            ))}

            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              disabled={currentPage === totalPages}
            >
              Next
            </Button>
          </div>
        </div>
      )}

      {/* 6. MODAL: Add New Member (Form Validation Guaranteed) */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add New Member"
        subtitle="Enrol a new library patron with verified contact details."
        maxWidth="max-w-xl"
      >
        <form onSubmit={handleSaveAdd} className="space-y-4" noValidate>
          {/* Row 1: Full Name */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 tracking-tight mb-1.5">
              Full Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              placeholder="e.g. Alexander Hamilton"
              value={formData.fullName}
              onChange={(e) => handleInputChange('fullName', e.target.value)}
              onBlur={() => handleInputBlur('fullName')}
              className={`w-full px-3.5 py-2.5 text-xs sm:text-sm bg-slate-50 border rounded-xl focus:outline-none transition-all ${
                formErrors.fullName
                  ? 'border-rose-400 bg-rose-50/30 focus:ring-4 focus:ring-rose-500/10'
                  : 'border-slate-200 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-600'
              }`}
            />
            {formErrors.fullName && (
              <p className="text-[11px] text-rose-500 mt-1 flex items-center gap-1 font-medium">
                <AlertCircle className="w-3 h-3" />
                {formErrors.fullName}
              </p>
            )}
          </div>

          {/* Row 2: Email & Mobile Number */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-semibold text-slate-700 tracking-tight mb-1.5">
                Email Address <span className="text-rose-500">*</span>
              </label>
              <input
                type="email"
                placeholder="patron@library.com"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                onBlur={() => handleInputBlur('email')}
                className={`w-full px-3.5 py-2.5 text-xs sm:text-sm bg-slate-50 border rounded-xl focus:outline-none transition-all ${
                  formErrors.email
                    ? 'border-rose-400 bg-rose-50/30 focus:ring-4 focus:ring-rose-500/10'
                    : 'border-slate-200 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-600'
                }`}
              />
              {formErrors.email && (
                <p className="text-[11px] text-rose-500 mt-1 flex items-center gap-1 font-medium">
                  <AlertCircle className="w-3 h-3" />
                  {formErrors.email}
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 tracking-tight mb-1.5">
                Mobile Number <span className="text-rose-500">*</span>
              </label>
              <input
                type="tel"
                placeholder="+1 (555) 000-0000"
                value={formData.mobileNumber}
                onChange={(e) => handleInputChange('mobileNumber', e.target.value)}
                onBlur={() => handleInputBlur('mobileNumber')}
                className={`w-full px-3.5 py-2.5 text-xs sm:text-sm bg-slate-50 border rounded-xl focus:outline-none transition-all ${
                  formErrors.mobileNumber
                    ? 'border-rose-400 bg-rose-50/30 focus:ring-4 focus:ring-rose-500/10'
                    : 'border-slate-200 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-600'
                }`}
              />
              {formErrors.mobileNumber && (
                <p className="text-[11px] text-rose-500 mt-1 flex items-center gap-1 font-medium">
                  <AlertCircle className="w-3 h-3" />
                  {formErrors.mobileNumber}
                </p>
              )}
            </div>
          </div>

          {/* Row 3: Physical Address */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 tracking-tight mb-1.5">
              Physical Address <span className="text-rose-500">*</span>
            </label>
            <textarea
              rows={2}
              placeholder="e.g. 100 Main Street, Apt 4B, New York, NY 10001"
              value={formData.address}
              onChange={(e) => handleInputChange('address', e.target.value)}
              onBlur={() => handleInputBlur('address')}
              className={`w-full px-3.5 py-2.5 text-xs sm:text-sm bg-slate-50 border rounded-xl focus:outline-none transition-all ${
                formErrors.address
                  ? 'border-rose-400 bg-rose-50/30 focus:ring-4 focus:ring-rose-500/10'
                  : 'border-slate-200 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-600'
              }`}
            />
            {formErrors.address && (
              <p className="text-[11px] text-rose-500 mt-1 flex items-center gap-1 font-medium">
                <AlertCircle className="w-3 h-3" />
                {formErrors.address}
              </p>
            )}
          </div>

          {/* Row 4: Membership ID & Membership Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-semibold text-slate-700 tracking-tight mb-1.5">
                Membership ID <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={formData.membershipId}
                onChange={(e) => handleInputChange('membershipId', e.target.value)}
                onBlur={() => handleInputBlur('membershipId')}
                className={`w-full px-3.5 py-2.5 text-xs sm:text-sm bg-slate-50 font-mono border rounded-xl focus:outline-none transition-all ${
                  formErrors.membershipId
                    ? 'border-rose-400 bg-rose-50/30 focus:ring-4 focus:ring-rose-500/10'
                    : 'border-slate-200 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-600'
                }`}
              />
              {formErrors.membershipId && (
                <p className="text-[11px] text-rose-500 mt-1 flex items-center gap-1 font-medium">
                  <AlertCircle className="w-3 h-3" />
                  {formErrors.membershipId}
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 tracking-tight mb-1.5">
                Membership Date <span className="text-rose-500">*</span>
              </label>
              <input
                type="date"
                value={formData.membershipDate}
                onChange={(e) => handleInputChange('membershipDate', e.target.value)}
                onBlur={() => handleInputBlur('membershipDate')}
                className={`w-full px-3.5 py-2.5 text-xs sm:text-sm bg-slate-50 border rounded-xl focus:outline-none transition-all ${
                  formErrors.membershipDate
                    ? 'border-rose-400 bg-rose-50/30 focus:ring-4 focus:ring-rose-500/10'
                    : 'border-slate-200 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-600'
                }`}
              />
              {formErrors.membershipDate && (
                <p className="text-[11px] text-rose-500 mt-1 flex items-center gap-1 font-medium">
                  <AlertCircle className="w-3 h-3" />
                  {formErrors.membershipDate}
                </p>
              )}
            </div>
          </div>

          {/* Row 5: Role & Status */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-semibold text-slate-700 tracking-tight mb-1.5">
                Member Role
              </label>
              <select
                value={formData.role}
                onChange={(e) => handleInputChange('role', e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-600"
              >
                <option value="Student">Student</option>
                <option value="Faculty">Faculty</option>
                <option value="Researcher">Researcher</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 tracking-tight mb-1.5">
                Initial Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => handleInputChange('status', e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-600"
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
          </div>

          {/* Modal Actions */}
          <div className="pt-3 border-t border-slate-100 flex justify-end gap-2.5">
            <Button variant="outline" size="md" onClick={() => setIsAddModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="md" disabled={isSubmitting}>
              {isSubmitting ? 'Enrolling Member...' : 'Enrol Member'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* 7. MODAL: Edit Member (Form Validation Guaranteed) */}
      <Modal
        isOpen={!!editingMember}
        onClose={() => setEditingMember(null)}
        title="Edit Member Information"
        subtitle={`Updating records for ${editingMember?.fullName}`}
        maxWidth="max-w-xl"
      >
        <form onSubmit={handleSaveEdit} className="space-y-4" noValidate>
          {/* Full Name */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 tracking-tight mb-1.5">
              Full Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={formData.fullName}
              onChange={(e) => handleInputChange('fullName', e.target.value)}
              onBlur={() => handleInputBlur('fullName')}
              className={`w-full px-3.5 py-2.5 text-xs sm:text-sm bg-slate-50 border rounded-xl focus:outline-none transition-all ${
                formErrors.fullName
                  ? 'border-rose-400 bg-rose-50/30 focus:ring-4 focus:ring-rose-500/10'
                  : 'border-slate-200 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-600'
              }`}
            />
            {formErrors.fullName && (
              <p className="text-[11px] text-rose-500 mt-1 flex items-center gap-1 font-medium">
                <AlertCircle className="w-3 h-3" />
                {formErrors.fullName}
              </p>
            )}
          </div>

          {/* Email & Phone */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-semibold text-slate-700 tracking-tight mb-1.5">
                Email Address <span className="text-rose-500">*</span>
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                onBlur={() => handleInputBlur('email')}
                className={`w-full px-3.5 py-2.5 text-xs sm:text-sm bg-slate-50 border rounded-xl focus:outline-none transition-all ${
                  formErrors.email
                    ? 'border-rose-400 bg-rose-50/30 focus:ring-4 focus:ring-rose-500/10'
                    : 'border-slate-200 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-600'
                }`}
              />
              {formErrors.email && (
                <p className="text-[11px] text-rose-500 mt-1 flex items-center gap-1 font-medium">
                  <AlertCircle className="w-3 h-3" />
                  {formErrors.email}
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 tracking-tight mb-1.5">
                Mobile Number <span className="text-rose-500">*</span>
              </label>
              <input
                type="tel"
                value={formData.mobileNumber}
                onChange={(e) => handleInputChange('mobileNumber', e.target.value)}
                onBlur={() => handleInputBlur('mobileNumber')}
                className={`w-full px-3.5 py-2.5 text-xs sm:text-sm bg-slate-50 border rounded-xl focus:outline-none transition-all ${
                  formErrors.mobileNumber
                    ? 'border-rose-400 bg-rose-50/30 focus:ring-4 focus:ring-rose-500/10'
                    : 'border-slate-200 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-600'
                }`}
              />
              {formErrors.mobileNumber && (
                <p className="text-[11px] text-rose-500 mt-1 flex items-center gap-1 font-medium">
                  <AlertCircle className="w-3 h-3" />
                  {formErrors.mobileNumber}
                </p>
              )}
            </div>
          </div>

          {/* Address */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 tracking-tight mb-1.5">
              Physical Address <span className="text-rose-500">*</span>
            </label>
            <textarea
              rows={2}
              value={formData.address}
              onChange={(e) => handleInputChange('address', e.target.value)}
              onBlur={() => handleInputBlur('address')}
              className={`w-full px-3.5 py-2.5 text-xs sm:text-sm bg-slate-50 border rounded-xl focus:outline-none transition-all ${
                formErrors.address
                  ? 'border-rose-400 bg-rose-50/30 focus:ring-4 focus:ring-rose-500/10'
                  : 'border-slate-200 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-600'
              }`}
            />
            {formErrors.address && (
              <p className="text-[11px] text-rose-500 mt-1 flex items-center gap-1 font-medium">
                <AlertCircle className="w-3 h-3" />
                {formErrors.address}
              </p>
            )}
          </div>

          {/* Membership ID & Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-semibold text-slate-700 tracking-tight mb-1.5">
                Membership ID <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={formData.membershipId}
                onChange={(e) => handleInputChange('membershipId', e.target.value)}
                onBlur={() => handleInputBlur('membershipId')}
                className={`w-full px-3.5 py-2.5 text-xs sm:text-sm bg-slate-50 font-mono border rounded-xl focus:outline-none transition-all ${
                  formErrors.membershipId
                    ? 'border-rose-400 bg-rose-50/30 focus:ring-4 focus:ring-rose-500/10'
                    : 'border-slate-200 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-600'
                }`}
              />
              {formErrors.membershipId && (
                <p className="text-[11px] text-rose-500 mt-1 flex items-center gap-1 font-medium">
                  <AlertCircle className="w-3 h-3" />
                  {formErrors.membershipId}
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 tracking-tight mb-1.5">
                Membership Date <span className="text-rose-500">*</span>
              </label>
              <input
                type="date"
                value={formData.membershipDate}
                onChange={(e) => handleInputChange('membershipDate', e.target.value)}
                onBlur={() => handleInputBlur('membershipDate')}
                className={`w-full px-3.5 py-2.5 text-xs sm:text-sm bg-slate-50 border rounded-xl focus:outline-none transition-all ${
                  formErrors.membershipDate
                    ? 'border-rose-400 bg-rose-50/30 focus:ring-4 focus:ring-rose-500/10'
                    : 'border-slate-200 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-600'
                }`}
              />
              {formErrors.membershipDate && (
                <p className="text-[11px] text-rose-500 mt-1 flex items-center gap-1 font-medium">
                  <AlertCircle className="w-3 h-3" />
                  {formErrors.membershipDate}
                </p>
              )}
            </div>
          </div>

          {/* Role & Status */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-semibold text-slate-700 tracking-tight mb-1.5">
                Member Role
              </label>
              <select
                value={formData.role}
                onChange={(e) => handleInputChange('role', e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-600"
              >
                <option value="Student">Student</option>
                <option value="Faculty">Faculty</option>
                <option value="Researcher">Researcher</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 tracking-tight mb-1.5">
                Membership Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => handleInputChange('status', e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-600"
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
          </div>

          {/* Modal Actions */}
          <div className="pt-3 border-t border-slate-100 flex justify-end gap-2.5">
            <Button variant="outline" size="md" onClick={() => setEditingMember(null)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="md" disabled={isSubmitting}>
              {isSubmitting ? 'Saving Changes...' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* 8. MODAL: Delete Member Confirmation */}
      <Modal
        isOpen={!!deletingMember}
        onClose={() => setDeletingMember(null)}
        title="Confirm Member Removal"
        subtitle="This action will delete the member account and invalidate their library card."
        maxWidth="max-w-md"
      >
        <div className="space-y-4">
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            Are you sure you want to delete member{' '}
            <strong className="text-slate-900 font-bold">"{deletingMember?.fullName}"</strong> (
            {deletingMember?.membershipId})? This will permanently remove their records from local storage.
          </p>

          <div className="p-3 bg-rose-50 border border-rose-100 rounded-xl text-xs text-rose-800">
            ⚠️ <strong>Warning:</strong> Ensure all issued books have been returned before deleting patron profiles.
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <Button variant="outline" size="md" onClick={() => setDeletingMember(null)}>
              Cancel
            </Button>
            <Button
              variant="danger"
              size="md"
              onClick={handleConfirmDelete}
              disabled={isDeleting}
            >
              {isDeleting ? 'Deleting...' : 'Delete Member'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default MembersPage;
