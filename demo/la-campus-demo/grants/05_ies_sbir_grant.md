# Grant Application Narrative
## IES Small Business Innovation Research (SBIR) Program
## U.S. Department of Education — Institute of Education Sciences
**Phase I Amount:** $150,000–$225,000 (6-month feasibility study)
**Phase II Amount:** Up to $1,500,000 (2-year prototype & testing)
**Estimated Deadline:** Watch for 2026 solicitation release — historically May–July
**Funder:** Institute of Education Sciences (IES), U.S. Department of Education
**Apply at:** [ies.ed.gov/funding](https://ies.ed.gov/funding) | Submissions via grants.gov

> ⚠️ **Program Status Note:** The SBIR/STTR authorization lapsed September 30, 2025. As of March 2026, congressional reauthorization is pending. Monitor [sbir.gov](https://www.sbir.gov) and [ies.ed.gov/funding](https://ies.ed.gov/funding) for the reauthorization announcement and new solicitation. When it drops, move fast — this is one of the highest-value grants available to an edtech startup at this stage.

> **Eligibility Reminder:** SBIR requires the applicant to be a U.S.-based for-profit small business with 500 or fewer employees. All R&D must be conducted in the United States. P&G Consulting Group / Learning Adventures meets both requirements.

---

## PHASE I APPLICATION NARRATIVE

**Company Name:** P&G Consulting Group (Learning Adventures)
**Principal Investigator:** [Name of technical lead / PI]
**Contact:** mansagills@gmail.com
**Technology Area:** Education Technology — Game-Based Learning, K–5 STEM
**Phase:** Phase I — Feasibility Study
**Proposed Period of Performance:** 6 months
**Requested Amount:** $225,000

---

## Section 1: Identification and Significance of the Problem

### 1.1 The Educational Need

Elementary school students in the United States are falling behind in mathematics and science at alarming rates. The 2022 National Assessment of Educational Progress (NAEP) — often called "the Nation's Report Card" — reported fourth-grade math scores at their lowest level since 2003. Fourth-grade science proficiency has shown similarly troubling trends. These declines are concentrated among students from low-income households, communities of color, and students attending under-resourced schools, where access to high-quality supplemental learning is most limited.

A key driver of this decline is **disengagement**. Research consistently shows that students who do not find learning engaging do not persist, do not practice, and do not achieve. The challenge is not primarily one of instructional quality — it is one of motivation and design. Students who disengage from traditional instruction at the elementary level are at heightened risk for long-term STEM avoidance, reduced educational attainment, and exclusion from the growing STEM workforce.

The need, then, is for supplemental learning tools that are:
1. **Intrinsically motivating** — students choose to engage, without coercion
2. **Curriculum-aligned** — engagement translates directly into standards-based skill development
3. **Accessible** — usable on low-end devices, in low-bandwidth environments, by families with no budget for premium subscriptions
4. **Safe** — designed from the ground up to protect the privacy and safety of children

The current market of educational technology has not adequately met this need. Most edtech products sacrifice engagement for educational rigor, or sacrifice rigor for engagement. Products that achieve both are rare, expensive, or inaccessible to the students who most need them.

### 1.2 The Gap in the Market

IES SBIR investments are directed at technology products that address documented educational needs through research-validated approaches. The gap Learning Adventures targets is well-documented:

- **Engagement gap:** Children spend an average of 2–4 hours/day on recreational digital activities, but average less than 20 minutes/day on educational digital activities outside school (Common Sense Media, 2023)
- **Access gap:** Premium edtech subscriptions (Khan Academy Plus, IXL, Prodigy Premium) cost $10–$20/month — out of reach for families at or below the poverty line
- **Quality gap:** Free educational apps overwhelmingly rely on rote drill mechanics that fail to sustain engagement past initial novelty
- **Safety gap:** Most consumer edtech platforms expose children to advertising, data collection, and social features without adequate COPPA compliance

Learning Adventures addresses all four gaps simultaneously. The Phase I SBIR study would provide the first rigorous evidence of whether and how well it does so.

---

## Section 2: Proposed Innovation

### 2.1 The Learning Adventures Platform

Learning Adventures is a fully operational, game-based educational platform for K–5 students. Rather than treating educational content as a reward for completing a game, Learning Adventures makes the educational content the game itself — embedded in a living, navigable 2D world that students explore with a customizable avatar.

The platform currently includes:

**The Campus World**
A top-down 2D pixel-art school campus built with Phaser.js and Next.js 14. Students navigate a tile-based world (Stardew Valley / classic Zelda visual style) between subject-specific buildings: the Math Building (fully operational), Science Lab, Library, History Museum, and Innovation Hub. The campus includes NPCs, daily quests, environmental storytelling, and seasonal events.

**41 Verified Educational Games and Lessons**
All content is available today — 34 HTML5 games and 7 interactive lessons across Mathematics (16 items) and Science (21 items), with English and History represented and expanding. Every item is:
- A single HTML file with no external dependencies (offline-capable)
- Cross-browser and mobile-responsive
- WCAG-accessible (keyboard navigation, high contrast)
- Designed for 5–15 minute sessions
- Balanced at approximately 70% engagement / 30% explicit learning

**Sample Math Content:** Fraction Pizza Party, Math Race Rally, Number Line Ninja, Multiplication Bingo Bonanza, Equation Balance Scale, Money Market Madness, Geometry Builder Challenge, Time Attack Clock (and 8 more)

**Sample Science Content:** Planet Explorer Quest, Ocean Conservation Heroes, Body System Heroes, Ecosystem Building Tycoon, Fossil Dig Adventure, States of Matter Mixer, Crystal Cave Chemistry, Pollution Solution Squad (and 13 more)

**Progression and Motivation Systems**
- XP and leveling system tied to educational content completion
- Badge and achievement system with 20+ milestone badges
- Dual currency economy: Academic XP (earned through learning) and Campus Coins (earned through daily job mini-games) used to purchase character upgrades and cosmetics
- Social features: leaderboards, study groups, friend challenges, daily quests

**Parent and Teacher Dashboards**
- Parents monitor learning activity, set daily/weekly goals, and review progress reports
- Teachers and administrators access class-wide analytics and learning trends
- Goal-setting with calendar integration for scheduled sessions
- Weekly automated digest emails to parent/guardian addresses

**COPPA-Compliant Child Authentication**
- Children log in with algorithmically generated anonymous usernames (e.g., "BraveEagle42") — no real names stored for minors
- 4-digit PIN authentication — no passwords for children to manage
- Child profiles attached to and controlled by parent accounts
- No advertising, no external links, no third-party tracking in the child-facing interface

**AI-Powered Content Studio (Phase 7 — Operational)**
- Gemini AI–powered multi-agent workflow for generating new, standards-aligned educational games
- Content builder agents produce complete, playable HTML5 game files
- QA review agent validates accessibility and educational integrity
- Admin panel integration for one-click content publishing
- This system enables the content library to expand rapidly in response to identified learning gaps — a significant differentiator over static-library competitors

### 2.2 The Educational Theory Behind the Design

Learning Adventures is grounded in three bodies of educational and psychological research:

**Interest Development Theory (Hidi & Renninger, 2006)**
The platform is designed to move students through triggered situational interest (the 2D world, character, and adventure framing) → maintained situational interest (XP, daily challenges, social features) → emerging individual interest (repeated positive STEM experiences shift self-concept) → well-developed individual interest (students seek out STEM content independently).

**Self-Determination Theory (Deci & Ryan, 1985)**
Autonomy is served through player choice (which building, which game, how to customize and manage the in-game economy). Competence is served through adaptive difficulty, immediate feedback, and visible progression. Relatedness is served through study groups, friend challenges, and shared leaderboards.

**Game-Based Learning Research (Gee, 2003; Mayer, 2019)**
Learning Adventures applies the "good game" principles identified in the learning sciences literature: pleasantly frustrating challenge, clear goals and feedback, situated understanding, and identity projection through the avatar and campus world.

### 2.3 Differentiation from Existing Products

| Feature | Learning Adventures | Prodigy | Khan Academy | IXL | ABCmouse |
|---|---|---|---|---|---|
| True game world (navigable 2D) | ✅ | Partial | ❌ | ❌ | ❌ |
| Free at core tier | ✅ | Partial | ✅ | ❌ | ❌ |
| COPPA-compliant by design | ✅ | ✅ | Partial | Partial | ✅ |
| No advertising | ✅ | ❌ | ✅ | ✅ | ❌ |
| Offline-capable content | ✅ | ❌ | Partial | ❌ | ❌ |
| AI content generation | ✅ | ❌ | ❌ | ❌ | ❌ |
| Social features (peer challenges) | ✅ | Partial | ❌ | ❌ | ❌ |
| Parent + teacher dashboards | ✅ | ✅ | ✅ | ✅ | Partial |
| Open-source / transparent | ✅ | ❌ | ✅ | ❌ | ❌ |

---

## Section 3: Phase I Research Plan

### 3.1 Phase I Objective

The objective of Phase I is to establish the **technical feasibility and initial efficacy signal** of the Learning Adventures platform as a supplemental K–5 STEM learning tool — specifically:

1. Can the platform reliably deliver consistent, measurable engagement (sessions, time-on-task, voluntary return rate) across a diverse sample of K–5 students?
2. Is there a preliminary positive signal for learning outcomes (math and science knowledge gains) among students who engage regularly with the platform?
3. What platform features, content types, and usage patterns are most strongly associated with engagement and learning gains?
4. Are there significant differences in engagement or outcomes by student demographic subgroup (gender, race/ethnicity, income level, ELL status)?

### 3.2 Participants

- **Sample:** 200–300 K–5 students across 4–6 classrooms in 2–3 elementary schools
- **Selection criteria:** Title I schools preferred; diverse demographic composition; mix of urban and suburban
- **Teacher involvement:** 4–6 teachers who will participate in a 4-hour professional development session prior to implementation

### 3.3 Study Design

**Design:** Single-arm pilot study with pre/post assessment and continuous behavioral monitoring
**Duration:** 10 weeks of platform use
**Usage protocol:** Minimum 3 sessions per week, 20 minutes per session (60 min/week minimum)

### 3.4 Measures

| Construct | Instrument | Timing |
|---|---|---|
| Math knowledge | Researcher-developed items, 20 questions aligned to Common Core | Pre (week 0), Post (week 10) |
| Science knowledge | Researcher-developed items, 20 questions aligned to NGSS | Pre (week 0), Post (week 10) |
| STEM interest & identity | Adapted STEM-CIS scale (Kier et al., 2014) | Pre (week 0), Post (week 10) |
| Engagement (behavioral) | Platform logs: sessions, time-on-task, completion rates, voluntary logins | Continuous (weekly export) |
| User experience | Student survey (10 items, age-appropriate) | Week 5, Week 10 |
| Teacher implementation fidelity | Structured observation checklist | Weeks 3, 6, 9 |
| Parent satisfaction | Survey (8 items) | Week 10 |

### 3.5 Analysis Plan

- **Primary analysis:** Paired t-tests and effect size (Cohen's d) for pre/post changes in math knowledge, science knowledge, and STEM interest
- **Engagement analysis:** Descriptive statistics on session frequency, duration, and voluntary return rate; correlation with learning gains
- **Subgroup analysis:** Stratified analysis by gender, race/ethnicity, grade level, and ELL status
- **Qualitative data:** Thematic analysis of student and teacher feedback to identify platform strengths and improvement priorities

### 3.6 Phase I Deliverables

By the end of Phase I, Learning Adventures will produce:
1. Feasibility report documenting platform performance, engagement metrics, and preliminary efficacy findings
2. Data analysis report with pre/post assessment results and effect size estimates
3. Prioritized list of platform improvements informed by student/teacher feedback
4. Phase II research plan incorporating findings from Phase I
5. Updated content library (target: 60+ games/lessons) based on gaps identified in pilot

---

## Section 4: Phase II Preview

If Phase I demonstrates feasibility and a positive efficacy signal (effect size d ≥ 0.15 for at least one primary outcome), Learning Adventures will pursue Phase II funding to conduct a fully powered randomized controlled trial (RCT) with:

- **Sample:** 1,500–2,000 students across 25–30 schools
- **Design:** Cluster-randomized controlled trial (schools randomly assigned to treatment vs. waitlist control)
- **Duration:** Full academic year (9 months)
- **Outcomes:** Math proficiency, science proficiency, STEM identity, voluntary engagement
- **Deliverables:** Peer-reviewed publication, implementation guide, commercial-ready platform

---

## Section 5: Commercialization Plan

### 5.1 Business Model

Learning Adventures operates on a **freemium model** designed to maximize access while achieving financial sustainability:

**Free Tier (Always Free)**
- Full access to all educational content (games and lessons)
- Basic progress tracking
- Parent dashboard (standard view)
- COPPA-compliant child accounts

**Premium Tier (~$5–8/month per family)**
- Advanced parent analytics and goal-setting tools
- Priority content updates (new games released to premium first)
- Ad-free guarantee (core platform is already ad-free; premium ensures it permanently)
- Family challenge events and premium cosmetics

**School/District Licensing**
- Per-student annual license for schools integrating Learning Adventures into instruction
- Includes teacher dashboard, class analytics, curriculum alignment documentation, and PD support
- Pricing: $3–5 per student per year (competitive with IXL, below Prodigy)

**Institutional Research Partnerships**
- Data licensing agreements with universities conducting education research
- Content co-development agreements with curriculum publishers

### 5.2 Market Size

- **Total addressable market:** 56 million K–12 students in the U.S.; 24 million K–5 students
- **Serviceable addressable market:** K–5 supplemental learning market, estimated $2.5B and growing
- **Beachhead market:** Title I school districts + underserved families seeking free alternatives to premium platforms

### 5.3 Revenue Projections (Post-Phase II)

| Year | Users | Revenue Source | Projected Revenue |
|---|---|---|---|
| Year 1 (post-Phase II) | 10,000 active users | Freemium conversions + 5 district licenses | $75,000 |
| Year 2 | 50,000 active users | Freemium + 25 district licenses | $400,000 |
| Year 3 | 200,000 active users | Freemium + 100 district licenses + partnerships | $1,800,000 |
| Year 4 | 500,000 active users | Full commercial scale | $5,000,000+ |

---

## Section 6: Team Qualifications

**P&G Consulting Group / Learning Adventures** has demonstrated the technical capacity to build, deploy, and maintain a complex, full-stack educational technology platform. The completed platform — 41 verified educational games, a fully operational 2D campus world, COPPA-compliant authentication, AI content studio, and parent/teacher dashboards — represents substantial prior-art development and establishes the team's capability to execute the proposed Phase I research.

**Technical Stack:**
- Frontend: Next.js 14, React, TypeScript, Phaser.js, Tailwind CSS
- Backend: Node.js, PostgreSQL 14, Prisma ORM, NextAuth.js
- AI: Google Gemini API, multi-agent content generation
- Infrastructure: Vercel, PostgreSQL hosting, CDN-ready

**Prior Accomplishments:**
- Complete platform developed and deployed on schedule across all planned phases
- COPPA-compliant architecture designed and implemented from inception
- AI content studio (Phase 7) — fully operational multi-agent workflow for game generation
- 41 verified, curriculum-aligned games and lessons (launch-ready)

---

## Section 7: Conclusion

The Institute of Education Sciences SBIR program exists to fund exactly this: a promising, operational educational technology product with a strong theoretical foundation, a clear market need, and a team capable of executing rigorous research. Learning Adventures checks every box.

The Phase I study would provide the first evidence-based validation of whether game-based learning at this depth and design quality can reliably improve STEM engagement and outcomes for K–5 students — particularly those most underserved by the current educational technology market. The answer will matter for students, for teachers, for the edtech industry, and for the national STEM pipeline.

We are ready to find out. We ask IES to invest in the question alongside us.

---

*This narrative was prepared for the IES SBIR Program, U.S. Department of Education.*
*Monitor [ies.ed.gov/funding](https://ies.ed.gov/funding) and [sbir.gov](https://www.sbir.gov) for the 2026 solicitation following congressional reauthorization.*
*Contact: P&G Consulting Group | mansagills@gmail.com*
*GitHub: [github.com/mansagills/learning-adventures-platform](https://github.com/mansagills/learning-adventures-platform)*

---

## Appendix: Key References

- Common Sense Media. (2023). *The Common Sense census: Media use by tweens and teens.* Common Sense Media.
- Deci, E. L., & Ryan, R. M. (1985). *Intrinsic motivation and self-determination in human behavior.* Plenum.
- Gee, J. P. (2003). *What video games have to teach us about learning and literacy.* Palgrave Macmillan.
- Hidi, S., & Renninger, K. A. (2006). The four-phase model of interest development. *Educational Psychologist, 41*(2), 111–127.
- Kier, M. W., Blanchard, M. R., Osborne, J. W., & Albert, J. L. (2014). The development of the STEM career interest survey (STEM-CIS). *Research in Science Education, 44*(3), 461–481.
- Mayer, R. E. (2019). *Computer games in education.* Annual Review of Psychology, 70, 531–549.
- NAEP. (2022). *Nation's report card: 2022 mathematics and reading assessments.* National Center for Education Statistics.
