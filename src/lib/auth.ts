import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

export type UserRole = "super_admin" | "client_admin";

export type AuthUser = {
  email: string;
  role: UserRole;
};

const secret = new TextEncoder().encode(process.env.JWT_SECRET || "fallback-secret");

// Rate limiting
const RATE_LIMIT_MAP = new Map<string, { attempts: number; lockedUntil: number }>();
const MAX_ATTEMPTS = 5;
const LOCKOUT_DURATION = 15 * 60 * 1000;

export function checkRateLimit(ip: string): { allowed: boolean; remainingMinutes?: number } {
  const entry = RATE_LIMIT_MAP.get(ip);
  if (!entry) return { allowed: true };

  if (entry.lockedUntil > Date.now()) {
    const remaining = Math.ceil((entry.lockedUntil - Date.now()) / 60000);
    return { allowed: false, remainingMinutes: remaining };
  }

  if (entry.attempts >= MAX_ATTEMPTS) {
    entry.lockedUntil = Date.now() + LOCKOUT_DURATION;
    return { allowed: false, remainingMinutes: 15 };
  }

  return { allowed: true };
}

export function recordFailedAttempt(ip: string): void {
  const entry = RATE_LIMIT_MAP.get(ip) || { attempts: 0, lockedUntil: 0 };
  entry.attempts += 1;
  RATE_LIMIT_MAP.set(ip, entry);
}

export function resetAttempts(ip: string): void {
  RATE_LIMIT_MAP.delete(ip);
}

// Super admin check (env vars only)
export function validateSuperAdmin(email: string, password: string): AuthUser | null {
  if (
    email === process.env.SUPER_ADMIN_EMAIL &&
    password === process.env.SUPER_ADMIN_PASSWORD
  ) {
    return { email, role: "super_admin" };
  }
  return null;
}

// Client admin check (will be from DB later, using in-memory store for now)
const clientAdmins: { email: string; password: string }[] = [];

export function registerClientAdmin(email: string, password: string): boolean {
  if (clientAdmins.find((a) => a.email === email)) return false;
  clientAdmins.push({ email, password });
  return true;
}

export function validateClientAdmin(email: string, password: string): AuthUser | null {
  const admin = clientAdmins.find((a) => a.email === email && a.password === password);
  if (admin) return { email, role: "client_admin" };
  return null;
}

// Combined login
export function validateCredentials(email: string, password: string): AuthUser | null {
  const superAdmin = validateSuperAdmin(email, password);
  if (superAdmin) return superAdmin;

  const clientAdmin = validateClientAdmin(email, password);
  if (clientAdmin) return clientAdmin;

  return null;
}

// JWT
export async function createToken(user: AuthUser): Promise<string> {
  return new SignJWT({ email: user.email, role: user.role })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("7d")
    .sign(secret);
}

export async function verifyToken(token: string): Promise<AuthUser | null> {
  try {
    const { payload } = await jwtVerify(token, secret);
    return { email: payload.email as string, role: payload.role as UserRole };
  } catch {
    return null;
  }
}

export async function getCurrentUser(): Promise<AuthUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get("admin_token")?.value;
  if (!token) return null;
  return verifyToken(token);
}
