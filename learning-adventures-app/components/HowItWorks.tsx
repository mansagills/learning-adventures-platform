import Container from './Container';
import Icon from './Icon';

export default function HowItWorks() {
  const steps = [
    {
      number: '01',
      title: 'Create Your Profile',
      description: 'Tell us about your child\'s grade level, interests, and learning goals. Our smart system creates a personalized learning path.',
      icon: 'academic'
    },
    {
      number: '02',
      title: 'Explore Adventures',
      description: 'Browse our library of interactive games and lessons. Each adventure is designed to build specific skills while keeping learning fun.',
      icon: 'play'
    },
    {
      number: '03',
      title: 'Learn & Progress',
      description: 'Watch your child engage with adaptive content that grows with them. Track progress and celebrate achievements together.',
      icon: 'star'
    },
    {
      number: '04',
      title: 'See Results',
      description: 'Get detailed insights into your child\'s learning journey with progress reports and skill assessments.',
      icon: 'check'
    }
  ];

  return (
    <section id="how-it-works" className="py-16 bg-gray-50">
      <Container>
        <div className="text-center mb-16">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-ink-900 mb-4">
            How Learning Adventures Works
          </h2>
          <p className="text-xl text-ink-600 max-w-3xl mx-auto">
            Getting started is simple. In just four steps, your child will be on their way to a more engaging learning experience.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <div key={step.number} className="text-center">
              {/* Step Number */}
              <div className="relative mb-6">
                <div className="w-16 h-16 bg-brand-500 text-white rounded-full flex items-center justify-center font-bold text-xl mx-auto mb-4">
                  {step.number}
                </div>

                {/* Connector Line (except for last item) */}
                {index < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-8 left-full w-full h-0.5 bg-brand-200 -z-10" />
                )}
              </div>

              {/* Icon */}
              <div className="flex items-center justify-center w-12 h-12 bg-white rounded-lg shadow-sm mx-auto mb-4">
                <Icon name={step.icon} size={24} className="text-brand-500" />
              </div>

              {/* Content */}
              <h3 className="font-display text-lg font-bold text-ink-900 mb-3">
                {step.title}
              </h3>
              <p className="text-ink-600 text-sm leading-relaxed">
                {step.description}
              </p>
            </div>
          ))}
        </div>

        {/* Call to Action */}
        <div className="text-center mt-16">
          <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
            <h3 className="font-display text-2xl font-bold text-ink-900 mb-4">
              Ready to Get Started?
            </h3>
            <p className="text-ink-600 mb-6">
              Join thousands of families who have transformed their child's learning experience.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="btn-primary">
                Start Free Trial
              </button>
              <button className="btn-secondary">
                Watch Demo Video
              </button>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}