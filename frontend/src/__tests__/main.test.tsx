import { describe, it, expect, vi } from "vitest";

const mockRender = vi.fn();
vi.mock("react-dom/client", () => ({
  createRoot: vi.fn(() => ({ render: mockRender })),
}));

vi.mock("@/App", () => ({
  default: () => <div>App</div>,
}));

describe("main", () => {
  it("renders App without crashing", async () => {
    await import("../main");
    expect(mockRender).toHaveBeenCalled();
  });
});
