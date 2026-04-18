import { supabase } from '../lib/supabase';

// Authentication services
export const authService = {
  // Sign up new user
  async signUp(email, password, metadata = {}) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username: metadata.username,
          full_name: metadata.fullName || metadata.username,
          role: metadata.role || 'encoder',
        }
      }
    });
    
    if (error) throw error;
    return data;
  },

  // Sign in user
  async signIn(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    
    if (error) throw error;
    return data;
  },

  // Sign out user
  async signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  // Get current user
  async getCurrentUser() {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error) throw error;
    return user;
  },

  // Get user profile
  async getProfile(userId) {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (error) throw error;
    return data;
  },

  // Update user profile
  async updateProfile(userId, updates) {
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Listen to auth changes
  onAuthStateChange(callback) {
    return supabase.auth.onAuthStateChange(callback);
  }
};

// User management services (admin only)
export const usersService = {
  // Get all users
  async getAll() {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  },

  // Create user (admin only)
  async create(userData) {
    // First create auth user
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: userData.email,
      password: userData.password,
      email_confirm: true,
      user_metadata: {
        username: userData.username,
        full_name: userData.fullName,
        role: userData.role
      }
    });

    if (authError) throw authError;

    // Profile is created automatically by trigger
    return authData;
  },

  // Update user
  async update(userId, updates) {
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Delete user (admin only)
  async delete(userId) {
    const { error } = await supabase.auth.admin.deleteUser(userId);
    if (error) throw error;
  }
};

// Entry management services
export const entriesService = {
  // Get entries for current user or all entries for admin
  async getAll() {
    const { data: { user } } = await supabase.auth.getUser();
    
    let query = supabase
      .from('entries_with_targets')
      .select('*')
      .order('created_at', { ascending: false });

    // If not admin, only get user's entries
    const profile = await authService.getProfile(user.id);
    if (profile.role !== 'admin') {
      query = query.eq('owner_id', user.id);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data;
  },

  // Get single entry
  async getById(id) {
    const { data, error } = await supabase
      .from('entries_with_targets')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data;
  },

  // Create entry
  async create(entryData) {
    const { data: { user } } = await supabase.auth.getUser();
    
    const { data, error } = await supabase
      .from('entries')
      .insert({
        ...entryData,
        owner_id: user.id
      })
      .select()
      .single();
    
    if (error) throw error;
    
    // Return entry with monthly targets
    return await this.getById(data.id);
  },

  // Update entry
  async update(id, updates) {
    const { data, error } = await supabase
      .from('entries')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    
    // Return updated entry with monthly targets
    return await this.getById(data.id);
  },

  // Delete entry
  async delete(id) {
    const { error } = await supabase
      .from('entries')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  },

  // Update monthly targets
  async updateMonthlyTargets(entryId, targets) {
    const updates = Object.entries(targets).map(([month, quantity]) => 
      supabase
        .from('monthly_targets')
        .upsert({ 
          entry_id: entryId, 
          month, 
          target_quantity: quantity 
        })
    );

    await Promise.all(updates);
    
    return await this.getById(entryId);
  }
};

// Template services
export const templateService = {
  // Get full template hierarchy
  async getHierarchy() {
    const { data, error } = await supabase
      .from('template_hierarchy')
      .select('*');
    
    if (error) throw error;
    return data;
  },

  // Get units
  async getUnits() {
    const { data, error } = await supabase
      .from('units')
      .select('*')
      .eq('is_active', true)
      .order('code');
    
    if (error) throw error;
    return data;
  },

  // Get components
  async getComponents() {
    const { data, error } = await supabase
      .from('components')
      .select('*')
      .eq('is_active', true)
      .order('sort_order');
    
    if (error) throw error;
    return data;
  },

  // Get sub-components by component
  async getSubComponents(componentId) {
    const { data, error } = await supabase
      .from('sub_components')
      .select('*')
      .eq('component_id', componentId)
      .eq('is_active', true)
      .order('sort_order');
    
    if (error) throw error;
    return data;
  },

  // Get key activities by sub-component
  async getKeyActivities(subComponentId) {
    const { data, error } = await supabase
      .from('key_activities')
      .select('*')
      .eq('sub_component_id', subComponentId)
      .eq('is_active', true)
      .order('sort_order');
    
    if (error) throw error;
    return data;
  },

  // Get sub-activities by key activity
  async getSubActivities(keyActivityId) {
    const { data, error } = await supabase
      .from('sub_activities')
      .select('*')
      .eq('key_activity_id', keyActivityId)
      .eq('is_active', true)
      .order('sort_order');
    
    if (error) throw error;
    return data;
  }
};

// Template management services (admin only)
export const templateManagementService = {
  // Component management
  async createComponent(componentData) {
    const { data, error } = await supabase
      .from('components')
      .insert(componentData)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async updateComponent(id, updates) {
    const { data, error } = await supabase
      .from('components')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async deleteComponent(id) {
    const { error } = await supabase
      .from('components')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  },

  // Similar methods for sub-components, key activities, and sub-activities...
  async createSubComponent(subComponentData) {
    const { data, error } = await supabase
      .from('sub_components')
      .insert(subComponentData)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async createKeyActivity(keyActivityData) {
    const { data, error } = await supabase
      .from('key_activities')
      .insert(keyActivityData)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async createSubActivity(subActivityData) {
    const { data, error } = await supabase
      .from('sub_activities')
      .insert(subActivityData)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }
};

// Submission window services
export const submissionService = {
  // Get active submission window
  async getActiveWindow() {
    const { data, error } = await supabase
      .from('submission_windows')
      .select('*')
      .eq('is_active', true)
      .single();
    
    if (error) throw error;
    return data;
  }
};

// ── AWPB Entries Service ───────────────────────────────────────────────────────
// Converts between camelCase (frontend) and snake_case (Supabase)

function entryToSnake(entry) {
  return {
    owner_id: entry.ownerId,
    owner_username: entry.ownerUsername || '',
    owner_full_name: entry.ownerFullName || '',
    planning_year: String(entry.planningYear),
    unit: entry.unit || '',
    component: entry.component || '',
    sub_component: entry.subComponent || '',
    key_activity: entry.keyActivity || '',
    no: entry.no || '',
    performance_indicator: entry.performanceIndicator || '',
    sub_activity: entry.subActivity || '',
    title_of_activities: entry.titleOfActivities || '',
    unit_cost: Number(entry.unitCost) || 0,
    monthly_breakdown: entry.monthlyBreakdown || [],
    grand_total: Number(entry.grandTotal) || 0,
    status: entry.status || 'Pending Review',
    admin_comment: entry.adminComment || '',
    submitted_at: entry.submittedAt || new Date().toISOString(),
    reviewed_at: entry.reviewedAt || null,
    resubmitted_at: entry.resubmittedAt || null,
  };
}

function entryToCamel(row) {
  return {
    id: row.id,
    ownerId: row.owner_id,
    ownerUsername: row.owner_username,
    ownerFullName: row.owner_full_name,
    planningYear: row.planning_year,
    unit: row.unit,
    component: row.component,
    subComponent: row.sub_component,
    keyActivity: row.key_activity,
    no: row.no,
    performanceIndicator: row.performance_indicator,
    subActivity: row.sub_activity,
    titleOfActivities: row.title_of_activities,
    unitCost: Number(row.unit_cost),
    monthlyBreakdown: row.monthly_breakdown || [],
    grandTotal: Number(row.grand_total),
    status: row.status,
    adminComment: row.admin_comment || '',
    submittedAt: row.submitted_at,
    reviewedAt: row.reviewed_at,
    resubmittedAt: row.resubmitted_at,
    createdAt: row.created_at,
  };
}

export const awbpEntriesService = {
  async getAll() {
    const { data, error } = await supabase
      .from('awpb_entries')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return (data || []).map(entryToCamel);
  },

  async create(entry) {
    const { data, error } = await supabase
      .from('awpb_entries')
      .insert(entryToSnake(entry))
      .select()
      .single();
    if (error) throw error;
    return entryToCamel(data);
  },

  async update(id, updates) {
    const snake = {};
    const fieldMap = {
      status: 'status',
      adminComment: 'admin_comment',
      reviewedAt: 'reviewed_at',
      resubmittedAt: 'resubmitted_at',
    };
    for (const [camel, snakeKey] of Object.entries(fieldMap)) {
      if (camel in updates) snake[snakeKey] = updates[camel];
    }
    if ('titleOfActivities' in updates) {
      Object.assign(snake, entryToSnake(updates));
    }
    const { data, error } = await supabase
      .from('awpb_entries')
      .update(snake)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return entryToCamel(data);
  },

  async delete(id) {
    const { error } = await supabase
      .from('awpb_entries')
      .delete()
      .eq('id', id);
    if (error) throw error;
  },
};

// Real-time subscriptions
export const realtimeService = {
  // Subscribe to entries changes
  subscribeToEntries(callback) {
    return supabase
      .channel('entries_changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'entries' },
        callback
      )
      .subscribe();
  },

  // Subscribe to user profile changes
  subscribeToProfiles(callback) {
    return supabase
      .channel('profiles_changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'profiles' },
        callback
      )
      .subscribe();
  }
};
