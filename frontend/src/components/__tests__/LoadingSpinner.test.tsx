import { render } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import LoadingSpinner from '../LoadingSpinner';

describe('LoadingSpinner Component', () => {
  it('renders correctly with default props', () => {
    const { container } = render(<LoadingSpinner />);
    const svg = container.querySelector('svg');
    expect(svg).toBeInTheDocument();
    expect(svg).toHaveClass('animate-spin');
    expect(svg).toHaveClass('text-primary');
    // Lucide sets width and height to the size prop (default 24)
    expect(svg).toHaveAttribute('width', '24');
    expect(svg).toHaveAttribute('height', '24');
  });

  it('renders correctly with custom props', () => {
    const { container } = render(<LoadingSpinner size={48} className="custom-class" />);
    const svg = container.querySelector('svg');
    expect(svg).toBeInTheDocument();
    expect(svg).toHaveClass('animate-spin');
    expect(svg).toHaveClass('text-primary');
    expect(svg).toHaveClass('custom-class');
    expect(svg).toHaveAttribute('width', '48');
    expect(svg).toHaveAttribute('height', '48');
  });
});
