import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import ResumeUploader from '../ResumeUploader';
import { useAuth } from '@/context/AuthContext';
import api from '@/services/api';
import { toast } from 'sonner';

vi.mock('@/context/AuthContext', () => ({
  useAuth: vi.fn(),
}));

vi.mock('@/services/api', () => ({
  default: {
    post: vi.fn(),
  },
}));

vi.mock('sonner', () => ({
  toast: {
    error: vi.fn(),
    success: vi.fn(),
  },
}));

describe('ResumeUploader Component', () => {
  const mockRefreshUser = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (useAuth as any).mockReturnValue({
      user: { _id: '123' },
      refreshUser: mockRefreshUser,
    });
  });

  const renderComponent = () => render(<ResumeUploader />);

  it('renders upload area', () => {
    renderComponent();
    expect(screen.getByText('Drop your resume here or click to browse')).toBeInTheDocument();
  });

  it('shows error if no user is logged in during upload', async () => {
    (useAuth as any).mockReturnValue({ user: null });
    renderComponent();
    
    // Create a mock file
    const file = new File(['dummy content'], 'resume.pdf', { type: 'application/pdf' });
    const input = document.getElementById('file-input') as HTMLInputElement;

    fireEvent.change(input, { target: { files: [file] } });
    
    // Upload button appears
    const uploadBtn = screen.getByRole('button', { name: /upload/i });
    fireEvent.click(uploadBtn);

    expect(toast.error).toHaveBeenCalledWith('You must be logged in to upload a resume.');
  });

  it('uploads file and displays success result', async () => {
    const mockUploadResult = {
      _id: 'resume-1',
      userId: '123',
      skills: ['react', 'node'],
      education: [],
      createdAt: new Date().toISOString(),
    };

    (api.post as any).mockResolvedValueOnce({
      data: { data: mockUploadResult },
    });

    renderComponent();
    
    const file = new File(['dummy content'], 'resume.pdf', { type: 'application/pdf' });
    const input = document.getElementById('file-input') as HTMLInputElement;

    fireEvent.change(input, { target: { files: [file] } });
    
    const uploadBtn = screen.getByRole('button', { name: /upload/i });
    fireEvent.click(uploadBtn);

    await waitFor(() => {
      expect(api.post).toHaveBeenCalled();
      expect(mockRefreshUser).toHaveBeenCalled();
      expect(toast.success).toHaveBeenCalledWith('Resume uploaded successfully!');
      expect(screen.getByText('Resume processed successfully')).toBeInTheDocument();
      expect(screen.getByText('react')).toBeInTheDocument();
      expect(screen.getByText('node')).toBeInTheDocument();
    });
  });
});
