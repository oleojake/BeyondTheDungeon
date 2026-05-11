import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Loader2,
  AlertCircle,
  User,
  Send,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useAuth } from "@/core/auth/useAuth";
import {
  getThread,
  createPost,
  deletePost,
  deleteThread,
  type ForumThread,
  type ForumPost,
} from "@/core/api/forum.service";
import { switchRoutes } from "@/router/routes";
import { useTranslation } from "@/i18n";

const ForoHiloScene = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { t } = useTranslation();
  const tf = t.foro;
  const navigate = useNavigate();

  const [thread, setThread] = useState<ForumThread | null>(null);
  const [posts, setPosts] = useState<ForumPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [reply, setReply] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [replyError, setReplyError] = useState<string | null>(null);

  useEffect(() => {
    if (id) loadThread();
  }, [id]);

  const loadThread = async () => {
    try {
      setLoading(true);
      setError(null);
      const { thread, posts } = await getThread(id!);
      setThread(thread);
      setPosts(posts);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al cargar el hilo");
    } finally {
      setLoading(false);
    }
  };

  const handleReply = async () => {
    if (!user || !thread) return;
    if (!reply.trim()) {
      setReplyError(tf.validation.required);
      return;
    }
    try {
      setSubmitting(true);
      setReplyError(null);
      const newPost = await createPost(thread.id, reply.trim(), user.id);
      setPosts((prev) => [...prev, newPost]);
      setReply("");
    } catch (err) {
      setReplyError(err instanceof Error ? err.message : "Error al enviar el mensaje");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeletePost = async (postId: string) => {
    try {
      await deletePost(postId);
      setPosts((prev) => prev.filter((p) => p.id !== postId));
    } catch {
      // silently ignore
    }
  };

  const handleDeleteThread = async () => {
    if (!thread) return;
    try {
      await deleteThread(thread.id);
      navigate(switchRoutes.foro);
    } catch {
      // silently ignore
    }
  };

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleString(undefined, {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  if (loading) {
    return (
      <div className="min-h-screen bg-dark flex justify-center items-center">
        <Loader2 className="size-8 animate-spin text-amber-400" />
      </div>
    );
  }

  if (error || !thread) {
    return (
      <div className="min-h-screen bg-dark">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <Alert variant="destructive">
            <AlertCircle className="size-4" />
            <AlertDescription>{error ?? tf.notFound}</AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark pb-16">
      {/* Back */}
      <div className="border-b border-dark-border bg-gradient-to-b from-stone-900 to-dark px-6 py-4">
        <div className="container mx-auto max-w-4xl">
          <Link
            to={switchRoutes.foro}
            className="inline-flex items-center gap-1 text-sm text-stone-400 hover:text-amber-300 transition-colors"
          >
            <ArrowLeft className="size-4" />
            {tf.backToForum}
          </Link>
        </div>
      </div>

      <div className="container mx-auto max-w-4xl px-4 py-8">
        {/* Hilo principal */}
        <div className="rounded-xl border border-amber-800/40 bg-amber-900/10 p-6 mb-6">
          <div className="flex items-start justify-between gap-2 mb-3">
            <h1 className="text-2xl font-bold text-amber-100 leading-tight">
              {thread.title}
            </h1>
            {user?.id === thread.author_id && (
              <Button
                variant="ghost"
                size="icon"
                className="text-stone-500 hover:text-red-400 shrink-0"
                onClick={handleDeleteThread}
                title={tf.deleteThread}
              >
                <Trash2 className="size-4" />
              </Button>
            )}
          </div>
          <p className="text-stone-300 whitespace-pre-wrap mb-4">{thread.content}</p>
          <div className="flex items-center gap-2 text-xs text-stone-500">
            <User className="size-3" />
            <span>{thread.profiles?.username ?? tf.unknownUser}</span>
            <span>·</span>
            <span>{formatDate(thread.created_at)}</span>
          </div>
        </div>

        {/* Posts */}
        {posts.length > 0 && (
          <div className="space-y-3 mb-6">
            <h2 className="text-xs font-semibold text-stone-500 uppercase tracking-widest">
              {tf.replies} ({posts.length})
            </h2>
            {posts.map((post) => (
              <div key={post.id} className="rounded-xl border border-dark-border bg-dark-card p-4">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm text-stone-300 whitespace-pre-wrap flex-1">
                    {post.content}
                  </p>
                  {user?.id === post.author_id && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-stone-500 hover:text-red-400 shrink-0 -mt-1"
                      onClick={() => handleDeletePost(post.id)}
                      title={tf.deletePost}
                    >
                      <Trash2 className="size-3" />
                    </Button>
                  )}
                </div>
                <div className="flex items-center gap-2 text-xs text-stone-500 mt-2">
                  <User className="size-3" />
                  <span>{post.profiles?.username ?? tf.unknownUser}</span>
                  <span>·</span>
                  <span>{formatDate(post.created_at)}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="border-t border-dark-border mb-6" />

        {/* Reply box */}
        {user ? (
          <div className="space-y-3">
            <h2 className="text-xs font-semibold text-stone-500 uppercase tracking-widest">
              {tf.addReply}
            </h2>
            <Textarea
              value={reply}
              onChange={(e) => setReply(e.target.value)}
              placeholder={tf.replyPlaceholder}
              rows={4}
              className="bg-dark-card border-dark-border text-stone-200"
            />
            {replyError && (
              <p className="text-sm text-destructive">{replyError}</p>
            )}
            <div className="flex justify-end">
              <Button
                onClick={handleReply}
                disabled={submitting}
                className="gap-2 bg-amber-600 hover:bg-amber-500 text-white"
              >
                {submitting ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <Send className="size-4" />
                )}
                {tf.send}
              </Button>
            </div>
          </div>
        ) : (
          <p className="text-sm text-stone-500 text-center py-4">
            {tf.loginToReply}{" "}
            <Link to={switchRoutes.login} className="text-amber-400 hover:underline">
              {tf.loginLink}
            </Link>
          </p>
        )}
      </div>
    </div>
  );
};

export default ForoHiloScene;
