# Astro Web3 Static Website — Development Prompt

Build a professional, modern, SEO-friendly static Web3 website using **Astro**.

The website must be designed with a clean architecture, reusable components, responsive layouts, and JSON-driven content. The first version must be **frontend/static only**. Do not implement authentication, database, backend APIs, payment systems, or dynamic server-side functionality.

## 1. Website Structure

Create exactly these main pages:

* `/` — Telegram Bots
* `/airdrops` — Airdrops
* `/contact` — Contact Us

Each page must have its own dedicated route and SEO metadata.

The homepage `/` is the main Telegram Bots directory.

The `/airdrops` page is a directory/listing of Web3 airdrops.

The `/contact` page contains a professional contact form UI and contact information. The form does not need backend functionality yet.

---

# 2. JSON-Driven Content Architecture

All Telegram bot and airdrop content must be stored in JSON files.

Do not hardcode bot or airdrop information directly inside Astro page components.

Create a structure similar to:

```text
src/
├── components/
│   ├── Header.astro
│   ├── Footer.astro
│   ├── BotCard.astro
│   ├── AirdropCard.astro
│   ├── SearchBar.astro
│   └── SEO.astro
│
├── data/
│   ├── bots.json
│   └── airdrops.json
│
├── layouts/
│   └── Layout.astro
│
├── pages/
│   ├── index.astro
│   ├── airdrops.astro
│   └── contact.astro
│
└── styles/
    └── global.css
```

The exact structure can be adjusted if necessary, but maintain a clear separation between:

* UI components
* layouts
* page routes
* static content/data
* styling
* SEO configuration

---

# 3. Telegram Bots JSON Data

Create `src/data/bots.json`.

Each bot must support the following fields:

```json
[
  {
    "title": "Example Web3 Bot",
    "url": "https://t.me/example_bot",
    "description": "Discover this Web3 Telegram bot and explore its available features, rewards and opportunities.",
    "image": "/images/bots/example-bot.webp"
  }
]
```

The fields are mandatory:

* `title`
* `url`
* `description`
* `image`

The JSON file must be easy to edit so that I can add, remove, or modify bots without changing the Astro components.

Example:

```json
[
  {
    "title": "Example Bot One",
    "url": "https://t.me/example_one_bot",
    "description": "A Web3 Telegram bot providing users with access to blockchain-related activities and rewards.",
    "image": "/images/bots/example-one.webp"
  },
  {
    "title": "Example Bot Two",
    "url": "https://t.me/example_two_bot",
    "description": "Explore this Telegram Web3 bot and discover its available features and opportunities.",
    "image": "/images/bots/example-two.webp"
  }
]
```

These are placeholder examples only. Keep the architecture ready for me to replace the data later.

---

# 4. Airdrops JSON Data

Create:

```text
src/data/airdrops.json
```

Use the same basic data structure:

```json
[
  {
    "title": "Example Airdrop",
    "url": "https://example.com",
    "description": "Discover this Web3 airdrop and learn more about the project and its participation opportunities.",
    "image": "/images/airdrops/example-airdrop.webp"
  }
]
```

Each airdrop must contain:

* `title`
* `url`
* `description`
* `image`

The architecture should make it easy to add hundreds of entries later without modifying the UI components.

---

# 5. Reusable Cards

Create reusable components:

### BotCard

The `BotCard.astro` component should receive a bot object and display:

* Image
* Project/bot title
* Short description
* CTA button
* External Telegram link

The Telegram link should open in a new browser tab.

Use appropriate security attributes for external links, such as:

```html
target="_blank"
rel="noopener noreferrer"
```

### AirdropCard

Create a similar reusable `AirdropCard.astro` component.

It should display:

* Image
* Airdrop/project title
* Description
* CTA button
* External project URL

Keep both components visually consistent while allowing their CTA labels to be different.

---

# 6. Homepage — Telegram Bots

Create `/`.

The page should include:

### Hero Section

A strong Web3-focused headline, for example:

> Discover Web3 Telegram Bots

Include a concise SEO-friendly introduction explaining that the website provides a curated directory of Telegram bots and Web3 opportunities.

Add a clear CTA that leads to the bot listings.

### Bot Directory

Load the data from:

```text
src/data/bots.json
```

Render every bot dynamically using `BotCard.astro`.

Do not duplicate HTML manually for every bot.

### Search

Add a client-side search interface allowing users to filter bots by title and description.

The search must work without a backend or database.

Keep JavaScript minimal and optimized for static-site performance.

---

# 7. Airdrops Page

Create:

```text
/airdrops
```

Include:

### Hero Section

Headline:

> Latest Web3 Airdrops

Add an SEO-friendly introduction explaining the purpose of the airdrop directory.

### Airdrop Directory

Load all content from:

```text
src/data/airdrops.json
```

Render the entries dynamically with:

```text
AirdropCard.astro
```

Add a client-side search/filter interface.

The architecture should allow future fields to be added, such as:

```json
{
  "title": "Example Airdrop",
  "url": "https://example.com",
  "description": "Example description",
  "image": "/images/airdrops/example.webp",
  "status": "Active",
  "category": "DeFi"
}
```

Do not require these additional fields in the initial implementation, but structure the components so they can be extended later.

---

# 8. Contact Page

Create:

```text
/contact
```

Include:

* Page title
* Short introduction
* Contact email placeholder
* Contact form
* Name field
* Email field
* Subject field
* Message field
* Submit button

For now, the form is frontend-only.

Do not implement a backend.

Use accessible form labels and semantic HTML.

---

# 9. Navigation

Create a reusable responsive header.

Navigation:

```text
Home
Airdrops
Contact
```

The active page should have a visually distinct navigation state.

The navigation must work correctly on desktop and mobile.

Add a responsive mobile menu if appropriate.

---

# 10. Footer

Create a reusable footer containing:

* Website name
* Short Web3 description
* Navigation links
* Telegram/social links placeholders
* Copyright notice

Use semantic HTML.

---

# 11. SEO Requirements

SEO is a major requirement.

Every page must have unique:

* `<title>`
* Meta description
* Canonical URL
* Open Graph metadata
* Twitter/X Card metadata

Example structure:

```text
Home:
Title: Web3 Telegram Bots | Discover Crypto & Blockchain Bots

Airdrops:
Title: Web3 Airdrops | Discover Crypto Airdrop Opportunities

Contact:
Title: Contact Us | Web3 Directory
```

Do not simply duplicate the same metadata across all pages.

Use an SEO component or layout-level SEO system so metadata can be configured per page.

---

# 12. Semantic HTML

Use proper semantic HTML5 elements:

```html
<header>
<nav>
<main>
<section>
<article>
<footer>
```

Use a logical heading hierarchy:

```text
H1
 ├── H2
 │    └── H3
```

Each page should have exactly one primary H1.

Images must have meaningful `alt` attributes.

Avoid unnecessary `<div>` elements when semantic elements are appropriate.

---

# 13. Technical SEO

Implement:

* `robots.txt`
* `sitemap.xml`
* Canonical URLs
* Open Graph metadata
* Twitter/X metadata
* Descriptive image alt text
* SEO-friendly URLs
* Semantic HTML
* Fast-loading pages
* Responsive design
* Proper heading hierarchy

Configure the Astro site URL correctly so canonical URLs and sitemap generation work correctly.

Use Astro's recommended SEO/static-site approach rather than creating unnecessary server-side functionality.

---

# 14. Performance

The website must be optimized for static delivery.

Prioritize:

* Minimal JavaScript
* Static HTML generation
* Optimized images
* Lazy loading for non-critical images
* Responsive images where appropriate
* No unnecessary dependencies
* Good Core Web Vitals
* Fast initial page load

Use Astro's static rendering capabilities wherever possible.

Avoid converting the entire application into a client-side SPA.

---

# 15. Responsive Design

The website must work correctly on:

* Mobile
* Tablet
* Laptop
* Desktop
* Large desktop screens

Use a mobile-first responsive layout.

Cards should automatically adapt to the available screen width.

Example:

```text
Mobile:
1 card / row

Tablet:
2 cards / row

Desktop:
3–4 cards / row
```

Do not use fixed widths that cause horizontal scrolling.

---

# 16. Visual Design

Create a modern Web3-inspired visual identity.

Design characteristics:

* Modern
* Professional
* Clean
* Premium
* Dark-friendly
* High contrast
* Subtle gradients
* Rounded cards
* Smooth hover effects
* Clear CTA buttons
* Good spacing
* Strong typography

Avoid excessive animations.

Animations should be subtle and should not negatively affect performance or accessibility.

---

# 17. Accessibility

Follow accessibility best practices.

Include:

* Proper form labels
* Keyboard-accessible navigation
* Visible focus states
* Sufficient color contrast
* Descriptive alt text
* Semantic HTML
* Accessible buttons
* Accessible links

Do not rely only on color to communicate information.

Respect `prefers-reduced-motion`.

---

# 18. Data Management Principle

The most important architectural requirement is:

**Content must be separated from presentation.**

For example:

```text
JSON
   ↓
Astro page
   ↓
Reusable component
   ↓
HTML
```

I should be able to modify:

```text
src/data/bots.json
```

and immediately see the new bot on the website without modifying the component or page.

The same principle must apply to:

```text
src/data/airdrops.json
```

---

# 19. Future Scalability

Although the first version is static, structure the project so it can later support:

* Categories
* Tags
* Search
* Sorting
* Featured projects
* Project status
* Multiple Web3 categories
* Pagination
* Individual project pages
* Database integration
* Admin dashboard

Do not implement these features now unless required.

Prepare the architecture without unnecessarily adding complexity.

---

# 20. Important Development Rules

1. Build the frontend only.
2. Do not add authentication.
3. Do not add a database.
4. Do not add backend APIs.
5. Do not add payment functionality.
6. Use JSON files as the content source.
7. Use reusable Astro components.
8. Keep content separate from UI.
9. Make all pages responsive.
10. Make the website SEO-friendly.
11. Use semantic HTML.
12. Optimize for static performance.
13. Keep the code modular and maintainable.
14. Avoid unnecessary dependencies.
15. Do not hardcode individual bot/airdrop entries into page files.

At the end, provide a clean, production-ready Astro frontend that can be deployed as a static website.
