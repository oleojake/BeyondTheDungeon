import { supabase } from "@/lib/supabase";

export interface ForumThread {
  id: string;
  title: string;
  content: string;
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
  authorId: string
): Promise<ForumThread> => {
  const { data, error } = await supabase
    .from("forum_threads")
    .insert({ title, content, author_id: authorId })
    .select(`*, profiles:author_id ( username, avatar_url )`)
    .single();

  if (error) throw new Error(error.message);
  return { ...data, post_count: 0 } as ForumThread;
};

export const createPost = async (
  threadId: string,
  content: string,
  authorId: string
): Promise<ForumPost> => {
  const { data, error } = await supabase
    .from("forum_posts")
    .insert({ thread_id: threadId, content, author_id: authorId })
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
