import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import DashboardSidebar from '../DashboardSidebar';
import { useAuth } from '@/context/AuthContext';

// Mock the AuthContext
vi.mock('@/context/AuthContext', () => ({
  useAuth: vi.fn(),
}));

// Mock useNavigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe('DashboardSidebar Component', () => {
  const mockLogout = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (useAuth as any).mockReturnValue({
      logout: mockLogout,
    });
  });

  it('renders all navigation links', () => {
    render(
      <MemoryRouter initialEntries={['/dashboard']}>
        <DashboardSidebar />
      </MemoryRouter>
    );

    expect(screen.getByText('SkillSync AI')).toBeInTheDocument();
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Upload Resume')).toBeInTheDocument();
    expect(screen.getByText('Jobs')).toBeInTheDocument();
    expect(screen.getByText('Job Matching')).toBeInTheDocument();
    expect(screen.getByText('Saved Jobs')).toBeInTheDocument();
  });

  it('highlights the active link based on current path', () => {
    render(
      <MemoryRouter initialEntries={['/dashboard/jobs']}>
        <DashboardSidebar />
      </MemoryRouter>
    );

    const jobsLink = screen.getByText('Jobs').closest('a');
    expect(jobsLink).toHaveClass('bg-primary/10');
    expect(jobsLink).toHaveClass('text-primary');

    const dashboardLink = screen.getByText('Dashboard').closest('a');
    expect(dashboardLink).not.toHaveClass('bg-primary/10');
  });

  it('calls logout and navigates to home when logout button is clicked', () => {
    render(
      <MemoryRouter initialEntries={['/dashboard']}>
        <DashboardSidebar />
      </MemoryRouter>
    );

    const logoutButton = screen.getByText('Logout');
    fireEvent.click(logoutButton);

    expect(mockLogout).toHaveBeenCalledTimes(1);
    expect(mockNavigate).toHaveBeenCalledWith('/');
  });
});
