import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { MessageSquare, Plus, Loader2, AlertCircle, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/core/auth/useAuth";
import {
  listThreads,
  createThread,
  type ForumThread,
} from "@/core/api/forum.service";
import { switchRoutes } from "@/router/routes";
import { useTranslation } from "@/i18n";

const ForoScene = () => {
  const { user } = useAuth();
  const { t } = useTranslation();
  const tf = t.foro;

  const [threads, setThreads] = useState<ForumThread[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    loadThreads();
  }, []);

  const loadThreads = async () => {
    try {
      setLoading(true);
      setError(null);
      setThreads(await listThreads());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al cargar los hilos");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateThread = async () => {
    if (!user) return;
    if (!title.trim() || !content.trim()) {
      setFormError(tf.validation.required);
      return;
    }
    try {
      setSubmitting(true);
      setFormError(null);
      const newThread = await createThread(title.trim(), content.trim(), user.id);
      setThreads((prev) => [newThread, ...prev]);
      setDialogOpen(false);
      setTitle("");
      setContent("");
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Error al crear el hilo");
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString(undefined, {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <MessageSquare className="size-7 text-orange-500" />
            {tf.title}
          </h1>
          <p className="text-muted-foreground mt-1">{tf.subtitle}</p>
        </div>
        {user && (
          <Button
            onClick={() => setDialogOpen(true)}
            className="gap-2 bg-orange-600 hover:bg-orange-700 text-white"
          >
            <Plus className="size-4" />
            {tf.newThread}
          </Button>
        )}
      </div>

      {/* Error */}
      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="size-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Loading */}
      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="size-8 animate-spin text-orange-500" />
        </div>
      ) : threads.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <MessageSquare className="size-12 mx-auto mb-3 opacity-30" />
          <p>{tf.empty}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {threads.map((thread) => (
            <Link
              key={thread.id}
              to={`${switchRoutes.foro}/${thread.id}`}
              className="block"
            >
              <Card className="hover:shadow-md transition-shadow cursor-pointer border border-border hover:border-orange-400">
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="text-base font-semibold leading-snug text-foreground line-clamp-2">
                      {thread.title}
                    </CardTitle>
                    <Badge variant="secondary" className="shrink-0 gap-1 text-xs">
                      <MessageSquare className="size-3" />
                      {thread.post_count}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                    {thread.content}
                  </p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <User className="size-3" />
                    <span>{thread.profiles?.username ?? tf.unknownUser}</span>
                    <span>·</span>
                    <span>{formatDate(thread.updated_at)}</span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}

      {/* Dialog nuevo hilo */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{tf.newThread}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1">
              <Label htmlFor="thread-title">{tf.form.titleLabel}</Label>
              <Input
                id="thread-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={tf.form.titlePlaceholder}
                maxLength={200}
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="thread-content">{tf.form.contentLabel}</Label>
              <Textarea
                id="thread-content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder={tf.form.contentPlaceholder}
                rows={5}
              />
            </div>
            {formError && (
              <p className="text-sm text-destructive">{formError}</p>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)} disabled={submitting}>
              {tf.form.cancel}
            </Button>
            <Button
              onClick={handleCreateThread}
              disabled={submitting}
              className="bg-orange-600 hover:bg-orange-700 text-white"
            >
              {submitting ? (
                <Loader2 className="size-4 animate-spin mr-2" />
              ) : null}
              {tf.form.submit}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ForoScene;
