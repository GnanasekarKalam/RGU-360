// src/services/mfa.service.ts
// Multi-Factor Authentication service

import crypto from 'crypto';
import { PrismaClient } from '@prisma/client';
import { mfaConfig } from '../config/jwt.config';

const prisma = new PrismaClient();

/**
 * Generate TOTP secret
 */
export const generateTotpSecret = (): string => {
  return crypto.randomBytes(32).toString('hex').slice(0, 32);
};

/**
 * Generate MFA code (for testing/OTP)
 */
export const generateMfaCode = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

/**
 * Create MFA challenge
 */
export const createMfaChallenge = async (
  userId: string,
  method: 'TOTP' | 'EMAIL' | 'SMS'
) => {
  try {
    const code = generateMfaCode();
    const expiresAt = new Date(Date.now() + mfaConfig.codeValidity);

    // Store challenge (in production, use database)
    console.log(`[MFA CHALLENGE] User: ${userId}, Method: ${method}, Code: ${code}`);

    return {
      success: true,
      code, // In production, don't return code to client
      expiresAt,
    };
  } catch (error: any) {
    console.error('Create MFA challenge error:', error);
    return {
      success: false,
      message: 'Failed to create MFA challenge',
    };
  }
};

/**
 * Verify MFA code
 */
export const verifyMfaCode = async (
  userId: string,
  code: string,
  challenge: { code: string; expiresAt: Date }
): Promise<boolean> => {
  try {
    // Check if code matches
    if (code !== challenge.code) {
      return false;
    }

    // Check if code is expired
    if (new Date() > challenge.expiresAt) {
      return false;
    }

    return true;
  } catch (error: any) {
    console.error('Verify MFA code error:', error);
    return false;
  }
};

/**
 * Enable MFA for user
 */
export const enableMfa = async (
  userId: string,
  method: 'TOTP' | 'EMAIL' | 'SMS'
) => {
  try {
    // Update user to enable MFA
    await prisma.user.update({
      where: { id: userId },
      data: {
        isMfaEnabled: true,
        mfaMethod: method,
      },
    });

    return {
      success: true,
      message: `MFA enabled with ${method}`,
    };
  } catch (error: any) {
    console.error('Enable MFA error:', error);
    return {
      success: false,
      message: 'Failed to enable MFA',
    };
  }
};

/**
 * Disable MFA for user
 */
export const disableMfa = async (userId: string) => {
  try {
    await prisma.user.update({
      where: { id: userId },
      data: {
        isMfaEnabled: false,
        mfaMethod: null,
      },
    });

    return {
      success: true,
      message: 'MFA disabled',
    };
  } catch (error: any) {
    console.error('Disable MFA error:', error);
    return {
      success: false,
      message: 'Failed to disable MFA',
    };
  }
};

/**
 * Get user MFA status
 */
export const getUserMfaStatus = async (userId: string) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        isMfaEnabled: true,
        mfaMethod: true,
      },
    });

    if (!user) {
      return {
        success: false,
        message: 'User not found',
      };
    }

    return {
      success: true,
      mfaEnabled: user.isMfaEnabled,
      method: user.mfaMethod,
    };
  } catch (error: any) {
    console.error('Get MFA status error:', error);
    return {
      success: false,
      message: 'Failed to get MFA status',
    };
  }
};

/**
 * Generate backup codes
 */
export const generateBackupCodes = (count: number = 10): string[] => {
  const codes: string[] = [];
  for (let i = 0; i < count; i++) {
    const code = crypto.randomBytes(4).toString('hex').toUpperCase();
    codes.push(code);
  }
  return codes;
};

/**
 * Store backup codes
 */
export const storeBackupCodes = async (userId: string, codes: string[]) => {
  try {
    // In production, encrypt and store in database
    console.log(`[BACKUP CODES] User: ${userId}, Codes stored`);

    return {
      success: true,
      message: 'Backup codes generated',
      codes, // Show once, then encrypt and store
    };
  } catch (error: any) {
    console.error('Store backup codes error:', error);
    return {
      success: false,
      message: 'Failed to store backup codes',
    };
  }
};

/**
 * Verify backup code
 */
export const verifyBackupCode = async (
  userId: string,
  code: string,
  backupCodes: string[]
): Promise<boolean> => {
  try {
    const index = backupCodes.indexOf(code);
    if (index > -1) {
      // Remove used code
      backupCodes.splice(index, 1);
      // Update in database
      console.log(`[BACKUP CODE USED] User: ${userId}`);
      return true;
    }
    return false;
  } catch (error: any) {
    console.error('Verify backup code error:', error);
    return false;
  }
};

/**
 * Send MFA code via email
 */
export const sendMfaCodeByEmail = async (email: string, code: string) => {
  try {
    // In production, use email service
    console.log(`[EMAIL MFA] To: ${email}, Code: ${code}`);

    return {
      success: true,
      message: 'MFA code sent to email',
    };
  } catch (error: any) {
    console.error('Send MFA email error:', error);
    return {
      success: false,
      message: 'Failed to send MFA code',
    };
  }
};

/**
 * Send MFA code via SMS
 */
export const sendMfaCodeBySms = async (phoneNumber: string, code: string) => {
  try {
    // In production, use SMS service
    console.log(`[SMS MFA] To: ${phoneNumber}, Code: ${code}`);

    return {
      success: true,
      message: 'MFA code sent via SMS',
    };
  } catch (error: any) {
    console.error('Send MFA SMS error:', error);
    return {
      success: false,
      message: 'Failed to send MFA code',
    };
  }
};
