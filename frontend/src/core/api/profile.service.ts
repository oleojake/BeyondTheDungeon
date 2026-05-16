import { supabase } from "@/lib/supabase";

export const getProfile = async (
  userId: string
): Promise<{ username: string | null; avatar_url: string | null }> => {
  const { data, error } = await supabase
    .from("profiles")
    .select("username, avatar_url")
    .eq("id", userId)
    .single();
  if (error) throw new Error(error.message);
  return data as { username: string | null; avatar_url: string | null };
};

export const updateAvatar = async (
  userId: string,
  avatarUrl: string
): Promise<void> => {
  const { error } = await supabase
    .from("profiles")
    .update({ avatar_url: avatarUrl })
    .eq("id", userId);
  if (error) throw new Error(error.message);
};

/** Upload a file to Supabase Storage (bucket: avatars) and return its public URL */
export const uploadAvatarFile = async (
  userId: string,
  file: File
): Promise<string> => {
  const ext = file.name.split(".").pop() ?? "jpg";
  const path = `${userId}/avatar.${ext}`;
  const { error } = await supabase.storage
    .from("avatars")
    .upload(path, file, { upsert: true, contentType: file.type });
  if (error) throw new Error(error.message);
  const { data } = supabase.storage.from("avatars").getPublicUrl(path);
  return data.publicUrl;
};

export const updateUsername = async (
  userId: string,
  username: string
): Promise<void> => {
  const { error } = await supabase
    .from("profiles")
    .update({ username })
    .eq("id", userId);
  if (error) throw new Error(error.message);
};

export const updateEmail = async (newEmail: string): Promise<void> => {
  const { error } = await supabase.auth.updateUser({ email: newEmail });
  if (error) throw new Error(error.message);
};

export const updatePassword = async (newPassword: string): Promise<void> => {
  const { error } = await supabase.auth.updateUser({ password: newPassword });
  if (error) throw new Error(error.message);
};

