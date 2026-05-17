import { describe, it, expect, vi } from "vitest";
import { screen } from "@testing-library/react";
import { render } from "@testing-library/react";

vi.mock("@/pods/home/components/navbar.component", () => ({
  Navbar: () => <div data-testid="navbar" />,
}));

vi.mock("@/components/PendingInvitationsBanner", () => ({
  PendingInvitationsBanner: () => <div data-testid="pending-invitations-banner" />,
}));

import { AppLayout } from "../app.layout";

describe("AppLayout", () => {
  it("renders Navbar and PendingInvitationsBanner", () => {
    render(
      <AppLayout>
        <div data-testid="child" />
      </AppLayout>
    );
    expect(screen.getByTestId("navbar")).toBeTruthy();
    expect(screen.getByTestId("pending-invitations-banner")).toBeTruthy();
  });

  it("renders children", () => {
    render(
      <AppLayout>
        <div data-testid="child" />
      </AppLayout>
    );
    expect(screen.getByTestId("child")).toBeTruthy();
  });
});
