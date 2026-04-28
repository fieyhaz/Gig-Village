import { useEffect, useState, useCallback } from "react";
import { signInUser, getUser, type User } from "@workspace/api-client-react";

const AUTH_KEY = "gigvillage_auth_user";
const AUTH_EVENT = "gigvillage:auth-changed";

export type AuthUser = User;

export function getAuthUser(): AuthUser | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(AUTH_KEY);
    return raw ? (JSON.parse(raw) as AuthUser) : null;
  } catch {
    return null;
  }
}

function setAuthUser(user: AuthUser | null) {
  if (user === null) {
    localStorage.removeItem(AUTH_KEY);
  } else {
    localStorage.setItem(AUTH_KEY, JSON.stringify(user));
  }
  window.dispatchEvent(new Event(AUTH_EVENT));
}

export function isAuthenticated(): boolean {
  return getAuthUser() !== null;
}

export async function loginUser(input: { name: string; email: string }): Promise<AuthUser> {
  const user = await signInUser({ name: input.name.trim(), email: input.email.trim() });
  setAuthUser(user);
  return user;
}

export function logoutUser(): void {
  setAuthUser(null);
}

export async function refreshAuthUser(): Promise<AuthUser | null> {
  const current = getAuthUser();
  if (!current) return null;
  try {
    const fresh = await getUser(current.id);
    setAuthUser(fresh);
    return fresh;
  } catch {
    return current;
  }
}

export function updateAuthUser(patch: Partial<AuthUser>): void {
  const current = getAuthUser();
  if (!current) return;
  setAuthUser({ ...current, ...patch });
}

export function useAuth(): {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isProvider: boolean;
  refresh: () => Promise<AuthUser | null>;
} {
  const [user, setUser] = useState<AuthUser | null>(() => getAuthUser());

  useEffect(() => {
    const update = () => setUser(getAuthUser());
    window.addEventListener(AUTH_EVENT, update);
    window.addEventListener("storage", update);
    return () => {
      window.removeEventListener(AUTH_EVENT, update);
      window.removeEventListener("storage", update);
    };
  }, []);

  const refresh = useCallback(async () => {
    const fresh = await refreshAuthUser();
    return fresh;
  }, []);

  return {
    user,
    isAuthenticated: user !== null,
    isProvider: !!user?.providerId,
    refresh,
  };
}
