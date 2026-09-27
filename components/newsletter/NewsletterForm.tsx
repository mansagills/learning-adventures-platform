'use client';

import { useId, useState, type FormEvent } from 'react';
import { cn } from '@/lib/utils';
import SiteIcon from '@/components/icons/SiteIcon';

interface NewsletterFormProps {
  /**
   * 'live' sends the sign-up to /api/newsletter. 'preview' only shows what
   * happens, and sends nothing (used until the email service is connected).
   */
  mode: 'live' | 'preview';
  className?: string;
}

type FormState =
  | { step: 'idle' }
  | { step: 'sending' }
  | { step: 'done' }
  | { step: 'error'; message: string };

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const inputClass =
  'mt-1 w-full rounded-2xl border-2 border-pg-border bg-white px-4 py-3 text-base font-medium text-ink-900 placeholder:text-ink-400 focus:outline-none focus:ring-4 focus:ring-pg-violet/30';

/**
 * Sign-up form for parents: email, optional first name, and a required
 * "I'm a parent or guardian" checkbox. It never asks about children.
 */
export default function NewsletterForm({
  mode,
  className,
}: NewsletterFormProps) {
  const id = useId();
  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [isParent, setIsParent] = useState(false);
  // A field real people never see. Bots that fill in every box fill this one
  // too, so those sign-ups can be ignored.
  const [website, setWebsite] = useState('');
  const [state, setState] = useState<FormState>({ step: 'idle' });

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!EMAIL_PATTERN.test(email.trim())) {
      setState({
        step: 'error',
        message: 'Please enter a valid email address.',
      });
      return;
    }
    if (!isParent) {
      setState({
        step: 'error',
        message:
          'Please confirm you are a parent or guardian, 18 or older. Our newsletter is for grown-ups only.',
      });
      return;
    }

    setState({ step: 'sending' });

    if (website || mode === 'preview') {
      // Preview (or a bot): show the thank-you message, send nothing.
      await new Promise((resolve) => setTimeout(resolve, 500));
      setState({ step: 'done' });
      return;
    }

    try {
      const response = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim(),
          firstName: firstName.trim(),
          isParent,
          website,
        }),
      });
      if (!response.ok) throw new Error(`Sign-up failed (${response.status})`);
      setState({ step: 'done' });
    } catch {
      setState({
        step: 'error',
        message:
          'Sorry, something went wrong and you were not signed up. Please try again in a minute.',
      });
    }
  }

  if (state.step === 'done') {
    return (
      <div
        role="status"
        className={cn(
          'rounded-3xl border-2 border-pg-border bg-white p-6 text-center shadow-pop md:p-8',
          className
        )}
      >
        <SiteIcon name="envelope" size={64} />
        <h2 className="mt-3 font-display text-2xl font-bold text-ink-900">
          Almost done! Check your inbox.
        </h2>
        <p className="mt-2 text-ink-700">
          We sent a message to <strong>{email.trim()}</strong>. Click the link
          inside to confirm your sign-up. If you don&apos;t see it in a few
          minutes, check your spam or promotions folder.
        </p>
        {mode === 'preview' && (
          <p className="mt-4 text-sm font-semibold text-sunshine-700">
            Preview only: nothing was sent.
          </p>
        )}
      </div>
    );
  }

  const sending = state.step === 'sending';
  const errorId = `${id}-error`;

  return (
    <form
      noValidate
      onSubmit={handleSubmit}
      aria-describedby={state.step === 'error' ? errorId : undefined}
      className={cn(
        'rounded-3xl border-2 border-pg-border bg-white p-6 shadow-pop md:p-8',
        className
      )}
    >
      <div className="grid gap-5">
        <label className="block">
          <span className="font-bold text-ink-900">Your email address</span>
          <input
            type="email"
            name="email"
            autoComplete="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="you@example.com"
            className={inputClass}
          />
        </label>

        <label className="block">
          <span className="font-bold text-ink-900">
            Your first name{' '}
            <span className="font-medium text-ink-600">(optional)</span>
          </span>
          <input
            type="text"
            name="firstName"
            autoComplete="given-name"
            maxLength={50}
            value={firstName}
            onChange={(event) => setFirstName(event.target.value)}
            className={inputClass}
          />
        </label>

        {/* Hidden from people and screen readers; see `website` above. */}
        <div
          aria-hidden="true"
          className="absolute -left-[9999px] h-px w-px overflow-hidden"
        >
          <label>
            Website
            <input
              type="text"
              name="website"
              tabIndex={-1}
              autoComplete="off"
              value={website}
              onChange={(event) => setWebsite(event.target.value)}
            />
          </label>
        </div>

        <label className="flex items-start gap-3">
          <input
            type="checkbox"
            name="isParent"
            required
            checked={isParent}
            onChange={(event) => setIsParent(event.target.checked)}
            className="mt-1 h-5 w-5 shrink-0 rounded border-2 border-pg-border accent-pg-violet"
          />
          <span className="text-ink-700">
            I&apos;m a parent or guardian, 18 or older, and I&apos;d like email
            updates from Learning Adventures.
          </span>
        </label>

        {state.step === 'error' && (
          <p
            id={errorId}
            role="alert"
            className="rounded-2xl border-2 border-coral-600 bg-coral-50 px-4 py-3 text-sm font-semibold text-coral-700"
          >
            {state.message}
          </p>
        )}

        <button
          type="submit"
          disabled={sending}
          className="inline-flex items-center justify-center gap-2 rounded-full border-2 border-pg-border bg-pg-violet px-6 py-3 text-lg font-bold text-white shadow-pop transition-all duration-200 hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-pop-hover focus:outline-none focus:ring-4 focus:ring-pg-violet/30 disabled:cursor-wait disabled:opacity-70"
        >
          <SiteIcon name="envelope" size={28} />
          {sending ? 'Signing you up…' : 'Sign me up'}
        </button>

        <p className="text-center text-sm text-ink-600">
          About once a month. Unsubscribe any time with one click.
        </p>
      </div>
    </form>
  );
}
