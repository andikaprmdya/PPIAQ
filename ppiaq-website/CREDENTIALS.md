# 🔐 PPIA Queensland - Test Credentials

## ✅ System Implementation Complete!

Semua fitur authentication dan member management sudah terimplementasi dengan baik. Berikut adalah 3 credentials untuk testing:

---

## 1️⃣ **ADMIN ACCOUNT**

**Role:** Admin - Full access to admin dashboard and member approval system

```
Email:    admin@ppiaq.org
Password: Admin123!
```

### Akses Admin:
- ✅ Login ke sistem
- ✅ Akses Admin Dashboard (`/admin/dashboard`)
- ✅ Lihat pending applications
- ✅ Approve/Reject member applications
- ✅ Lihat daftar approved dan rejected members
- ✅ Lihat payment proof dari setiap aplikasi
- ✅ View profile dengan membership card
- ✅ Community board access

**Testing Flow:**
1. Buka `http://localhost:3000/auth/login`
2. Masukkan email & password di atas
3. Klik "Admin Dashboard" di navbar
4. Lihat pending applications (akan kosong jika tidak ada pending)
5. Profile akan menunjukkan "Approved" status

---

## 2️⃣ **CURATOR ACCOUNT**

**Role:** Curator - Manage Acara Mendatang / Upcoming Events (view, add, edit, delete)

```
Email:    curator@ppiaq.org
Password: Curator123!
```

### Akses Curator:
- ✅ Login ke sistem
- ✅ Akses Curator Dashboard (`/curator/events`)
- ✅ Lihat daftar upcoming events
- ✅ Tambah event baru
- ✅ Edit event
- ✅ Delete event
- ✅ Publish/Draft event

---

## 3️⃣ **MEMBER ACCOUNT** (Pre-Approved)

**Role:** User - Regular member with full community access

```
Email:    budi@example.com
Password: Test12345
```

### Akses Member:
- ✅ Login ke sistem
- ✅ Akses Profile (`/profile`)
- ✅ View Membership Card dengan member ID
- ✅ Akses Community Board (`/community-board`)
- ✅ Lihat partner discounts
- ✅ Lihat community resources
- ✅ Lihat announcements

**Member Details:**
- Name: Budi Santoso
- University: University of Queensland
- Major: Computer Science
- Education Level: S1 (Bachelor)
- Membership Type: Ordinary Member
- Status: ✓ Approved

**Testing Flow:**
1. Buka `http://localhost:3000/auth/login`
2. Masukkan email & password di atas
3. Navbar akan berubah menampilkan nama & link ke Profile
4. Klik "Profile" untuk lihat membership card
5. Klik "Community Board" untuk lihat member-only content

---

## 🧪 Testing Scenarios

### Scenario 1: Complete Registration Flow
1. Buka `/auth/register`
2. Fill 3-step form:
   - Step 1: Personal info (nama, nationality, birthDate)
   - Step 2: Education info (university, major, level)
   - Step 3: Account & Payment (email, password, payment proof)
3. Upload dummy payment proof (JPEG/PNG, max 5MB)
4. Submit registration
5. Status akan menjadi "pending" - admin harus approve
6. Coba login sebagai applicant → akan dapat pesan "Pending approval"

### Scenario 2: Admin Approval Workflow
1. Login as admin (admin@ppiaq.org)
2. Akses Admin Dashboard
3. View pending applications
4. Click aplikasi untuk lihat detail & payment proof
5. Click "Setujui" untuk approve → user bisa login
6. Atau click "Tolak" dengan alasan → user dapat rejection message

### Scenario 3: Member Access
1. Login as Budi (budi@example.com)
2. Navbar menampilkan "Budi" & Profile/Logout buttons
3. Akses Profile → lihat membership card dengan validity dates
4. Akses Community Board → lihat discounts, resources, announcements
5. Click Logout → kembali ke public view

### Scenario 4: Protected Routes
1. Logout / Clear cookies
2. Try akses `/profile` → redirect ke login
3. Try akses `/community-board` → redirect ke login
4. Try akses `/admin/dashboard` → redirect ke login
5. Login sebagai member, try akses `/admin/dashboard` → redirect ke home (403)

---

## 🔄 Database Credentials Logic

**Password Hashing:** Semua password di-hash menggunakan bcryptjs (rounds: 10)

**Session Management:** User session disimpan di httpOnly cookie dengan 7-day expiry

**User Status:**
- `pending` - Menunggu admin approval
- `approved` - Bisa login & akses member features
- `rejected` - Tidak bisa login, display rejection reason

**User Roles:**
- `user` - Regular member
- `admin` - Administrator
- `curator` - Upcoming events curator

---

## 📝 Important Notes

- Default admin password: `Admin123!` (recommended to change in production)
- Member payment proof disimpan sebagai base64 string di database
- Middleware di `/middleware.ts` protect routes berdasarkan role & status
- Auth context (`/lib/auth-context.tsx`) manage global auth state
- Navbar dinamis berubah berdasarkan login status & user role

---

## 🚀 Quick Start Testing

**Terminal 1 - Run dev server:**
```bash
cd ppiaq-website
npm run dev
```

**Browser:**
1. Open `http://localhost:3000`
2. Click "Login" atau "Register"
3. Use credentials di atas untuk testing

**Test All Features:**
- Admin: admin@ppiaq.org / Admin123!
- Curator: curator@ppiaq.org / Curator123!
- Member: budi@example.com / Test12345

---

**✨ Semuanya sudah siap untuk testing! Selamat mencoba!**
