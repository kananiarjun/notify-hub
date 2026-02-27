import type { User } from "./schema";
import { randomUUID } from "crypto";

/**
 * Creates a user object with all required default values
 */
export function createUserWithDefaults(userData: Partial<User>): User {
  const now = new Date();
  
  return {
    id: userData.id || randomUUID(),
    name: userData.name || '',
    email: userData.email || '',
    password: userData.password || '',
    role: userData.role || 'USER',
    plan: userData.plan || 'FREE',
    emailUsed: userData.emailUsed ?? 0,
    smsUsed: userData.smsUsed ?? 0,
    planStartDate: userData.planStartDate || now,
    isActive: userData.isActive ?? true,
    createdAt: userData.createdAt || now,
    updatedAt: userData.updatedAt || now,
  };
}

/**
 * Ensures a user object has all required fields with defaults
 */
export function ensureUserDefaults(user: Partial<User>): User {
  const now = new Date();
  
  return {
    id: user.id || randomUUID(),
    name: user.name || '',
    email: user.email || '',
    password: user.password || '',
    role: (user.role as 'ADMIN' | 'USER') || 'USER',
    plan: (user.plan as 'FREE' | 'BASIC' | 'PREMIUM') || 'FREE',
    emailUsed: user.emailUsed ?? 0,
    smsUsed: user.smsUsed ?? 0,
    planStartDate: user.planStartDate || now,
    isActive: user.isActive ?? true,
    createdAt: user.createdAt || now,
    updatedAt: user.updatedAt || now,
  };
}
