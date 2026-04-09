# Admin Account Guide (Website User)

This guide is for people who use the admin account on the website.
It focuses on daily usage on the web interface, not technical setup.

## 1. Admin Login

Use this account:

- Email: `admin@ppiaq.org`
- Password: `Admin123!`

Login steps:

1. Open: `https://ppiaqueensland.org/auth/login`
2. Enter admin email and password.
3. Click Sign In.
4. You will be redirected to the Admin Dashboard.

If login fails, check your email/password carefully and try again.

## 2. Main Admin Area

Main page:

- `https://ppiaqueensland.org/admin/dashboard`

From this page, you can:

- Review member applications
- Approve, reject, or move rejected users back to pending
- Import member data from CSV/Excel
- Export member and newsletter data
- View member details, status, and membership activity

## 3. Manage Applications (Pending, Approved, Rejected, Newsletter)

At the top of Admin Dashboard, use the tabs:

- **Pending**: new applications waiting for review
- **Approved**: approved members
- **Rejected**: rejected applications
- **Newsletter**: newsletter subscriber list

How to review a member:

1. Open the correct tab.
2. Click a member card or table row.
3. A detail popup will open.
4. Choose action: approve, reject, unreject, or edit data (based on tab/status).

## 4. Approved Members Filter and View

Inside the **Approved** tab:

- Use membership filter:
  - No Filter (All)
  - Filter Active
  - Filter Non-Active
- Change view format:
  - Cards
  - Table
- Set rows per page:
  - `5`, `10`, `20`, `30`, `40`, `50`, or `All`
- Use **Previous** and **Next** for page navigation.

## 5. Import Member Data (CSV/Excel)

On Admin Dashboard, click:

- `📤 Import CSV/Excel`

Then:

1. Download the template (recommended).
2. Fill the file using the same column format.
3. Upload your CSV/XLSX/XLS file.
4. Wait for import result summary.

Current import behavior:

- Empty optional fields are accepted and stored as `N/A`.
- Duplicate records are skipped.
- Only new records are imported.
- For `Griffith University`, non-Indonesian nationality rows are skipped from membership list import.

## 6. Export Data (CSV/Excel)

Use:

- `📥 Export CSV`
- `📥 Export Excel`

Export follows what you currently select:

- Pending tab exports pending data
- Approved tab exports approved data
- Rejected tab exports rejected data
- Newsletter tab exports newsletter data
- In Approved tab, export also follows active/non-active filter

## 7. Edit Member Data

To edit a member:

1. Open member detail popup from card/table.
2. Click edit mode.
3. Update needed fields.
4. Click save/update.

Use this for corrections like member number, branch, campus, dates, or status notes.

## 8. Member Access Flow (Important)

Admin should follow this flow:

1. User registers first from the public register page.
2. User status starts as **Pending**.
3. User cannot login while status is pending/rejected.
4. Admin reviews and sets final status (Approved/Rejected).
5. User receives email status notification for:
   - Pending (after registration)
   - Approved
   - Rejected

Only **Approved** users can sign in and access member pages.

## 9. Other Admin Pages

You also have these admin pages:

- Events: `https://ppiaqueensland.org/admin/events`
  - Create, edit, delete, and set Draft/Published
- Team: `https://ppiaqueensland.org/admin/team`
  - Add, edit, activate/deactivate, and delete team members
- Community Board: `https://ppiaqueensland.org/admin/community-board`
  - Manage discounts, resources, and announcements
- Content pages (from top nav "Content")
  - Home, About, Membership, and Pesta Rakyat text/content updates

## 10. Logout

To log out:

1. Click the account/header area.
2. Click **Logout**.

You will return to the login/public page.

## 11. Quick Troubleshooting

### Import says skipped
- Usually because data is duplicate (already in database).
- Check email/member number uniqueness.

### Member cannot login
- Confirm member status is not pending/rejected.
- Confirm email and password are correct.

### Export file is not what you expected
- Check active tab before exporting.
- In Approved tab, check active/non-active filter first.
