import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Users,
  Calendar,
  Mail,
  Phone,
  MapPin,
  IdCard,
  Edit2,
  Trash2,
  CheckCircle,
  AlertCircle,
  Copy,
  BookOpen,
  Award,
  Clock,
  ShieldCheck,
  UserCheck,
} from 'lucide-react';
import { toast } from 'react-toastify';
import { memberService } from '../../services/memberService';
import { validateMemberForm } from './MembersPage';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';

const MemberProfilePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [member, setMember] = useState(() => memberService.getMemberById(id));
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [copiedId, setCopiedId] = useState(false);

  // Form State for editing
  const [formData, setFormData] = useState(() => {
    const initial = memberService.getMemberById(id);
    return {
      fullName: initial?.fullName || '',
      email: initial?.email || '',
      mobileNumber: initial?.mobileNumber || '',
      address: initial?.address || '',
      membershipId: initial?.membershipId || '',
      membershipDate: initial?.membershipDate || new Date().toISOString().split('T')[0],
      status: initial?.status || 'Active',
      role: initial?.role || 'Student',
      department: initial?.department || 'General Studies',
    };
  });
  const [formErrors, setFormErrors] = useState({});
  const [touchedFields, setTouchedFields] = useState({});

  const loadMemberDetails = () => {
    const data = memberService.getMemberById(id);
    if (data) {
      setMember(data);
      setFormData({
        fullName: data.fullName || '',
        email: data.email || '',
        mobileNumber: data.mobileNumber || '',
        address: data.address || '',
        membershipId: data.membershipId || '',
        membershipDate: data.membershipDate || new Date().toISOString().split('T')[0],
        status: data.status || 'Active',
        role: data.role || 'Student',
        department: data.department || 'General Studies',
      });
    } else {
      setMember(null);
    }
  };

  useEffect(() => {
    loadMemberDetails();
  }, [id]);

  const handleCopyId = () => {
    if (!member?.membershipId) return;
    navigator.clipboard.writeText(member.membershipId);
    setCopiedId(true);
    toast.info('Membership ID copied to clipboard!');
    setTimeout(() => setCopiedId(false), 2000);
  };

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

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;

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
      const updated = await memberService.updateMember(id, formData);
      setMember(updated);
      setIsEditModalOpen(false);
      toast.success('Member profile updated successfully!');
    } catch (err) {
      console.error(err);
      toast.error('Failed to update member profile.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (isDeleting) return;

    setIsDeleting(true);
    try {
      await memberService.deleteMember(id);
      toast.success(`Member "${member.fullName}" was successfully removed.`);
      navigate('/members');
    } catch (err) {
      console.error(err);
      toast.error('Failed to delete member.');
    } finally {
      setIsDeleting(false);
    }
  };

  if (!member) {
    return (
      <div className="bg-white rounded-3xl border border-slate-200/80 p-12 text-center max-w-lg mx-auto shadow-xs">
        <AlertCircle className="w-16 h-16 text-rose-500 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-slate-800">Member Not Found</h2>
        <p className="text-sm text-slate-500 mt-2 mb-6">
          The requested member cardholder does not exist or may have been deleted from local storage.
        </p>
        <Link to="/members">
          <Button variant="primary" icon={ArrowLeft}>
            Back to Member Directory
          </Button>
        </Link>
      </div>
    );
  }

  const isActive = member.status === 'Active';

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-300">
      {/* Top Navigation & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <Link
          to="/members"
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-indigo-600 transition-colors w-fit group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span>Back to Member Directory</span>
        </Link>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            icon={Edit2}
            onClick={() => setIsEditModalOpen(true)}
          >
            Edit Member
          </Button>
          <Button
            variant="danger"
            size="sm"
            icon={Trash2}
            onClick={() => setIsDeleteModalOpen(true)}
          >
            Delete
          </Button>
        </div>
      </div>

      {/* Main Profile & Membership Card */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8">
        {/* Left Column: Digital Membership Pass Card */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-6 sm:p-7 shadow-xl border border-slate-800 relative overflow-hidden">
            {/* Background design elements */}
            <div className="absolute -right-8 -bottom-8 w-44 h-44 rounded-full bg-indigo-500/10 blur-2xl pointer-events-none" />
            <div className="absolute top-0 right-0 p-6 opacity-10">
              <IdCard className="w-32 h-32 text-white" />
            </div>

            {/* Header of Card */}
            <div className="flex items-center justify-between pb-6 border-b border-white/10 relative z-10">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-indigo-500 flex items-center justify-center text-white shadow-md">
                  <Users className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[10px] uppercase tracking-widest text-indigo-300 font-bold block">
                    BookStack LMS
                  </span>
                  <span className="text-xs font-semibold text-slate-200">
                    Official Library Pass
                  </span>
                </div>
              </div>

              <span
                className={`text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider ${
                  isActive
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                }`}
              >
                {member.status || 'Active'}
              </span>
            </div>

            {/* Avatar & Details */}
            <div className="pt-6 flex items-center gap-4 relative z-10">
              <img
                src={member.avatar || memberService.DEFAULT_MEMBER_AVATAR}
                alt={member.fullName}
                className="w-18 h-18 sm:w-20 sm:h-20 rounded-2xl object-cover ring-2 ring-indigo-400/40 shadow-lg"
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = memberService.DEFAULT_MEMBER_AVATAR;
                }}
              />
              <div className="min-w-0">
                <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight truncate">
                  {member.fullName}
                </h2>
                <span className="text-xs font-medium text-indigo-300 block mt-0.5">
                  {member.role || 'Student'} • {member.department || 'General'}
                </span>
                <span className="inline-block mt-2 text-[10px] font-semibold text-slate-400 bg-white/5 border border-white/10 px-2.5 py-0.5 rounded-full">
                  Member since {member.membershipDate}
                </span>
              </div>
            </div>

            {/* Bottom Bar: Membership ID & Barcode Simulation */}
            <div className="mt-8 pt-5 border-t border-white/10 flex items-center justify-between relative z-10">
              <div>
                <span className="text-[10px] uppercase tracking-wider text-slate-400 block font-semibold">
                  Membership ID
                </span>
                <span className="font-mono text-sm sm:text-base font-extrabold text-indigo-200 tracking-wider">
                  {member.membershipId}
                </span>
              </div>

              <button
                type="button"
                onClick={handleCopyId}
                className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors"
                title="Copy Membership ID"
              >
                {copiedId ? (
                  <>
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Quick Stats Widget */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
              <span className="text-xs font-semibold text-slate-400 block">Books In Possession</span>
              <span className="text-2xl font-extrabold text-slate-900 mt-1 block">
                {member.booksIssuedCount || 0}
              </span>
              <span className="text-[11px] text-slate-500 font-medium mt-1 flex items-center gap-1">
                <BookOpen className="w-3 h-3 text-indigo-500" />
                Active circulation
              </span>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
              <span className="text-xs font-semibold text-slate-400 block">Standing Status</span>
              <span className="text-2xl font-extrabold text-emerald-600 mt-1 block">
                {isActive ? 'Good' : 'Review'}
              </span>
              <span className="text-[11px] text-slate-500 font-medium mt-1 flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-emerald-500" />
                Zero overdue fines
              </span>
            </div>
          </div>
        </div>

        {/* Right Column: Full Specifications & Verified Details */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs space-y-6">
            <div>
              <h3 className="text-base font-extrabold text-slate-900 tracking-tight">
                Patron Contact & Biographic Data
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                All 6 primary attributes verified for library circulation privileges.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              {/* 1. Full Name */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
                <span className="text-slate-400 font-medium text-[11px] block">Full Name</span>
                <span className="text-sm font-bold text-slate-900 block truncate">
                  {member.fullName}
                </span>
              </div>

              {/* 2. Membership ID */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
                <span className="text-slate-400 font-medium text-[11px] block">Membership ID</span>
                <span className="text-sm font-bold font-mono text-indigo-600 block">
                  {member.membershipId}
                </span>
              </div>

              {/* 3. Email */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
                <span className="text-slate-400 font-medium text-[11px] block">Email Address</span>
                <a
                  href={`mailto:${member.email}`}
                  className="text-sm font-semibold text-indigo-600 hover:underline block truncate"
                >
                  {member.email}
                </a>
              </div>

              {/* 4. Mobile Number */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
                <span className="text-slate-400 font-medium text-[11px] block">Mobile Number</span>
                <a
                  href={`tel:${member.mobileNumber}`}
                  className="text-sm font-semibold text-slate-800 hover:text-indigo-600 block"
                >
                  {member.mobileNumber}
                </a>
              </div>

              {/* 5. Physical Address (Span 2) */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1 sm:col-span-2">
                <span className="text-slate-400 font-medium text-[11px] block flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-indigo-500" />
                  Registered Physical Address
                </span>
                <span className="text-sm font-semibold text-slate-800 block">
                  {member.address}
                </span>
              </div>

              {/* 6. Membership Date */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
                <span className="text-slate-400 font-medium text-[11px] block flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-slate-400" />
                  Membership Date
                </span>
                <span className="text-sm font-bold text-slate-800 block">
                  {member.membershipDate}
                </span>
              </div>

              {/* Status & Category */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
                <span className="text-slate-400 font-medium text-[11px] block">Account Status</span>
                <span className="text-sm font-bold text-emerald-600 block">
                  {member.status || 'Active'} • {member.role || 'Student'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* MODAL: Edit Member (with full validation) */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit Member Profile"
        subtitle={`Update bibliographic details for ${member.fullName}`}
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

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <Button
              type="button"
              variant="outline"
              size="md"
              onClick={() => setIsEditModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="md" disabled={isSubmitting}>
              {isSubmitting ? 'Saving Changes...' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* MODAL: Delete Confirmation */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Delete Member Account"
        subtitle="This action will delete this patron record and all library privileges."
        maxWidth="max-w-md"
      >
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-rose-50 border border-rose-100 text-rose-700 text-xs">
            <p className="font-bold">Caution:</p>
            <p className="mt-1">
              You are about to delete <span className="font-bold">"{member.fullName}"</span> (
              {member.membershipId}). Ensure any borrowed volumes have been checked in.
            </p>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <Button
              variant="outline"
              size="md"
              onClick={() => setIsDeleteModalOpen(false)}
            >
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

export default MemberProfilePage;
