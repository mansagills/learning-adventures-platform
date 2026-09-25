'use client';

import { useState } from 'react';
import Container from '@/components/Container';
import Link from 'next/link';
import { analytics } from '@/lib/analytics';

interface FAQItem {
  id: string;
  question: string;
  answer: string;
}

export default function Faq() {
  const [openItems, setOpenItems] = useState<Set<string>>(new Set());

  const faqItems: FAQItem[] = [
    {
      id: 'what-is-it',
      question: 'What is the Learning Adventures World demo?',
      answer:
        'It’s an early preview of the Learning Adventures World: a pixel-art Academy campus where kids walk between subject buildings, meet Jaylen and SPARK, follow the first story quests and play games. It’s a showcase of where we’re headed, and it’s still in development.',
    },
    {
      id: 'controls',
      question: 'How do I move around?',
      answer:
        'Use the arrow keys or W, A, S, D on a keyboard. Walk up to a character to talk to them, and walk into a building to see what’s inside. On a phone or tablet, use the on-screen joystick. The demo works best on a computer or tablet.',
    },
    {
      id: 'progress',
      question: 'Is my progress saved?',
      answer:
        'Your name, character and demo XP are saved in this browser on this device only. Nothing is sent to us, and there’s no account. Use the Restart button in the demo to start fresh at any time.',
    },
    {
      id: 'full-world',
      question: 'When is the full Learning Adventures World coming?',
      answer:
        'We’re building it now. The full world will have a season-long story, games in every building and more. There’s no release date yet, so keep an eye on this page.',
    },
    {
      id: 'games',
      question: 'Where are the regular games?',
      answer:
        'All of our mini-games are free to play right now on the Games page, with no sign-up. You can also read the stories behind them in our interactive ebooks.',
    },
  ];

  const toggleItem = (itemId: string) => {
    const newOpenItems = new Set(openItems);

    if (newOpenItems.has(itemId)) {
      newOpenItems.delete(itemId);
    } else {
      newOpenItems.add(itemId);
      analytics.openFAQ(
        faqItems.find((item) => item.id === itemId)?.question || itemId
      );
    }

    setOpenItems(newOpenItems);
  };

  const isOpen = (itemId: string) => openItems.has(itemId);

  const colors = [
    'violet',
    'pink',
    'yellow',
    'mint',
    'violet',
    'pink',
  ] as const;

  const colorClasses = {
    violet: {
      number: 'text-pg-violet',
      icon: 'bg-pg-violet',
    },
    pink: {
      number: 'text-coral-600',
      icon: 'bg-pg-pink',
    },
    yellow: {
      number: 'text-sunshine-700',
      icon: 'bg-pg-yellow',
    },
    mint: {
      number: 'text-grass-700',
      icon: 'bg-pg-mint',
    },
  };

  return (
    <section id="faq" className="py-20 bg-white relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-dot-grid opacity-10"></div>

      <Container>
        {/* Section Header */}
        <div className="text-center mb-12 relative z-10">
          <div className="inline-flex items-center gap-2 mb-4 px-4 py-2 bg-white border-2 border-pg-border rounded-full shadow-pop">
            <span className="text-lg">❓</span>
            <span className="text-sm font-bold text-foreground uppercase tracking-wide">
              FAQ
            </span>
          </div>

          <h2 className="font-outfit text-4xl md:text-5xl font-extrabold text-foreground mb-4">
            Frequently Asked{' '}
            <span className="relative inline-block">
              <span className="text-pg-violet">Questions</span>
              <svg
                className="absolute -bottom-1 left-0 w-full h-3"
                viewBox="0 0 200 8"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M2 4C20 2 40 6 60 4C80 2 100 6 120 4C140 2 160 6 180 4C190 3 198 4 198 4"
                  stroke="#F472B6"
                  strokeWidth="3"
                  strokeLinecap="round"
                />
              </svg>
            </span>
          </h2>

          <p className="font-plus-jakarta text-xl text-foreground/70 max-w-2xl mx-auto">
            Quick answers about the demo and what&apos;s coming next.
          </p>
        </div>

        {/* FAQ Items */}
        <div className="max-w-3xl mx-auto relative z-10">
          <div className="space-y-4">
            {faqItems.map((item, index) => {
              const color = colors[index % colors.length];
              const colorClass = colorClasses[color];

              return (
                <div
                  key={item.id}
                  className="card-sticker overflow-hidden hover:rotate-0 hover:scale-100"
                >
                  <button
                    onClick={() => toggleItem(item.id)}
                    className="w-full px-6 py-5 text-left flex items-center justify-between transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-pg-violet focus:ring-offset-2 rounded-xl"
                    aria-expanded={isOpen(item.id)}
                    aria-controls={`faq-answer-${item.id}`}
                    id={`faq-question-${item.id}`}
                  >
                    <div className="flex items-center gap-4 pr-4">
                      {/* Number prefix */}
                      <span
                        className={`font-outfit text-2xl font-extrabold ${colorClass.number}`}
                      >
                        {String(index + 1).padStart(2, '0')}
                      </span>
                      <span className="font-outfit font-bold text-foreground text-lg">
                        {item.question}
                      </span>
                    </div>
                    {/* Icon in colored circle */}
                    <div
                      className={`flex-shrink-0 w-10 h-10 ${colorClass.icon} border-2 border-pg-border rounded-full flex items-center justify-center shadow-pop transition-transform duration-200 ${isOpen(item.id) ? 'rotate-180' : ''}`}
                    >
                      <svg
                        className="w-5 h-5 text-white"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    </div>
                  </button>

                  <div
                    id={`faq-answer-${item.id}`}
                    aria-labelledby={`faq-question-${item.id}`}
                    className={`transition-all duration-300 ease-bounce ${
                      isOpen(item.id)
                        ? 'max-h-96 opacity-100'
                        : 'max-h-0 opacity-0'
                    } overflow-hidden`}
                  >
                    <div className="px-6 pb-5 pl-[88px]">
                      <p className="font-plus-jakarta text-foreground/70 leading-relaxed">
                        {item.answer}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Contact CTA Card */}
        <div className="mt-16 max-w-2xl mx-auto relative z-10">
          <div className="card-sticker-featured p-8 text-center relative">
            {/* Floating decoration */}
            <div className="absolute -top-4 -right-4 w-10 h-10 bg-pg-mint border-2 border-pg-border rounded-lg shadow-pop rotate-12 flex items-center justify-center">
              <span className="text-lg">🎮</span>
            </div>

            <h3 className="font-outfit text-2xl font-extrabold text-foreground mb-3">
              Looking for the games?
            </h3>
            <p className="font-plus-jakarta text-foreground/70 mb-6">
              Every mini-game is free to play today, and each interactive ebook
              tells the story behind them.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/games"
                className="inline-flex items-center justify-center gap-2 rounded-full border-2 border-pg-border bg-pg-violet px-6 py-3 font-bold text-white shadow-pop transition-all duration-200 ease-bounce hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-pop-hover focus:outline-none focus-visible:ring-4 focus-visible:ring-pg-violet/40"
              >
                🎮 Play the games
              </Link>
              <Link
                href="/books"
                className="inline-flex items-center justify-center gap-2 rounded-full border-2 border-pg-border bg-white px-6 py-3 font-bold text-ink-900 transition-all duration-200 hover:bg-pg-yellow focus:outline-none focus-visible:ring-4 focus-visible:ring-pg-violet/40"
              >
                📚 See the books
              </Link>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
