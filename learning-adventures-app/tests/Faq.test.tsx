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

    expect(screen.getByText('Frequently Asked Questions')).toBeInTheDocument();
    expect(screen.getByText('Is Learning Adventures accessible for children with special needs?')).toBeInTheDocument();
    expect(screen.getByText('How much does Learning Adventures cost?')).toBeInTheDocument();
    expect(screen.getByText('Can my child use Learning Adventures without an internet connection?')).toBeInTheDocument();
    expect(screen.getByText('How do I track my child\'s learning progress?')).toBeInTheDocument();
    expect(screen.getByText('How does the AI personalization work?')).toBeInTheDocument();
    expect(screen.getByText('How do you protect my child\'s privacy and data?')).toBeInTheDocument();
  });

  it('expands and collapses FAQ items when clicked', async () => {
    render(<Faq />);

    const firstQuestion = screen.getByText('Is Learning Adventures accessible for children with special needs?');
    const firstButton = firstQuestion.closest('button');

    expect(firstButton).toHaveAttribute('aria-expanded', 'false');

    // Click to expand
    fireEvent.click(firstButton!);

    await waitFor(() => {
      expect(firstButton).toHaveAttribute('aria-expanded', 'true');
    });

    expect(screen.getByText(/Yes! Our platform is designed with accessibility/)).toBeInTheDocument();

    // Click to collapse
    fireEvent.click(firstButton!);

    await waitFor(() => {
      expect(firstButton).toHaveAttribute('aria-expanded', 'false');
    });
  });

  it('tracks analytics when FAQ items are opened', async () => {
    render(<Faq />);

    const firstQuestion = screen.getByText('Is Learning Adventures accessible for children with special needs?');
    const firstButton = firstQuestion.closest('button');

    fireEvent.click(firstButton!);

    await waitFor(() => {
      expect(analytics.openFAQ).toHaveBeenCalledWith('Is Learning Adventures accessible for children with special needs?');
    });
  });

  it('has proper ARIA attributes for accessibility', () => {
    render(<Faq />);

    const buttons = screen.getAllByRole('button');

    buttons.forEach((button, index) => {
      expect(button).toHaveAttribute('aria-expanded');
      expect(button).toHaveAttribute('aria-controls');
      expect(button).toHaveAttribute('id');

      const ariaControls = button.getAttribute('aria-controls');
      const correspondingPanel = document.getElementById(ariaControls!);
      expect(correspondingPanel).toBeInTheDocument();
    });
  });

  it('supports keyboard navigation', () => {
    render(<Faq />);

    const firstButton = screen.getAllByRole('button')[0];

    firstButton.focus();
    expect(firstButton).toHaveFocus();

    // Test Enter key
    fireEvent.keyDown(firstButton, { key: 'Enter', code: 'Enter' });
    expect(firstButton).toHaveAttribute('aria-expanded', 'true');

    // Test Space key
    fireEvent.keyDown(firstButton, { key: ' ', code: 'Space' });
    expect(firstButton).toHaveAttribute('aria-expanded', 'false');
  });

  it('allows multiple FAQ items to be open simultaneously', async () => {
    render(<Faq />);

    const buttons = screen.getAllByRole('button');
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
    expect(screen.getByText('Contact Support')).toBeInTheDocument();
    expect(screen.getByText('Schedule a Demo')).toBeInTheDocument();
  });

  it('has proper focus management', () => {
    render(<Faq />);

    const buttons = screen.getAllByRole('button');

    // All FAQ buttons should be focusable
    buttons.slice(0, 6).forEach(button => {
      expect(button).not.toHaveAttribute('tabindex', '-1');
    });
  });
});
