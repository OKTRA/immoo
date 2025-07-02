import { AuthState, AuthAction } from '@/types/auth';

// État initial
export const initialAuthState: AuthState = {
  status: 'loading',
  user: null,
  profile: null,
  isLoading: true,
  error: null,
  initialized: false,
};

// Reducer pour gérer les changements d'état
export const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.payload,
        status: action.payload ? 'loading' : state.status,
        error: action.payload ? null : state.error, // Clear error when loading
      };

    case 'SET_AUTHENTICATED':
      return {
        ...state,
        status: 'authenticated',
        user: action.payload.user,
        profile: action.payload.profile,
        isLoading: false,
        error: null,
        initialized: true,
      };

    case 'SET_UNAUTHENTICATED':
      return {
        ...state,
        status: 'unauthenticated',
        user: null,
        profile: null,
        isLoading: false,
        error: null,
        initialized: true,
      };

    case 'SET_ERROR':
      return {
        ...state,
        status: 'error',
        error: action.payload,
        isLoading: false,
        initialized: true,
      };

    case 'SET_INITIALIZED':
      return {
        ...state,
        initialized: action.payload,
      };

    case 'UPDATE_PROFILE':
      return {
        ...state,
        profile: action.payload,
      };

    default:
      return state;
  }
}; 