'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Container from './Container';
import Icon from './Icon';
import { analytics } from '@/lib/analytics';

export default function SocialProof() {
  const [currentTestimonial, setCurrentTestimonial] = useState(0);

  const testimonials = [
    {
      name: 'Sarah Mitchell',
      role: 'Mother of 8-year-old Emma',
      content: 'Learning Adventures has completely transformed how Emma approaches homework. She actually asks to do math now! The personalized lessons keep her engaged and the progress tracking helps me support her learning.',
      rating: 5,
      avatar: '/testimonial-1.jpg'
    },
    {
      name: 'David Chen',
      role: 'Father of 10-year-old Marcus',
      content: 'As a parent working from home, I needed something that could keep Marcus learning independently. The adaptive content is brilliant - it challenges him without frustrating him.',
      rating: 5,
      avatar: '/testimonial-2.jpg'
    },
    {
      name: 'Maria Rodriguez',
      role: 'Mother of 7-year-old Sofia',
      content: 'Sofia has learning differences, and most educational apps don\'t accommodate her needs. Learning Adventures\' accessibility features have been a game-changer for our family.',
      rating: 5,
      avatar: '/testimonial-3.jpg'
    }
  ];

  const partners = [
    { name: 'Education First', logo: '/partner-1.svg' },
    { name: 'Learning Alliance', logo: '/partner-2.svg' },
    { name: 'Future Schools', logo: '/partner-3.svg' },
    { name: 'STEM Education', logo: '/partner-4.svg' },
    { name: 'Digital Learning', logo: '/partner-5.svg' }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 5000);

    return () => clearInterval(timer);
  }, [testimonials.length]);

  const handleTestimonialChange = (index: number) => {
    setCurrentTestimonial(index);
    analytics.clickCTA('Testimonial Navigation', 'social-proof');
  };

  const handlePartnerClick = (partnerName: string) => {
    analytics.clickPartnerLogo(partnerName);
  };

  return (
    <section id="social-proof" className="py-16 bg-white">
      <Container>
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-ink-900 mb-4">
            Loved by Families Everywhere
          </h2>
          <p className="text-xl text-ink-600 max-w-3xl mx-auto mb-8">
            Join thousands of parents who have seen remarkable improvements in their children's learning engagement and outcomes.
          </p>

          {/* Aggregate Rating */}
          <div className="flex items-center justify-center space-x-2 mb-4">
            {[...Array(5)].map((_, i) => (
              <Icon key={i} name="star" size={24} className="text-sun-400 fill-current" />
            ))}
            <span className="text-2xl font-bold text-ink-900 ml-2">4.9</span>
            <span className="text-ink-600">out of 5 stars</span>
          </div>
          <p className="text-ink-600">Based on 2,847 verified reviews</p>
        </div>

        {/* Testimonials Carousel */}
        <div className="relative mb-16">
          <div className="bg-brand-50 rounded-2xl p-8 md:p-12">
            <div className="max-w-4xl mx-auto">
              {/* Stars */}
              <div className="flex justify-center mb-6">
                {[...Array(testimonials[currentTestimonial].rating)].map((_, i) => (
                  <Icon key={i} name="star" size={20} className="text-sun-400 fill-current" />
                ))}
              </div>

              {/* Testimonial Content */}
              <blockquote className="text-lg md:text-xl text-ink-900 text-center mb-8 leading-relaxed">
                "{testimonials[currentTestimonial].content}"
              </blockquote>

              {/* Author */}
              <div className="flex items-center justify-center space-x-4">
                <div className="w-12 h-12 bg-brand-200 rounded-full flex items-center justify-center">
                  <span className="text-brand-600 font-semibold">
                    {testimonials[currentTestimonial].name.split(' ').map(n => n[0]).join('')}
                  </span>
                </div>
                <div className="text-left">
                  <div className="font-semibold text-ink-900">
                    {testimonials[currentTestimonial].name}
                  </div>
                  <div className="text-ink-600 text-sm">
                    {testimonials[currentTestimonial].role}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Navigation Dots */}
          <div className="flex justify-center space-x-2 mt-6">
            {testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => handleTestimonialChange(index)}
                className={`w-3 h-3 rounded-full transition-colors duration-250 ${
                  index === currentTestimonial
                    ? 'bg-brand-500'
                    : 'bg-gray-300 hover:bg-gray-400'
                }`}
                aria-label={`Go to testimonial ${index + 1}`}
              />
            ))}
          </div>
        </div>

        {/* Trust Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <div className="text-center">
            <div className="text-3xl md:text-4xl font-bold text-brand-500 mb-2">50K+</div>
            <div className="text-ink-600">Active Families</div>
          </div>
          <div className="text-center">
            <div className="text-3xl md:text-4xl font-bold text-brand-500 mb-2">95%</div>
            <div className="text-ink-600">Improvement Rate</div>
          </div>
          <div className="text-center">
            <div className="text-3xl md:text-4xl font-bold text-brand-500 mb-2">4.9★</div>
            <div className="text-ink-600">Average Rating</div>
          </div>
        </div>

        {/* Partner Logos */}
        <div className="border-t border-gray-100 pt-12">
          <p className="text-center text-ink-600 mb-8">
            Trusted by leading educational organizations
          </p>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-8 items-center opacity-60">
            {partners.map((partner) => (
              <button
                key={partner.name}
                onClick={() => handlePartnerClick(partner.name)}
                className="flex items-center justify-center p-4 hover:opacity-80 transition-opacity duration-250 grayscale hover:grayscale-0"
                aria-label={`Learn more about ${partner.name}`}
              >
                <div className="w-24 h-12 bg-gray-200 rounded flex items-center justify-center">
                  <span className="text-xs text-gray-500 text-center">
                    {partner.name}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}