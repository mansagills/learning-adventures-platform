'use client';

import { useState, useEffect } from 'react';
import Container from './Container';

export default function SocialProof() {
  const [currentTestimonial, setCurrentTestimonial] = useState(0);

  const testimonials = [
    {
      name: 'Jake, age 9',
      role: 'Level 14 Adventurer',
      content:
        "I don't even feel like I'm doing math. I'm just trying to beat the dungeon boss!",
      rating: 5,
      initials: 'J',
      color: 'violet' as const,
    },
    {
      name: 'Amara, age 11',
      role: 'Level 22 Explorer',
      content:
        "My favorite part is the secret areas. You have to solve puzzles to find them. I've found three so far.",
      rating: 5,
      initials: 'A',
      color: 'pink' as const,
    },
    {
      name: 'Theo, age 8',
      role: 'Level 7 Quest Seeker',
      content:
        "I asked to play it after dinner instead of watching TV. My mom was shocked.",
      rating: 5,
      initials: 'T',
      color: 'mint' as const,
    },
  ];

  const colorClasses = {
    violet: { border: 'border-pg-violet', bg: 'bg-pg-violet', text: 'text-pg-violet' },
    pink: { border: 'border-pg-pink', bg: 'bg-pg-pink', text: 'text-pg-pink' },
    mint: { border: 'border-pg-mint', bg: 'bg-pg-mint', text: 'text-pg-mint' },
    yellow: { border: 'border-pg-yellow', bg: 'bg-pg-yellow', text: 'text-pg-yellow' },
  };

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [testimonials.length]);

  const Star = () => (
    <svg className="w-5 h-5 text-pg-yellow" viewBox="0 0 20 20" fill="currentColor">
      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
    </svg>
  );

  return (
    <section
      id="social-proof"
      className="py-20 bg-background relative overflow-hidden"
    >
      <div className="absolute inset-0 bg-dot-grid opacity-20"></div>
      <div className="absolute top-10 right-10 w-20 h-20 bg-pg-pink/20 rounded-full blur-xl"></div>
      <div className="absolute bottom-20 left-10 w-16 h-16 bg-pg-yellow/30 rounded-full blur-xl"></div>

      <Container>
        {/* Section Header */}
        <div className="text-center mb-12 relative z-10">
          <div className="inline-flex items-center gap-2 mb-4 px-4 py-2 bg-white border-2 border-pg-border rounded-full shadow-pop">
            <span className="text-lg">💬</span>
            <span className="text-sm font-bold text-foreground uppercase tracking-wide">
              From the Adventurers
            </span>
          </div>

          <h2 className="font-outfit text-4xl md:text-5xl font-extrabold text-foreground mb-4">
            Kids{' '}
            <span className="relative inline-block">
              <span className="text-pg-pink">Can't Stop</span>
              <svg
                className="absolute -bottom-1 left-0 w-full h-3"
                viewBox="0 0 200 8"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M2 4C20 2 40 6 60 4C80 2 100 6 120 4C140 2 160 6 180 4C190 3 198 4 198 4"
                  stroke="#34D399"
                  strokeWidth="3"
                  strokeLinecap="round"
                />
              </svg>
            </span>{' '}
            Playing
          </h2>
        </div>

        {/* Testimonial Carousel */}
        <div className="relative mb-16 z-10">
          <div className="card-sticker max-w-3xl mx-auto p-8 md:p-12">
            <div className="flex justify-center gap-1 mb-6">
              {[...Array(testimonials[currentTestimonial].rating)].map((_, i) => (
                <Star key={i} />
              ))}
            </div>

            <blockquote className="font-plus-jakarta text-xl md:text-2xl text-foreground text-center mb-8 leading-relaxed">
              "{testimonials[currentTestimonial].content}"
            </blockquote>

            <div className="flex items-center justify-center gap-4">
              <div
                className={`w-14 h-14 ${colorClasses[testimonials[currentTestimonial].color].bg} border-2 border-pg-border rounded-xl flex items-center justify-center shadow-pop`}
              >
                <span className="text-white font-outfit font-bold text-xl">
                  {testimonials[currentTestimonial].initials}
                </span>
              </div>
              <div className="text-left">
                <div className={`font-outfit font-bold ${colorClasses[testimonials[currentTestimonial].color].text}`}>
                  {testimonials[currentTestimonial].name}
                </div>
                <div className="text-foreground/60 text-sm flex items-center gap-1">
                  <span>⚔️</span>
                  {testimonials[currentTestimonial].role}
                </div>
              </div>
            </div>
          </div>

          {/* Navigation Dots */}
          <div className="flex justify-center gap-3 mt-8">
            {testimonials.map((testimonial, index) => (
              <button
                key={index}
                onClick={() => setCurrentTestimonial(index)}
                className={`w-4 h-4 rounded-sm border-2 border-pg-border transition-all duration-200 ${
                  index === currentTestimonial
                    ? `${colorClasses[testimonial.color].bg} shadow-pop`
                    : 'bg-white hover:bg-gray-100'
                }`}
                aria-label={`Go to testimonial ${index + 1}`}
              />
            ))}
          </div>
        </div>

        {/* World Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
          <div className="card-sticker text-center p-6 group hover:-translate-y-1 transition-all duration-200 ease-bounce">
            <div className="icon-circle-violet mx-auto mb-3">
              <span className="text-lg">🌍</span>
            </div>
            <div className="font-outfit text-4xl font-extrabold text-pg-violet mb-1">
              1
            </div>
            <div className="font-plus-jakarta text-foreground/60">
              Connected World
            </div>
          </div>
          <div className="card-sticker text-center p-6 group hover:-translate-y-1 transition-all duration-200 ease-bounce">
            <div className="icon-circle-pink mx-auto mb-3">
              <span className="text-lg">⚔️</span>
            </div>
            <div className="font-outfit text-4xl font-extrabold text-pg-pink mb-1">
              100+
            </div>
            <div className="font-plus-jakarta text-foreground/60">
              Quests & Challenges
            </div>
          </div>
          <div className="card-sticker text-center p-6 group hover:-translate-y-1 transition-all duration-200 ease-bounce">
            <div className="icon-circle-yellow mx-auto mb-3">
              <span className="text-lg">⭐</span>
            </div>
            <div className="font-outfit text-4xl font-extrabold text-pg-yellow mb-1">
              5
            </div>
            <div className="font-plus-jakarta text-foreground/60">
              Subject Areas
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
