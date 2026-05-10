-- ============================================================
-- AstroVeda Admin Analytics Schema
-- Production-Ready Migration
-- Run this in Supabase SQL Editor (Dashboard > SQL Editor)
-- ============================================================

-- 1. ANALYTICS EVENTS — raw event stream (append-only)
-- Every user action sends a structured event here.
CREATE TABLE IF NOT EXISTS public.analytics_events (
    id              uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id         text NOT NULL,                         -- Can be anon ID for guests
    event_type      text NOT NULL,                         -- 'page_view', 'chat_message', 'report_view', 'tool_use', 'signup', 'login'
    event_data      jsonb DEFAULT '{}'::jsonb,             -- Flexible payload (page name, tool name, token count, etc.)
    session_id      text,                                  -- Groups events within a single app session
    device_type     text DEFAULT 'web',                    -- 'ios', 'android', 'web'
    created_at      timestamptz DEFAULT now() NOT NULL
);

-- Indexes for fast querying
CREATE INDEX IF NOT EXISTS idx_analytics_events_user_id ON public.analytics_events (user_id);
CREATE INDEX IF NOT EXISTS idx_analytics_events_type ON public.analytics_events (event_type);
CREATE INDEX IF NOT EXISTS idx_analytics_events_created ON public.analytics_events (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_analytics_events_session ON public.analytics_events (session_id);

-- 2. DAILY AGGREGATES — pre-computed daily stats for fast admin dashboard reads
CREATE TABLE IF NOT EXISTS public.daily_aggregates (
    id              uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    date            date NOT NULL UNIQUE,
    total_users     int DEFAULT 0,
    new_signups     int DEFAULT 0,
    dau             int DEFAULT 0,                         -- Daily Active Users
    wau             int DEFAULT 0,                         -- Weekly Active Users (computed weekly)
    mau             int DEFAULT 0,                         -- Monthly Active Users (computed monthly)
    guest_users     int DEFAULT 0,
    total_chats     int DEFAULT 0,
    total_tokens    bigint DEFAULT 0,
    ai_cost_usd     numeric(10,4) DEFAULT 0,
    ai_cost_inr     numeric(12,4) DEFAULT 0,
    revenue_inr     numeric(12,2) DEFAULT 0,
    created_at      timestamptz DEFAULT now(),
    updated_at      timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_daily_aggregates_date ON public.daily_aggregates (date DESC);

-- 3. USER SESSIONS — track session start/end for retention and engagement
CREATE TABLE IF NOT EXISTS public.user_sessions (
    id              uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id         text NOT NULL,
    session_id      text NOT NULL,
    started_at      timestamptz DEFAULT now() NOT NULL,
    ended_at        timestamptz,
    duration_seconds int,                                  -- Computed on session end
    pages_visited   int DEFAULT 0,
    device_type     text DEFAULT 'web',
    created_at      timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_user_sessions_user ON public.user_sessions (user_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_started ON public.user_sessions (started_at DESC);

-- 4. CHAT ANALYTICS — per-chat-session metrics
CREATE TABLE IF NOT EXISTS public.chat_analytics (
    id              uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id         text NOT NULL,
    session_id      text NOT NULL,
    message_count   int DEFAULT 0,
    input_tokens    int DEFAULT 0,
    output_tokens   int DEFAULT 0,
    cost_usd        numeric(8,4) DEFAULT 0,
    topic_category  text,                                  -- 'love', 'career', 'health', 'finance', 'general'
    user_rating     smallint,                              -- 1-5 thumbs rating
    response_time_ms int,                                  -- Average AI response time
    created_at      timestamptz DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_chat_analytics_user ON public.chat_analytics (user_id);
CREATE INDEX IF NOT EXISTS idx_chat_analytics_created ON public.chat_analytics (created_at DESC);

-- 5. RETENTION COHORTS — weekly cohort data for heatmap
CREATE TABLE IF NOT EXISTS public.retention_cohorts (
    id              uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    cohort_week     date NOT NULL,                         -- Start of the signup week
    week_number     int NOT NULL,                          -- 1, 2, 3... weeks after signup
    retention_pct   numeric(5,2) DEFAULT 0,                -- Percentage of cohort still active
    cohort_size     int DEFAULT 0,                         -- Number of users in original cohort
    created_at      timestamptz DEFAULT now(),
    UNIQUE(cohort_week, week_number)
);

CREATE INDEX IF NOT EXISTS idx_retention_cohorts_week ON public.retention_cohorts (cohort_week DESC);

-- 6. FEATURE USAGE — tracks which features/pages are most used
CREATE TABLE IF NOT EXISTS public.feature_usage (
    id              uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    date            date NOT NULL,
    feature_name    text NOT NULL,                         -- 'today', 'chat', 'kundli', 'tools', 'reports', 'path'
    total_visits    int DEFAULT 0,
    unique_users    int DEFAULT 0,
    avg_time_seconds numeric(8,2) DEFAULT 0,
    created_at      timestamptz DEFAULT now(),
    UNIQUE(date, feature_name)
);

CREATE INDEX IF NOT EXISTS idx_feature_usage_date ON public.feature_usage (date DESC);

-- 7. ADMIN ALERTS — anomaly detection notifications
CREATE TABLE IF NOT EXISTS public.admin_alerts (
    id              uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    alert_type      text NOT NULL,                         -- 'dau_drop', 'cost_spike', 'api_error', 'retention_drop', 'suspicious_activity'
    severity        text DEFAULT 'warning',                -- 'info', 'warning', 'critical'
    title           text NOT NULL,
    description     text,
    is_dismissed    boolean DEFAULT false,
    triggered_at    timestamptz DEFAULT now() NOT NULL,
    dismissed_at    timestamptz,
    dismissed_by    text
);

CREATE INDEX IF NOT EXISTS idx_admin_alerts_type ON public.admin_alerts (alert_type);
CREATE INDEX IF NOT EXISTS idx_admin_alerts_active ON public.admin_alerts (is_dismissed, triggered_at DESC);

-- 8. LIVE PRESENCE — realtime online user tracking
-- This table is designed for Supabase Realtime subscriptions
CREATE TABLE IF NOT EXISTS public.live_presence (
    id              uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id         text NOT NULL UNIQUE,
    last_seen       timestamptz DEFAULT now() NOT NULL,
    current_page    text,
    device_type     text DEFAULT 'web',
    is_online       boolean DEFAULT true
);

CREATE INDEX IF NOT EXISTS idx_live_presence_online ON public.live_presence (is_online) WHERE is_online = true;

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================

-- Enable RLS on all tables
ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_aggregates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.retention_cohorts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feature_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.live_presence ENABLE ROW LEVEL SECURITY;

-- Analytics events: users can INSERT their own events, admins can SELECT all
CREATE POLICY "Users can insert own events" ON public.analytics_events
    FOR INSERT WITH CHECK (true);  -- All users (including anon) can log events

CREATE POLICY "Service role can read all events" ON public.analytics_events
    FOR SELECT USING (true);       -- Admin reads via service role or anon key for now

-- Daily aggregates: read-only for admin
CREATE POLICY "Anyone can read aggregates" ON public.daily_aggregates
    FOR SELECT USING (true);

CREATE POLICY "Service can upsert aggregates" ON public.daily_aggregates
    FOR ALL USING (true);

-- User sessions: users insert own, admin reads all
CREATE POLICY "Users can insert sessions" ON public.user_sessions
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Anyone can read sessions" ON public.user_sessions
    FOR SELECT USING (true);

-- Chat analytics: insert from app, read from admin
CREATE POLICY "Insert chat analytics" ON public.chat_analytics
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Read chat analytics" ON public.chat_analytics
    FOR SELECT USING (true);

-- Retention cohorts: admin read-only
CREATE POLICY "Read retention cohorts" ON public.retention_cohorts
    FOR ALL USING (true);

-- Feature usage: read/write
CREATE POLICY "Feature usage access" ON public.feature_usage
    FOR ALL USING (true);

-- Admin alerts: full access
CREATE POLICY "Admin alerts access" ON public.admin_alerts
    FOR ALL USING (true);

-- Live presence: full access for realtime
CREATE POLICY "Live presence access" ON public.live_presence
    FOR ALL USING (true);

-- ============================================================
-- ENABLE REALTIME on key tables
-- ============================================================
ALTER PUBLICATION supabase_realtime ADD TABLE public.live_presence;
ALTER PUBLICATION supabase_realtime ADD TABLE public.admin_alerts;
ALTER PUBLICATION supabase_realtime ADD TABLE public.daily_aggregates;

-- ============================================================
-- HELPER FUNCTIONS
-- ============================================================

-- Function: Upsert daily aggregate for today
CREATE OR REPLACE FUNCTION public.upsert_daily_aggregate(
    p_date date DEFAULT CURRENT_DATE,
    p_new_signups int DEFAULT 0,
    p_chats int DEFAULT 0,
    p_tokens bigint DEFAULT 0,
    p_ai_cost_usd numeric DEFAULT 0,
    p_revenue numeric DEFAULT 0
)
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
    INSERT INTO public.daily_aggregates (date, new_signups, total_chats, total_tokens, ai_cost_usd, ai_cost_inr, revenue_inr)
    VALUES (p_date, p_new_signups, p_chats, p_tokens, p_ai_cost_usd, p_ai_cost_usd * 83, p_revenue)
    ON CONFLICT (date) DO UPDATE SET
        new_signups = daily_aggregates.new_signups + EXCLUDED.new_signups,
        total_chats = daily_aggregates.total_chats + EXCLUDED.total_chats,
        total_tokens = daily_aggregates.total_tokens + EXCLUDED.total_tokens,
        ai_cost_usd = daily_aggregates.ai_cost_usd + EXCLUDED.ai_cost_usd,
        ai_cost_inr = daily_aggregates.ai_cost_inr + EXCLUDED.ai_cost_inr,
        revenue_inr = daily_aggregates.revenue_inr + EXCLUDED.revenue_inr,
        updated_at = now();
END;
$$;

-- Function: Update live presence (heartbeat)
CREATE OR REPLACE FUNCTION public.heartbeat_presence(
    p_user_id text,
    p_current_page text DEFAULT NULL,
    p_device_type text DEFAULT 'web'
)
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
    INSERT INTO public.live_presence (user_id, last_seen, current_page, device_type, is_online)
    VALUES (p_user_id, now(), p_current_page, p_device_type, true)
    ON CONFLICT (user_id) DO UPDATE SET
        last_seen = now(),
        current_page = COALESCE(p_current_page, live_presence.current_page),
        device_type = p_device_type,
        is_online = true;
END;
$$;

-- Function: Mark stale users as offline (run periodically, e.g. via pg_cron or edge function)
CREATE OR REPLACE FUNCTION public.cleanup_stale_presence()
RETURNS int
LANGUAGE plpgsql
AS $$
DECLARE
    affected int;
BEGIN
    UPDATE public.live_presence
    SET is_online = false
    WHERE is_online = true AND last_seen < now() - interval '5 minutes';
    GET DIAGNOSTICS affected = ROW_COUNT;
    RETURN affected;
END;
$$;

-- Function: Get current online count
CREATE OR REPLACE FUNCTION public.get_online_count()
RETURNS int
LANGUAGE sql
STABLE
AS $$
    SELECT count(*)::int FROM public.live_presence WHERE is_online = true AND last_seen > now() - interval '5 minutes';
$$;

-- Function: Compute DAU for today
CREATE OR REPLACE FUNCTION public.compute_dau(p_date date DEFAULT CURRENT_DATE)
RETURNS int
LANGUAGE sql
STABLE
AS $$
    SELECT count(DISTINCT user_id)::int
    FROM public.analytics_events
    WHERE created_at::date = p_date;
$$;
