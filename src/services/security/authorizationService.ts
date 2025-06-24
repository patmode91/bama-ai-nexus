
import { supabase } from '@/integrations/supabase/client';
import { logger } from '../loggerService';

export type Role = 'admin' | 'business_owner' | 'user' | 'moderator' | 'analyst';

export type Permission = 
  | 'businesses.read' | 'businesses.write' | 'businesses.delete'
  | 'users.read' | 'users.write' | 'users.delete'
  | 'analytics.read' | 'analytics.write'
  | 'events.read' | 'events.write' | 'events.delete'
  | 'admin.access' | 'moderator.access'
  | 'integrations.read' | 'integrations.write'
  | 'system.monitor' | 'system.configure';

export interface UserPermissions {
  userId: string;
  roles: Role[];
  permissions: Permission[];
  businessId?: number;
}

class AuthorizationService {
  private static instance: AuthorizationService;
  private userPermissions: Map<string, UserPermissions> = new Map();
  
  private rolePermissions: Record<Role, Permission[]> = {
    admin: [
      'businesses.read', 'businesses.write', 'businesses.delete',
      'users.read', 'users.write', 'users.delete',
      'analytics.read', 'analytics.write',
      'events.read', 'events.write', 'events.delete',
      'admin.access',
      'integrations.read', 'integrations.write',
      'system.monitor', 'system.configure'
    ],
    business_owner: [
      'businesses.read', 'businesses.write',
      'analytics.read',
      'events.read', 'events.write'
    ],
    moderator: [
      'businesses.read', 'businesses.write',
      'events.read', 'events.write',
      'moderator.access'
    ],
    analyst: [
      'businesses.read',
      'analytics.read', 'analytics.write',
      'events.read'
    ],
    user: [
      'businesses.read',
      'events.read'
    ]
  };

  static getInstance(): AuthorizationService {
    if (!AuthorizationService.instance) {
      AuthorizationService.instance = new AuthorizationService();
    }
    return AuthorizationService.instance;
  }

  async loadUserPermissions(userId: string): Promise<UserPermissions | null> {
    try {
      // Check cache first
      const cached = this.userPermissions.get(userId);
      if (cached) return cached;

      // Fetch from database
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error || !profile) {
        logger.error('Failed to load user profile', { error, userId }, 'Authorization');
        return null;
      }

      // Determine roles (in a real app, this would be from a roles table)
      const roles: Role[] = ['user']; // Default role
      
      // Check if user is admin (from metadata or admin table)
      const { data: { user } } = await supabase.auth.getUser();
      if (user?.user_metadata?.role === 'admin') {
        roles.push('admin');
      }

      // Check if user owns any businesses
      const { data: ownedBusinesses } = await supabase
        .from('businesses')
        .select('id')
        .eq('owner_id', userId);

      if (ownedBusinesses && ownedBusinesses.length > 0) {
        roles.push('business_owner');
      }

      // Calculate permissions based on roles
      const permissions = this.calculatePermissions(roles);

      const userPermissions: UserPermissions = {
        userId,
        roles,
        permissions,
        businessId: ownedBusinesses?.[0]?.id
      };

      // Cache the permissions
      this.userPermissions.set(userId, userPermissions);

      return userPermissions;
    } catch (error) {
      logger.error('Error loading user permissions', { error, userId }, 'Authorization');
      return null;
    }
  }

  async hasPermission(userId: string, permission: Permission): Promise<boolean> {
    const userPermissions = await this.loadUserPermissions(userId);
    if (!userPermissions) return false;

    return userPermissions.permissions.includes(permission);
  }

  async hasRole(userId: string, role: Role): Promise<boolean> {
    const userPermissions = await this.loadUserPermissions(userId);
    if (!userPermissions) return false;

    return userPermissions.roles.includes(role);
  }

  async hasAnyRole(userId: string, roles: Role[]): Promise<boolean> {
    const userPermissions = await this.loadUserPermissions(userId);
    if (!userPermissions) return false;

    return roles.some(role => userPermissions.roles.includes(role));
  }

  async canAccessBusiness(userId: string, businessId: number): Promise<boolean> {
    const userPermissions = await this.loadUserPermissions(userId);
    if (!userPermissions) return false;

    // Admins can access all businesses
    if (userPermissions.roles.includes('admin')) return true;

    // Business owners can access their own businesses
    if (userPermissions.businessId === businessId) return true;

    // Check if user has explicit permission
    return userPermissions.permissions.includes('businesses.read');
  }

  async requirePermission(userId: string, permission: Permission): Promise<void> {
    const hasPermission = await this.hasPermission(userId, permission);
    if (!hasPermission) {
      throw new Error(`Access denied: Required permission '${permission}' not found`);
    }
  }

  async requireRole(userId: string, role: Role): Promise<void> {
    const hasRole = await this.hasRole(userId, role);
    if (!hasRole) {
      throw new Error(`Access denied: Required role '${role}' not found`);
    }
  }

  private calculatePermissions(roles: Role[]): Permission[] {
    const permissions = new Set<Permission>();
    
    roles.forEach(role => {
      this.rolePermissions[role].forEach(permission => {
        permissions.add(permission);
      });
    });

    return Array.from(permissions);
  }

  // Cache management
  clearUserCache(userId: string): void {
    this.userPermissions.delete(userId);
  }

  clearAllCache(): void {
    this.userPermissions.clear();
  }

  // Statistics
  getCacheStats() {
    return {
      cachedUsers: this.userPermissions.size,
      totalRoles: Object.keys(this.rolePermissions).length,
      totalPermissions: Object.values(this.rolePermissions).flat().length
    };
  }
}

export const authorizationService = AuthorizationService.getInstance();
export default authorizationService;
