import { describe, it, expect, vi, beforeEach } from "vitest";

const mockFetch = vi.fn();
vi.stubGlobal("fetch", mockFetch);

beforeEach(() => {
  vi.clearAllMocks();
});

async function loadApiClient() {
  const { apiClient } = await import("../api.client");
  return apiClient;
}

describe("apiClient", () => {
  describe("post", () => {
    it("sends POST request with JSON body and returns parsed response", async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ id: 1, name: "test" }),
      });

      const apiClient = await loadApiClient();
      const result = await apiClient.post<{ id: number; name: string }>("/test", { foo: "bar" });

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("/test"),
        expect.objectContaining({
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ foo: "bar" }),
        }),
      );
      expect(result).toEqual({ id: 1, name: "test" });
    });

    it("throws error message from response JSON on failure", async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        json: () => Promise.resolve({ message: "Something went wrong" }),
      });

      const apiClient = await loadApiClient();
      await expect(apiClient.post("/test", {})).rejects.toThrow("Something went wrong");
    });

    it("throws generic error when response JSON has no message", async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        json: () => Promise.resolve({}),
        status: 500,
      });

      const apiClient = await loadApiClient();
      await expect(apiClient.post("/test", {})).rejects.toThrow("Error 500");
    });

    it("throws fallback message when JSON parsing fails on error", async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        json: () => Promise.reject(new Error("invalid json")),
      });

      const apiClient = await loadApiClient();
      await expect(apiClient.post("/test", {})).rejects.toThrow("Error desconocido");
    });
  });

  describe("get", () => {
    it("sends GET request and returns parsed response", async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve([{ id: 1 }]),
      });

      const apiClient = await loadApiClient();
      const result = await apiClient.get<{ id: number }[]>("/items");

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("/items"),
        expect.objectContaining({
          method: "GET",
          headers: { "Content-Type": "application/json" },
        }),
      );
      expect(result).toEqual([{ id: 1 }]);
    });

    it("throws on failure response", async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        json: () => Promise.resolve({ message: "Not found" }),
        status: 404,
      });

      const apiClient = await loadApiClient();
      await expect(apiClient.get("/missing")).rejects.toThrow("Not found");
    });
  });
});
