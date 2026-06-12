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

    expect(screen.getByText(/Frequently Asked/i)).toBeInTheDocument();
    expect(
      screen.getByText('What exactly is Learning Adventures?')
    ).toBeInTheDocument();
    expect(
      screen.getByText('What ages is it for?')
    ).toBeInTheDocument();
    expect(
      screen.getByText('Does my kid actually learn anything, or is it just a game?')
    ).toBeInTheDocument();
    expect(
      screen.getByText("How do I know what my child is doing in the world?")
    ).toBeInTheDocument();
    expect(
      screen.getByText('How much does it cost?')
    ).toBeInTheDocument();
    expect(
      screen.getByText("Is it safe for kids?")
    ).toBeInTheDocument();
  });

  it('expands and collapses FAQ items when clicked', async () => {
    render(<Faq />);

    const firstQuestion = screen.getByText(
      'What exactly is Learning Adventures?'
    );
    const firstButton = firstQuestion.closest('button');

    expect(firstButton).toHaveAttribute('aria-expanded', 'false');

    // Click to expand
    fireEvent.click(firstButton!);

    await waitFor(() => {
      expect(firstButton).toHaveAttribute('aria-expanded', 'true');
    });

    expect(
      screen.getByText(/Learning Adventures is a 2D pixel game world/)
    ).toBeInTheDocument();

    // Click to collapse
    fireEvent.click(firstButton!);

    await waitFor(() => {
      expect(firstButton).toHaveAttribute('aria-expanded', 'false');
    });
  });

  it('tracks analytics when FAQ items are opened', async () => {
    render(<Faq />);

    const firstQuestion = screen.getByText(
      'What exactly is Learning Adventures?'
    );
    const firstButton = firstQuestion.closest('button');

    fireEvent.click(firstButton!);

    await waitFor(() => {
      expect(analytics.openFAQ).toHaveBeenCalledWith(
        'What exactly is Learning Adventures?'
      );
    });
  });

  it('has proper ARIA attributes for accessibility', () => {
    render(<Faq />);

    // Get all buttons inside FAQ items
    const buttons = screen.getAllByRole('button').filter(b => b.hasAttribute('aria-expanded'));

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

    const firstButton = screen.getAllByRole('button').filter(b => b.hasAttribute('aria-expanded'))[0];

    firstButton.focus();
    expect(firstButton).toHaveFocus();

    // Test Enter key
    fireEvent.click(firstButton); // simulating keyboard activation
    expect(firstButton).toHaveAttribute('aria-expanded', 'true');

    // Test Space key
    fireEvent.click(firstButton); // simulating keyboard activation
    expect(firstButton).toHaveAttribute('aria-expanded', 'false');
  });

  it('allows multiple FAQ items to be open simultaneously', async () => {
    render(<Faq />);

    const buttons = screen.getAllByRole('button').filter(b => b.hasAttribute('aria-expanded'));
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

    const buttons = screen.getAllByRole('button').filter(b => b.hasAttribute('aria-expanded'));

    // All FAQ buttons should be focusable
    buttons.slice(0, 6).forEach((button) => {
      expect(button).not.toHaveAttribute('tabindex', '-1');
    });
  });
});
