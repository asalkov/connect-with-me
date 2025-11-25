import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { LoginForm } from './LoginForm';
import authReducer from '../store/slices/authSlice';

const createMockStore = (initialState = {}) => {
  return configureStore({
    reducer: {
      auth: authReducer,
    },
    preloadedState: {
      auth: {
        user: null,
        accessToken: null,
        refreshToken: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
        ...initialState,
      },
    },
  });
};

describe('LoginForm', () => {
  it('renders login form', () => {
    const store = createMockStore();
    render(
      <Provider store={store}>
        <LoginForm />
      </Provider>,
    );

    expect(screen.getByText('Welcome Back')).toBeInTheDocument();
    expect(screen.getByLabelText(/email or username/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
  });

  it('shows validation errors for empty fields', async () => {
    const store = createMockStore();
    const user = userEvent.setup();

    render(
      <Provider store={store}>
        <LoginForm />
      </Provider>,
    );

    const submitButton = screen.getByRole('button', { name: /sign in/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/email or username is required/i)).toBeInTheDocument();
      expect(screen.getByText(/password is required/i)).toBeInTheDocument();
    });
  });

  it('toggles password visibility', async () => {
    const store = createMockStore();
    const user = userEvent.setup();

    render(
      <Provider store={store}>
        <LoginForm />
      </Provider>,
    );

    const passwordInput = screen.getByLabelText(/password/i);
    expect(passwordInput).toHaveAttribute('type', 'password');

    const toggleButton = screen.getByRole('button', { name: '' });
    await user.click(toggleButton);

    expect(passwordInput).toHaveAttribute('type', 'text');
  });

  it('displays error message from store', () => {
    const store = createMockStore({ error: 'Invalid credentials' });

    render(
      <Provider store={store}>
        <LoginForm />
      </Provider>,
    );

    expect(screen.getByText('Invalid credentials')).toBeInTheDocument();
  });

  it('shows loading state', () => {
    const store = createMockStore({ isLoading: true });

    render(
      <Provider store={store}>
        <LoginForm />
      </Provider>,
    );

    expect(screen.getByRole('button', { name: /signing in/i })).toBeDisabled();
  });

  it('calls onSwitchToRegister when sign up link is clicked', async () => {
    const store = createMockStore();
    const onSwitchToRegister = vi.fn();
    const user = userEvent.setup();

    render(
      <Provider store={store}>
        <LoginForm onSwitchToRegister={onSwitchToRegister} />
      </Provider>,
    );

    const signUpLink = screen.getByText(/sign up/i);
    await user.click(signUpLink);

    expect(onSwitchToRegister).toHaveBeenCalled();
  });
});
