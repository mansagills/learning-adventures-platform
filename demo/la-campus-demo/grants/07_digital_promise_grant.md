# Grant Application Narrative
## Digital Promise — Learning Innovation Fund / Research + Practice Grant
**Estimated Amount:** $10,000–$500,000
**Deadline:** Rolling / ongoing 2026
**Funder:** Digital Promise (congressionally authorized nonprofit)
**Focus Areas:** Equity-centered edtech, evidence-based learning, underrepresented learners, research-practice partnerships
**Apply at:** [digitalpromise.org](https://digitalpromise.org) | Contact grants@digitalpromise.org for current RFP cycles

> **About Digital Promise:** Digital Promise is a congressionally authorized nonprofit that accelerates innovation in education through research, product development, and equity-focused partnerships. Their funding programs prioritize technology products that serve underrepresented learners and are supported by evidence of impact. Their LearnPlatform integration and Product Certifications are well-known in the edtech market — a Digital Promise partnership carries significant credibility with school districts. This narrative is structured for their Research + Practice Partnership and Learning Innovation Fund tracks.

---

## GRANT APPLICATION NARRATIVE

**Organization:** P&G Consulting Group (Learning Adventures Platform)
**Contact:** mansagills@gmail.com
**Website:** [learning-adventures-platform.vercel.app]
**GitHub:** [github.com/mansagills/learning-adventures-platform](https://github.com/mansagills/learning-adventures-platform)
**Project Title:** Learning Adventures: An Equity-Centered, Game-Based STEM Platform for K–5 Students in Under-Resourced Communities
**Grant Track:** Learning Innovation Fund / Research + Practice Partnership
**Requested Amount:** $150,000
**Project Period:** 18 months

---

## Section 1: Executive Summary

Learning Adventures is a fully operational, COPPA-compliant, game-based educational platform that puts K–5 students — especially those from underserved communities — at the center of their own learning journey. Students explore a top-down 2D pixel-art school campus with a customizable avatar, entering subject-specific buildings to play through curriculum-aligned educational adventures in Math, Science, English, History, and Interdisciplinary studies.

The platform features 41 verified educational games and lessons, a complete XP and achievement system, parent and teacher dashboards, social features, and a Gemini AI–powered content studio — all free at the core tier, all accessible on low-end devices, all COPPA-compliant by architecture.

We are requesting Digital Promise Learning Innovation Fund support to conduct a rigorous evidence study of the platform's impact on STEM interest, identity, and skill development among K–5 students from underrepresented groups — and to use the findings to pursue Digital Promise Product Certification and LearnPlatform integration, creating the credibility pathway that enables district-scale adoption.

---

## Section 2: The Problem — Equity Gaps in STEM Engagement Begin in Elementary School

Digital Promise's mission is grounded in a recognition that technology, properly designed and deployed, can be a powerful equalizer — expanding access to high-quality learning for students who have historically been left behind. Learning Adventures was built from exactly that premise.

The equity gaps in STEM engagement are measurable, persistent, and traceable to early elementary school:

**The engagement gap:** NAEP fourth-grade math proficiency stands at 35% nationally — but only 18% for Black students, 22% for Latino students, and 19% for students eligible for free/reduced lunch (NAEP, 2022). The gap is not primarily about instruction quality. It is about which students have access to engaging, motivating supplemental learning — and which do not.

**The technology access gap:** Premium edtech subscriptions ($10–20/month) are out of reach for families below the poverty line. Free alternatives are predominantly rote and low-engagement. Under-resourced schools operate on aging device infrastructure that many "modern" platforms cannot support. Families in rural communities often lack reliable broadband, making cloud-dependent platforms inaccessible in practice.

**The representation gap:** Many educational technology products were designed for and by people who don't reflect the demographics of the students most in need. Content that fails to reflect students' cultural backgrounds, histories, and identities sends a subtle but powerful message: this world was not made for you.

**The safety gap:** COPPA compliance in the edtech market remains inconsistent. Families from communities with historical reasons to distrust data collection — communities of color, immigrant families, low-income families — often choose not to engage with digital learning tools because they cannot trust that their children's data is protected.

Learning Adventures was designed to address all four gaps. It is free at the core. It runs on low-end devices with offline capability. Its content roadmap includes a culturally responsive review and bilingual interfaces. And its COPPA compliance is architectural — not a policy layer on top of an unsafe design, but a foundational constraint of the system.

---

## Section 3: The Solution — Learning Adventures Platform

### 3.1 Platform Overview

Learning Adventures is a complete, operational educational technology platform. It is not a prototype or a concept — it is a working product with 41 verified educational games and lessons, a 2D navigable campus world, a full user management system, parent and teacher dashboards, and an AI-powered content studio.

**The core experience:**

Students create a customizable pixel-art avatar and enter a top-down school campus (Stardew Valley / classic Zelda visual style, built with Phaser.js). They navigate freely between five subject buildings. The Math Building is fully operational — five game stations are playable, with XP awarded automatically on completion via a postMessage bridge between the HTML iframe and the React/Next.js platform.

Every game and lesson in the catalog is:
- A single, self-contained HTML5 file with no external dependencies
- Cross-browser, mobile-responsive, and offline-capable
- Designed for 5–15 minute sessions
- Balanced at approximately 70% engagement / 30% explicit learning content
- Curriculum-aligned to Common Core Math, NGSS, CCSS-ELA, and C3 standards (mapping in progress)

### 3.2 Equity-Centered Design Features

Learning Adventures embeds equity in every layer of the platform:

**Free at the core — no meaningful paywalls**
The entire educational content library is free. Every student gets access to every game and lesson. There is no "free preview" that cuts off after 10 minutes or a paywall blocking the best content. Families with zero edtech budget get the full experience.

**Designed for real-world technology access**
Every game is a single HTML file. No app download. No streaming. No WebGL requirement. The platform has been tested on school-issued Chromebooks from 2018 and performs reliably on 4G mobile connections. The upcoming PWA implementation will enable full offline play for downloaded content — removing the broadband requirement entirely for families with intermittent connectivity.

**COPPA-compliant by architecture**
Children log in with algorithmically generated anonymous usernames (e.g., "BraveEagle42") — no real names, no birthdates, no PII stored for minors. PIN-based authentication. Child profiles controlled entirely by parent accounts. No advertising, no external links, no third-party tracking.

**Parent-centered visibility**
The parent dashboard is a core feature, not an afterthought. Every parent gets real-time visibility into their child's learning activity: sessions completed, XP earned, games played, goals met. Working parents — parents who can't supervise homework — stay in the loop. Parents who've never used an edtech platform before can navigate it easily.

**Culturally responsive content roadmap**
The content expansion initiative includes a professional culturally responsive review of all existing and new games — ensuring representation of diverse histories, scientists, mathematicians, and cultural contexts. The bilingual interface initiative (English/Spanish priority, French and Mandarin planned) ensures that language is not a barrier to access.

### 3.3 The Complete Content Library

**Mathematics (16 items):**
Fraction Pizza Party, Math Race Rally, Number Monster Feeding, Treasure Hunt Calculator, Pizza Fraction Frenzy, Multiplication Bingo Bonanza, Shape Sorting Arcade, Math Jeopardy Junior, Number Line Ninja, Equation Balance Scale, Counting Carnival, Geometry Builder Challenge, Money Market Madness, Time Attack Clock, Math Memory Match, Multiplication Tables Adventure

**Science (21 items):**
Planet Explorer Quest, Ocean Conservation Heroes, Animal Kingdom Match, Weather Wizard Battle, Body System Heroes, Ecosystem Building Tycoon, States of Matter Mixer, Fossil Dig Adventure, Magnet Power Puzzle, Light Laboratory Escape, Plant Growing Championship, Rock Cycle Racing, Sound Wave Surfer, Ocean Depth Diver, Simple Machines Construction, Pollution Solution Squad, Crystal Cave Chemistry, Volcano Explorer Lab, Water Cycle Journey, Simple Machines Lab, Ecosystem Builder

**English Language Arts:** Spelling Bee Challenge (expanding)
**History / Social Studies:** Ancient Egypt Explorer (expanding)

### 3.4 Technology Architecture

| Component | Technology |
|---|---|
| Frontend | Next.js 14, React 18, TypeScript, Tailwind CSS |
| Game Engine | Phaser.js 3 (integrated via React-Phaser event bridge) |
| Authentication | NextAuth.js v4, JWT, Google OAuth, credentials |
| Database | PostgreSQL 14 + Prisma ORM |
| AI Content Studio | Google Gemini API, multi-agent workflow |
| Infrastructure | Vercel, CDN-ready, offline-capable HTML5 games |
| Compliance | COPPA-compliant architecture, FERPA-aware data handling |

---

## Section 4: Research Partnership Proposal

### 4.1 Research Purpose

Digital Promise's Learning Innovation Fund prioritizes products with evidence of impact — particularly for underrepresented learners. Learning Adventures is designed for evidence generation: the platform's behavioral data infrastructure captures session frequency, time-on-task, content completion rates, voluntary return rates, and XP progression continuously and at granular resolution.

What is missing is a formal evidence study — one that connects platform engagement to learning outcomes through a rigorous research design and produces findings publishable in peer-reviewed venues. This is what the Digital Promise partnership would enable.

### 4.2 Research Questions

1. Does regular engagement with Learning Adventures improve mathematics knowledge and science knowledge among K–5 students, as measured by validated pre/post assessments?
2. Does Learning Adventures engagement increase students' expressed interest in STEM subjects and their identification as STEM learners?
3. Do effects differ by student demographic subgroup — specifically by gender, race/ethnicity, socioeconomic status, and English learner status?
4. What platform features, content types, and usage patterns are most strongly associated with positive outcomes?
5. How does the parent dashboard affect family engagement and parental self-efficacy around their child's learning?

### 4.3 Proposed Study Design

**Design:** Quasi-experimental study with propensity-score matching
**Sample:** 400–600 students (grades 2–5) across 8–12 schools; 50%+ from underrepresented groups in STEM
**Duration:** One full academic semester (18 weeks)
**Data sources:**
- Pre/post math and science knowledge assessments (researcher-developed, Common Core / NGSS aligned)
- STEM Interest and Identity Survey (adapted STEM-CIS scale)
- Platform behavioral logs (session frequency, time-on-task, completion rates, voluntary engagement)
- Teacher implementation surveys (weeks 4, 9, 18)
- Parent engagement surveys (baseline and end-of-semester)
- Student focus groups (2x per semester)

**Analysis:**
- Regression analysis with propensity-score matched comparison group
- Subgroup analyses by gender, race/ethnicity, income level, ELL status
- Correlation analysis between engagement metrics and learning outcomes
- Thematic analysis of qualitative data (focus groups, open-ended survey items)

### 4.4 Digital Promise Certification Pathway

A formal evidence study conducted in partnership with Digital Promise positions Learning Adventures for:

1. **Digital Promise Product Certification** — the most recognized quality signal in the K–12 edtech market; required by many district procurement policies
2. **LearnPlatform by EAB Integration** — inclusion in the platform used by 2,500+ districts for edtech evaluation and selection
3. **ESSA Evidence Level** — evidence study designed to meet ESSA Tier 3 (correlational evidence) criteria, enabling Learning Adventures to be cited in Title IV-A technology spending requests by schools

These certifications are not incidental benefits — they are the bridge from a platform that works to a platform that districts adopt at scale.

---

## Section 5: Project Plan and Timeline

### 18-Month Project Timeline

| Phase | Months | Key Activities |
|---|---|---|
| **Phase 1: Foundation** | 1–3 | Finalize research instruments; IRB approval; recruit 8–12 schools; teacher PD workshops; expand content library to 65+ items; complete culturally responsive review |
| **Phase 2: Implementation** | 4–9 | Platform deployment across all schools; data collection (behavioral, surveys); monthly coaching check-ins with teachers; bilingual interface launch (10 games) |
| **Phase 3: Analysis** | 10–12 | Pre/post assessment analysis; behavioral data analysis; student focus groups; preliminary findings report to Digital Promise |
| **Phase 4: Dissemination** | 13–15 | Finalize evidence report; submit for Digital Promise Product Certification; submit abstract to AERA / ISTE; publish implementation guide |
| **Phase 5: Scale** | 16–18 | LearnPlatform integration; district outreach using certification; second-cohort school recruitment; Phase II research planning |

---

## Section 6: Budget and Use of Funds

| Category | Amount | Notes |
|---|---|---|
| Research Coordination (part-time, 18 months) | $45,000 | Study design, IRB, data collection, analysis |
| School Outreach + Partnership Development | $20,000 | Coordinator, travel, materials, onboarding kits |
| Teacher Professional Development | $15,000 | Workshops (4 hrs/cohort), coaching stipends |
| Content Development (culturally responsive expansion) | $20,000 | 25+ new games/lessons, curriculum specialist review |
| Bilingual Interface Development | $10,000 | Spanish translation + UI for 15 games |
| Infrastructure (CDN, PWA, WCAG audit) | $15,000 | Performance + accessibility |
| Dissemination (publications, certification fees, conference) | $10,000 | AERA travel, open-access fees, DP certification |
| Indirect / Contingency | $15,000 | 10% contingency |
| **Total** | **$150,000** | |

---

## Section 7: Broader Impact and Sustainability

### Scaling Impact Through Certification
Digital Promise Product Certification is widely recognized as the edtech industry's strongest quality signal. Achieving certification following this study would:
- Enable district procurement officers to cite Learning Adventures in federal technology spending (Title IV-A)
- Qualify Learning Adventures for inclusion in district edtech libraries and recommendation lists
- Create a replication pathway for any district to adopt the platform with confidence

### Sustaining Impact Through the Freemium Model
Learning Adventures' freemium model ensures that equity of access is never compromised by financial sustainability requirements. The core platform remains free permanently. Premium features (advanced analytics, priority content access, family event features) generate revenue from families who choose to upgrade — without creating a paywall that disadvantages low-income students.

### Sustaining Impact Through AI Content Generation
The AI content studio means the platform's most important resource — high-quality, curriculum-aligned educational games — grows continuously at low marginal cost. By the end of this grant period, the catalog will exceed 75 items. By Year 3, it will exceed 150. This is a compounding asset that no static-library competitor can match.

---

## Section 8: Why Digital Promise + Learning Adventures

Digital Promise was created to ensure that technology serves as a lever for equity in education — not a luxury for the well-resourced. Every design decision in Learning Adventures reflects that same conviction.

We are not asking Digital Promise to take a chance on an unproven idea. We are asking for the research infrastructure and credibility pathway that takes a proven platform from "working and ready" to "adopted at scale by the districts that need it most."

That is the gap Digital Promise was created to close. We would be proud to close it together.

---

*This narrative was prepared for Digital Promise Learning Innovation Fund / Research + Practice Partnership.*
*Visit [digitalpromise.org](https://digitalpromise.org) or contact grants@digitalpromise.org for current RFP cycles.*
*Contact: P&G Consulting Group | Learning Adventures | mansagills@gmail.com*
*GitHub: [github.com/mansagills/learning-adventures-platform](https://github.com/mansagills/learning-adventures-platform)*

---

## Appendix: Key References
- NAEP. (2022). *Nation's report card: 2022 mathematics and reading assessments.* NCES.
- Common Sense Media. (2023). *The Common Sense census: Media use by tweens and teens.*
- Every Student Succeeds Act (ESSA), Title IV-A: Student Support and Academic Enrichment Grants.
- Digital Promise. (2023). *Product certifications and research evidence framework.* digitalpromise.org.
- Kier, M. W., et al. (2014). The development of the STEM career interest survey. *Research in Science Education, 44*(3), 461–481.
