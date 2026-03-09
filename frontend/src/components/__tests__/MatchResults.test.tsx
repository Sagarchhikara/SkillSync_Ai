import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import MatchResults from '../MatchResults';
import { useAuth } from '@/context/AuthContext';
import api from '@/services/api';
import { toast } from 'sonner';

vi.mock('@/context/AuthContext', () => ({
  useAuth: vi.fn(),
}));

vi.mock('@/services/api', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
  },
}));

vi.mock('sonner', () => ({
  toast: {
    error: vi.fn(),
    success: vi.fn(),
  },
}));

describe('MatchResults Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (useAuth as any).mockReturnValue({
      user: { _id: '123' },
    });
  });

  const renderComponent = () => render(<MatchResults />);

  it('fetches and displays ranked jobs on mount', async () => {
    const mockJobs = [
      {
        job: { _id: 'j1', title: 'Frontend Engineer', company: 'Tech Inc', minExperience: 2 },
        matchDetails: {
          matchPercentage: 85,
          matchedSkills: ['react'],
          missingSkills: ['typescript'],
        },
      },
    ];

    (api.get as any).mockResolvedValueOnce({ data: { data: mockJobs } });

    renderComponent();

    // Loading State
    expect(api.get).toHaveBeenCalledWith('/match/auto/123');
    
    await waitFor(() => {
      expect(screen.getByText('Frontend Engineer')).toBeInTheDocument();
      expect(screen.getByText('Tech Inc')).toBeInTheDocument();
      expect(screen.getByText('react')).toBeInTheDocument();
      expect(screen.getByText('typescript')).toBeInTheDocument();
      expect(screen.getByText('85%')).toBeInTheDocument();
    });
  });

  it('shows error message if no resume is found', async () => {
    (api.get as any).mockRejectedValueOnce({
      response: { data: { message: 'No resume found.' } },
    });

    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('No resume found.')).toBeInTheDocument();
    });
  });

  it('saves job when save button is clicked', async () => {
    const mockJobs = [
      {
        job: { _id: 'j1', title: 'Backend Dev', company: 'Tech Inc', minExperience: 0 },
        matchDetails: { matchPercentage: 90, matchedSkills: ['node'], missingSkills: [] },
      },
    ];

    (api.get as any).mockResolvedValueOnce({ data: { data: mockJobs } });
    (api.post as any).mockResolvedValueOnce({});

    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('Backend Dev')).toBeInTheDocument();
    });

    const saveBtn = screen.getByTitle('Save Job');
    fireEvent.click(saveBtn);

    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith('/users/123/jobs/j1');
      expect(toast.success).toHaveBeenCalledWith('Job saved successfully!');
    });
  });
});
