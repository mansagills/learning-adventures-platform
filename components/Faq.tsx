'use client';

import { useState } from 'react';
import Container from './Container';
import Button from './Button';
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
      question: 'What exactly is Learning Adventures?',
      answer:
        'Learning Adventures is a 2D pixel game world where kids explore a living campus, go on quests, and earn XP — with math, science, reading, and more woven into every challenge. Think Adventure Academy meets an open-world RPG.',
    },
    {
      id: 'age-range',
      question: 'What ages is it for?',
      answer:
        'The world is designed for kids ages 5–12 (grades K–5). Quests and challenges automatically scale to match your child\'s level, so a 6-year-old and a 12-year-old can both be in the world at the same time.',
    },
    {
      id: 'learning',
      question: 'Does my kid actually learn anything, or is it just a game?',
      answer:
        'Both — by design. Every quest, mini-game, and challenge is built around real curriculum standards (math, science, reading, history). Kids are solving real problems; they just don\'t realize it because they\'re trying to beat the dungeon.',
    },
    {
      id: 'progress',
      question: "How do I know what my child is doing in the world?",
      answer:
        'Parents get a dashboard showing XP earned, quests completed, subjects covered, and time spent. You can see exactly which skills your child is working on without interrupting their game.',
    },
    {
      id: 'pricing',
      question: 'How much does it cost?',
      answer:
        'You can start for free — no credit card needed. Premium plans unlock the full world, all quest lines, and exclusive gear. We\'ll always keep a meaningful free tier so every kid can explore.',
    },
    {
      id: 'privacy',
      question: "Is it safe for kids?",
      answer:
        'Absolutely. We are fully COPPA-compliant, never share personal data, and the world is moderated. Kids use display names — never real names — and parents have full control over their child\'s account.',
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
      number: 'text-pg-pink',
      icon: 'bg-pg-pink',
    },
    yellow: {
      number: 'text-pg-yellow',
      icon: 'bg-pg-yellow',
    },
    mint: {
      number: 'text-pg-mint',
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
            Questions about the world? We've got answers. Can't find what you're
            looking for? Reach out to our team.
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
              <span className="text-lg">💬</span>
            </div>

            <h3 className="font-outfit text-2xl font-extrabold text-foreground mb-3">
              Still have questions?
            </h3>
            <p className="font-plus-jakarta text-foreground/70 mb-6">
              Our team is here to help you and your adventurer get the most out
              of the world.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button variant="candy" size="md">
                <span className="w-5 h-5 bg-white/20 rounded-full flex items-center justify-center mr-2">
                  📧
                </span>
                Contact Support
              </Button>
              <Button variant="outline-pop" size="md">
                Schedule a Demo
              </Button>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
