# Learning Adventures - Marketing Landing Page

A modern, responsive marketing landing page built with Next.js 14, TypeScript, and Tailwind CSS for the Learning Adventures educational platform.

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run tests
npm test

# Run linting
npm run lint

# Format code
npm run format
```

## 📁 Project Structure

```
learning-adventures-app/
├── app/                    # Next.js 14 App Router
│   ├── layout.tsx         # Root layout with fonts, metadata
│   ├── page.tsx           # Landing page
│   ├── globals.css        # Global styles and CSS variables
│   ├── robots.txt/        # SEO robots.txt route
│   └── sitemap.xml/       # SEO sitemap route
├── components/            # React components
│   ├── Header.tsx         # Navigation header
│   ├── Hero.tsx           # Hero section
│   ├── Benefits.tsx       # Features section
│   ├── HowItWorks.tsx     # Process explanation
│   ├── SocialProof.tsx    # Testimonials and reviews
│   ├── SecondaryCta.tsx   # Call-to-action section
│   ├── Faq.tsx            # Frequently asked questions
│   ├── Footer.tsx         # Site footer
│   ├── TrustBadges.tsx    # Trust indicators
│   ├── Icon.tsx           # SVG icon component
│   ├── Button.tsx         # Reusable button component
│   └── Container.tsx      # Layout container
├── lib/                   # Utility libraries
│   ├── analytics.ts       # Analytics tracking
│   ├── seo.ts            # SEO helpers and metadata
│   └── utils.ts          # General utilities
├── tests/                 # Test files
│   ├── setup.ts          # Test configuration
│   └── Faq.test.tsx      # FAQ component tests
└── public/               # Static assets
    └── .gitkeep          # Placeholder for images
```

## 🎨 Design System

### Colors

- **Brand Primary**: `#6C5CE7` (brand-500)
- **Brand Secondary**: `#5A4ED1` (brand-600)
- **Brand Light**: `#ECEBFF` (brand-100)
- **Accent**: `#00C2A8` (accent-500)
- **Text Dark**: `#0F172A` (ink-900)
- **Text Medium**: `#334155` (ink-600)
- **Highlight**: `#FFD166` (sun-400)
- **Error**: `#EF4444` (error-500)

### Typography

- **Display Font**: Nunito (headings)
- **Body Font**: Inter (body text)

### Motion

- Transition duration: 200-300ms
- Respects `prefers-reduced-motion`

## 🏗️ Technology Stack

- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Fonts**: next/font with Nunito & Inter
- **Testing**: Vitest + Testing Library
- **Linting**: ESLint + Prettier
- **Build**: PostCSS + Autoprefixer

## ♿ Accessibility Features

- Semantic HTML landmarks
- Skip-to-content link
- Focus-visible styles
- ARIA labels and descriptions
- Keyboard navigation support
- Screen reader compatibility
- High contrast support
- Reduced motion support

## 🔍 SEO Optimization

- Open Graph metadata
- Twitter Card tags
- JSON-LD structured data
- Semantic HTML structure
- Robots.txt and sitemap.xml
- Performance optimized images
- Core Web Vitals optimized

## 📊 Analytics

The analytics system is implemented with a flexible interface that can be connected to various providers:

```typescript
import { analytics } from '@/lib/analytics';

// Track CTA clicks
analytics.clickCTA('Start Your Adventure', 'hero');

// Track section views
analytics.viewSection('benefits');

// Track FAQ interactions
analytics.openFAQ('How much does it cost?');
```

## 🧪 Testing

Run the test suite with:

```bash
npm test
```

The project includes:

- Component testing with Testing Library
- Accessibility testing
- Keyboard navigation testing
- Analytics tracking verification

## 🔧 Configuration

### Environment Variables

Create a `.env.local` file for environment-specific configurations:

```bash
# Analytics
NEXT_PUBLIC_GA_ID=your-ga-id
NEXT_PUBLIC_ANALYTICS_API=your-analytics-endpoint

# SEO
NEXT_PUBLIC_SITE_URL=https://learningadventures.org
```

### Customization

1. **Colors**: Update `tailwind.config.ts` and CSS variables in `globals.css`
2. **Fonts**: Modify font imports in `app/layout.tsx`
3. **Content**: Edit component props and copy directly in component files
4. **Analytics**: Implement your preferred analytics provider in `lib/analytics.ts`

## 📱 Responsive Design

The landing page is fully responsive across all device sizes:

- **Mobile**: 320px - 767px
- **Tablet**: 768px - 1023px
- **Desktop**: 1024px - 1440px+

## 🚢 Deployment

### Vercel (Recommended)

```bash
npm run build
```

Deploy to Vercel with zero configuration.

### Other Platforms

The app generates static files and can be deployed to any hosting service that supports Next.js.

## 📋 Requirements Checklist

- ✅ Next.js 14 with App Router
- ✅ TypeScript configuration
- ✅ Tailwind CSS styling
- ✅ Responsive design (320px-1440px)
- ✅ Accessibility features (WCAG 2.1 AA)
- ✅ SEO optimization
- ✅ Analytics integration
- ✅ Performance optimization
- ✅ Testing setup
- ✅ ESLint + Prettier
- ✅ Component library
- ✅ Documentation

## 🤝 Contributing

1. Follow the existing code style
2. Write tests for new components
3. Ensure accessibility compliance
4. Update documentation as needed

## 📄 License

This project is part of the Learning Adventures platform.

---

**Built with ❤️ for Learning Adventures**
