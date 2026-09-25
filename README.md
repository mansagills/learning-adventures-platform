# Learning Adventures

The Learning Adventures website: free learning games for grades K–5 organized by subject,
interactive ebooks that tell the stories behind the games, and a playable preview of the
Learning Adventures World. Built with Next.js 14 (App Router), TypeScript and Tailwind CSS.

The public site (v1) runs with **no backend, database or secrets**. Accounts, dashboards and admin
tools are still in the code but hidden behind a feature flag (see "Configuration" below).

## 🚀 Quick Start

```bash
npm install
npm run dev          # http://localhost:3000
npm run build        # production build (works with no env vars)
npm start            # serve the production build
npm test             # vitest (includes the content checks)
npm run lint
npm run type-check
```

## 🗺️ Site map (v1)

| Route                          | What it is                                                                     |
| ------------------------------ | ------------------------------------------------------------------------------ |
| `/`                            | Homepage: subject grid, game rows, interactive ebooks, demo teaser, parent FAQ |
| `/games`                       | Every playable game, with subject filters and search                           |
| `/games/[gameId]`              | The game player (HTML games play in an iframe)                                 |
| `/subjects/[subject]`          | One subject's games and companion ebooks                                       |
| `/books`, `/books/[slug]`      | Interactive ebooks with free sample pages                                      |
| `/demo`, `/demo/play`          | Learning Adventures World demo: landing page and the playable campus           |
| `/about`, `/privacy`, `/terms` | About and legal pages                                                          |

## 📁 Where things live

```
app/                  # Routes (App Router)
components/
  home/               # Homepage sections
  play/               # Game cards, game browser, game player
  books/              # Book covers, cards, sample page viewer, "Get the ebook" button
  demo/               # Demo landing page and CampusDemoExperience (the playable demo)
  Header.tsx, Footer.tsx, ContentPage.tsx
lib/
  content/            # ✏️ The site's content: subjects.ts, games.ts, books.ts
  siteConfig.ts       # Feature flag and external links
  seo.ts              # Metadata and structured data
public/
  games/, lessons/    # The HTML games and activities
  books/<slug>/       # Ebook sample pages
game/                 # Phaser code for the Learning Adventures World
tests/                # vitest tests (tests/content checks the content files)
```

## ➕ Adding content

**A game:** save the HTML file to `public/games/<name>.html` (or `public/lessons/`), then add an
entry to the `games` array in `lib/content/games.ts` (`slug`, `title`, `subject`, `kind`, `emoji`,
`grades`, `difficulty`, `description`, `skills`, `estimatedTime`, `htmlPath`, and optionally
`featured` and `thumbnail`). Run `npm test`: it fails if the file is missing or a slug is repeated.

**A book:** add or edit an entry in `lib/content/books.ts`. To publish one, set
`status: 'available'`, `ebookUrl` (the book's page in the ebook store), `coverImage`, and
`samplePages` (images saved in `public/books/<slug>/`). Link it to its games with
`companionGameSlugs` (this also shows the book on those games' pages). Run `npm test` to check the paths.

## 🔧 Configuration

Every variable is optional. With none set, the site works and hides the matching feature.

| Variable                       | Effect                                                                                     |
| ------------------------------ | ------------------------------------------------------------------------------------------ |
| `NEXT_PUBLIC_CONTACT_EMAIL`    | Shows a contact email in the footer and on About/Privacy/Terms                             |
| `NEXT_PUBLIC_EBOOK_STORE_URL`  | Fallback "Get the interactive ebook" link for books with no `ebookUrl`                     |
| `NEXT_PUBLIC_NEWSLETTER_URL`   | "Tell me when it's out" link under coming-soon books                                       |
| `NEXT_PUBLIC_DEMO_TRAILER_URL` | YouTube/Vimeo trailer on `/demo`                                                           |
| `NEXT_PUBLIC_ENABLE_ACCOUNTS`  | `true` turns accounts, dashboards and admin back on (these need Supabase and the database) |

Going live: see `docs/V1_GO_LIVE_CHECKLIST.md`. Plan and progress: `docs/V1_WEBSITE_REBUILD_PLAN.md`.

## 🏗️ Technology Stack

- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Fonts**: next/font with Outfit (headings) and Plus Jakarta Sans (body)
- **Testing**: Vitest + Testing Library
- **Linting**: ESLint + Prettier
- **Build**: PostCSS + Autoprefixer
- **Demo**: Phaser 3 (the Learning Adventures World)

## ♿ Accessibility Features

- Semantic HTML landmarks
- Skip-to-content link
- Focus-visible styles
- ARIA labels and descriptions
- Keyboard navigation support
- Screen reader compatibility
- Text colors meet WCAG AA contrast (checked with axe on every public page)
- Reduced motion support

## 🔍 SEO Optimization

- Open Graph metadata
- Twitter Card tags
- JSON-LD structured data
- Semantic HTML structure
- Robots.txt and sitemap.xml
- Performance optimized images
- Core Web Vitals optimized

## 🧪 Testing

Run the test suite with:

```bash
npm test
```

The project includes:

- Content checks (`tests/content`): every game and image file exists, slugs are unique, and links between games and books point to real items
- Component tests with Testing Library

## 📱 Responsive Design

The site is fully responsive across all device sizes:

- **Mobile**: 320px - 767px
- **Tablet**: 768px - 1023px
- **Desktop**: 1024px - 1440px+

## 🚢 Deployment

Deploy on Vercel with the repo root as the Root Directory and no environment variables. Step by
step, including the current Vercel issue: `docs/V1_GO_LIVE_CHECKLIST.md`.

## 🤝 Contributing

1. Follow the existing code style
2. Write tests for new components
3. Ensure accessibility compliance
4. Update documentation as needed

## 📄 License

This project is part of the Learning Adventures platform.

---

**Built with ❤️ for Learning Adventures**
