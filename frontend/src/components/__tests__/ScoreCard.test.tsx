import { render, screen, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import ScoreCard from '../ScoreCard';

describe('ScoreCard Component', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it('renders with initial values and updates score after timeout', async () => {
    render(<ScoreCard score={85} label="Match Score" size={150} />);

    // Renders the label
    expect(screen.getByText('Match Score')).toBeInTheDocument();

    // Initially displays 0%
    expect(screen.getByText('0%')).toBeInTheDocument();

    // Advance timers to trigger the setTimeout in ScoreCard
    act(() => {
      vi.advanceTimersByTime(300);
    });

    // Now it should display 85%
    expect(screen.getByText('85%')).toBeInTheDocument();
  });

  it('applies correct success color for scores >= 80', () => {
    const { container } = render(<ScoreCard score={85} label="High Score" />);
    // The animated circle is the second one
    const animatedCircle = container.querySelector('svg motion\\.circle, svg circle:nth-child(2)');
    expect(animatedCircle).toHaveAttribute('stroke', 'hsl(var(--success))');
  });

  it('applies correct warning color for scores >= 50 and < 80', () => {
    const { container } = render(<ScoreCard score={60} label="Medium Score" />);
    const animatedCircle = container.querySelector('svg motion\\.circle, svg circle:nth-child(2)');
    expect(animatedCircle).toHaveAttribute('stroke', 'hsl(var(--warning))');
  });

  it('applies correct destructive color for scores < 50', () => {
    const { container } = render(<ScoreCard score={30} label="Low Score" />);
    const animatedCircle = container.querySelector('svg motion\\.circle, svg circle:nth-child(2)');
    expect(animatedCircle).toHaveAttribute('stroke', 'hsl(var(--destructive))');
  });
});
