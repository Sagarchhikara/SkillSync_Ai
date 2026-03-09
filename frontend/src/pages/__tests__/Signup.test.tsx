import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import Signup from '../Signup';
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

vi.mock('sonner', () => ({
  toast: {
    error: vi.fn(),
    success: vi.fn(),
  },
}));

import { toast } from 'sonner';

describe('Signup Page', () => {
  const mockLogin = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (useAuth as any).mockReturnValue({ login: mockLogin });
  });

  const renderComponent = () => {
    render(
      <MemoryRouter>
        <Signup />
      </MemoryRouter>
    );
  };

  it('renders signup form elements', () => {
    renderComponent();
    expect(screen.getByLabelText(/name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^password/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/confirm password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /create account/i })).toBeInTheDocument();
  });

  it('shows error if passwords do not match', async () => {
    renderComponent();
    
    // Fill the form
    fireEvent.change(screen.getByLabelText(/name/i), { target: { value: 'John Doe' } });
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'john@example.com' } });
    fireEvent.change(screen.getByLabelText(/^password/i), { target: { value: 'password123' } });
    fireEvent.change(screen.getByLabelText(/confirm password/i), { target: { value: 'password456' } });
    
    fireEvent.click(screen.getByRole('button', { name: /create account/i }));

    expect(toast.error).toHaveBeenCalledWith('Passwords do not match');
    expect(api.post).not.toHaveBeenCalled();
  });

  it('calls API and logs in on successful submission', async () => {
    (api.post as any).mockResolvedValueOnce({
      data: { token: 'fake-jwt-token', user: { id: '2', name: 'Jane Doe' } },
    });

    renderComponent();
    
    // Fill the form
    fireEvent.change(screen.getByLabelText(/name/i), { target: { value: 'Jane Doe' } });
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'jane@example.com' } });
    fireEvent.change(screen.getByLabelText(/^password/i), { target: { value: 'securepass123' } });
    fireEvent.change(screen.getByLabelText(/confirm password/i), { target: { value: 'securepass123' } });
    
    fireEvent.click(screen.getByRole('button', { name: /create account/i }));

    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith('/auth/signup', {
        name: 'Jane Doe',
        email: 'jane@example.com',
        password: 'securepass123',
      });
      expect(mockLogin).toHaveBeenCalledWith('fake-jwt-token', { id: '2', name: 'Jane Doe' });
      expect(toast.success).toHaveBeenCalledWith('Account created successfully!');
      expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
    });
  });
});
