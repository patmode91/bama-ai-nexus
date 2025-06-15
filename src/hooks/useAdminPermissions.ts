
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

export interface AdminPermission {
  id: string;
  name: string;
  description: string;
  category: 'users' | 'businesses' | 'system' | 'content' | 'analytics';
}

export interface UserRole {
  id: string;
  name: string;
  permissions: string[];
  level: number;
}

const DEFAULT_PERMISSIONS: AdminPermission[] = [
  { id: 'users.view', name: 'View Users', description: 'View user profiles and data', category: 'users' },
  { id: 'users.edit', name: 'Edit Users', description: 'Modify user profiles and settings', category: 'users' },
  { id: 'users.delete', name: 'Delete Users', description: 'Remove users from the system', category: 'users' },
  { id: 'businesses.view', name: 'View Businesses', description: 'View business listings', category: 'businesses' },
  { id: 'businesses.edit', name: 'Edit Businesses', description: 'Modify business information', category: 'businesses' },
  { id: 'businesses.verify', name: 'Verify Businesses', description: 'Approve business verifications', category: 'businesses' },
  { id: 'system.monitor', name: 'System Monitoring', description: 'Access system health and performance data', category: 'system' },
  { id: 'system.config', name: 'System Configuration', description: 'Modify system settings', category: 'system' },
  { id: 'content.moderate', name: 'Content Moderation', description: 'Review and moderate user content', category: 'content' },
  { id: 'analytics.view', name: 'View Analytics', description: 'Access business intelligence dashboards', category: 'analytics' }
];

const DEFAULT_ROLES: UserRole[] = [
  { id: 'super_admin', name: 'Super Admin', permissions: DEFAULT_PERMISSIONS.map(p => p.id), level: 100 },
  { id: 'admin', name: 'Admin', permissions: ['users.view', 'users.edit', 'businesses.view', 'businesses.edit', 'businesses.verify', 'system.monitor', 'analytics.view'], level: 80 },
  { id: 'moderator', name: 'Moderator', permissions: ['users.view', 'businesses.view', 'content.moderate'], level: 60 },
  { id: 'analyst', name: 'Analyst', permissions: ['users.view', 'businesses.view', 'analytics.view', 'system.monitor'], level: 40 }
];

export const useAdminPermissions = () => {
  const { user } = useAuth();
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [permissions, setPermissions] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadUserPermissions();
    } else {
      setUserRole(null);
      setPermissions([]);
      setLoading(false);
    }
  }, [user]);

  const loadUserPermissions = async () => {
    if (!user) return;

    try {
      // For demo purposes, assign admin role to any authenticated user
      // In production, this would query a user_roles table
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

      const roleId = profile?.role || 'admin';
      const role = DEFAULT_ROLES.find(r => r.id === roleId) || DEFAULT_ROLES[1];
      
      setUserRole(role);
      setPermissions(role.permissions);
    } catch (error) {
      console.error('Error loading user permissions:', error);
      // Default to basic admin for demo
      setUserRole(DEFAULT_ROLES[1]);
      setPermissions(DEFAULT_ROLES[1].permissions);
    } finally {
      setLoading(false);
    }
  };

  const hasPermission = (permission: string): boolean => {
    return permissions.includes(permission);
  };

  const hasAnyPermission = (requiredPermissions: string[]): boolean => {
    return requiredPermissions.some(permission => permissions.includes(permission));
  };

  const hasAllPermissions = (requiredPermissions: string[]): boolean => {
    return requiredPermissions.every(permission => permissions.includes(permission));
  };

  return {
    userRole,
    permissions,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    loading,
    availablePermissions: DEFAULT_PERMISSIONS,
    availableRoles: DEFAULT_ROLES
  };
};
