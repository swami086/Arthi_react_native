-- migration 009: Create A2UI Surface and Action tables

-- 1. Create a2ui_surfaces table
CREATE TABLE IF NOT EXISTS a2ui_surfaces (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    surface_id TEXT UNIQUE NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    agent_id TEXT NOT NULL,
    components JSONB DEFAULT '[]'::jsonb,
    data_model JSONB DEFAULT '{}'::jsonb,
    metadata JSONB DEFAULT '{}'::jsonb,
    version INTEGER DEFAULT 1,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Create a2ui_actions table
CREATE TABLE IF NOT EXISTS a2ui_actions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    surface_id TEXT REFERENCES a2ui_surfaces(surface_id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    action_id TEXT NOT NULL,
    action_type TEXT NOT NULL,
    payload JSONB DEFAULT '{}'::jsonb,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Add indexes
CREATE INDEX idx_a2ui_surfaces_user_id ON a2ui_surfaces(user_id);
CREATE INDEX idx_a2ui_surfaces_agent_id ON a2ui_surfaces(agent_id);
CREATE INDEX idx_a2ui_surfaces_surface_id ON a2ui_surfaces(surface_id);
CREATE INDEX idx_a2ui_actions_surface_id ON a2ui_actions(surface_id);
CREATE INDEX idx_a2ui_actions_user_id ON a2ui_actions(user_id);

-- 4. Enable RLS
ALTER TABLE a2ui_surfaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE a2ui_actions ENABLE ROW LEVEL SECURITY;

-- 5. Create RLS Policies

-- Surfaces Select
CREATE POLICY "Users can view their own surfaces"
    ON a2ui_surfaces FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

-- Actions Insert
CREATE POLICY "Users can insert their own actions"
    ON a2ui_actions FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

-- Service role policies are handled by bypass RLS in Supabase by default for service_role
-- But we can explicitly add them if needed for clarity. 
-- However, standard practice is to specify ROLES.

CREATE POLICY "Service role has full access to surfaces"
    ON a2ui_surfaces FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Service role has full access to actions"
    ON a2ui_actions FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- 6. Add updated_at trigger
CREATE TRIGGER trigger_a2ui_surfaces_updated_at
    BEFORE UPDATE ON a2ui_surfaces
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
