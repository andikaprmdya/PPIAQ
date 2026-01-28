# PPIA Queensland Website

A modern, bilingual (Indonesian/English) website for PPIA Queensland - Indonesian Student Association in Australia, Queensland Chapter.

## 🚀 Features

- **Bilingual Support**: Full Indonesian/English language switching
- **Responsive Design**: Mobile-first approach with Tailwind CSS
- **Multi-step Registration**: 3-step registration form with validation
- **User Authentication**: Login and registration with dummy database
- **Dynamic Pages**: Home, About, Membership, Contact, and Pesta Rakyat event page
- **Newsletter Subscription**: Stay-in-touch email collection
- **Contact Form**: Get in touch with the organization
- **API Routes**: Backend endpoints for all form submissions
- **Dummy Database**: In-memory storage for testing (no external DB needed)

## 📁 Project Structure

```
ppiaq-website/
├── app/
│   ├── api/                    # Backend API Routes
│   │   ├── auth/               # Authentication endpoints
│   │   │   ├── login/route.ts
│   │   │   └── register/route.ts
│   │   ├── contact/            # Contact form submission
│   │   │   └── submit/route.ts
│   │   └── newsletter/         # Newsletter subscription
│   │       └── subscribe/route.ts
│   ├── auth/                   # Authentication pages
│   │   ├── login/page.tsx
│   │   └── register/page.tsx
│   ├── about/page.tsx          # About page
│   ├── membership/page.tsx      # Membership page
│   ├── contact/page.tsx        # Contact page
│   ├── pesta-rakyat/page.tsx   # Event page
│   ├── page.tsx                # Home page
│   └── layout.tsx              # Root layout with providers
├── components/
│   ├── layout/
│   │   ├── header.tsx          # Navigation header
│   │   └── footer.tsx          # Footer
│   └── sections/               # Home page sections
│       ├── hero.tsx
│       ├── mission.tsx
│       ├── features.tsx
│       ├── cta.tsx
│       ├── faq.tsx
│       └── newsletter.tsx
├── lib/
│   ├── database/
│   │   └── db.ts               # Dummy database implementation
│   ├── language-context.tsx    # Language switching context
│   ├── translations.ts         # All translation strings
│   └── types/index.ts          # TypeScript types
├── public/                     # Static files
└── package.json
```

## 🛠️ Tech Stack

- **Framework**: Next.js 16.1.6 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion, Motion/React
- **Icons**: Lucide React, React Icons
- **Form Handling**: React Hook Form, Zod validation
- **State Management**: React Context API
- **UI Components**: shadcn/ui

## 📦 Installation & Setup

### Prerequisites
- Node.js 18.18 or later
- npm or yarn

### Install Dependencies
```bash
cd ppiaq-website
npm install
```

### Run Development Server
```bash
npm run dev
```

The site will be available at: **http://localhost:3000** (or 3001 if 3000 is in use)

### Build for Production
```bash
npm run build
npm start
```

## 🌐 Pages

### Public Pages
- **Home** (`/`) - Welcome, mission, features, FAQ, newsletter signup
- **About** (`/about`) - Organization info, university branches, team members
- **Membership** (`/membership`) - Pricing, benefits, membership types
- **Contact** (`/contact`) - Contact form and information
- **Pesta Rakyat** (`/pesta-rakyat`) - Event details and schedule

### Authentication Pages
- **Login** (`/auth/login`) - Simple email/password login
- **Register** (`/auth/register`) - 3-step registration form

## 🔐 Authentication

### Registration Flow
1. **Step 1**: Personal Information (First Name, Last Name, Email)
2. **Step 2**: Account Setup (Username, Password)
3. **Step 3**: Membership Type (Ordinary/Associate, University Selection)

### Test Credentials
The dummy database includes a test user:
- **Email**: john@example.com
- **Password**: Password123

## 💾 Database

Currently using a dummy in-memory database. All data is stored in `lib/database/db.ts`:

- **Users**: Registration and login data
- **Newsletter Subscribers**: Email subscriptions
- **Contact Messages**: Contact form submissions

⚠️ **Note**: Data is reset when the server restarts. When ready for production, connect to a real database (Firebase, PostgreSQL, MongoDB, etc.).

## 🌍 Language Switching

The website supports bilingual content:
- **EN**: English
- **ID**: Indonesian

Switch languages using the language selector buttons in the header (top right).

## 📝 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user

### Forms
- `POST /api/contact/submit` - Submit contact form
- `POST /api/newsletter/subscribe` - Subscribe to newsletter

## 🎨 Customization

### Add/Change University Branches
Edit `app/about/page.tsx`:
```typescript
const UNIVERSITIES = [
  // Add your universities here
];
```

### Update Team Members
Edit `app/about/page.tsx`:
```typescript
const TEAM_MEMBERS = [
  // Add your team members here
];
```

### Modify Translations
Edit `lib/translations.ts` and add your translations for both languages.

## 📱 Responsive Design

- **Mobile**: Full responsiveness for devices < 640px
- **Tablet**: Optimized layout for 640px - 1024px
- **Desktop**: Full width layout for 1024px+

## ✅ Testing Checklist

- [ ] Language switching works (EN/ID)
- [ ] All navigation links work
- [ ] Registration form validates correctly
- [ ] Login with test credentials works
- [ ] Contact form submission works
- [ ] Newsletter signup works
- [ ] Mobile responsive on all pages
- [ ] All pages load without errors

## 📄 Integration Points (Future)

When ready to move from dummy to real database:

1. **Authentication**: Replace dummy DB with JWT/Session management
2. **Database**: Connect to real database (PostgreSQL, MongoDB, etc.)
3. **Email**: Integrate email service for newsletter
4. **Payment**: Add payment gateway for membership (optional)
5. **Admin Panel**: Create dashboard for managing content

## 🚨 Known Limitations

- Dummy database data persists only during the current session
- No real email sending (newsletter)
- No user image uploads
- No admin dashboard yet

## 🔗 Useful Links

- [Next.js Documentation](https://nextjs.org/docs)
- [Tailwind CSS](https://tailwindcss.com)
- [shadcn/ui](https://ui.shadcn.com)
- [TypeScript](https://www.typescriptlang.org)

## 📞 Support

For questions or issues, contact PPIA Queensland:
- 📧 Email: info@ppiaq.org
- 📱 Instagram: @ppiaqueensland
- 📍 Location: Queensland, Australia

---

**Built with ❤️ for PPIA Queensland using Next.js, TypeScript, and Tailwind CSS**
