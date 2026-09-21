-- ============================================================
-- EXTENSIONS
-- ============================================================
CREATE EXTENSION IF NOT EXISTS "pgcrypto";   -- for gen_random_uuid()

-- ============================================================
-- ENUMS
-- ============================================================
CREATE TYPE user_role AS ENUM ('student', 'landlord', 'admin');
CREATE TYPE residence_type AS ENUM ('single', 'shared', 'apartment');
CREATE TYPE application_status AS ENUM ('pending', 'approved', 'rejected');
CREATE TYPE payment_status AS ENUM ('pending', 'paid', 'overdue', 'cancelled');
CREATE TYPE maintenance_status AS ENUM ('open', 'in_progress', 'resolved', 'closed');

-- ============================================================
-- PROFILES (extends auth.users)
-- ============================================================
CREATE TABLE public.profiles (
    id            UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email         TEXT NOT NULL UNIQUE,
    full_name     TEXT NOT NULL,
    phone         TEXT,
    role          user_role NOT NULL DEFAULT 'student',
    avatar_url    TEXT,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Automatically create a profile when a new user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'student')
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Keep updated_at current
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
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
-- STUDENTS (optional extra student-specific fields)
-- ============================================================
CREATE TABLE public.students (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id       UUID NOT NULL UNIQUE REFERENCES public.profiles(id) ON DELETE CASCADE,
    student_number TEXT,                    -- university student number
    created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
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
    icon        TEXT,                       -- optional icon key / emoji
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
    image_url       TEXT,                   -- public URL (Supabase Storage or external)
    price           INTEGER NOT NULL CHECK (price > 0),          -- monthly rent in ZAR
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

CREATE INDEX idx_residences_landlord   ON public.residences (landlord_id);
CREATE INDEX idx_residences_type       ON public.residences (type);
CREATE INDEX idx_residences_price      ON public.residences (price);
CREATE INDEX idx_residences_distance   ON public.residences (distance_km);
CREATE INDEX idx_residences_available  ON public.residences (available_rooms) WHERE available_rooms > 0 AND is_active;

-- ============================================================
-- RESIDENCE ↔ AMENITIES (many-to-many)
-- ============================================================
CREATE TABLE public.residence_amenities (
    residence_id  UUID NOT NULL REFERENCES public.residences(id) ON DELETE CASCADE,
    amenity_id    INTEGER NOT NULL REFERENCES public.amenities(id) ON DELETE CASCADE,
    PRIMARY KEY (residence_id, amenity_id)
);

-- ============================================================
-- ROOMS (optional granular inventory)
-- ============================================================
CREATE TABLE public.rooms (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    residence_id  UUID NOT NULL REFERENCES public.residences(id) ON DELETE CASCADE,
    room_number   TEXT NOT NULL,
    floor         SMALLINT,
    is_available  BOOLEAN NOT NULL DEFAULT TRUE,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (residence_id, room_number)
);

CREATE INDEX idx_rooms_residence ON public.rooms (residence_id);

-- ============================================================
-- APPLICATIONS
-- ============================================================
CREATE TABLE public.applications (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id      UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
    residence_id    UUID NOT NULL REFERENCES public.residences(id) ON DELETE CASCADE,
    status          application_status NOT NULL DEFAULT 'pending',
    applied_date    DATE NOT NULL DEFAULT CURRENT_DATE,
    notes           TEXT,                   -- internal notes (landlord/admin)
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    UNIQUE (student_id, residence_id)       -- one application per student per residence
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
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    residence_id  UUID NOT NULL REFERENCES public.residences(id) ON DELETE CASCADE,
    student_id    UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
    rating        SMALLINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
    comment       TEXT,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    UNIQUE (residence_id, student_id)
);

CREATE TRIGGER reviews_updated_at
  BEFORE UPDATE ON public.reviews
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE INDEX idx_reviews_residence ON public.reviews (residence_id);

-- ============================================================
-- FAVORITES / WISHLIST
-- ============================================================
CREATE TABLE public.favorites (
    student_id    UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
    residence_id  UUID NOT NULL REFERENCES public.residences(id) ON DELETE CASCADE,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (student_id, residence_id)
);

-- ============================================================
-- PAYMENTS
-- ============================================================
CREATE TABLE public.payments (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    application_id  UUID NOT NULL REFERENCES public.applications(id) ON DELETE CASCADE,
    amount          NUMERIC(10,2) NOT NULL CHECK (amount > 0),
    due_date        DATE NOT NULL,
    paid_at         TIMESTAMPTZ,
    status          payment_status NOT NULL DEFAULT 'pending',
    reference       TEXT,                   -- payment gateway reference
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
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
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    residence_id  UUID NOT NULL REFERENCES public.residences(id) ON DELETE CASCADE,
    student_id    UUID REFERENCES public.students(id) ON DELETE SET NULL,
    title         TEXT NOT NULL,
    description   TEXT,
    status        maintenance_status NOT NULL DEFAULT 'open',
    priority      SMALLINT CHECK (priority BETWEEN 1 AND 5) DEFAULT 3,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    resolved_at   TIMESTAMPTZ
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
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id     UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title       TEXT NOT NULL,
    body        TEXT,
    is_read     BOOLEAN NOT NULL DEFAULT FALSE,
    link        TEXT,                       -- optional deep-link
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_notifications_user_unread
  ON public.notifications (user_id)
  WHERE NOT is_read;

-- ============================================================
-- ADMIN / AGGREGATE VIEW (optional but useful)
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

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.landlords ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.amenities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.residences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.residence_amenities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.maintenance_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- ---------- PROFILES ----------
CREATE POLICY "Public profiles are viewable by everyone"
  ON public.profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- ---------- LANDLORDS ----------
CREATE POLICY "Landlords are viewable by everyone"
  ON public.landlords FOR SELECT
  USING (true);

CREATE POLICY "Landlords can update their own record"
  ON public.landlords FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage landlords"
  ON public.landlords FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ---------- STUDENTS ----------
CREATE POLICY "Students can view their own record"
  ON public.students FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Students can update their own record"
  ON public.students FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Admins and landlords can view students"
  ON public.students FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('admin', 'landlord')
    )
  );

-- ---------- AMENITIES ----------
CREATE POLICY "Amenities are public"
  ON public.amenities FOR SELECT
  USING (true);

CREATE POLICY "Only admins can manage amenities"
  ON public.amenities FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ---------- RESIDENCES ----------
CREATE POLICY "Active residences are public"
  ON public.residences FOR SELECT
  USING (is_active = true OR
         EXISTS (
           SELECT 1 FROM public.landlords l
           WHERE l.id = landlord_id AND l.user_id = auth.uid()
         ) OR
         EXISTS (
           SELECT 1 FROM public.profiles
           WHERE id = auth.uid() AND role = 'admin'
         ));

CREATE POLICY "Landlords can insert their own residences"
  ON public.residences FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.landlords
      WHERE id = landlord_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Landlords can update their own residences"
  ON public.residences FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.landlords
      WHERE id = landlord_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage all residences"
  ON public.residences FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ---------- RESIDENCE_AMENITIES ----------
CREATE POLICY "Residence amenities are public"
  ON public.residence_amenities FOR SELECT
  USING (true);

CREATE POLICY "Landlords/admins can manage residence amenities"
  ON public.residence_amenities FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.residences r
      JOIN public.landlords l ON l.id = r.landlord_id
      WHERE r.id = residence_id AND (l.user_id = auth.uid() OR
            EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'))
    )
  );

-- ---------- ROOMS ----------
CREATE POLICY "Rooms are viewable with their residence"
  ON public.rooms FOR SELECT
  USING (true);

CREATE POLICY "Landlords can manage rooms of their residences"
  ON public.rooms FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.residences r
      JOIN public.landlords l ON l.id = r.landlord_id
      WHERE r.id = residence_id AND l.user_id = auth.uid()
    )
  );

-- ---------- APPLICATIONS ----------
CREATE POLICY "Students can view their own applications"
  ON public.applications FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.students s
      WHERE s.id = student_id AND s.user_id = auth.uid()
    )
  );

CREATE POLICY "Students can create applications"
  ON public.applications FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.students s
      WHERE s.id = student_id AND s.user_id = auth.uid()
    )
  );

CREATE POLICY "Landlords can view applications for their residences"
  ON public.applications FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.residences r
      JOIN public.landlords l ON l.id = r.landlord_id
      WHERE r.id = residence_id AND l.user_id = auth.uid()
    )
  );

CREATE POLICY "Landlords can update applications for their residences"
  ON public.applications FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.residences r
      JOIN public.landlords l ON l.id = r.landlord_id
      WHERE r.id = residence_id AND l.user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage all applications"
  ON public.applications FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ---------- REVIEWS ----------
CREATE POLICY "Reviews are public"
  ON public.reviews FOR SELECT
  USING (true);

CREATE POLICY "Students can create reviews"
  ON public.reviews FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.students s
      WHERE s.id = student_id AND s.user_id = auth.uid()
    )
  );

CREATE POLICY "Students can update their own reviews"
  ON public.reviews FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.students s
      WHERE s.id = student_id AND s.user_id = auth.uid()
    )
  );

-- ---------- FAVORITES ----------
CREATE POLICY "Students can manage their own favorites"
  ON public.favorites FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.students s
      WHERE s.id = student_id AND s.user_id = auth.uid()
    )
  );

-- ---------- PAYMENTS ----------
CREATE POLICY "Students can view their own payments"
  ON public.payments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.applications a
      JOIN public.students s ON s.id = a.student_id
      WHERE a.id = application_id AND s.user_id = auth.uid()
    )
  );

CREATE POLICY "Landlords can view payments for their residences"
  ON public.payments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.applications a
      JOIN public.residences r ON r.id = a.residence_id
      JOIN public.landlords l ON l.id = r.landlord_id
      WHERE a.id = application_id AND l.user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage payments"
  ON public.payments FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ---------- MAINTENANCE REQUESTS ----------
CREATE POLICY "Students can create and view their own requests"
  ON public.maintenance_requests FOR ALL
  USING (
    student_id IS NOT NULL AND
    EXISTS (
      SELECT 1 FROM public.students s
      WHERE s.id = student_id AND s.user_id = auth.uid()
    )
  );

CREATE POLICY "Landlords can manage requests for their residences"
  ON public.maintenance_requests FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.residences r
      JOIN public.landlords l ON l.id = r.landlord_id
      WHERE r.id = residence_id AND l.user_id = auth.uid()
    )
  );

-- ---------- NOTIFICATIONS ----------
CREATE POLICY "Users can view and update their own notifications"
  ON public.notifications FOR ALL
  USING (auth.uid() = user_id);

-- ============================================================
-- HELPER: automatically keep available_rooms in sync (optional)
-- ============================================================
-- You can later add a trigger that updates residences.available_rooms
-- whenever a room’s is_available flag changes.