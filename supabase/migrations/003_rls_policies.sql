-- Row Level Security (RLS) Policies for AWPB System

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE monthly_targets ENABLE ROW LEVEL SECURITY;

-- Profiles table policies
-- Users can view their own profile
CREATE POLICY "Users can view own profile" ON profiles
    FOR SELECT USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile" ON profiles
    FOR UPDATE USING (auth.uid() = id);

-- Admins can view all profiles
CREATE POLICY "Admins can view all profiles" ON profiles
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() AND role = 'admin' AND status = 'active'
        )
    );

-- Admins can update all profiles
CREATE POLICY "Admins can update all profiles" ON profiles
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() AND role = 'admin' AND status = 'active'
        )
    );

-- Entries table policies
-- Users can view their own entries
CREATE POLICY "Users can view own entries" ON entries
    FOR SELECT USING (owner_id = auth.uid());

-- Admins can view all entries
CREATE POLICY "Admins can view all entries" ON entries
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() AND role = 'admin' AND status = 'active'
        )
    );

-- Users can insert their own entries
CREATE POLICY "Users can insert own entries" ON entries
    FOR INSERT WITH CHECK (owner_id = auth.uid());

-- Users can update their own entries (only if draft or returned)
CREATE POLICY "Users can update own entries" ON entries
    FOR UPDATE USING (
        owner_id = auth.uid() AND 
        (status = 'draft' OR status = 'Returned')
    );

-- Admins can update all entries
CREATE POLICY "Admins can update all entries" ON entries
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() AND role = 'admin' AND status = 'active'
        )
    );

-- Users can delete their own entries (only if draft)
CREATE POLICY "Users can delete own draft entries" ON entries
    FOR DELETE USING (
        owner_id = auth.uid() AND status = 'draft'
    );

-- Admins can delete any entry
CREATE POLICY "Admins can delete any entry" ON entries
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() AND role = 'admin' AND status = 'active'
        )
    );

-- Monthly targets table policies
-- Users can view targets for their own entries
CREATE POLICY "Users can view own entry targets" ON monthly_targets
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM entries 
            WHERE id = entry_id AND owner_id = auth.uid()
        )
    );

-- Admins can view all targets
CREATE POLICY "Admins can view all targets" ON monthly_targets
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() AND role = 'admin' AND status = 'active'
        )
    );

-- Users can insert targets for their own entries
CREATE POLICY "Users can insert own entry targets" ON monthly_targets
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM entries 
            WHERE id = entry_id AND owner_id = auth.uid()
        )
    );

-- Users can update targets for their own entries
CREATE POLICY "Users can update own entry targets" ON monthly_targets
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM entries 
            WHERE id = entry_id AND owner_id = auth.uid()
        )
    );

-- Admins can update all targets
CREATE POLICY "Admins can update all targets" ON monthly_targets
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() AND role = 'admin' AND status = 'active'
        )
    );

-- Users can delete targets for their own entries
CREATE POLICY "Users can delete own entry targets" ON monthly_targets
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM entries 
            WHERE id = entry_id AND owner_id = auth.uid()
        )
    );

-- Admins can delete any targets
CREATE POLICY "Admins can delete any targets" ON monthly_targets
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() AND role = 'admin' AND status = 'active'
        )
    );

-- Public read access for template data (no RLS needed for these)
-- These tables are used for dropdowns and reference data
ALTER TABLE units DISABLE ROW LEVEL SECURITY;
ALTER TABLE components DISABLE ROW LEVEL SECURITY;
ALTER TABLE sub_components DISABLE ROW LEVEL SECURITY;
ALTER TABLE key_activities DISABLE ROW LEVEL SECURITY;
ALTER TABLE sub_activities DISABLE ROW LEVEL SECURITY;
ALTER TABLE submission_windows DISABLE ROW LEVEL SECURITY;

-- Create function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, username, full_name, email, role, status)
    VALUES (
        NEW.id,
        NEW.raw_user_meta_data->>'username',
        COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'role', 'encoder'),
        'active'
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to automatically create profile on signup
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
