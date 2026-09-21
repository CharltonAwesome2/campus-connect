-- ============================================================
-- EXTENSIONS
-- ============================================================
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================
-- ENUMS
-- ============================================================
CREATE TYPE user_role AS ENUM ('student', 'landlord', 'admin');
CREATE TYPE residence_type AS ENUM ('single', 'shared', 'apartment');
CREATE TYPE application_status AS ENUM ('pending', 'approved', 'rejected');
CREATE TYPE payment_status AS ENUM ('pending', 'paid', 'overdue', 'cancelled');
CREATE TYPE maintenance_status AS ENUM ('open', 'in_progress', 'resolved', 'closed');

-- ============================================================
-- PROFILES (standalone – no auth.users)
-- ============================================================
CREATE TABLE public.profiles (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email         TEXT NOT NULL UNIQUE,
    password_hash TEXT,                     -- optional for testing
    full_name     TEXT NOT NULL,
    phone         TEXT,
    role          user_role NOT NULL DEFAULT 'student',
    avatar_url    TEXT,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============================================================
-- LANDLORDS
-- ============================================================
CREATE TABLE public.landlords (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id       UUID NOT NULL UNIQUE REFERENCES public.profiles(id) ON DELETE CASCADE,
    company_name  TEXT NOT NULL,
    email         TEXT NOT NULL,
    phone         TEXT,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER landlords_updated_at
  BEFORE UPDATE ON public.landlords
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============================================================
-- STUDENTS
-- ============================================================
CREATE TABLE public.students (
    id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id        UUID NOT NULL UNIQUE REFERENCES public.profiles(id) ON DELETE CASCADE,
    student_number TEXT,
    created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER students_updated_at
  BEFORE UPDATE ON public.students
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============================================================
-- AMENITIES
-- ============================================================
CREATE TABLE public.amenities (
    id          SERIAL PRIMARY KEY,
    name        TEXT NOT NULL UNIQUE,
    icon        TEXT,
    description TEXT
);

-- ============================================================
-- RESIDENCES
-- ============================================================
CREATE TABLE public.residences (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    landlord_id     UUID NOT NULL REFERENCES public.landlords(id) ON DELETE RESTRICT,
    name            TEXT NOT NULL,
    address         TEXT NOT NULL,
    description     TEXT,
    image_url       TEXT,
    price           INTEGER NOT NULL CHECK (price > 0),
    distance_km     NUMERIC(5,2) NOT NULL CHECK (distance_km >= 0),
    available_rooms INTEGER NOT NULL DEFAULT 0 CHECK (available_rooms >= 0),
    total_rooms     INTEGER NOT NULL CHECK (total_rooms > 0),
    type            residence_type NOT NULL,
    is_active       BOOLEAN NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT available_lte_total CHECK (available_rooms <= total_rooms)
);

CREATE TRIGGER residences_updated_at
  BEFORE UPDATE ON public.residences
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE INDEX idx_residences_landlord  ON public.residences (landlord_id);
CREATE INDEX idx_residences_type      ON public.residences (type);
CREATE INDEX idx_residences_price     ON public.residences (price);
CREATE INDEX idx_residences_distance  ON public.residences (distance_km);
CREATE INDEX idx_residences_available ON public.residences (available_rooms)
  WHERE available_rooms > 0 AND is_active;

-- ============================================================
-- RESIDENCE ↔ AMENITIES
-- ============================================================
CREATE TABLE public.residence_amenities (
    residence_id UUID NOT NULL REFERENCES public.residences(id) ON DELETE CASCADE,
    amenity_id   INTEGER NOT NULL REFERENCES public.amenities(id) ON DELETE CASCADE,
    PRIMARY KEY (residence_id, amenity_id)
);

-- ============================================================
-- ROOMS
-- ============================================================
CREATE TABLE public.rooms (
    id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    residence_id UUID NOT NULL REFERENCES public.residences(id) ON DELETE CASCADE,
    room_number  TEXT NOT NULL,
    floor        SMALLINT,
    is_available BOOLEAN NOT NULL DEFAULT TRUE,
    created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (residence_id, room_number)
);

CREATE INDEX idx_rooms_residence ON public.rooms (residence_id);

-- ============================================================
-- APPLICATIONS
-- ============================================================
CREATE TABLE public.applications (
    id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id   UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
    residence_id UUID NOT NULL REFERENCES public.residences(id) ON DELETE CASCADE,
    status       application_status NOT NULL DEFAULT 'pending',
    applied_date DATE NOT NULL DEFAULT CURRENT_DATE,
    notes        TEXT,
    created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (student_id, residence_id)
);

CREATE TRIGGER applications_updated_at
  BEFORE UPDATE ON public.applications
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE INDEX idx_applications_student   ON public.applications (student_id);
CREATE INDEX idx_applications_residence ON public.applications (residence_id);
CREATE INDEX idx_applications_status    ON public.applications (status);
CREATE INDEX idx_applications_date      ON public.applications (applied_date);

-- ============================================================
-- REVIEWS
-- ============================================================
CREATE TABLE public.reviews (
    id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    residence_id UUID NOT NULL REFERENCES public.residences(id) ON DELETE CASCADE,
    student_id   UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
    rating       SMALLINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
    comment      TEXT,
    created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (residence_id, student_id)
);

CREATE TRIGGER reviews_updated_at
  BEFORE UPDATE ON public.reviews
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE INDEX idx_reviews_residence ON public.reviews (residence_id);

-- ============================================================
-- FAVORITES
-- ============================================================
CREATE TABLE public.favorites (
    student_id   UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
    residence_id UUID NOT NULL REFERENCES public.residences(id) ON DELETE CASCADE,
    created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (student_id, residence_id)
);

-- ============================================================
-- PAYMENTS
-- ============================================================
CREATE TABLE public.payments (
    id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    application_id UUID NOT NULL REFERENCES public.applications(id) ON DELETE CASCADE,
    amount         NUMERIC(10,2) NOT NULL CHECK (amount > 0),
    due_date       DATE NOT NULL,
    paid_at        TIMESTAMPTZ,
    status         payment_status NOT NULL DEFAULT 'pending',
    reference      TEXT,
    created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER payments_updated_at
  BEFORE UPDATE ON public.payments
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE INDEX idx_payments_application ON public.payments (application_id);
CREATE INDEX idx_payments_status      ON public.payments (status);

-- ============================================================
-- MAINTENANCE REQUESTS
-- ============================================================
CREATE TABLE public.maintenance_requests (
    id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    residence_id UUID NOT NULL REFERENCES public.residences(id) ON DELETE CASCADE,
    student_id   UUID REFERENCES public.students(id) ON DELETE SET NULL,
    title        TEXT NOT NULL,
    description  TEXT,
    status       maintenance_status NOT NULL DEFAULT 'open',
    priority     SMALLINT CHECK (priority BETWEEN 1 AND 5) DEFAULT 3,
    created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    resolved_at  TIMESTAMPTZ
);

CREATE TRIGGER maintenance_updated_at
  BEFORE UPDATE ON public.maintenance_requests
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE INDEX idx_maintenance_residence ON public.maintenance_requests (residence_id);
CREATE INDEX idx_maintenance_status    ON public.maintenance_requests (status);

-- ============================================================
-- NOTIFICATIONS
-- ============================================================
CREATE TABLE public.notifications (
    id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id    UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title      TEXT NOT NULL,
    body       TEXT,
    is_read    BOOLEAN NOT NULL DEFAULT FALSE,
    link       TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_notifications_user_unread
  ON public.notifications (user_id)
  WHERE NOT is_read;

-- ============================================================
-- ADMIN STATS VIEW
-- ============================================================
CREATE OR REPLACE VIEW public.admin_stats AS
SELECT
    (SELECT COUNT(*) FROM public.residences WHERE is_active) AS total_residences,
    (SELECT COALESCE(SUM(total_rooms), 0) FROM public.residences WHERE is_active) AS total_rooms,
    (SELECT COALESCE(SUM(total_rooms - available_rooms), 0) FROM public.residences WHERE is_active) AS occupied_rooms,
    (SELECT COUNT(*) FROM public.applications) AS total_applications,
    (SELECT COUNT(*) FROM public.applications WHERE status = 'pending') AS pending_applications,
    (SELECT COUNT(*) FROM public.applications WHERE status = 'approved') AS approved_applications,
    (SELECT COUNT(*) FROM public.applications WHERE status = 'rejected') AS rejected_applications,
    ROUND(
        (SELECT COALESCE(SUM(total_rooms - available_rooms)::NUMERIC / NULLIF(SUM(total_rooms), 0) * 100, 0)
         FROM public.residences WHERE is_active),
        1
    ) AS average_occupancy;