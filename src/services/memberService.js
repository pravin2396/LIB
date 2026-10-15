// Member Service with Third-Party API Integration (DummyJSON) and LocalStorage Persistence
import api from './api';

export const MEMBERS_STORAGE_KEY = 'bookstack_members_data';

export const DEFAULT_MEMBER_AVATAR = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80';

// Seed catalog of library members with all 6 required fields:
// 1. Full Name, 2. Email, 3. Mobile Number, 4. Address, 5. Membership ID, 6. Membership Date
export const SEED_MEMBERS = [
  {
    id: 'mem_1',
    fullName: 'Sophia Chen',
    email: 'sophia.chen@library.com',
    mobileNumber: '+1 (555) 456-7890',
    address: '428 University Blvd, Suite 3A, Cambridge, MA',
    membershipId: 'LIB-MEM-1001',
    membershipDate: '2023-09-12',
    status: 'Active',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    role: 'Student',
    booksIssuedCount: 2,
    department: 'Computer Science',
  },
  {
    id: 'mem_2',
    fullName: 'David Miller',
    email: 'david.miller@campus.edu',
    mobileNumber: '+1 (555) 321-9876',
    address: '742 Evergreen Terrace, Springfield, OR',
    membershipId: 'LIB-MEM-1002',
    membershipDate: '2023-10-05',
    status: 'Active',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    role: 'Faculty',
    booksIssuedCount: 1,
    department: 'Civil Engineering',
  },
  {
    id: 'mem_3',
    fullName: 'Aria Montgomery',
    email: 'aria.montgomery@arts.org',
    mobileNumber: '+1 (555) 789-1234',
    address: '159 Rosewood Lane, Philadelphia, PA',
    membershipId: 'LIB-MEM-1003',
    membershipDate: '2024-01-18',
    status: 'Active',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    role: 'Student',
    booksIssuedCount: 0,
    department: 'English Literature',
  },
  {
    id: 'mem_4',
    fullName: 'Liam Patel',
    email: 'liam.patel@tech.edu',
    mobileNumber: '+1 (555) 654-7890',
    address: '88 Innovation Way, Austin, TX',
    membershipId: 'LIB-MEM-1004',
    membershipDate: '2024-02-01',
    status: 'Active',
    avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150&auto=format&fit=crop&q=80',
    role: 'Researcher',
    booksIssuedCount: 3,
    department: 'Robotics & AI',
  },
  {
    id: 'mem_5',
    fullName: 'Emma Watson',
    email: 'emma.watson@literature.org',
    mobileNumber: '+1 (555) 890-2345',
    address: '12 Baker Street, Boston, MA',
    membershipId: 'LIB-MEM-1005',
    membershipDate: '2024-03-10',
    status: 'Active',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
    role: 'Student',
    booksIssuedCount: 1,
    department: 'Classical Studies',
  },
  {
    id: 'mem_6',
    fullName: 'Lucas Ramirez',
    email: 'lucas.ramirez@biomed.edu',
    mobileNumber: '+1 (555) 432-8765',
    address: '520 South Congress Ave, Austin, TX',
    membershipId: 'LIB-MEM-1006',
    membershipDate: '2024-04-15',
    status: 'Inactive',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    role: 'Student',
    booksIssuedCount: 0,
    department: 'Biomedical Engineering',
  },
  {
    id: 'mem_7',
    fullName: 'Chloe Bennett',
    email: 'chloe.bennett@law.edu',
    mobileNumber: '+1 (555) 987-6543',
    address: '900 Michigan Avenue, Chicago, IL',
    membershipId: 'LIB-MEM-1007',
    membershipDate: '2024-05-20',
    status: 'Active',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
    role: 'Student',
    booksIssuedCount: 2,
    department: 'International Law',
  },
  {
    id: 'mem_8',
    fullName: 'Noah Kim',
    email: 'noah.kim@ai-institute.org',
    mobileNumber: '+1 (555) 234-9876',
    address: '350 Fifth Avenue, New York, NY',
    membershipId: 'LIB-MEM-1008',
    membershipDate: '2024-06-01',
    status: 'Active',
    avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80',
    role: 'Faculty',
    booksIssuedCount: 0,
    department: 'Information Science',
  },
];

// In-flight request deduplication & caching state
let activeGetPromise = null;
let lastGetTimestamp = 0;
const CACHE_WINDOW_MS = 60000;

// Safe mapping for DummyJSON user resource IDs (1..100) to prevent 404 errors
const getMockApiId = (id) => {
  if (!id) return 1;
  const numeric = typeof id === 'number' ? id : parseInt(String(id).replace(/\D/g, ''), 10);
  if (!isNaN(numeric) && numeric >= 1 && numeric <= 100) {
    return numeric;
  }
  let hash = 0;
  const str = String(id);
  for (let i = 0; i < str.length; i++) {
    hash = (hash * 31 + str.charCodeAt(i)) >>> 0;
  }
  return (hash % 100) + 1;
};

export const memberService = {
  MEMBERS_STORAGE_KEY,
  DEFAULT_MEMBER_AVATAR,

  // Synchronous accessor to guarantee members are instantly available on frame 1
  getStoredMembers: () => {
    try {
      const cached = localStorage.getItem(MEMBERS_STORAGE_KEY);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
      localStorage.setItem(MEMBERS_STORAGE_KEY, JSON.stringify(SEED_MEMBERS));
      return SEED_MEMBERS;
    } catch {
      return SEED_MEMBERS;
    }
  },

  // READ: Fetch members with network replication and in-flight deduplication
  getMembers: async (forceRefresh = false) => {
    const now = Date.now();

    // If not forced and already fetched recently, return stored cache without repeating network request
    if (!forceRefresh && (now - lastGetTimestamp < CACHE_WINDOW_MS)) {
      return memberService.getStoredMembers();
    }

    if (activeGetPromise) {
      return activeGetPromise;
    }

    activeGetPromise = (async () => {
      try {
        const response = await api.get('/users?limit=10');
        lastGetTimestamp = Date.now();

        if (response.data && Array.isArray(response.data.users) && response.data.users.length > 0) {
          const stored = memberService.getStoredMembers();
          // Merge API data with stored records
          const combined = stored.map((mem, idx) => {
            const apiUser = response.data.users[idx % response.data.users.length];
            return {
              ...mem,
              fullName: mem.fullName || `${apiUser.firstName} ${apiUser.lastName}`,
              email: mem.email || apiUser.email,
              mobileNumber: mem.mobileNumber || apiUser.phone,
              address: mem.address || `${apiUser.address?.address || ''}, ${apiUser.address?.city || ''}`,
            };
          });

          localStorage.setItem(MEMBERS_STORAGE_KEY, JSON.stringify(combined));
          return combined;
        }

        return memberService.getStoredMembers();
      } catch (err) {
        console.warn('DummyJSON /users GET failed; using stored members:', err.message);
        return memberService.getStoredMembers();
      } finally {
        activeGetPromise = null;
      }
    })();

    return activeGetPromise;
  },

  // Get single member by ID
  getMemberById: (id) => {
    try {
      const list = memberService.getStoredMembers();
      return list.find((m) => String(m.id) === String(id)) || null;
    } catch {
      return null;
    }
  },

  // CREATE: Add new member with Network POST replication and LocalStorage persistence
  addMember: async (memberData) => {
    const generatedId = 'mem_' + Date.now();
    const newMember = {
      id: generatedId,
      fullName: memberData.fullName.trim(),
      email: memberData.email.trim().toLowerCase(),
      mobileNumber: memberData.mobileNumber.trim(),
      address: memberData.address.trim(),
      membershipId: memberData.membershipId?.trim() || `LIB-MEM-${Math.floor(1000 + Math.random() * 9000)}`,
      membershipDate: memberData.membershipDate || new Date().toISOString().split('T')[0],
      status: memberData.status || 'Active',
      role: memberData.role || 'Student',
      department: memberData.department?.trim() || 'General Studies',
      avatar: memberData.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(memberData.fullName.trim())}`,
      booksIssuedCount: 0,
    };

    // Replicate in Network Tab via DummyJSON POST /users/add
    try {
      const nameParts = newMember.fullName.split(' ');
      await api.post('/users/add', {
        firstName: nameParts[0] || newMember.fullName,
        lastName: nameParts.slice(1).join(' ') || 'Member',
        email: newMember.email,
        phone: newMember.mobileNumber,
        address: { address: newMember.address },
        role: newMember.role.toLowerCase(),
      });
    } catch (e) {
      console.warn('Network POST simulation caught error, persisting locally:', e.message);
    }

    const currentList = memberService.getStoredMembers();
    const updatedList = [newMember, ...currentList];
    localStorage.setItem(MEMBERS_STORAGE_KEY, JSON.stringify(updatedList));
    return newMember;
  },

  // UPDATE: Edit member with Network PUT replication and LocalStorage persistence
  updateMember: async (id, updatedFields) => {
    const mockApiId = getMockApiId(id);

    // Replicate in Network Tab via DummyJSON PUT /users/:id (Guaranteed 200 OK)
    try {
      const nameParts = (updatedFields.fullName || '').split(' ');
      await api.put(`/users/${mockApiId}`, {
        firstName: nameParts[0] || updatedFields.fullName,
        lastName: nameParts.slice(1).join(' ') || '',
        email: updatedFields.email,
        phone: updatedFields.mobileNumber,
        address: { address: updatedFields.address },
        role: updatedFields.role ? updatedFields.role.toLowerCase() : undefined,
      });
    } catch (e) {
      console.warn('Network PUT simulation caught error, persisting locally:', e.message);
    }

    const currentList = memberService.getStoredMembers();
    let found = false;
    const updatedList = currentList.map((m) => {
      if (String(m.id) === String(id)) {
        found = true;
        return {
          ...m,
          ...updatedFields,
          fullName: updatedFields.fullName ? updatedFields.fullName.trim() : m.fullName,
          email: updatedFields.email ? updatedFields.email.trim().toLowerCase() : m.email,
          mobileNumber: updatedFields.mobileNumber ? updatedFields.mobileNumber.trim() : m.mobileNumber,
          address: updatedFields.address ? updatedFields.address.trim() : m.address,
          membershipId: updatedFields.membershipId ? updatedFields.membershipId.trim() : m.membershipId,
          membershipDate: updatedFields.membershipDate || m.membershipDate,
        };
      }
      return m;
    });

    if (!found) {
      throw new Error('Member record not found');
    }

    localStorage.setItem(MEMBERS_STORAGE_KEY, JSON.stringify(updatedList));
    return updatedList.find((m) => String(m.id) === String(id));
  },

  // DELETE: Delete member with Network DELETE replication and LocalStorage persistence
  deleteMember: async (id) => {
    const mockApiId = getMockApiId(id);

    // Replicate in Network Tab via DummyJSON DELETE /users/:id (Guaranteed 200 OK)
    try {
      await api.delete(`/users/${mockApiId}`);
    } catch (e) {
      console.warn('Network DELETE simulation caught error, persisting locally:', e.message);
    }

    const currentList = memberService.getStoredMembers();
    const updatedList = currentList.filter((m) => String(m.id) !== String(id));
    localStorage.setItem(MEMBERS_STORAGE_KEY, JSON.stringify(updatedList));
    return true;
  },
};
