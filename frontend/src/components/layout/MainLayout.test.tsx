import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { MainLayout } from './MainLayout';
import authReducer from '../../store/slices/authSlice';

// Mock the child components
vi.mock('./AppHeader', () => ({
  AppHeader: () => <div data-testid="app-header">Header</div>,
}));

vi.mock('./Sidebar', () => ({
  Sidebar: () => <div data-testid="sidebar">Sidebar</div>,
}));

vi.mock('./MobileDrawer', () => ({
  MobileDrawer: () => <div data-testid="mobile-drawer">Mobile Drawer</div>,
}));

const mockStore = configureStore({
  reducer: {
    auth: authReducer,
  },
  preloadedState: {
    auth: {
      user: {
        id: '1',
        username: 'testuser',
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      accessToken: 'mock-token',
      refreshToken: 'mock-refresh-token',
      isAuthenticated: true,
      isLoading: false,
      error: null,
    },
  },
});

describe('MainLayout', () => {
  const renderWithProviders = (component: React.ReactElement) => {
    return render(
      <Provider store={mockStore}>
        <BrowserRouter>
          {component}
        </BrowserRouter>
      </Provider>
    );
  };

  it('renders children content', () => {
    renderWithProviders(
      <MainLayout>
        <div data-testid="test-content">Test Content</div>
      </MainLayout>
    );

    expect(screen.getByTestId('test-content')).toBeInTheDocument();
    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });

  it('renders header component', () => {
    renderWithProviders(
      <MainLayout>
        <div>Content</div>
      </MainLayout>
    );

    expect(screen.getByTestId('app-header')).toBeInTheDocument();
  });

  it('applies correct layout styles', () => {
    const { container } = renderWithProviders(
      <MainLayout>
        <div>Content</div>
      </MainLayout>
    );

    const mainBox = container.querySelector('[component="main"]');
    expect(mainBox).toBeInTheDocument();
  });
});
