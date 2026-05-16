# CampusConnect

A dashboard for managing student residences, applications, and property listings. Built for students, landlords, and administrators.

## What this app does

**For Students**
- Browse available residences and filter by price, type, or search term
- Submit applications to properties you're interested in
- Track your submitted applications and their status

**For Landlords**
- View and manage your listed properties
- See incoming applications from students
- Approve or reject applications with one click

**For Administrators**
- View overall platform metrics and statistics
- See occupancy rates and alert notifications
- Monitor allocation lists across all properties

## How to use it

**Demo Login**  
The login page lets you pick a role (Student, Landlord, or Admin) to see the corresponding dashboard. An valid email-format email should be entered, along with any password.

**Button click actions**
- **Apply** → Shows a confirmation message (demo only, not saved)
- **Approve/Reject** → Shows a success or error message (demo only)
- **Add Property** → Opens a form; submitting shows a success message (demo only)

**Notifications**  
Small popup messages (toasts) appear when you take actions, confirming what happened.

## Current limitations (important!)

This is a **frontend-only demo**. All data is mock data stored in the code, not a real database. Actions like applying, approving, or adding properties show success messages but don't actually save changes.


## Tech notes 

- Built with React + Vite + TypeScript
- Styling uses Tailwind CSS and shadcn/ui components
- Responsive design works on mobile and desktop
- All UI components are in `src/components/ui/`
# campus-connect
