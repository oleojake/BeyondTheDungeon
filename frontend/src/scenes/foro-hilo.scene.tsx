import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import {
  ArrowLeft,
  Loader2,
  AlertCircle,
  User,
  Send,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
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
import { useNavigate } from "react-router-dom";

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
      <div className="flex justify-center py-24">
        <Loader2 className="size-8 animate-spin text-orange-500" />
      </div>
    );
  }

  if (error || !thread) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <Alert variant="destructive">
          <AlertCircle className="size-4" />
          <AlertDescription>{error ?? tf.notFound}</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Back */}
      <Link
        to={switchRoutes.foro}
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6"
      >
        <ArrowLeft className="size-4" />
        {tf.backToForum}
      </Link>

      {/* Hilo principal */}
      <Card className="mb-6 border-orange-200 dark:border-orange-900">
        <CardContent className="pt-6">
          <div className="flex items-start justify-between gap-2 mb-3">
            <h1 className="text-2xl font-bold text-foreground leading-tight">
              {thread.title}
            </h1>
            {user?.id === thread.author_id && (
              <Button
                variant="ghost"
                size="icon"
                className="text-muted-foreground hover:text-destructive shrink-0"
                onClick={handleDeleteThread}
                title={tf.deleteThread}
              >
                <Trash2 className="size-4" />
              </Button>
            )}
          </div>
          <p className="text-foreground whitespace-pre-wrap mb-4">{thread.content}</p>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <User className="size-3" />
            <span>{thread.profiles?.username ?? tf.unknownUser}</span>
            <span>·</span>
            <span>{formatDate(thread.created_at)}</span>
          </div>
        </CardContent>
      </Card>

      {/* Posts */}
      {posts.length > 0 && (
        <div className="space-y-3 mb-6">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
            {tf.replies} ({posts.length})
          </h2>
          {posts.map((post) => (
            <Card key={post.id} className="border border-border">
              <CardContent className="pt-4 pb-3">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm text-foreground whitespace-pre-wrap flex-1">
                    {post.content}
                  </p>
                  {user?.id === post.author_id && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-muted-foreground hover:text-destructive shrink-0 -mt-1"
                      onClick={() => handleDeletePost(post.id)}
                      title={tf.deletePost}
                    >
                      <Trash2 className="size-3" />
                    </Button>
                  )}
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground mt-2">
                  <User className="size-3" />
                  <span>{post.profiles?.username ?? tf.unknownUser}</span>
                  <span>·</span>
                  <span>{formatDate(post.created_at)}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Separator className="mb-6" />

      {/* Reply box */}
      {user ? (
        <div className="space-y-3">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
            {tf.addReply}
          </h2>
          <Textarea
            value={reply}
            onChange={(e) => setReply(e.target.value)}
            placeholder={tf.replyPlaceholder}
            rows={4}
          />
          {replyError && (
            <p className="text-sm text-destructive">{replyError}</p>
          )}
          <div className="flex justify-end">
            <Button
              onClick={handleReply}
              disabled={submitting}
              className="gap-2 bg-orange-600 hover:bg-orange-700 text-white"
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
        <p className="text-sm text-muted-foreground text-center py-4">
          {tf.loginToReply}{" "}
          <Link to={switchRoutes.login} className="text-orange-500 underline">
            {tf.loginLink}
          </Link>
        </p>
      )}
    </div>
  );
};

export default ForoHiloScene;
