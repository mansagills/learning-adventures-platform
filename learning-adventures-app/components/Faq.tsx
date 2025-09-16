'use client';

import { useState } from 'react';
import Container from './Container';
import Icon from './Icon';
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
      id: 'accessibility',
      question: 'Is Learning Adventures accessible for children with special needs?',
      answer: 'Yes! Our platform is designed with accessibility as a core principle. We provide keyboard navigation, screen reader compatibility, high contrast modes, adjustable text sizes, and support for various assistive technologies. Our content is also designed to accommodate different learning styles and abilities.'
    },
    {
      id: 'pricing',
      question: 'How much does Learning Adventures cost?',
      answer: 'We offer flexible pricing plans starting at $9.99/month for individual families. We also have family plans for multiple children and institutional pricing for schools. All plans include a 14-day free trial with no credit card required, so you can explore our full library of content risk-free.'
    },
    {
      id: 'offline',
      question: 'Can my child use Learning Adventures without an internet connection?',
      answer: 'Many of our activities can be downloaded for offline use, perfect for travel or areas with limited internet connectivity. While some interactive features require an internet connection, we ensure that core learning content remains accessible offline through our mobile app.'
    },
    {
      id: 'progress',
      question: 'How do I track my child\'s learning progress?',
      answer: 'Our comprehensive parent dashboard provides detailed insights into your child\'s learning journey. You can view completed activities, skill progression, time spent learning, areas of strength, and topics that may need additional practice. Weekly progress reports are also available via email.'
    },
    {
      id: 'ai-features',
      question: 'How does the AI personalization work?',
      answer: 'Our adaptive learning AI analyzes your child\'s responses, learning pace, and preferences to customize content difficulty and presentation style. The system identifies knowledge gaps and provides targeted practice while ensuring your child remains appropriately challenged without becoming frustrated.'
    },
    {
      id: 'privacy',
      question: 'How do you protect my child\'s privacy and data?',
      answer: 'We take privacy seriously and are fully COPPA compliant. We never share personal information with third parties for marketing purposes, use bank-level encryption for all data, and parents have full control over their child\'s account settings. You can view our comprehensive privacy policy for complete details.'
    }
  ];

  const toggleItem = (itemId: string) => {
    const newOpenItems = new Set(openItems);

    if (newOpenItems.has(itemId)) {
      newOpenItems.delete(itemId);
    } else {
      newOpenItems.add(itemId);
      analytics.openFAQ(faqItems.find(item => item.id === itemId)?.question || itemId);
    }

    setOpenItems(newOpenItems);
  };

  const isOpen = (itemId: string) => openItems.has(itemId);

  return (
    <section id="faq" className="py-16 bg-gray-50">
      <Container>
        <div className="text-center mb-16">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-ink-900 mb-4">
            Frequently Asked Questions
          </h2>
          <p className="text-xl text-ink-600 max-w-3xl mx-auto">
            Have questions? We've got answers. If you don't find what you're looking for, feel free to contact our support team.
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="space-y-4">
            {faqItems.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden"
              >
                <button
                  onClick={() => toggleItem(item.id)}
                  className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-50 transition-colors duration-250 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-inset"
                  aria-expanded={isOpen(item.id)}
                  aria-controls={`faq-answer-${item.id}`}
                  id={`faq-question-${item.id}`}
                >
                  <span className="font-semibold text-ink-900 pr-4">
                    {item.question}
                  </span>
                  <div className="flex-shrink-0">
                    <Icon
                      name={isOpen(item.id) ? 'chevronUp' : 'chevronDown'}
                      size={20}
                      className={`text-brand-500 transition-transform duration-250 ${
                        isOpen(item.id) ? 'rotate-0' : 'rotate-0'
                      }`}
                    />
                  </div>
                </button>

                <div
                  id={`faq-answer-${item.id}`}
                  aria-labelledby={`faq-question-${item.id}`}
                  className={`transition-all duration-250 ease-in-out ${
                    isOpen(item.id)
                      ? 'max-h-96 opacity-100'
                      : 'max-h-0 opacity-0'
                  } overflow-hidden`}
                >
                  <div className="px-6 pb-4">
                    <p className="text-ink-600 leading-relaxed">
                      {item.answer}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Contact CTA */}
        <div className="text-center mt-12">
          <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
            <h3 className="font-display text-xl font-bold text-ink-900 mb-3">
              Still have questions?
            </h3>
            <p className="text-ink-600 mb-6">
              Our support team is here to help you get the most out of Learning Adventures.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="btn-primary">
                Contact Support
              </button>
              <button className="btn-secondary">
                Schedule a Demo
              </button>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}