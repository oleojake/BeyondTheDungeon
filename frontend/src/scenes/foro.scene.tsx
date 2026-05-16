import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { MessageSquare, Plus, Loader2, AlertCircle, User, Camera, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
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
  uploadForumImage,
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
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

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
      let imageUrl: string | undefined;
      if (imageFile) {
        imageUrl = await uploadForumImage(user.id, `thread-${Date.now()}`, imageFile);
      }
      const newThread = await createThread(title.trim(), content.trim(), user.id, imageUrl);
      setThreads((prev) => [newThread, ...prev]);
      setDialogOpen(false);
      setTitle("");
      setContent("");
      setImageFile(null);
      setImagePreview(null);
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
    <div className="min-h-screen bg-dark pb-16">
      {/* Hero banner */}
      <div className="relative overflow-hidden bg-gradient-to-br from-stone-900 via-dark to-stone-900 border-b border-dark-border">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[200px] bg-amber-600/10 blur-3xl rounded-full" />
        </div>
        <div className="relative container mx-auto max-w-5xl px-6 py-14">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
            <div className="text-center sm:text-left">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-amber-600/20 border border-amber-600/30 mb-5">
                <MessageSquare className="w-8 h-8 text-amber-400" />
              </div>
              <h1 className="text-4xl md:text-5xl font-bold text-amber-100 mb-4 tracking-tight">
                {tf.title}
              </h1>
              <p className="text-lg text-stone-400 max-w-2xl leading-relaxed">
                {tf.subtitle}
              </p>
            </div>
            {user && (
              <Button
                onClick={() => setDialogOpen(true)}
                className="shrink-0 gap-2 bg-amber-600 hover:bg-amber-500 text-white font-semibold px-6 py-3 rounded-xl shadow-lg"
              >
                <Plus className="size-4" />
                {tf.newThread}
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Thread list */}
      <div className="container mx-auto max-w-5xl px-6 mt-10">
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="size-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="size-8 animate-spin text-amber-400" />
          </div>
        ) : threads.length === 0 ? (
          <div className="text-center py-16 text-stone-500">
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
                <div className="rounded-xl border border-dark-border bg-dark-card hover:border-amber-600/50 hover:bg-amber-900/10 transition-all p-5">
                  <div className="flex items-start justify-between gap-3">
                    <h2 className="text-base font-semibold text-amber-100 leading-snug line-clamp-2">
                      {thread.title}
                    </h2>
                    <span className="shrink-0 inline-flex items-center gap-1 text-xs text-stone-400 bg-dark/60 border border-dark-border rounded-full px-2.5 py-1">
                      <MessageSquare className="size-3" />
                      {thread.post_count}
                    </span>
                  </div>
                  <p className="text-sm text-stone-400 line-clamp-2 mt-2 mb-3">
                    {thread.content}
                  </p>
                  {thread.image_url && (
                    <img
                      src={thread.image_url}
                      alt=""
                      className="mt-2 mb-3 max-h-36 rounded-lg border border-dark-border object-cover"
                      onClick={(e) => e.preventDefault()}
                    />
                  )}
                  <div className="flex items-center gap-2.5 mt-3">
                    <div className="shrink-0">
                      {thread.profiles?.avatar_url ? (
                        <img src={thread.profiles.avatar_url} alt="" className="size-7 rounded-full bg-stone-800 border border-dark-border" />
                      ) : (
                        <div className="size-7 rounded-full bg-stone-800 border border-dark-border flex items-center justify-center">
                          <User className="size-3.5 text-stone-500" />
                        </div>
                      )}
                    </div>
                    <span className="text-sm font-medium text-stone-300">{thread.profiles?.username ?? tf.unknownUser}</span>
                    <span className="text-stone-600">&middot;</span>
                    <span className="text-xs text-stone-500">{formatDate(thread.updated_at)}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

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
            {/* Image upload */}
            <div className="space-y-1">
              <Label>Imagen (opcional)</Label>
              {imagePreview ? (
                <div className="relative inline-block">
                  <img src={imagePreview} alt="preview" className="max-h-40 rounded-lg border border-dark-border object-contain" />
                  <button
                    type="button"
                    onClick={() => { setImageFile(null); setImagePreview(null); }}
                    className="absolute -top-2 -right-2 bg-red-600 hover:bg-red-500 rounded-full p-0.5 text-white"
                  >
                    <X className="size-3.5" />
                  </button>
                </div>
              ) : (
                <label
                  htmlFor="thread-image"
                  className="flex items-center gap-2 cursor-pointer text-sm px-3 py-2 rounded-md border border-dark-border bg-dark-card hover:bg-dark-border transition-colors text-gray-300 w-fit"
                >
                  <Camera className="size-4" />
                  Adjuntar imagen
                  <input
                    id="thread-image"
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/gif"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      if (file.size > 5 * 1024 * 1024) { alert("La imagen no puede superar 5 MB"); e.target.value = ""; return; }
                      setImageFile(file);
                      setImagePreview(URL.createObjectURL(file));
                    }}
                  />
                </label>
              )}
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
              className="bg-amber-600 hover:bg-amber-500 text-white"
            >
              {submitting ? <Loader2 className="size-4 animate-spin mr-2" /> : null}
              {tf.form.submit}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ForoScene;
