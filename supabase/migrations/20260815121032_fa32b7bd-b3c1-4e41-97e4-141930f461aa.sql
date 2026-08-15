-- Create Enums
CREATE TYPE public.work_day_status AS ENUM ('in_progress', 'completed');
CREATE TYPE public.session_status AS ENUM ('active', 'completed');

-- Create Tables
-- Table: work_days
CREATE TABLE public.work_days (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    date DATE NOT NULL UNIQUE,
    status work_day_status NOT NULL DEFAULT 'in_progress',
    total_earned DECIMAL(10, 2) DEFAULT 0.00,
    odometer_start INTEGER,
    odometer_end INTEGER,
    total_deliveries INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Table: sessions (jornadas)
CREATE TABLE public.sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    work_day_id UUID NOT NULL REFERENCES public.work_days(id) ON DELETE CASCADE,
    start_time TIMESTAMPTZ NOT NULL DEFAULT now(),
    end_time TIMESTAMPTZ,
    status session_status NOT NULL DEFAULT 'active',
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Grant Access
GRANT SELECT, INSERT, UPDATE, DELETE ON public.work_days TO authenticated;
GRANT ALL ON public.work_days TO service_role;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.sessions TO authenticated;
GRANT ALL ON public.sessions TO service_role;

-- Enable RLS
ALTER TABLE public.work_days ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;

-- Create Policies (Using a simple check for personal use as requested, but keeping them to authenticated role)
CREATE POLICY "Allow authenticated users full access to work_days"
ON public.work_days
FOR ALL
TO authenticated
USING (true);

CREATE POLICY "Allow authenticated users full access to sessions"
ON public.sessions
FOR ALL
TO authenticated
USING (true);

-- Create Indexes for performance
CREATE INDEX idx_work_days_date ON public.work_days(date);
CREATE INDEX idx_sessions_work_day_id ON public.sessions(work_day_id);
CREATE INDEX idx_sessions_status ON public.sessions(status);
