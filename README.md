# 📚 BookStack - Modern Library Management System (LMS)

A production-grade, responsive Library Management System built with **React.js**, **Vite**, **Tailwind CSS**, **Context API**, and integrated with the **Open Library Third-Party API**.

---

## 🚀 Technology Stack

- **Frontend Core:** React.js 19 (Vite)
- **Styling:** Tailwind CSS v4
- **State Management:** React Context API (`AuthContext`, `BookContext`)
- **Routing:** React Router DOM (Declarative routes, Protected route guards)
- **Data Fetching:** Axios with HTTP interceptors & Open Library API
- **Form Management:** React Hook Form (with comprehensive validation rules)
- **Notifications:** React Toastify (themed toasts with auto-dismiss)
- **Icons:** Lucide React
- **Data Persistence:** Local Storage (for registered users, auth tokens, borrowing records)

---

## 🔐 Module 1: Authentication & Authorization

### Key Features Implemented:
1. **User Login (`/login`)**
   - Form validation via React Hook Form (email format, password min length)
   - Password Show/Hide toggle
   - Remember Me session state
   - One-click **Demo Credentials Switcher** (Admin, Librarian, Student)
   - Redirection to requested protected route after login
   - Error handling with customized toast alerts

2. **User Registration (`/register`)**
   - Full Name, Email, Role Selection (Student, Faculty, Librarian, Admin), and Department
   - Real-time password strength meter (Weak / Medium / Strong)
   - Password confirmation match validation
   - Terms and circulation policy acceptance checkbox
   - Instant membership ID generation (`LIB-STD-XXXX`, etc.)
   - Auto-login upon registration and persistence to LocalStorage

3. **Forgot Password Flow (`/forgot-password`)**
   - 3-step recovery flow (Enter Email -> Verify 6-digit Code -> Set New Password)
   - Simulated OTP verification with demo code helper
   - Updates password persistently in LocalStorage
   - Direct link to sign in with new credentials

4. **Protected Routes (`ProtectedRoute.jsx`)**
   - Context API-driven route guard
   - Unauthenticated visitors are redirected to `/login` preserving intended URL
   - Role-based permissions guard support

5. **Logout Flow**
   - Clears active token and session while preserving user records in LocalStorage
   - Triggers informational toast alert
   - Redirects to login page

---

## 🔑 Default Demo Accounts (Pre-configured in LocalStorage)

| Role | Email | Password | Membership ID |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@library.com` | `Password@123` | `LIB-ADM-001` |
| **Librarian** | `librarian@library.com` | `Password@123` | `LIB-STF-014` |
| **Student** | `student@library.com` | `Password@123` | `LIB-STD-1092` |

> *Tip: You can also register any new account on the `/register` page and sign in immediately.*

---

## 🎨 UI & UX Highlights

- **Fully Responsive Design:** Tailored layouts for Mobile, Tablet, and Desktop screens.
- **Sidebar Navigation:** Collapsible mobile drawer, badge indicators for active loans, quick sign-out.
- **Top Navigation Bar:** Global live search shortcut, simulated notification center, member profile dropdown.
- **Third-Party API Catalog:** Connects to Open Library API with instant search by topic/author/title, cover image rendering, and offline fallback catalog.
- **Circulation Management:** Borrow books and return them with live status tracking (`Active`, `Overdue`).
- **Skeleton Loaders:** Custom shimmer animations for stat cards, book covers, and data tables.
- **Reusable Component Library:** Modular `Button`, `Input`, `Card`, `Modal`, `Badge`, `SearchBar`, and `SkeletonLoader`.

---

## 📁 Project Structure

```
src/
├── assets/
├── components/
│   ├── auth/
│   │   ├── DemoAccountsBanner.jsx
│   │   └── ProtectedRoute.jsx
│   ├── common/
│   │   ├── Badge.jsx
│   │   ├── Button.jsx
│   │   ├── Card.jsx
│   │   ├── Input.jsx
│   │   ├── Modal.jsx
│   │   ├── SearchBar.jsx
│   │   └── SkeletonLoader.jsx
│   └── layout/
│       ├── AppLayout.jsx
│       ├── Footer.jsx
│       ├── Navbar.jsx
│       └── Sidebar.jsx
├── context/
│   ├── AuthContext.jsx
│   └── BookContext.jsx
├── pages/
│   ├── auth/
│   │   ├── ForgotPasswordPage.jsx
│   │   ├── LoginPage.jsx
│   │   └── RegisterPage.jsx
│   ├── books/
│   │   ├── BooksCatalogPage.jsx
│   │   └── MyBorrowedBooksPage.jsx
│   ├── dashboard/
│   │   └── DashboardPage.jsx
│   ├── profile/
│   │   └── ProfilePage.jsx
│   └── NotFoundPage.jsx
├── services/
│   ├── api.js
│   ├── bookService.js
│   └── storageService.js
├── App.jsx
├── index.css
└── main.jsx
```

---

## 💻 Running the Application Locally

1. **Install Dependencies:**
   ```bash
   npm install
   ```

2. **Start Development Server:**
   ```bash
   npm run dev
   ```

3. **Build for Production:**
   ```bash
   npm run build
   ```
