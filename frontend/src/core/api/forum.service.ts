import { supabase } from "@/lib/supabase";

export async function uploadForumImage(
  userId: string,
  contextId: string,
  file: File
): Promise<string> {
  const ext = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
  const path = `${userId}/${contextId}-${Date.now()}.${ext}`;

  const { error } = await supabase.storage
    .from("forum-images")
    .upload(path, file, { upsert: true });

  if (error) throw new Error(`Error al subir la imagen: ${error.message}`);

  const { data } = supabase.storage.from("forum-images").getPublicUrl(path);
  return data.publicUrl;
}

export interface ForumThread {
  id: string;
  title: string;
  content: string;
  image_url?: string | null;
  author_id: string;
  created_at: string;
  updated_at: string;
  profiles: { username: string; avatar_url: string | null };
  post_count: number;
}

export interface ForumPost {
  id: string;
  thread_id: string;
  content: string;
  image_url?: string | null;
  author_id: string;
  created_at: string;
  profiles: { username: string; avatar_url: string | null };
}

export const listThreads = async (): Promise<ForumThread[]> => {
  const { data, error } = await supabase
    .from("forum_threads")
    .select(`
      *,
      profiles:author_id ( username, avatar_url ),
      post_count:forum_posts(count)
    `)
    .order("updated_at", { ascending: false });

  if (error) throw new Error(error.message);

  return (data ?? []).map((t: any) => ({
    ...t,
    post_count: t.post_count?.[0]?.count ?? 0,
  }));
};

export const getThread = async (
  id: string
): Promise<{ thread: ForumThread; posts: ForumPost[] }> => {
  const [threadRes, postsRes] = await Promise.all([
    supabase
      .from("forum_threads")
      .select(`*, profiles:author_id ( username, avatar_url )`)
      .eq("id", id)
      .single(),
    supabase
      .from("forum_posts")
      .select(`*, profiles:author_id ( username, avatar_url )`)
      .eq("thread_id", id)
      .order("created_at", { ascending: true }),
  ]);

  if (threadRes.error) throw new Error(threadRes.error.message);
  if (postsRes.error) throw new Error(postsRes.error.message);

  return {
    thread: threadRes.data as ForumThread,
    posts: (postsRes.data ?? []) as ForumPost[],
  };
};

export const createThread = async (
  title: string,
  content: string,
  authorId: string,
  imageUrl?: string
): Promise<ForumThread> => {
  const payload: Record<string, unknown> = { title, content, author_id: authorId };
  if (imageUrl) payload.image_url = imageUrl;

  const { data, error } = await supabase
    .from("forum_threads")
    .insert(payload)
    .select(`*, profiles:author_id ( username, avatar_url )`)
    .single();

  if (error) throw new Error(error.message);
  return { ...data, post_count: 0 } as ForumThread;
};

export const createPost = async (
  threadId: string,
  content: string,
  authorId: string,
  imageUrl?: string
): Promise<ForumPost> => {
  const payload: Record<string, unknown> = { thread_id: threadId, content, author_id: authorId };
  if (imageUrl) payload.image_url = imageUrl;

  const { data, error } = await supabase
    .from("forum_posts")
    .insert(payload)
    .select(`*, profiles:author_id ( username, avatar_url )`)
    .single();

  if (error) throw new Error(error.message);

  // Tocar updated_at del hilo para que suba en el listado
  await supabase
    .from("forum_threads")
    .update({ updated_at: new Date().toISOString() })
    .eq("id", threadId);

  return data as ForumPost;
};

export const deleteThread = async (id: string): Promise<void> => {
  const { error } = await supabase.from("forum_threads").delete().eq("id", id);
  if (error) throw new Error(error.message);
};

export const deletePost = async (id: string): Promise<void> => {
  const { error } = await supabase.from("forum_posts").delete().eq("id", id);
  if (error) throw new Error(error.message);
};
