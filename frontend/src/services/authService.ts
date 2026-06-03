import { supabase, getSupabaseUrl, getSupabaseKey } from '@config/supabase';
import { User } from '@/types';

export const authService = {
  ensureConfigured() {
    const url = getSupabaseUrl();
    const key = getSupabaseKey();
    if (!url || !key) {
      throw new Error('Supabase not configured. Copy frontend/.env.local.example to .env.local and set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY then restart the dev server.');
    }
  },
  // Sign up
  async signUp(email: string, password: string, fullName: string, role: string) {
    authService.ensureConfigured();
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          role,
        },
      },
    });

    if (error) throw error;
    return data;
  },

  // Sign in
  async signIn(email: string, password: string) {
    authService.ensureConfigured();
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;
    if (data.user) {
      await authService.attachRole(data.user as User, true); // Force fetch roles from DB on fresh login
    }
    return data;
  },

  // Sign out
  async signOut() {
    authService.ensureConfigured();
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  // Get current user
  async getCurrentUser(forceRefresh = false) {
    authService.ensureConfigured();
    const { data, error } = await supabase.auth.getUser();
    if (error) throw error;
    const user = data.user;
    if (user) {
      await authService.attachRole(user as User, forceRefresh);
    }
    return user;
  },

  // Get session
  async getSession() {
    authService.ensureConfigured();
    const { data, error } = await supabase.auth.getSession();
    if (error) throw error;
    return data.session;
  },

  // Reset password
  async resetPassword(email: string) {
    const { data, error } = await supabase.auth.resetPasswordForEmail(email);
    if (error) throw error;
    return data;
  },

  // Update password
  async updatePassword(newPassword: string) {
    const { data, error } = await supabase.auth.updateUser({
      password: newPassword,
    });
    if (error) throw error;
    return data;
  },

  // Get user role
  async getUserRole(userId: string) {
    const { data, error } = await supabase
      .from('user_roles')
      .select('role, is_approved')
      .eq('user_id', userId)
      .maybeSingle();

    if (error) throw error;
    return data;
  },

  // Attach role & approval status from user_roles to auth user metadata
  async attachRole(user: User | null, forceRefresh = false) {
    if (!user) return user;
    if (!forceRefresh && user.user_metadata?.role && user.user_metadata?.is_approved !== undefined) {
      return user;
    }

    try {
      const data = await authService.getUserRole(user.id);
      if (data) {
        user.user_metadata = {
          ...user.user_metadata,
          role: data.role,
          is_approved: data.is_approved,
        };
      } else {
        // Fallback or default for un-mapped accounts (usually first admin user setup)
        user.user_metadata = {
          ...user.user_metadata,
          role: 'admin',
          is_approved: true,
        };
      }
    } catch (error) {
      console.warn('Unable to attach user role:', error);
    }

    return user;
  },

  // Get list of all users (Admin only)
  async getUsersList() {
    authService.ensureConfigured();
    const { data, error } = await supabase.rpc('get_users_list');
    if (error) throw error;
    return data;
  },

  // Update a user role and approval status (Admin only, invokes update_user_role_and_approval RPC)
  async updateUserRoleAndApproval(targetUserId: string, newRole: string, newApproval: boolean) {
    authService.ensureConfigured();
    const { error } = await supabase.rpc('update_user_role_and_approval', {
      target_user_id: targetUserId,
      new_role: newRole,
      new_approval: newApproval,
    });
    if (error) throw error;
  },
};

export const storageService = {
  // Upload file to bucket
  async uploadFile(bucket: string, path: string, file: File) {
    const { data, error } = await supabase.storage.from(bucket).upload(path, file);
    if (error) throw error;
    return data;
  },

  // Delete file from bucket
  async deleteFile(bucket: string, path: string) {
    const { error } = await supabase.storage.from(bucket).remove([path]);
    if (error) throw error;
  },

  // Get file URL
  getFileUrl(bucket: string, path: string) {
    const { data } = supabase.storage.from(bucket).getPublicUrl(path);
    return data.publicUrl;
  },

  // Upload payslip
  async uploadPayslip(filename: string, file: File) {
    return this.uploadFile('payslips', filename, file);
  },

  // Upload receipt
  async uploadReceipt(filename: string, file: File) {
    return this.uploadFile('receipts', filename, file);
  },

  // Upload document
  async uploadDocument(filename: string, file: File) {
    return this.uploadFile('documents', filename, file);
  },
};
