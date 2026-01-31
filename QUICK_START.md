# 🚀 PPIA Queensland Website - Quick Start Guide

## ⚡ 5-Minute Setup

### 1. Navigate to Project
```bash
cd C:\Users\Dika\UQ\PPIAQ\ppiaq-website
```

### 2. Start Development Server
```bash
npm run dev
```

### 3. Open in Browser
Visit: **http://localhost:3000** (or 3001)

✅ **Done!** Your website is now running locally.

---

## 🧪 What to Test First

### Homepage
- [ ] Hero section displays correctly
- [ ] Language switcher works (EN/ID buttons in top right)
- [ ] All sections visible (Mission, Features, CTA, FAQ, Newsletter)
- [ ] Navigation menu appears

### Navigation
- [ ] Home link works
- [ ] About page loads
- [ ] Membership page loads
- [ ] Contact page loads
- [ ] Pesta Rakyat page loads
- [ ] Login/Register buttons work

### Registration
- [ ] Click "Sign Up" button
- [ ] Fill in Step 1 (Personal Info)
- [ ] Progress bar updates
- [ ] Click "Next" → Step 2
- [ ] Fill Account Setup
- [ ] Click "Next" → Step 3
- [ ] Select Membership Type & University
- [ ] Click "Sign Up" button
- [ ] See success message

### Login
- [ ] Click "Sign In" button
- [ ] Email: `john@example.com`
- [ ] Password: `Password123`
- [ ] Click "Sign In"
- [ ] Should see success/redirect

### Forms
- [ ] Contact form: Fill name, email, message → Submit
- [ ] Newsletter: Enter email → Subscribe
- [ ] Should see success messages

### Language Switching
- [ ] Click "EN" button → All text in English
- [ ] Click "ID" button → All text in Indonesian

---

## 📱 Device Testing

### Mobile (< 640px)
- Menu collapses to hamburger icon
- Forms stack vertically
- Images scale properly

### Tablet (640px - 1024px)
- 2-column layouts appear
- Navigation remains visible

### Desktop (> 1024px)
- Full layout
- All features visible

---

## 🔗 Important URLs

| Page | URL |
|------|-----|
| Home | http://localhost:3000 |
| About | http://localhost:3000/about |
| Membership | http://localhost:3000/membership |
| Contact | http://localhost:3000/contact |
| Pesta Rakyat | http://localhost:3000/pesta-rakyat |
| Login | http://localhost:3000/auth/login |
| Register | http://localhost:3000/auth/register |

---

## 🐛 Troubleshooting

### Port Already in Use
If you see "Port 3000 is in use":
- The server will automatically use port 3001
- Visit: http://localhost:3001 instead

### Dependencies Missing
If you see module not found errors:
```bash
npm install
npm run dev
```

### TypeScript Errors
If build fails with TypeScript errors:
```bash
npm run dev
```
Development server usually handles them automatically.

### Page Not Showing
1. Check browser console (F12) for errors
2. Make sure server is running (`npm run dev`)
3. Try refreshing the page (Ctrl+R or Cmd+R)

### Language Not Changing
- Click the EN or ID button in the top-right header
- If not visible, scroll to top of page

### Form Not Submitting
1. Check all fields are filled
2. Check email format is correct
3. Look for error messages on the page
4. Check browser console for API errors

---

## 📊 Database Info

### Where Data is Stored
- File: `lib/database/db.ts`
- Type: In-memory (temporary)
- Resets: When server restarts

### Test Data Included
- **User Email**: john@example.com
- **Password**: Password123
- **Can register**: Unlimited new users during session

### To Clear Data
- Restart the server: Stop (Ctrl+C) then `npm run dev`

---

## 🛠️ Development Tips

### Edit & Instant Reload
All changes auto-refresh in browser:
1. Edit any `.tsx` file
2. Save (Ctrl+S)
3. Browser refreshes automatically

### Where to Make Changes

| Want to... | Edit File |
|------------|-----------|
| Add translations | `lib/translations.ts` |
| Change colors/style | Component `.tsx` files (look for `className`) |
| Add team members | `app/about/page.tsx` |
| Modify forms | `app/auth/register/page.tsx` |
| Add new page | Create `app/pagename/page.tsx` |

### Common Edits

**Change header color:**
Look for `bg-gradient-to-br from-blue-600` in `components/layout/header.tsx`

**Add new navigation link:**
Edit `components/layout/header.tsx` → `navItems` array

**Update translations:**
Edit `lib/translations.ts` → add your text

---

## ✅ Checklist: Before Showing to Others

- [ ] Website runs without errors
- [ ] All pages load
- [ ] Language switching works
- [ ] Registration form works
- [ ] Login with test account works
- [ ] Contact form works
- [ ] Newsletter signup works
- [ ] Mobile responsiveness okay
- [ ] No console errors (F12)
- [ ] All links navigate correctly

---

## 📞 Quick Help

**Need to stop server?**
Press `Ctrl+C` in terminal

**Need to restart server?**
Press `Ctrl+C`, then run `npm run dev` again

**Lost? Go back to root:**
```bash
cd C:\Users\Dika\UQ\PPIAQ\ppiaq-website
```

---

## 🎉 You're All Set!

Your bilingual PPIA Queensland website is ready. Start the server and explore all the features. When you're ready to connect a real database, let me know!

**Happy coding! 🚀**
