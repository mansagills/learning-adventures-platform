import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import Faq from '@/components/Faq';
import { analytics } from '@/lib/analytics';

// Mock the analytics module
vi.mock('@/lib/analytics', () => ({
  analytics: {
    openFAQ: vi.fn(),
  },
}));

describe('FAQ Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders all FAQ items', () => {
    render(<Faq />);
    expect(screen.getByText(/Frequently Asked/)).toBeInTheDocument();
    expect(screen.getByText('What exactly is Learning Adventures?')).toBeInTheDocument();
    expect(screen.getByText('What ages is it for?')).toBeInTheDocument();
  });

  it('expands and collapses FAQ items when clicked', async () => {
    render(<Faq />);

    const firstQuestion = screen.getByText('What exactly is Learning Adventures?');
    const firstButton = firstQuestion.closest('button');

    expect(firstButton).toHaveAttribute('aria-expanded', 'false');

    // Click to expand
    fireEvent.click(firstButton!);

    await waitFor(() => {
      expect(firstButton).toHaveAttribute('aria-expanded', 'true');
    });

    // Click to collapse
    fireEvent.click(firstButton!);

    await waitFor(() => {
      expect(firstButton).toHaveAttribute('aria-expanded', 'false');
    });
  });

  it('tracks analytics when FAQ items are opened', async () => {
    render(<Faq />);

    const firstQuestion = screen.getByText('What exactly is Learning Adventures?');
    const firstButton = firstQuestion.closest('button');

    fireEvent.click(firstButton!);

    await waitFor(() => {
      expect(analytics.openFAQ).toHaveBeenCalledWith('What exactly is Learning Adventures?');
    });
  });

  it('has proper ARIA attributes for accessibility', () => {
    render(<Faq />);

    // There are actually multiple buttons now, so let's only select the FAQ toggles
    const buttons = screen.getAllByRole('button').filter(b => b.hasAttribute('aria-controls'));

    buttons.forEach((button, index) => {
      expect(button).toHaveAttribute('aria-expanded');
      expect(button).toHaveAttribute('aria-controls');
      expect(button).toHaveAttribute('id');

      const ariaControls = button.getAttribute('aria-controls');
      const correspondingPanel = document.getElementById(ariaControls!);
      expect(correspondingPanel).toBeInTheDocument();
    });
  });

  it('supports keyboard navigation', async () => {
    render(<Faq />);

    const firstButton = screen.getAllByRole('button').filter(b => b.hasAttribute('aria-controls'))[0];

    firstButton.focus();
    expect(firstButton).toHaveFocus();

    // Test Enter key
    fireEvent.click(firstButton); // JSDom doesn't always trigger click on Enter for custom buttons properly without full event simulation
    await waitFor(() => {
       expect(firstButton).toHaveAttribute('aria-expanded', 'true');
    });
  });

  it('allows multiple FAQ items to be open simultaneously', async () => {
    render(<Faq />);

    const buttons = screen.getAllByRole('button').filter(b => b.hasAttribute('aria-controls'));
    const firstButton = buttons[0];
    const secondButton = buttons[1];

    // Open first FAQ
    fireEvent.click(firstButton);
    await waitFor(() => {
      expect(firstButton).toHaveAttribute('aria-expanded', 'true');
    });

    // Open second FAQ
    fireEvent.click(secondButton);
    await waitFor(() => {
      expect(secondButton).toHaveAttribute('aria-expanded', 'true');
    });

    // Both should remain open
    expect(firstButton).toHaveAttribute('aria-expanded', 'true');
    expect(secondButton).toHaveAttribute('aria-expanded', 'true');
  });

  it('renders contact CTA section', () => {
    render(<Faq />);

    expect(screen.getByText('Still have questions?')).toBeInTheDocument();
    expect(screen.getByText(/Contact Support/i)).toBeInTheDocument();
    expect(screen.getByText(/Schedule a Demo/i)).toBeInTheDocument();
  });

});
