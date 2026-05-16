
  # Student Residence Management Dashboar`d

  This repository contains a Vite + React frontend for a Student Residence Management Dashboard (Figma source available in the original project).
## Functionality

- Role-based dashboards: `student`, `landlord`, and `admin` are provided via pages in `src/pages/`.
- Students can browse residences and view/submit applications (see `src/pages/student-dashboard.tsx` and `src/components/application-card.tsx`).
- Landlords can view and manage listings and applications (see `src/pages/landlord-dashboard.tsx` and `src/components/residence-card.tsx`).
- Admins have an overview/management view (see `src/pages/admin-dashboard.tsx`).
- Authentication: a simple demo login exists at `src/pages/login.tsx` (mock authentication is used for the demo).
- Data: the app uses mock data from `src/data/mock-data.ts`; swap these imports for API calls to connect a backend.
- Routing & navigation are configured in `src/routes.tsx` and implemented with the components in `src/components/`.
- Responsive behavior is supported via `src/hooks/use-mobile.ts` and `src/components/use-mobile.ts`.

## Implementation notes

- UI primitives and shared components live in `src/components/ui/` and are reused across pages.
- Shared utilities are available in `src/lib/utils.ts`.
- Global styles and theme configuration are in `src/styles/` (Tailwind + custom CSS).

## Extending the app

- To connect a real backend: replace usages of `src/data/mock-data.ts` with fetch/axios calls and update page components to handle async data.
- To add a new page: create the component in `src/pages/` and add a route in `src/routes.tsx`.
- To modify UI primitives: edit or extend components in `src/components/ui/` and reuse them across the app.

If you'd like, I can add usage examples, integration tips, or screenshots to this README.

## Application Behavior (implemented)

This section describes the actual behaviors implemented in the app (what you can click and what happens), not the code layout.

- Authentication (demo): The login page (`src/pages/login.tsx`) provides a role selector (Student / Landlord / Admin). The form performs a mock login — it does not authenticate against a server; submitting navigates to the selected role's dashboard (`/student`, `/landlord`, `/admin`).

- Student flow (what happens):
  - Browse residences from `src/pages/student-dashboard.tsx`. Search, price and type filters run client-side against `src/data/mock-data.ts`.
  - Click `Apply` on a residence card to submit an application. The `onApply` handler shows a success toast (via `sonner`) and displays a message: "Application submitted..." — this is a UI notification only (no persistence).
  - The `My Applications` tab shows a slice of the mock applications list (client-side). Application status badges are shown using `ApplicationCard`.

- Landlord flow (what happens):
  - Landlord dashboard (`src/pages/landlord-dashboard.tsx`) filters properties by a mock `landlordId` and shows analytics computed from mock data.
  - Landlords can open an Add Property dialog; submitting the form triggers a success toast but does not save to persistent storage (mock-only behavior).
  - Applications for the landlord's properties are listed. For pending applications, `Approve` and `Reject` buttons call handlers that show success/error toasts — they do not mutate the mock dataset.

- Admin flow (what happens):
  - Admin dashboard (`src/pages/admin-dashboard.tsx`) shows global metrics, charts and alerts computed from `src/data/mock-data.ts`.
  - Alerts detect fully-occupied residences and allocation lists show approved vs pending applications (read-only views driven by mock data).

- UI & UX notes:
  - Notifications use `sonner` to show success/info/error messages for actions (apply, approve, reject, add property).
  - Animations are implemented with `motion` for subtle transitions on lists and cards.
  - Responsive behavior is supported via `src/hooks/use-mobile.ts` and mobile-aware components.

- Data & persistence (current limitations):
  - All pages read from `src/data/mock-data.ts`. Actions (apply, approve, add property, edit/delete) currently trigger UI toasts only and do not persist changes to the mock data or a backend.
  - To make actions real, handlers need to call an API and update local state (or re-fetch) after the server responds.