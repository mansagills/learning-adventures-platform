import type { Metadata } from 'next';
import { catalogData, getFeaturedAdventures } from '@/lib/catalogData';
import { generateMetadata } from '@/lib/seo';
import Container from '@/components/Container';
import CategorySection from '@/components/CategorySection';
import AdventureCard from '@/components/AdventureCard';
import Button from '@/components/Button';
import Icon from '@/components/Icon';

export const metadata: Metadata = generateMetadata({
  title: 'Adventure Catalog - Learning Adventures',
  description: 'Explore our comprehensive collection of interactive math, science, English, history, and interdisciplinary games and lessons designed for elementary students. Start your learning adventure today!',
  path: '/catalog'
});

export default function CatalogPage() {
  const featuredAdventures = getFeaturedAdventures();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-brand-500 via-brand-600 to-accent-500 text-white py-16">
        <Container>
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
              Adventure Catalog
            </h1>
            <p className="text-xl md:text-2xl mb-8 opacity-90">
              Discover interactive learning experiences that make education exciting.
              Choose from math, science, English, history, and interdisciplinary adventures designed for every learner.
            </p>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold mb-2">85+</div>
                <div className="opacity-90">Learning Adventures</div>
              </div>
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold mb-2">5</div>
                <div className="opacity-90">Subject Areas</div>
              </div>
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold mb-2">K-5</div>
                <div className="opacity-90">Grade Levels</div>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* Filter Section */}
      <section className="bg-white border-b border-gray-100 py-6">
        <Container>
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center space-x-4">
              <Icon name="filter" size={20} className="text-ink-600" />
              <span className="text-ink-600 font-medium">Filter by:</span>
              <div className="flex space-x-2">
                <select className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500">
                  <option value="">All Subjects</option>
                  <option value="math">Math</option>
                  <option value="science">Science</option>
                  <option value="english">English Language Arts</option>
                  <option value="history">History</option>
                  <option value="interdisciplinary">Interdisciplinary</option>
                </select>
                <select className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500">
                  <option value="">All Grades</option>
                  <option value="K">Kindergarten</option>
                  <option value="1">Grade 1</option>
                  <option value="2">Grade 2</option>
                  <option value="3">Grade 3</option>
                  <option value="4">Grade 4</option>
                  <option value="5">Grade 5</option>
                </select>
                <select className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500">
                  <option value="">All Types</option>
                  <option value="lesson">Lessons</option>
                  <option value="game">Games</option>
                </select>
                <select className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500">
                  <option value="">All Difficulty</option>
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
              </div>
            </div>
            <div className="text-sm text-ink-600">
              Showing {catalogData.reduce((total, cat) => total + cat.adventures.lessons.length + cat.adventures.games.length, 0)} adventures
            </div>
          </div>
        </Container>
      </section>

      {/* Featured Adventures */}
      {featuredAdventures.length > 0 && (
        <section className="py-16 bg-white">
          <Container>
            <div className="text-center mb-12">
              <h2 className="font-display text-3xl md:text-4xl font-bold text-ink-900 mb-4">
                Featured Adventures
              </h2>
              <p className="text-xl text-ink-600 max-w-3xl mx-auto">
                Start with these popular and highly-rated learning experiences
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredAdventures.map((adventure) => (
                <AdventureCard
                  key={adventure.id}
                  adventure={adventure}
                  size="large"
                />
              ))}
            </div>
          </Container>
        </section>
      )}

      {/* Category Sections */}
      {catalogData.map((category, index) => (
        <CategorySection
          key={category.id}
          category={category}
          className={index % 2 === 0 ? 'py-16 bg-gray-50' : 'py-16 bg-white'}
        />
      ))}

      {/* Call to Action */}
      <section className="py-16 bg-gradient-to-r from-brand-500 to-accent-500 text-white">
        <Container>
          <div className="text-center max-w-3xl mx-auto">
            <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
              Ready to Start Learning?
            </h2>
            <p className="text-xl mb-8 opacity-90">
              Join thousands of families who are already exploring these amazing educational adventures.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                variant="secondary"
                size="lg"
                className="bg-white text-brand-500 hover:bg-gray-50"
              >
                Start Free Trial
              </Button>
              <Button
                variant="primary"
                size="lg"
                className="bg-transparent border-2 border-white text-white hover:bg-white hover:text-brand-500"
              >
                View Pricing
              </Button>
            </div>
          </div>
        </Container>
      </section>
    </div>
  );
}