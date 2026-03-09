import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import Login from '../Login';
import { useAuth } from '@/context/AuthContext';
import api from '@/services/api';

vi.mock('@/context/AuthContext', () => ({
  useAuth: vi.fn(),
}));

vi.mock('@/services/api', () => ({
  default: {
    post: vi.fn(),
  },
}));

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

// Mock sonner toast
vi.mock('sonner', () => ({
  toast: {
    error: vi.fn(),
    success: vi.fn(),
  },
}));

import { toast } from 'sonner';

describe('Login Page', () => {
  const mockLogin = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (useAuth as any).mockReturnValue({ login: mockLogin });
  });

  const renderComponent = () => {
    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    );
  };

  it('renders login form elements', () => {
    renderComponent();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
  });

  it('shows error if fields are empty on submit', async () => {
    renderComponent();
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));

    expect(toast.error).toHaveBeenCalledWith('Please fill in all fields');
    expect(api.post).not.toHaveBeenCalled();
  });

  it('calls API and logs in on successful submission', async () => {
    (api.post as any).mockResolvedValueOnce({
      data: { token: 'fake-token', user: { id: '1', name: 'User' } },
    });

    renderComponent();
    
    // Fill the form
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'password123' } });
    
    // Submit
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));

    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith('/auth/login', {
        email: 'test@example.com',
        password: 'password123',
      });
      expect(mockLogin).toHaveBeenCalledWith('fake-token', { id: '1', name: 'User' });
      expect(toast.success).toHaveBeenCalledWith('Welcome back!');
      expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
    });
  });

  it('shows error toast on API failure', async () => {
    (api.post as any).mockRejectedValueOnce({
      response: { data: { message: 'Invalid credentials' } },
    });

    renderComponent();
    
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'wrongpass' } });
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Invalid credentials');
      expect(mockLogin).not.toHaveBeenCalled();
      expect(mockNavigate).not.toHaveBeenCalled();
    });
  });
});
