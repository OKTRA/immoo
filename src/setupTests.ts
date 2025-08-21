import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock des composants de navigation
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    Navigate: ({ to }: { to: string }) => <div data-testid="navigate" data-to={to}>Navigate to {to}</div>,
    useNavigate: () => vi.fn(),
    useLocation: () => ({ pathname: '/', search: '', hash: '', state: null }),
    Link: ({ to, children, ...props }: any) => <a href={to} {...props}>{children}</a>,
    Outlet: () => <div data-testid="outlet">Outlet</div>
  };
});

// Mock de Supabase
vi.mock('@/lib/supabase', () => ({
  supabase: {
    auth: {
      getSession: vi.fn(),
      onAuthStateChange: vi.fn(() => ({ data: { subscription: { unsubscribe: vi.fn() } } })),
      signOut: vi.fn()
    },
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn(() => ({ data: null, error: null })),
          order: vi.fn(() => ({ limit: vi.fn(() => ({ data: [], error: null })) }))
        })),
        update: vi.fn(() => ({ eq: vi.fn(() => ({ data: null, error: null })) })),
        insert: vi.fn(() => ({ select: vi.fn(() => ({ single: vi.fn(() => ({ data: null, error: null })) })) })),
        delete: vi.fn(() => ({ eq: vi.fn(() => ({ data: null, error: null })) }))
      }))
    }))
  }
}));

// Mock des services
vi.mock('@/services/authService', () => ({
  getUserProfile: vi.fn(),
  signInWithEmail: vi.fn(),
  signUpWithEmail: vi.fn(),
  signOut: vi.fn()
}));

// Mock des composants UI
vi.mock('@/components/ui/LoadingSpinner', () => ({
  default: ({ text }: { text?: string }) => <div data-testid="loading-spinner">{text || 'Loading...'}</div>
}));

// Configuration globale des tests
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // deprecated
    removeListener: vi.fn(), // deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock des événements personnalisés
window.dispatchEvent = vi.fn();
window.addEventListener = vi.fn();
window.removeEventListener = vi.fn();
