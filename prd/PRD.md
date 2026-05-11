# PRD.md — Personal Portfolio Website `berutu.dev`

## 1. Project Overview

### 1.1 Project Name
**berutu.dev — Personal Portfolio, Blog, and Freelance Sales Website**

### 1.2 Owner
**Yosepri Berutu**

### 1.3 Purpose
Build a personal portfolio website for `berutu.dev` that functions as:

1. A professional portfolio for freelance opportunities, especially Upwork and international clients.
2. A case-study hub to showcase real projects, especially the HKBP website built as a contribution to the church.
3. A writing platform similar to Medium, where the owner can publish technical articles, engineering notes, project breakdowns, and AI-assisted development lessons.
4. A trust-building sales page for freelance services around MVP development, admin dashboards, backend APIs, deployment, and AI-assisted full-stack development.

### 1.4 Core Positioning
The website should position the owner as:

> **AI-assisted Full-Stack Developer helping founders and small teams ship MVPs, admin dashboards, and backend APIs faster using React, Go, Laravel, Spring Boot, Flask, and modern deployment workflows.**

### 1.5 Primary Audience
The website should be designed for:

1. **Upwork clients**
   - Startup founders
   - Small business owners
   - Technical and non-technical founders
   - Product managers
   - Agencies needing extra development help

2. **International freelance prospects**
   - People looking for MVP development
   - People needing backend/API help
   - People needing admin dashboard/internal tools
   - People needing bug fixing, deployment, or integrations

3. **Recruiters / hiring managers**
   - Optional secondary audience
   - Should be able to quickly understand skills and project quality

4. **Technical readers**
   - Developers reading blog posts
   - People interested in AI-assisted development and full-stack engineering

---

## 2. Current Context and Constraints

### 2.1 Domain
The domain has already been purchased:

```txt
berutu.dev
```

### 2.2 Development Machine
Local development will be done on:

```txt
MacBook Pro 2017
macOS 13.7.8 (22H730)
```

The stack must be comfortable to run on this machine. Avoid unnecessarily heavy local tooling.

### 2.3 Deployment Target
The website will eventually be deployed to a VPS using:

```txt
Docker Compose
Caddy or Nginx reverse proxy
Cloudflare DNS
```

Initial local development should not require the VPS to be ready.

### 2.4 Initial Scope
The first version should be a **static/content-driven website**.

No custom backend is required for v1.

### 2.5 Future Scope
The website should be easy to extend later with:

- newsletter
- client inquiry form
- project status page
- private client portal
- SaaS experiments
- API endpoint
- CMS integration
- analytics dashboard

But these must not block v1.

---

## 3. Recommended Tech Stack

### 3.1 Main Stack

Use:

```txt
Astro
React
TypeScript
Tailwind CSS
MDX
Docker
Caddy
```

### 3.2 Why Astro
Astro is chosen because this website is primarily content-driven: portfolio pages, case studies, blog posts, service pages, and landing pages. Astro is optimized for fast content-driven websites and allows selective use of React components only when interactivity is needed.

### 3.3 Why React
React should be used only for interactive components, such as:

- portfolio filter
- animated project cards
- theme toggle
- mobile navigation
- testimonial carousel
- contact CTA interactions
- search/filter for blog posts if added later

Avoid making the entire site a React SPA.

### 3.4 Why MDX
MDX should be used for blog posts and case studies because the owner wants to write like Medium, but with the ability to embed custom components inside articles.

### 3.5 Styling
Use:

```txt
Tailwind CSS
```

Optional component inspiration:

```txt
shadcn/ui style
lucide-react icons
```

Do not install unnecessary UI libraries unless needed.

### 3.6 Package Manager
Use one of:

```txt
pnpm
npm
```

Preferred:

```txt
pnpm
```

If pnpm is not installed, the AI Agent may either install it or use npm. The project must remain runnable with clear instructions.

### 3.7 Node Version
Use Node.js LTS.

Recommended local setup:

```txt
Node.js 20 LTS or newer LTS
```

If using `nvm`, provide `.nvmrc`.

---

## 4. Non-Goals for v1

Do not build the following in v1:

1. User login
2. Admin dashboard
3. Database-backed blog editor
4. Complex CMS
5. Payment system
6. Client portal
7. SaaS dashboard
8. Multi-language support unless very easy
9. Overly complex animations
10. Heavy backend/API

The first version must ship quickly and look professional.

---

## 5. Success Criteria

The website is considered successful when:

1. A visitor can understand within 5 seconds:
   - who the owner is
   - what services he offers
   - what kind of projects he can build
   - how to contact him

2. The HKBP case study clearly demonstrates:
   - real-world project experience
   - React + Go development
   - AI-assisted development workflow
   - ability to build end-to-end products

3. The blog supports:
   - MDX posts
   - tags
   - publish dates
   - reading time
   - author info
   - SEO metadata
   - clean article layout

4. The site is fast:
   - Lighthouse performance target: 90+
   - Good mobile UX
   - Minimal unnecessary JavaScript

5. The codebase is clean enough to be shown as portfolio-quality work.

---

## 6. Website Structure

### 6.1 Main Routes

Build these pages:

```txt
/
 /about
 /services
 /work
 /work/hkbp-website
 /blog
 /blog/[slug]
 /contact
 /lab
 /uses
```

### 6.2 Optional Routes

Can be added if time allows:

```txt
/resume
/now
/stack
/book-a-call
```

### 6.3 Suggested Navigation

Header navigation:

```txt
Home
Work
Services
Blog
About
Contact
```

Primary CTA:

```txt
Hire Me
```

Secondary CTA:

```txt
View Work
```

---

## 7. Content Architecture

### 7.1 Content Collections

Use Astro content collections.

Create collections for:

```txt
src/content/blog/
src/content/work/
```

Optional later:

```txt
src/content/lab/
src/content/notes/
```

### 7.2 Blog Frontmatter Schema

Each blog post should support:

```yaml
title: string
description: string
publishDate: date
updatedDate: date optional
tags: string[]
category: string
draft: boolean
featured: boolean
coverImage: string optional
```

Example:

```mdx
---
title: "How I Built a Church Website with React, Go, and AI Agents"
description: "A technical case study about building a real-world church website using AI-assisted development."
publishDate: 2026-05-15
tags: ["React", "Go", "AI-assisted development", "Portfolio"]
category: "Case Study"
draft: false
featured: true
---

Content goes here.
```

### 7.3 Work / Case Study Frontmatter Schema

Each case study should support:

```yaml
title: string
subtitle: string
description: string
role: string
clientType: string
projectType: string
startDate: string optional
endDate: string optional
status: string
stack: string[]
featured: boolean
demoUrl: string optional
githubUrl: string optional
coverImage: string optional
```

Example:

```mdx
---
title: "HKBP Church Website"
subtitle: "A full-stack website built as a contribution to my church"
description: "A React and Go-based website with public pages, content management, PDF publishing, and event features."
role: "Full-stack Developer, Product Planner, AI-assisted Development Lead"
clientType: "Nonprofit / Church"
projectType: "Full-stack Web Application"
status: "In Progress"
stack: ["React", "Go", "MySQL", "Cloudflare R2", "Docker"]
featured: true
demoUrl: "https://hkbp.berutu.dev"
githubUrl: ""
coverImage: "/images/work/hkbp-cover.png"
---

Content goes here.
```

---

## 8. Page Requirements

## 8.1 Home Page `/`

### Goal
The homepage must act as a sales page and professional introduction.

### Sections

#### 8.1.1 Hero Section
Must include:

- short intro
- strong positioning
- primary CTA
- secondary CTA
- visual element

Suggested copy:

```txt
Hi, I’m Yosepri Berutu.
I build MVPs, admin dashboards, and backend APIs with full-stack engineering and AI-assisted development.
```

Subcopy:

```txt
I help founders and small teams turn ideas into production-ready web applications using React, Go, Laravel, Spring Boot, Flask, and modern deployment workflows.
```

Primary CTA:

```txt
Hire Me
```

Secondary CTA:

```txt
View Case Studies
```

#### 8.1.2 Trust / Skill Summary
Show 4–6 compact skill cards:

```txt
MVP Development
Backend APIs
Admin Dashboards
AI-assisted Development
Deployment & DevOps
Technical Writing
```

#### 8.1.3 Featured Work
Show 2–3 featured projects:

1. HKBP Website
2. Sarana Tani / fertilizer distribution platform, if ready
3. Face Recognition Attendance API, if ready
4. Spring Boot / S3 upload project, if ready

Each card should show:

- title
- short description
- stack
- link to case study
- optional live demo

#### 8.1.4 Services Preview
Show 3 service categories:

1. Full-stack MVP Development
2. Backend API & Integrations
3. Deployment, Debugging & Technical Consulting

Each service should include:
- what it is
- who it is for
- sample deliverables

#### 8.1.5 AI-assisted Workflow Section
Explain the owner's unique workflow.

Suggested copy:

```txt
I use AI agents to accelerate planning, UI exploration, code generation, debugging, and documentation — while still applying software engineering judgment for architecture, review, security, and production readiness.
```

Make it clear that AI is an accelerator, not a replacement for engineering quality.

#### 8.1.6 Latest Articles
Show 3 latest blog posts.

#### 8.1.7 Final CTA
Suggested copy:

```txt
Have an MVP, dashboard, or backend problem to solve?
Let’s discuss how I can help.
```

CTA:

```txt
Contact Me
```

---

## 8.2 About Page `/about`

### Goal
Build personal trust.

### Must include:

1. Professional introduction
2. Technical background
3. AI-assisted development philosophy
4. Why the HKBP project was built
5. Current freelance focus
6. Contact CTA

### Suggested content angle

The About page should communicate that the owner is:

- a Java/backend engineer
- comfortable with full-stack development
- actively building portfolio projects
- using AI responsibly to accelerate development
- interested in freelance work, especially MVPs, dashboards, APIs, and deployment

Do not make the tone too corporate. Keep it human, clear, and credible.

---

## 8.3 Services Page `/services`

### Goal
Make it clear what clients can hire the owner for.

### Service Categories

#### 8.3.1 MVP Development
Description:

```txt
I help founders and small teams build the first usable version of their product.
```

Deliverables:

- landing page
- authentication if needed
- core feature implementation
- admin dashboard
- backend API
- database design
- deployment

Ideal client:

- founder with idea
- startup validating product
- small team needing fast execution

#### 8.3.2 Admin Dashboard / Internal Tools
Deliverables:

- CRUD dashboard
- role-based access
- data tables
- filters and search
- file upload
- export
- reporting

#### 8.3.3 Backend API Development
Stacks:

```txt
Go
Spring Boot
Laravel
Flask
```

Deliverables:

- REST API
- database schema
- authentication
- third-party integration
- file storage integration
- logging
- error handling

#### 8.3.4 Laravel / PHP Maintenance
Good for Upwork clients who already have Laravel apps.

Deliverables:

- bug fixing
- feature addition
- API integration
- version upgrade support
- performance improvement

#### 8.3.5 Flask / Python Microservices
Deliverables:

- automation API
- AI/ML microservice
- webhook service
- image/file processing API
- face recognition-related service

#### 8.3.6 Deployment & Debugging
Deliverables:

- VPS setup
- Docker Compose setup
- Caddy/Nginx reverse proxy
- SSL/HTTPS
- database setup
- production bug investigation

### Pricing
Do not show fixed pricing in v1 unless owner requests it.

Instead use:

```txt
Available for fixed-price projects and hourly freelance work.
```

---

## 8.4 Work Page `/work`

### Goal
Show portfolio/case studies.

### Layout
Use a grid/list of case study cards.

Each card:

- project title
- short description
- role
- stack badges
- status
- CTA: Read case study

### Required Projects to Include Initially

At minimum include placeholder/case study entries for:

1. HKBP Website
2. Face Recognition Attendance API
3. Subsidized Fertilizer Distribution Platform / Sarana Tani
4. Backend File Upload to S3/R2
5. Laravel or Flask demo if available later

Use draft/placeholder state if content is not final.

---

## 8.5 HKBP Case Study `/work/hkbp-website`

### Goal
This is the flagship case study.

### Important Positioning
Do **not** sell the HKBP website as a commercial church website template.

It should be positioned as:

> A nonprofit contribution and real-world full-stack portfolio project.

### Required Sections

#### 8.5.1 Overview
Explain:

- what the project is
- why it was built
- who it serves
- that it was built as a contribution/persembahan for the church

Suggested copy:

```txt
I built this website as a personal contribution to my church. Beyond serving the church community, the project also became a real-world case study for building a full-stack web application with an AI-assisted development workflow.
```

#### 8.5.2 Problem
Describe common church/community communication problems:

- announcements scattered across chats
- warta PDFs hard to access
- event schedules not centralized
- public information not easily discoverable
- admin needs a simple way to manage content

#### 8.5.3 Goals
List:

- provide public website
- publish schedules and events
- manage announcements
- upload and display warta PDFs
- improve content organization
- create admin-friendly workflow

#### 8.5.4 Role
State owner responsibilities:

- requirement planning
- UX planning
- frontend implementation
- backend implementation
- AI agent prompting and review
- deployment planning
- technical decision making
- QA and bug fixing

#### 8.5.5 Stack
Show:

```txt
React
Go
MySQL
Cloudflare R2
Docker
Caddy/Nginx
AI-assisted development
```

Adjust according to actual implementation.

#### 8.5.6 Features
Include:

- public homepage
- daily verse
- daily devotion
- upcoming events
- calendar interaction
- announcements
- warta PDF publishing
- admin panel
- content management
- file upload
- responsive design

#### 8.5.7 AI-assisted Development Workflow
Explain the workflow:

1. Requirement breakdown
2. PRD creation
3. UI/UX prompt generation
4. Frontend implementation by AI agent
5. Backend implementation by AI agent
6. Human review and adjustment
7. Debugging
8. Deployment planning
9. Iteration

Make clear that the owner provided direction and engineering review.

#### 8.5.8 Technical Challenges
Examples:

- structuring admin features
- designing content model
- handling file upload to Cloudflare R2
- managing events/calendar UX
- making UI consistent across homepage
- deployment and environment configuration

#### 8.5.9 Result
If not live yet, say:

```txt
Currently in development.
```

If live later, include link.

#### 8.5.10 Screenshots
Prepare placeholders:

```txt
/images/work/hkbp/home.png
/images/work/hkbp/admin-dashboard.png
/images/work/hkbp/events.png
/images/work/hkbp/warta.png
```

Use placeholder cards if images are not ready.

---

## 8.6 Blog Page `/blog`

### Goal
A Medium-like writing hub.

### Features

Must include:

- list of blog posts
- title
- description
- publish date
- tags
- category
- reading time
- featured posts
- responsive layout

Optional:

- tag filter
- search
- newsletter CTA

### Initial Blog Post Ideas

Create placeholder/draft posts for:

1. `how-i-built-hkbp-website-with-ai-agents.mdx`
2. `why-i-use-astro-for-my-developer-portfolio.mdx`
3. `deploying-multiple-apps-in-one-vps-with-docker-and-caddy.mdx`
4. `react-go-vs-laravel-for-mvp-development.mdx`
5. `using-ai-agents-as-a-full-stack-developer.mdx`

Do not publish all if content is not final. Use `draft: true`.

---

## 8.7 Blog Detail Page `/blog/[slug]`

### Required Article Layout

Must include:

- article title
- description
- publish date
- updated date if available
- tags
- reading time
- table of contents if easy
- clean typography
- code block styling
- callout components
- previous/next posts if easy
- related posts if easy

### Typography
Article reading experience should be excellent:

- max width around `720px`
- comfortable line height
- clear headings
- styled code blocks
- image captions
- readable mobile layout

---

## 8.8 Contact Page `/contact`

### Goal
Make it easy for clients to contact the owner.

### Required CTA Options

Include:

- Email
- LinkedIn
- GitHub
- Upwork profile placeholder
- WhatsApp optional, but consider whether to expose publicly

### Contact Form
For v1, avoid backend.

Options:

1. Simple mailto link
2. Formspree
3. Tally form
4. Google Form embed
5. Resend later if backend/serverless is added

Recommended for v1:

```txt
Use mailto + external form placeholder.
```

### Suggested Form Fields

If using external form:

- name
- email
- project type
- budget range
- message

---

## 8.9 Lab Page `/lab`

### Goal
Show experiments and mini projects.

### Examples

- Flask face recognition API demo
- Laravel admin demo
- Spring Boot file upload API
- Go REST API starter
- AI-generated UI experiments
- Docker deployment experiments

Each item:

- name
- short description
- stack
- status
- link if available

---

## 8.10 Uses Page `/uses`

### Goal
Humanize the owner and help technical readers.

Include:

- laptop
- editor
- terminal
- programming languages
- frameworks
- AI tools
- deployment tools
- preferred workflow

This is optional but nice for developer personal brand.

---

## 9. Design Requirements

### 9.1 Visual Direction
The design should feel:

```txt
modern
minimal
developer-focused
premium but not flashy
international freelance-friendly
```

### 9.2 Style Keywords

```txt
clean
dark-friendly
high contrast
soft gradients
subtle borders
rounded cards
readable typography
technical but human
```

### 9.3 Theme
Support:

```txt
dark mode
light mode optional
```

Recommended:

- dark mode default
- light mode available via toggle if easy

If theme toggle adds complexity, use a polished dark theme first.

### 9.4 Color Direction
Use a restrained palette.

Suggested:

```txt
Background: near-black / slate
Text: white / slate-200
Muted text: slate-400
Accent: blue, cyan, emerald, or violet
Cards: slate-900 / border slate-800
```

Do not overuse gradients.

### 9.5 Typography
Use modern readable fonts.

Recommended:

- Sans: Inter, Geist, or system font
- Mono: JetBrains Mono or Geist Mono

If external font loading is used, optimize it properly.

### 9.6 Layout Principles

- Max width container: around `1120px` or `1200px`
- Generous whitespace
- Mobile-first responsive layout
- Cards should have consistent spacing
- CTA buttons should be obvious
- Avoid clutter

### 9.7 Animation
Use minimal animations.

Acceptable:

- fade in
- subtle slide up
- hover elevation
- card hover border
- animated background accent

Avoid:

- heavy scroll animations
- excessive motion
- slow page transitions
- distracting effects

### 9.8 Inspiration
The site should feel like a mix of:

- developer portfolio
- modern SaaS landing page
- technical blog
- freelance sales page

Do not copy any specific website exactly.

---

## 10. Components Required

Create reusable components.

### 10.1 Layout Components

```txt
BaseLayout.astro
SiteHeader.astro
SiteFooter.astro
SEO.astro
Container.astro
Section.astro
```

### 10.2 UI Components

```txt
Button.astro or Button.tsx
Badge.astro
Card.astro
SectionHeading.astro
TechBadge.astro
CTASection.astro
```

### 10.3 Portfolio Components

```txt
ProjectCard.astro
FeaturedProject.astro
CaseStudyHeader.astro
CaseStudySection.astro
StackList.astro
Timeline.astro
```

### 10.4 Blog Components

```txt
BlogCard.astro
BlogPostHeader.astro
ArticleLayout.astro
TagList.astro
ReadingTime.astro
TableOfContents.astro optional
Callout.astro
CodeBlock styling
```

### 10.5 Interactive React Components

Use React only if necessary:

```txt
ThemeToggle.tsx
MobileMenu.tsx
ProjectFilter.tsx optional
BlogSearch.tsx optional
```

---

## 11. SEO Requirements

### 11.1 General SEO
Every page must include:

- title
- description
- canonical URL
- Open Graph metadata
- Twitter card metadata
- favicon
- sensible heading hierarchy

### 11.2 Site Metadata

Use:

```txt
Site name: berutu.dev
Default title: Yosepri Berutu — AI-assisted Full-Stack Developer
Default description: I help founders and small teams ship MVPs, admin dashboards, and backend APIs faster with React, Go, Laravel, Spring Boot, Flask, and AI-assisted development.
URL: https://berutu.dev
```

### 11.3 Sitemap and Robots

Add:

```txt
sitemap.xml
robots.txt
```

Use Astro sitemap integration if appropriate.

### 11.4 Structured Data
Add JSON-LD if easy:

- Person
- WebSite
- BlogPosting for articles
- CreativeWork for case studies

### 11.5 Open Graph Images
Create default OG image placeholder.

Path:

```txt
/public/og/default.png
```

Optional later: dynamic OG images.

---

## 12. Performance Requirements

### 12.1 Target
Aim for:

```txt
Lighthouse Performance: 90+
Lighthouse Accessibility: 90+
Lighthouse Best Practices: 90+
Lighthouse SEO: 90+
```

### 12.2 Performance Rules

- Avoid unnecessary JavaScript
- Optimize images
- Use responsive images
- Lazy-load below-the-fold images
- Keep font loading efficient
- Avoid large animation libraries unless necessary
- Use static generation

### 12.3 Images
Use local optimized images where possible.

Use:

```txt
public/images/
src/assets/
```

Prefer Astro image optimization if compatible with the chosen setup.

---

## 13. Accessibility Requirements

Must include:

- semantic HTML
- proper heading order
- keyboard-accessible navigation
- visible focus states
- alt text for images
- sufficient color contrast
- aria labels for icon-only buttons
- skip-to-content link if easy

Do not ship inaccessible navigation.

---

## 14. Local Development Requirements

### 14.1 Prerequisites

The AI Agent should provide setup instructions for macOS.

Expected tools:

```txt
Node.js LTS
pnpm or npm
Git
VS Code or Cursor
```

Optional:

```txt
nvm
Docker Desktop
```

### 14.2 Initial Commands

Suggested project creation:

```bash
pnpm create astro@latest berutu-dev
cd berutu-dev
pnpm astro add react
pnpm astro add mdx
```

For Tailwind, follow current Astro/Tailwind setup. Prefer the modern Tailwind integration method compatible with the installed Astro/Tailwind version.

### 14.3 Development Commands

Must support:

```bash
pnpm install
pnpm dev
pnpm build
pnpm preview
```

### 14.4 Environment Variables

For v1, avoid required environment variables.

Optional future variables:

```env
PUBLIC_SITE_URL=https://berutu.dev
PUBLIC_CONTACT_EMAIL=
PUBLIC_LINKEDIN_URL=
PUBLIC_GITHUB_URL=
PUBLIC_UPWORK_URL=
```

### 14.5 Local Preview
The site must run locally at:

```txt
http://localhost:4321
```

---

## 15. Deployment Requirements

### 15.1 Dockerfile
Create a production-ready Dockerfile.

Preferred approach:

1. Build Astro site
2. Serve static output using Nginx or Caddy container

### 15.2 Docker Compose
Create `docker-compose.yml` for portfolio app.

Example service name:

```txt
berutu-portfolio
```

Expose only internal container port. Let Caddy/Nginx reverse proxy handle public ports.

### 15.3 Caddy
Prepare a sample `Caddyfile`.

Example:

```txt
berutu.dev, www.berutu.dev {
    reverse_proxy berutu-portfolio:80
}
```

Actual implementation may differ depending on container setup.

### 15.4 Cloudflare
The final deployment should assume DNS will be managed in Cloudflare.

Required DNS records later:

```txt
A     berutu.dev       VPS_IP
CNAME www             berutu.dev
```

Optional subdomains:

```txt
A     hkbp             VPS_IP
A     api-hkbp         VPS_IP
A     lab              VPS_IP
```

---

## 16. Repository Requirements

### 16.1 Suggested Folder Structure

```txt
berutu-dev/
├── public/
│   ├── favicon.svg
│   ├── images/
│   └── og/
├── src/
│   ├── assets/
│   ├── components/
│   │   ├── layout/
│   │   ├── ui/
│   │   ├── blog/
│   │   └── work/
│   ├── content/
│   │   ├── blog/
│   │   └── work/
│   ├── data/
│   │   ├── site.ts
│   │   ├── services.ts
│   │   └── navigation.ts
│   ├── layouts/
│   │   ├── BaseLayout.astro
│   │   ├── ArticleLayout.astro
│   │   └── CaseStudyLayout.astro
│   ├── pages/
│   │   ├── index.astro
│   │   ├── about.astro
│   │   ├── services.astro
│   │   ├── contact.astro
│   │   ├── lab.astro
│   │   ├── uses.astro
│   │   ├── blog/
│   │   │   ├── index.astro
│   │   │   └── [slug].astro
│   │   └── work/
│   │       ├── index.astro
│   │       └── [slug].astro
│   ├── styles/
│   │   └── global.css
│   └── utils/
│       ├── readingTime.ts
│       ├── formatDate.ts
│       └── seo.ts
├── astro.config.mjs
├── package.json
├── tsconfig.json
├── Dockerfile
├── docker-compose.yml
├── Caddyfile.example
├── README.md
└── PRD.md
```

### 16.2 Code Quality
Use:

```txt
TypeScript
ESLint optional
Prettier optional
```

Do not overcomplicate linting in v1.

### 16.3 Naming
Use clear naming.

Good:

```txt
ProjectCard.astro
FeaturedWork.astro
ArticleLayout.astro
```

Avoid:

```txt
Comp1.astro
Thing.tsx
NewSection.astro
```

---

## 17. Content Copy Direction

### 17.1 Tone
The copy should be:

```txt
clear
confident
professional
human
specific
not arrogant
not too corporate
```

### 17.2 Avoid
Avoid phrases like:

```txt
I can do everything
best developer
world-class solution
cheap service
```

### 17.3 Prefer
Use outcome-focused phrases:

```txt
ship MVPs faster
build production-ready APIs
turn ideas into usable products
create admin dashboards that simplify operations
debug and deploy full-stack applications
```

### 17.4 Suggested Homepage Copy

Hero title:

```txt
I build MVPs, dashboards, and backend APIs with AI-assisted full-stack development.
```

Subtitle:

```txt
I’m Yosepri Berutu, a software engineer helping founders and small teams turn product ideas into usable web applications using React, Go, Laravel, Spring Boot, Flask, and modern deployment workflows.
```

CTA:

```txt
Hire Me
View Work
```

### 17.5 Suggested Services Intro

```txt
I help clients move from idea to working software — from planning and UI implementation to backend APIs, integrations, and deployment.
```

### 17.6 Suggested AI Workflow Copy

```txt
AI helps me move faster, but engineering judgment keeps the work reliable. I use AI agents for exploration, scaffolding, implementation assistance, debugging, and documentation, while reviewing architecture, code quality, security, and production readiness myself.
```

---

## 18. Initial Content to Create

### 18.1 Site Data
Create `src/data/site.ts`:

```ts
export const site = {
  name: "Yosepri Berutu",
  domain: "berutu.dev",
  url: "https://berutu.dev",
  title: "Yosepri Berutu — AI-assisted Full-Stack Developer",
  description:
    "I help founders and small teams ship MVPs, admin dashboards, and backend APIs faster with React, Go, Laravel, Spring Boot, Flask, and AI-assisted development.",
  email: "your-email@example.com",
  github: "https://github.com/your-username",
  linkedin: "https://www.linkedin.com/in/your-username",
  upwork: "",
};
```

Use placeholders where exact links are unknown.

### 18.2 Initial Case Studies
Create draft content for:

```txt
hkbp-website.mdx
face-recognition-attendance-api.mdx
subsidized-fertilizer-platform.mdx
cloud-storage-upload-api.mdx
```

### 18.3 Initial Blog Drafts
Create draft content for:

```txt
how-i-built-hkbp-website-with-ai-agents.mdx
deploying-multiple-apps-on-one-vps.mdx
why-i-chose-astro-for-my-portfolio.mdx
ai-assisted-development-workflow.mdx
```

---

## 19. Security and Privacy

### 19.1 Public Contact
Do not expose sensitive personal information.

For public contact:

- email is okay
- LinkedIn is okay
- GitHub is okay
- Upwork profile is okay
- WhatsApp optional

### 19.2 Environment
Do not commit:

```txt
.env
API keys
private credentials
server IP if not needed
SSH keys
```

### 19.3 Contact Form
If using third-party forms, do not expose secret keys.

---

## 20. Analytics

For v1, analytics is optional.

Preferred privacy-friendly options:

```txt
Plausible
Umami
Cloudflare Web Analytics
```

Google Analytics is acceptable but not required.

If analytics adds friction, skip for first release.

---

## 21. Acceptance Criteria

### 21.1 Functional Acceptance

The project is accepted when:

- [ ] `pnpm install` works
- [ ] `pnpm dev` runs locally
- [ ] `pnpm build` succeeds
- [ ] `pnpm preview` works
- [ ] Homepage exists
- [ ] About page exists
- [ ] Services page exists
- [ ] Work listing page exists
- [ ] HKBP case study page exists
- [ ] Blog listing page exists
- [ ] Blog detail page works from MDX content
- [ ] Contact page exists
- [ ] Site is responsive
- [ ] Navigation works on desktop and mobile
- [ ] SEO metadata exists
- [ ] Sitemap and robots exist
- [ ] Dockerfile exists
- [ ] Docker Compose example exists
- [ ] README contains setup instructions

### 21.2 Design Acceptance

- [ ] Looks professional on desktop
- [ ] Looks professional on mobile
- [ ] Dark theme is polished
- [ ] Typography is readable
- [ ] CTAs are clear
- [ ] Case study layout is visually strong
- [ ] Blog layout is comfortable to read
- [ ] No obvious UI bugs

### 21.3 Content Acceptance

- [ ] Clear positioning on homepage
- [ ] Services are specific
- [ ] HKBP case study is framed as nonprofit contribution
- [ ] AI-assisted development is explained clearly
- [ ] Blog supports draft posts
- [ ] Placeholder links are easy to replace

### 21.4 Performance Acceptance

- [ ] Build output is static or mostly static
- [ ] Minimal client-side JavaScript
- [ ] Images are optimized or prepared for optimization
- [ ] Lighthouse score should target 90+ across key categories

---

## 22. Suggested Implementation Plan for AI Agent

### Phase 1 — Project Setup
1. Create Astro project.
2. Add React integration.
3. Add MDX integration.
4. Add Tailwind CSS.
5. Configure TypeScript.
6. Create base folder structure.
7. Add global styles.

### Phase 2 — Layout and Design System
1. Create `BaseLayout`.
2. Create header and footer.
3. Create reusable buttons, badges, cards, section headings.
4. Create SEO component.
5. Configure site metadata.

### Phase 3 — Static Pages
1. Build homepage.
2. Build about page.
3. Build services page.
4. Build contact page.
5. Build lab page.
6. Build uses page.

### Phase 4 — Content Collections
1. Configure blog collection.
2. Configure work collection.
3. Create blog listing and detail pages.
4. Create work listing and detail pages.
5. Add draft filtering.

### Phase 5 — Case Study
1. Create HKBP case study content.
2. Build case study layout.
3. Add feature sections, stack badges, role, process, challenges, result.
4. Add screenshot placeholders.

### Phase 6 — Polish
1. Improve responsive layout.
2. Add hover states.
3. Add subtle animations.
4. Improve article typography.
5. Add 404 page.
6. Add sitemap/robots.
7. Run build.

### Phase 7 — Deployment Prep
1. Add Dockerfile.
2. Add docker-compose.yml.
3. Add Caddyfile example.
4. Add README deployment section.
5. Document DNS setup for Cloudflare.

---

## 23. README Requirements

The AI Agent must create/update `README.md` with:

```txt
Project overview
Tech stack
Local setup
Development commands
Build command
Preview command
Content writing guide
How to add blog post
How to add case study
Deployment notes
Docker usage
Environment variables
```

---

## 24. AI Agent Development Rules

The AI Agent must follow these rules:

1. Keep the project simple and shippable.
2. Do not add backend unless explicitly requested.
3. Do not add CMS in v1.
4. Do not overuse React client-side components.
5. Prefer static pages and content collections.
6. Use TypeScript where applicable.
7. Keep components reusable.
8. Use clear file names.
9. Do not hardcode too much content inside components if it belongs in content/data files.
10. Make the site easy to modify by the owner later.
11. Add comments only where helpful.
12. Ensure local development works on macOS.
13. Avoid heavy dependencies.
14. Make the design polished enough for international freelance clients.
15. Treat HKBP as a contribution/case study, not as a product for sale.

---

## 25. Future Enhancements

After v1, consider:

1. Add project search/filter.
2. Add blog search.
3. Add newsletter.
4. Add dynamic OG image generation.
5. Add analytics.
6. Add RSS feed.
7. Add `/resume`.
8. Add `/book-a-call`.
9. Add client testimonials.
10. Add Upwork-specific landing page.
11. Add downloadable PDF resume.
12. Add status page for demos.
13. Add multilingual support if targeting Indonesian and English audiences.
14. Add CMS only if writing workflow becomes painful.

---

## 26. Language Strategy

For Upwork/international freelance, primary website language should be:

```txt
English
```

Optional later:

```txt
Indonesian version
```

Do not build bilingual support in v1 unless explicitly requested.

However, case studies may mention Indonesian context where relevant.

---

## 27. Recommended First Release Content

The first release should not wait for perfect content.

Minimum public release content:

1. Homepage
2. Services page
3. HKBP case study
4. Contact page
5. 1 blog post:
   - "How I Built a Full-Stack Church Website with React, Go, and AI Agents"
6. 1–2 additional project placeholders

The goal is to publish quickly and iterate.

---

## 28. Final Instruction to AI Agent

Build this as a polished, fast, content-driven developer portfolio for `berutu.dev`.

Prioritize:

```txt
clarity > complexity
trust > flashy animation
case studies > generic claims
performance > heavy interactivity
shipping v1 > perfect architecture
```

The website must help the owner win freelance opportunities by showing real ability, clear services, and thoughtful AI-assisted engineering workflow.
