import { type ReactNode } from "react";
import { MemoryRouter } from "react-router-dom";
import { render, type RenderOptions } from "@testing-library/react";
import { I18nProvider } from "@/i18n";
import { AuthContext, type AuthState } from "@/core/auth/auth.provider";

const defaultAuthState: AuthState = {
  session: null,
  user: null,
  loading: false,
  isAdmin: false,
  logout: async () => {},
};

function TestWrapper({
  children,
  authState = defaultAuthState,
  initialEntries = ["/"],
}: {
  children: ReactNode;
  authState?: AuthState;
  initialEntries?: string[];
}) {
  return (
    <MemoryRouter initialEntries={initialEntries}>
      <I18nProvider>
        <AuthContext.Provider value={authState}>
          {children}
        </AuthContext.Provider>
      </I18nProvider>
    </MemoryRouter>
  );
}

function renderWithProviders(
  ui: ReactNode,
  options?: Omit<RenderOptions, "wrapper"> & {
    authState?: AuthState;
    initialEntries?: string[];
  }
) {
  const { authState, initialEntries, ...renderOptions } = options ?? {};
  return render(ui, {
    wrapper: ({ children }) => (
      <TestWrapper authState={authState} initialEntries={initialEntries}>
        {children}
      </TestWrapper>
    ),
    ...renderOptions,
  });
}

export { TestWrapper, renderWithProviders, defaultAuthState };
export type { AuthState };
