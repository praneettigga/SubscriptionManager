-- Supabase SQL Schema for Subscription Manager
-- Run this in the Supabase SQL Editor

-- Create subscriptions table
CREATE TABLE IF NOT EXISTS subscriptions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    cost DECIMAL(10, 2) NOT NULL,
    billing_cycle VARCHAR(20) DEFAULT 'monthly' CHECK (billing_cycle IN ('monthly', 'yearly')),
    first_payment_date DATE,
    category VARCHAR(50) DEFAULT 'other',
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'canceled', 'paused')),
    notes TEXT,
    url VARCHAR(500),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_subscriptions_category ON subscriptions(category);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions(status);

-- Enable Row Level Security (RLS)
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

-- Create a policy that allows all operations (for demo purposes)
-- In production, you would want user-specific policies
DROP POLICY IF EXISTS "Allow all operations" ON subscriptions;
CREATE POLICY "Allow all operations" ON subscriptions
    FOR ALL
    USING (true)
    WITH CHECK (true);

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to call the function before update
DROP TRIGGER IF EXISTS update_subscriptions_updated_at ON subscriptions;
CREATE TRIGGER update_subscriptions_updated_at
    BEFORE UPDATE ON subscriptions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- NEW: Shared Subscription Support
-- =============================================
ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS is_shared BOOLEAN DEFAULT false;
ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS shared_with INTEGER DEFAULT 1 CHECK (shared_with >= 1 AND shared_with <= 5);

-- =============================================
-- NEW: User Settings Table (Budget Tracking)
-- =============================================
CREATE TABLE IF NOT EXISTS user_settings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    monthly_budget DECIMAL(10, 2),
    alert_threshold INTEGER DEFAULT 80 CHECK (alert_threshold >= 0 AND alert_threshold <= 100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS for user_settings
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;

-- Policy for user_settings (allow all for demo)
DROP POLICY IF EXISTS "Allow all operations on user_settings" ON user_settings;
CREATE POLICY "Allow all operations on user_settings" ON user_settings
    FOR ALL
    USING (true)
    WITH CHECK (true);

-- Trigger for user_settings updated_at
DROP TRIGGER IF EXISTS update_user_settings_updated_at ON user_settings;
CREATE TRIGGER update_user_settings_updated_at
    BEFORE UPDATE ON user_settings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Insert default user settings if not exists
INSERT INTO user_settings (monthly_budget, alert_threshold)
SELECT NULL, 80
WHERE NOT EXISTS (SELECT 1 FROM user_settings LIMIT 1);
