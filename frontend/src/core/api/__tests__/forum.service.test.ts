import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  uploadForumImage,
  listThreads,
  getThread,
  createThread,
  createPost,
  deleteThread,
  deletePost,
} from "../forum.service";

const mocks = vi.hoisted(() => {
  const resolveHolder: { value: { data: unknown; error: { message: string } | null } } = {
    value: { data: null, error: null },
  };

  const builder = {
    select: vi.fn(function () { return this; }),
    eq: vi.fn(function () { return this; }),
    order: vi.fn(function () { return this; }),
    single: vi.fn(function () { return this; }),
    insert: vi.fn(function () { return this; }),
    update: vi.fn(function () { return this; }),
    delete: vi.fn(function () { return this; }),
    then(onFulfilled: any) {
      return Promise.resolve(resolveHolder.value).then(onFulfilled);
    },
  };

  const storageUpload = vi.fn(() => Promise.resolve({ error: null }));
  const storageGetPublicUrl = vi.fn(() => ({
    data: { publicUrl: "https://example.com/img.jpg" },
  }));

  const supabase = {
    from: vi.fn(() => builder),
    storage: {
      from: vi.fn(() => ({
        upload: storageUpload,
        getPublicUrl: storageGetPublicUrl,
      })),
    },
  };

  return { builder, storageUpload, storageGetPublicUrl, supabase, resolveHolder };
});

vi.mock("@/lib/supabase", () => ({
  supabase: mocks.supabase,
}));

beforeEach(() => {
  vi.clearAllMocks();
  mocks.resolveHolder.value = { data: null, error: null };
});

describe("listThreads", () => {
  it("returns list of threads with post_count", async () => {
    const raw = [
      {
        id: "t1",
        title: "T1",
        content: "C",
        author_id: "u1",
        created_at: "2024-01-01",
        updated_at: "2024-01-01",
        profiles: { username: "u", avatar_url: null },
        post_count: [{ count: 5 }],
      },
    ];
    mocks.resolveHolder.value = { data: raw, error: null };

    const result = await listThreads();
    expect(result).toHaveLength(1);
    expect(result[0].post_count).toBe(5);
    expect(mocks.supabase.from).toHaveBeenCalledWith("forum_threads");
  });

  it("returns empty array when data is null", async () => {
    mocks.resolveHolder.value = { data: null, error: null };
    const result = await listThreads();
    expect(result).toEqual([]);
  });

  it("throws on error", async () => {
    mocks.resolveHolder.value = { data: null, error: { message: "List error" } };
    await expect(listThreads()).rejects.toThrow("List error");
  });
});

describe("getThread", () => {
  const threadData = {
    id: "t1", title: "T", content: "C", author_id: "u1",
    created_at: "2024-01-01", updated_at: "2024-01-01",
    profiles: { username: "u", avatar_url: null },
    post_count: [{ count: 2 }],
  };
  const postsData = [{
    id: "p1", thread_id: "t1", content: "P", author_id: "u1",
    created_at: "2024-01-01",
    profiles: { username: "u", avatar_url: null },
  }];

  it("returns thread and posts", async () => {
    const threadResult = { data: threadData, error: null };
    const postsResult = { data: postsData, error: null };

    mocks.supabase.from
      .mockReturnValueOnce({
        ...mocks.builder,
        then: (onF: any) => Promise.resolve(threadResult).then(onF),
      })
      .mockReturnValueOnce({
        ...mocks.builder,
        then: (onF: any) => Promise.resolve(postsResult).then(onF),
      });

    const result = await getThread("t1");
    expect(result.thread.id).toBe("t1");
    expect(result.posts).toHaveLength(1);
    expect(result.posts[0].id).toBe("p1");
    expect(mocks.supabase.from).toHaveBeenNthCalledWith(1, "forum_threads");
    expect(mocks.supabase.from).toHaveBeenNthCalledWith(2, "forum_posts");
  });

  it("throws on thread query error", async () => {
    const threadResult = { data: null, error: { message: "Thread error" } };
    const postsResult = { data: [], error: null };

    mocks.supabase.from
      .mockReturnValueOnce({
        ...mocks.builder,
        then: (onF: any) => Promise.resolve(threadResult).then(onF),
      })
      .mockReturnValueOnce({
        ...mocks.builder,
        then: (onF: any) => Promise.resolve(postsResult).then(onF),
      });

    await expect(getThread("bad")).rejects.toThrow("Thread error");
  });

  it("throws on posts query error", async () => {
    const threadResult = { data: threadData, error: null };
    const postsResult = { data: null, error: { message: "Posts error" } };

    mocks.supabase.from
      .mockReturnValueOnce({
        ...mocks.builder,
        then: (onF: any) => Promise.resolve(threadResult).then(onF),
      })
      .mockReturnValueOnce({
        ...mocks.builder,
        then: (onF: any) => Promise.resolve(postsResult).then(onF),
      });

    await expect(getThread("t1")).rejects.toThrow("Posts error");
  });
});

describe("createThread", () => {
  it("creates a thread without image", async () => {
    const created = {
      id: "t1", title: "Title", content: "Content", author_id: "u1",
      image_url: null, created_at: "2024-01-01", updated_at: "2024-01-01",
      profiles: { username: "u", avatar_url: null },
    };
    mocks.resolveHolder.value = { data: created, error: null };

    const result = await createThread("Title", "Content", "u1");
    expect(result.id).toBe("t1");
    expect(result.post_count).toBe(0);
    expect(mocks.builder.insert).toHaveBeenCalledWith(
      { title: "Title", content: "Content", author_id: "u1" }
    );
  });

  it("creates a thread with image", async () => {
    const created = {
      id: "t2", title: "Title", content: "Content", author_id: "u1",
      image_url: "https://example.com/img.jpg",
      created_at: "2024-01-01", updated_at: "2024-01-01",
      profiles: { username: "u", avatar_url: null },
    };
    mocks.resolveHolder.value = { data: created, error: null };

    const result = await createThread("Title", "Content", "u1", "https://example.com/img.jpg");
    expect(result.image_url).toBe("https://example.com/img.jpg");
    expect(mocks.builder.insert).toHaveBeenCalledWith(
      { title: "Title", content: "Content", author_id: "u1", image_url: "https://example.com/img.jpg" }
    );
  });

  it("throws on error", async () => {
    mocks.resolveHolder.value = { data: null, error: { message: "Insert error" } };
    await expect(createThread("T", "C", "u1")).rejects.toThrow("Insert error");
  });
});

describe("createPost", () => {
  it("creates a post without image and updates thread updated_at", async () => {
    const post = {
      id: "p1", thread_id: "t1", content: "C", author_id: "u1",
      created_at: "2024-01-01",
      profiles: { username: "u", avatar_url: null },
    };
    mocks.resolveHolder.value = { data: post, error: null };

    const result = await createPost("t1", "C", "u1");
    expect(result.id).toBe("p1");
    expect(mocks.builder.insert).toHaveBeenCalledWith(
      { thread_id: "t1", content: "C", author_id: "u1" }
    );
    expect(mocks.builder.update).toHaveBeenCalledWith(
      expect.objectContaining({ updated_at: expect.any(String) })
    );
    expect(mocks.builder.eq).toHaveBeenCalledWith("id", "t1");
  });

  it("creates a post with image", async () => {
    const post = {
      id: "p2", thread_id: "t1", content: "C", author_id: "u1",
      image_url: "https://example.com/img.jpg",
      created_at: "2024-01-01",
      profiles: { username: "u", avatar_url: null },
    };
    mocks.resolveHolder.value = { data: post, error: null };

    const result = await createPost("t1", "C", "u1", "https://example.com/img.jpg");
    expect(result.image_url).toBe("https://example.com/img.jpg");
    expect(mocks.builder.insert).toHaveBeenCalledWith(
      { thread_id: "t1", content: "C", author_id: "u1", image_url: "https://example.com/img.jpg" }
    );
  });

  it("throws on error", async () => {
    mocks.resolveHolder.value = { data: null, error: { message: "Post error" } };
    await expect(createPost("t1", "C", "u1")).rejects.toThrow("Post error");
  });
});

describe("deleteThread", () => {
  it("deletes a thread", async () => {
    await expect(deleteThread("t1")).resolves.toBeUndefined();
    expect(mocks.builder.delete).toHaveBeenCalled();
    expect(mocks.builder.eq).toHaveBeenCalledWith("id", "t1");
  });

  it("throws on error", async () => {
    mocks.resolveHolder.value = { data: null, error: { message: "Delete error" } };
    await expect(deleteThread("t1")).rejects.toThrow("Delete error");
  });
});

describe("deletePost", () => {
  it("deletes a post", async () => {
    await expect(deletePost("p1")).resolves.toBeUndefined();
    expect(mocks.builder.delete).toHaveBeenCalled();
    expect(mocks.builder.eq).toHaveBeenCalledWith("id", "p1");
  });

  it("throws on error", async () => {
    mocks.resolveHolder.value = { data: null, error: { message: "Delete error" } };
    await expect(deletePost("p1")).rejects.toThrow("Delete error");
  });
});

describe("uploadForumImage", () => {
  it("uploads file and returns public URL", async () => {
    const file = new File(["dummy"], "image.png", { type: "image/png" });
    const url = await uploadForumImage("user-1", "ctx-1", file);
    expect(url).toBe("https://example.com/img.jpg");
    expect(mocks.supabase.storage.from).toHaveBeenCalledWith("forum-images");
    expect(mocks.storageUpload).toHaveBeenCalledWith(
      expect.stringMatching(/^user-1\/ctx-1-\d+\.png$/),
      file,
      { upsert: true }
    );
  });

  it("throws on upload error", async () => {
    const file = new File(["d"], "img.jpg", { type: "image/jpeg" });
    mocks.storageUpload.mockResolvedValueOnce({ error: { message: "Upload failed" } });
    await expect(uploadForumImage("u1", "c1", file)).rejects.toThrow(
      "Error al subir la imagen: Upload failed"
    );
  });
});
