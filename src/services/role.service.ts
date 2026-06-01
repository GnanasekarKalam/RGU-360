// src/services/role.service.ts
// Role and permission management service

import { PrismaClient, UserRole as PrismaUserRole } from '@prisma/client';
import { UserRole } from '../types/auth.types';
import { PERMISSION_MATRIX, hasPermission, canAccess } from '../config/permissions-complete';

const prisma = new PrismaClient();

/**
 * Create a role
 */
export const createRole = async (
  name: UserRole,
  description: string,
  permissions: string[]
) => {
  try {
    // Role already exists in Prisma model if using enum
    // This is for managing permissions associated with role
    console.log(`Creating role: ${name}`);

    return {
      success: true,
      role: { name, description, permissions },
    };
  } catch (error: any) {
    console.error('Create role error:', error);
    return {
      success: false,
      message: 'Failed to create role',
    };
  }
};

/**
 * Assign role to user
 */
export const assignRoleToUser = async (
  userId: string,
  roleId: string,
  departmentId?: string,
  expiresAt?: Date
) => {
  try {
    const userRole = await prisma.userRole.create({
      data: {
        userId,
        roleId,
        departmentId,
        expiresAt,
        isPrimary: false,
        assignedAt: new Date(),
      },
      include: {
        role: true,
        user: {
          select: {
            email: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    return {
      success: true,
      message: 'Role assigned successfully',
      userRole,
    };
  } catch (error: any) {
    console.error('Assign role error:', error);
    return {
      success: false,
      message: 'Failed to assign role',
    };
  }
};

/**
 * Remove role from user
 */
export const removeRoleFromUser = async (userId: string, roleId: string) => {
  try {
    const deleted = await prisma.userRole.deleteMany({
      where: {
        userId,
        roleId,
      },
    });

    return {
      success: true,
      message: 'Role removed successfully',
      deletedCount: deleted.count,
    };
  } catch (error: any) {
    console.error('Remove role error:', error);
    return {
      success: false,
      message: 'Failed to remove role',
    };
  }
};

/**
 * Get user roles
 */
export const getUserRoles = async (userId: string) => {
  try {
    const roles = await prisma.userRole.findMany({
      where: { userId },
      include: {
        role: true,
        department: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return {
      success: true,
      roles,
    };
  } catch (error: any) {
    console.error('Get user roles error:', error);
    return {
      success: false,
      message: 'Failed to get user roles',
    };
  }
};

/**
 * Set primary role for user
 */
export const setPrimaryRole = async (userId: string, roleId: string) => {
  try {
    // Clear existing primary role
    await prisma.userRole.updateMany({
      where: { userId },
      data: { isPrimary: false },
    });

    // Set new primary role
    const userRole = await prisma.userRole.update({
      where: {
        userId_roleId_departmentId: {
          userId,
          roleId,
          departmentId: null,
        },
      },
      data: { isPrimary: true },
      include: { role: true },
    });

    return {
      success: true,
      message: 'Primary role set successfully',
      userRole,
    };
  } catch (error: any) {
    console.error('Set primary role error:', error);
    return {
      success: false,
      message: 'Failed to set primary role',
    };
  }
};

/**
 * Get user permissions
 */
export const getUserPermissions = async (userId: string): Promise<string[]> => {
  try {
    const userRoles = await prisma.userRole.findMany({
      where: { userId },
      include: { role: true },
    });

    if (userRoles.length === 0) {
      return [];
    }

    // Combine all permissions from all roles
    const allPermissions = new Set<string>();

    for (const userRole of userRoles) {
      const rolePermissions = PERMISSION_MATRIX[userRole.role.name as UserRole] || [];
      rolePermissions.forEach(permission => allPermissions.add(permission));
    }

    return Array.from(allPermissions);
  } catch (error: any) {
    console.error('Get user permissions error:', error);
    return [];
  }
};

/**
 * Check if user has permission
 */
export const userHasPermission = async (
  userId: string,
  permission: string
): Promise<boolean> => {
  const permissions = await getUserPermissions(userId);
  return permissions.includes(permission);
};

/**
 * Get role permissions
 */
export const getRolePermissions = (role: UserRole): string[] => {
  return PERMISSION_MATRIX[role] || [];
};

/**
 * Check if role can perform action on resource
 */
export const roleCanAccess = (role: UserRole, resource: string, action: string): boolean => {
  return canAccess(role, resource, action);
};

/**
 * Get all available roles
 */
export const getAllRoles = async () => {
  try {
    const roles = await prisma.role.findMany({
      select: {
        id: true,
        name: true,
        description: true,
        permissions: true,
      },
    });

    return {
      success: true,
      roles,
    };
  } catch (error: any) {
    console.error('Get all roles error:', error);
    return {
      success: false,
      message: 'Failed to get roles',
    };
  }
};

/**
 * Bulk assign role to multiple users
 */
export const bulkAssignRole = async (
  userIds: string[],
  roleId: string,
  departmentId?: string
) => {
  try {
    const results = [];

    for (const userId of userIds) {
      const result = await assignRoleToUser(userId, roleId, departmentId);
      results.push(result);
    }

    return {
      success: true,
      message: `Role assigned to ${results.filter(r => r.success).length} users`,
      results,
    };
  } catch (error: any) {
    console.error('Bulk assign role error:', error);
    return {
      success: false,
      message: 'Failed to bulk assign role',
    };
  }
};

/**
 * Check if user can manage other users
 */
export const canManageUsers = (role: UserRole): boolean => {
  return ['super_admin', 'admin', 'hod'].includes(role);
};

/**
 * Check if user can manage departments
 */
export const canManageDepartments = (role: UserRole): boolean => {
  return ['super_admin', 'admin'].includes(role);
};

/**
 * Check if user can view audit logs
 */
export const canViewAuditLogs = (role: UserRole): boolean => {
  return hasPermission(role, 'users:view_audit_logs') || hasPermission(role, 'audit:read');
};

/**
 * Check if user can manage roles
 */
export const canManageRoles = (role: UserRole): boolean => {
  return ['super_admin', 'admin'].includes(role);
};

/**
 * Check department scope access
 */
export const canAccessDepartment = async (
  userId: string,
  departmentId: string
): Promise<boolean> => {
  const userRoles = await prisma.userRole.findMany({
    where: {
      userId,
      departmentId,
    },
  });

  return userRoles.length > 0;
};

/**
 * Get user's department scope
 */
export const getUserDepartments = async (userId: string) => {
  try {
    const departments = await prisma.userRole.findMany({
      where: { userId, departmentId: { not: null } },
      select: {
        departmentId: true,
        department: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      distinct: ['departmentId'],
    });

    return {
      success: true,
      departments: departments.map(d => d.department).filter(d => d !== null),
    };
  } catch (error: any) {
    console.error('Get user departments error:', error);
    return {
      success: false,
      message: 'Failed to get user departments',
    };
  }
};
