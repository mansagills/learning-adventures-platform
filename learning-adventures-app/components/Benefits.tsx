import Image from 'next/image';
import Container from './Container';
import Icon from './Icon';

export default function Benefits() {
  const benefits = [
    {
      icon: 'academic',
      title: 'Personalized Learning',
      description: 'AI-powered adaptive content that adjusts to your child\'s learning pace and style, ensuring they\'re always challenged but never overwhelmed.',
      image: '/benefit-1.jpg',
      imageAlt: 'Child using personalized learning interface on tablet'
    },
    {
      icon: 'play',
      title: 'Engaging Content',
      description: 'Interactive games, animations, and hands-on activities that make complex concepts easy to understand and remember.',
      image: '/benefit-2.jpg',
      imageAlt: 'Children playing educational games together'
    },
    {
      icon: 'heart',
      title: 'Accessibility First',
      description: 'Designed for all learners with support for different abilities, learning styles, and accessibility needs.',
      image: '/benefit-3.jpg',
      imageAlt: 'Diverse group of children learning together with assistive technology'
    },
    {
      icon: 'check',
      title: 'Multi-Subject Curriculum',
      description: 'Comprehensive coverage of math, science, reading, and critical thinking skills aligned with educational standards.',
      image: '/benefit-1.jpg',
      imageAlt: 'Educational curriculum showing various subjects'
    },
    {
      icon: 'star',
      title: 'Proven Results',
      description: 'Backed by educational research and proven to improve learning outcomes and student engagement.',
      image: '/benefit-2.jpg',
      imageAlt: 'Charts and graphs showing improved learning outcomes'
    }
  ];

  return (
    <section id="benefits" className="py-16 bg-white">
      <Container>
        <div className="text-center mb-16">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-ink-900 mb-4">
            Why Parents Choose Learning Adventures
          </h2>
          <p className="text-xl text-ink-600 max-w-3xl mx-auto">
            Our platform combines cutting-edge educational technology with proven teaching methods to create an unparalleled learning experience.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {benefits.map((benefit, index) => (
            <div
              key={benefit.title}
              className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-250 group"
            >
              {/* Image */}
              <div className="relative h-48 mb-6 rounded-lg overflow-hidden">
                <Image
                  src={benefit.image}
                  alt={benefit.imageAlt}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
              </div>

              {/* Icon */}
              <div className="flex items-center justify-center w-12 h-12 bg-brand-100 rounded-lg mb-4">
                <Icon name={benefit.icon} size={24} className="text-brand-500" />
              </div>

              {/* Content */}
              <h3 className="font-display text-xl font-bold text-ink-900 mb-3">
                {benefit.title}
              </h3>
              <p className="text-ink-600 leading-relaxed">
                {benefit.description}
              </p>
            </div>
          ))}
        </div>

        {/* Additional Trust Elements */}
        <div className="mt-16 text-center">
          <div className="inline-flex items-center space-x-2 bg-brand-100 text-brand-600 px-6 py-3 rounded-full">
            <Icon name="shield" size={20} />
            <span className="font-semibold">Trusted by 50,000+ families worldwide</span>
          </div>
        </div>
      </Container>
    </section>
  );
}