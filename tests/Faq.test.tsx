import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import Faq from '@/components/demo/Faq';
import { analytics } from '@/lib/analytics';

// Mock the analytics module
vi.mock('@/lib/analytics', () => ({
  analytics: {
    openFAQ: vi.fn(),
  },
}));

/**
 * These assertions are driven off what the component renders rather than
 * hard-coded question text. The suite previously pinned seven exact marketing
 * strings ("Is Learning Adventures accessible for children with special
 * needs?" and friends); every one of them was later rewritten, so the whole
 * file failed on copy that no longer existed while the accordion behaviour it
 * was meant to protect was working fine. Reading the questions out of the DOM
 * keeps the behavioural coverage and stops copy edits breaking the build.
 */
const questionButtons = () =>
  screen.getAllByRole('button').filter((b) => b.hasAttribute('aria-expanded'));

describe('FAQ Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the heading and one expandable control per FAQ item', () => {
    render(<Faq />);

    // The heading is split across elements for the underline flourish, so match
    // on the accessible name rather than a single text node.
    expect(
      screen.getByRole('heading', { name: /frequently asked\s+questions/i })
    ).toBeInTheDocument();

    const buttons = questionButtons();
    expect(buttons.length).toBeGreaterThan(0);

    // Every control starts collapsed and carries non-empty question text.
    buttons.forEach((button) => {
      expect(button).toHaveAttribute('aria-expanded', 'false');
      expect(button.textContent?.trim()).not.toBe('');
    });
  });

  it('expands and collapses FAQ items when clicked', async () => {
    render(<Faq />);

    const firstButton = questionButtons()[0];
    const panelId = firstButton.getAttribute('aria-controls')!;

    expect(firstButton).toHaveAttribute('aria-expanded', 'false');

    fireEvent.click(firstButton);
    await waitFor(() => {
      expect(firstButton).toHaveAttribute('aria-expanded', 'true');
    });

    // The answer panel this control owns should now hold content.
    expect(document.getElementById(panelId)?.textContent?.trim()).not.toBe('');

    fireEvent.click(firstButton);
    await waitFor(() => {
      expect(firstButton).toHaveAttribute('aria-expanded', 'false');
    });
  });

  it('tracks analytics when FAQ items are opened', async () => {
    render(<Faq />);

    const firstButton = questionButtons()[0];

    fireEvent.click(firstButton);

    await waitFor(() => {
      expect(analytics.openFAQ).toHaveBeenCalledTimes(1);
    });

    // Whatever this item's question currently says is what should be reported.
    // Checked against the control's own text rather than a hard-coded string,
    // and against the button's full text because it also renders a number
    // prefix ("01") alongside the question.
    const reported = vi.mocked(analytics.openFAQ).mock.calls[0][0];
    expect(typeof reported).toBe('string');
    expect(reported).not.toBe('');
    expect(firstButton.textContent).toContain(reported);
  });

  it('has proper ARIA attributes for accessibility', () => {
    render(<Faq />);

    questionButtons().forEach((button) => {
      expect(button).toHaveAttribute('aria-expanded');
      expect(button).toHaveAttribute('aria-controls');
      expect(button).toHaveAttribute('id');

      const ariaControls = button.getAttribute('aria-controls');
      expect(document.getElementById(ariaControls!)).toBeInTheDocument();
    });
  });

  it('exposes each question as a focusable native button', () => {
    render(<Faq />);

    const buttons = questionButtons();

    // Native <button> elements are activated by Enter and Space by the browser
    // itself, so asserting on the element type and focusability is the part
    // this component is actually responsible for. (The old test fired a
    // synthetic keyDown and expected it to toggle, which jsdom does not
    // translate into a click.)
    buttons.forEach((button) => {
      expect(button.tagName).toBe('BUTTON');
      expect(button).not.toHaveAttribute('tabindex', '-1');
    });

    buttons[0].focus();
    expect(buttons[0]).toHaveFocus();
  });

  it('allows multiple FAQ items to be open simultaneously', async () => {
    render(<Faq />);

    const buttons = questionButtons();
    expect(buttons.length).toBeGreaterThan(1);

    fireEvent.click(buttons[0]);
    await waitFor(() => {
      expect(buttons[0]).toHaveAttribute('aria-expanded', 'true');
    });

    fireEvent.click(buttons[1]);
    await waitFor(() => {
      expect(buttons[1]).toHaveAttribute('aria-expanded', 'true');
    });

    expect(buttons[0]).toHaveAttribute('aria-expanded', 'true');
    expect(buttons[1]).toHaveAttribute('aria-expanded', 'true');
  });
});
