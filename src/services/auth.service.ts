import client, { unwrap } from "./api";
import { tokenStorage } from "@/utils/storage";
import type { AuthResponse, LoginPayload, User } from "@/types";

export const authService = {
  async login(payload: LoginPayload): Promise<AuthResponse> {
    const response = await client.post<{ data: AuthResponse }>(
      "/auth/login",
      payload
    );
    const auth = unwrap<AuthResponse>(response);
    tokenStorage.setTokens(auth.token, auth.refreshToken);
    return auth;
  },

  async logout(): Promise<void> {
    try {
      await client.post("/auth/logout");
    } catch {
      // best-effort — clear local state regardless
    } finally {
      tokenStorage.clear();
    }
  },

  async getProfile(): Promise<User> {
    // Cache-Control: no-cache prevents the browser from serving a stale
    // /users/me response (e.g. one without avatarUrl from before the upload).
    const response = await client.get<{ data: User }>("/users/me", {
      headers: { "Cache-Control": "no-cache" },
    });
    return unwrap<User>(response);
  },

  async updateProfile(payload: Partial<User>): Promise<User> {
    const response = await client.patch<{ data: User }>("/users/me", payload);
    return unwrap<User>(response);
  },

  async uploadAvatar(file: File): Promise<User> {
    const formData = new FormData();
    formData.append("file", file);
    const response = await client.post<{ data: User }>("/users/me/avatar", formData, {
      timeout: 60_000,
      headers: { "Content-Type": undefined }, // let browser set multipart boundary
    });
    return unwrap<User>(response);
  },
};
