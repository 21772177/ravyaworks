# RavyaWorks Website Framework

A reusable, config-driven website template. **One framework → unlimited client websites.**

Build a brand-new website by editing a single `config.js` file and dropping images into `assets/`. No frameworks, no build step, no backend. Pure HTML + CSS + JS that runs anywhere.

---

## The Core Idea

```
_framework/          ← shared engine (edit NEVER)
  └── restaurant/        ← a demo website (copy this to make a new client site)
      ├── index.html     ← loads the engine + your config (edit once: title/meta)
      ├── config.js      ← ALL content + theme lives here (THIS is what you edit)
      └── assets/        ← images for this site only
```

Every website shares the same engine (`_framework/`). Each site is just **one config file + images**. The engine reads the config and renders every section — header, hero, about, services/menu, gallery, testimonials, contact, footer, plus RavyaWorks lead-gen widgets.

---

## How to Build a New Client Website (5 minutes)

### Step 1 — Copy a demo folder
Duplicate the closest demo (e.g. `restaurant/`) and rename it:
```
demos/restaurant/   →   demos/client-shanti-restaurant/
```

### Step 2 — Edit `config.js`
Open the copied `config.js`. Change the content to match the client:

| Section        | What to change                                              |
|----------------|-------------------------------------------------------------|
| `business`     | Client's name, tagline, industry                            |
| `theme`        | 6 hex color codes → instantly re-skins the whole site       |
| `seo`          | Meta description, keywords                                  |
| `hero`         | Headline, subheading, quick highlights                      |
| `about`        | Story paragraphs, mission, vision, stats                    |
| `services`     | Service/menu items (title, price, description, image)       |
| `gallery`      | List of image filenames                                     |
| `testimonials` | Customer reviews                                            |
| `contact`      | Phone, email, address, Google Map embed                     |
| `hours`        | Opening hours                                               |
| `social`       | Social media links                                          |

### Step 3 — Replace images
Drop the client's images into the new folder's `assets/`, matching the filenames referenced in `config.js` (or change the filenames in config to match your images).

### Step 4 — Edit `index.html` (SEO only)
Open `index.html` and update the `<title>`, `<meta description>`, and schema.org JSON-LD block. The visible content is auto-rendered from config — don't add HTML here.

### Step 5 — Open & verify
Just open `index.html` in a browser. Done. Upload the whole `demos/<client>/` folder under `ravyaworks.com/demos/<client>/`.

---

## The `config.js` Reference

```js
window.SITE_CONFIG = {
  business:      { name, tagline, industry, established },
  theme:         { primary, primaryDark, primaryLight, secondary,
                   accent, surfaceAlt, headingFont, bodyFont },
  seo:           { description, keywords, ogImage },
  navLabels:     { services: "Menu" },          // rename "Services" nav item
  cta:           { header, primary, secondary }, // button labels
  hero:          { heading, subheading, images[], quick[] },
  about:         { title, image, since, paragraphs[], mission, vision,
                   footerBlurb, stats[{value,label}] },
  services:      { style: "menu"|"cards"|"pricing", eyebrow, title, subtitle,
                   items[{title, price, description, image, tag}] },
  team:          [{ name, role, specialty, description, photo, social }],  // NEW
  gallery:       [ "assets/img1.jpg", ... ],
  faq:           [{ q, a }],                                          // NEW
  testimonials:  [ {name, role, rating, text, avatar} ],
  ctaBand:       { title, subtitle },
  contact:       { phone, whatsapp, email,
                   address{full, area, city, pincode}, mapEmbed,
                   formEndpoint },                                    // NEW
  hours:         [ {day, time} ],
  social:        { facebook, instagram, twitter, youtube },
  // Optional sections:
  team:          [{ name, role, specialty, description, photo, social }],
  faq:           [{ q, a }],
  blog:          [{ title, date, category, excerpt, image, link }],
  analytics:     { ga4: "G-XXXXXX", plausible: "domain.com" },
  cookieConsent: "Cookie message text",
  i18n:          { hi: { nav_home: "होम", ... }, kn: { ... } }
};
```

### Services styles
- `"menu"` — list with thumbnail + dotted price line (restaurants, caterers)
- `"cards"` — image cards with optional price (salons, gyms, schools, hospitals, etc.)
- `"pricing"` — pricing table with features list and CTA button (gym memberships, coaching plans)

### Team section (optional)
Add a `team` array to show staff/doctor/expert profiles with photo (or auto-generated initials), name, role, specialty and description. Shown as a grid after FAQ.

### FAQ section (optional)
Add a `faq` array of `{ q, a }` objects for an accordion FAQ section. Shows after gallery, before team/testimonials.

### Contact form backend (optional)
Set `contact.formEndpoint` to a form backend URL (Web3Forms, Formspree, Getform, etc.). If not set, the form validates front-end and shows success without sending.

### Blog section (optional)
Add a `blog` array of post objects with `title`, `date`, `category`, `excerpt`, `image` and `link`. Shows as a card grid.

### Team section (optional)
Add a `team` array to show staff/doctor/expert profiles with photo (or auto-generated initials), name, role, specialty and description.

### FAQ section (optional)
Add a `faq` array of `{ q, a }` objects for an accordion FAQ section.

### Analytics (optional)
Set `analytics.ga4` for Google Analytics 4 or `analytics.plausible` for Plausible Analytics. Script tags are injected automatically.

### Cookie Consent (optional)
Set `cookieConsent` to a string message. A GDPR banner appears with Accept/Decline buttons. Consent stored in localStorage.

### Multi-language (optional)
Set `i18n` with language codes (e.g. `hi`, `kn`). Toggle button appears in header. Translates nav labels and CTA text.

### Config Builder
Open `demos/_framework/builder.html` in a browser for a visual form that generates config.js with industry presets, live preview and download.

---

## Theme Presets (instant industry palettes)

Already built into `_framework/css/theme.css`. Set `data-preset` on `<body>` in `index.html`:

| Preset       | Industries                          |
|--------------|-------------------------------------|
| `restaurant` | Restaurant, food                    |
| `school`     | School, education                   |
| `hospital`   | Hospital, clinic, diagnostic        |
| `gym`        | Gym, fitness, yoga                  |
| `salon`      | Salon, spa, beauty                  |
| `grocery`    | Grocery, supermarket                |
| `boutique`   | Boutique, fashion                   |
| `caterer`    | Caterer, event management           |
| `coaching`   | Coaching, tuition                   |

> **Note:** `config.theme` (hex codes) always overrides the preset. Use a preset as a starting point, then fine-tune in config.

---

## RavyaWorks Lead-Gen (built in, cannot be removed)

Every site built from this framework includes two lead-capture widgets that route prospects to RavyaWorks:

1. **Floating WhatsApp button** (bottom-right) → opens `wa.me/919503196964` with the message: *"Hi RavyaWorks! I saw the [Business] demo and I need a similar website."*
2. **"Request Similar Website" ribbon** (bottom, appears after 4s) → links to `ravyaworks.com/contact`

These are hardcoded in `_framework/js/app.js` so they're correct on every demo automatically. To change the RavyaWorks phone/domain, edit the `RW` constant at the top of `app.js`.

---

## What Each File Does

### `_framework/` (shared engine — do not edit per-site)
| File | Purpose |
|------|---------|
| `css/base.css` | Reset, CSS variables (theming hooks), typography, utilities |
| `css/layout.css` | Header, navigation, footer, responsive drawer |
| `css/components.css` | Buttons, hero, cards, gallery, testimonials, contact form, WhatsApp float, ribbon |
| `css/theme.css` | Industry color presets (`data-preset`) |
| `js/app.js` | **The engine.** Reads `SITE_CONFIG` and renders the whole page. |

### Per-site folder (e.g. `restaurant/`)
| File | Purpose |
|------|---------|
| `index.html` | Loads fonts + framework CSS + `config.js` + `app.js`. Contains SEO meta + JSON-LD only. |
| `config.js` | **The only file you edit.** All content + theme. |
| `assets/` | This site's images. |

---

## Customizing the Contact Form

The contact form is front-end only by default — it validates input and shows a "Message Sent" success state. To make it actually send emails:

1. Sign up for a free form backend (Formspree, Getform, Web3Forms).
2. In `_framework/js/app.js`, find the `form.addEventListener("submit"...)` block in `buildContact()` and add an `await fetch(yourEndpoint, { method: "POST", body: new FormData(form) })` before showing success.

---

## Adding a Brand Logo

Currently each site uses a letter-mark (the business's first initial in a colored square) as the logo, generated automatically. To use a real logo image:

1. Add the logo to the site's `assets/` folder.
2. In `_framework/js/app.js`, `buildHeader()`, replace the `.brand__mark` span with an `<img>` tag. (Do this once in the engine to apply to all sites.)

---

## Sections Every Site Gets (from the RavyaWorks spec)

1. ✅ Hero — name, tagline, CTA
2. ✅ About — overview, mission, vision, stats
3. ✅ Services / Menu — industry-specific
4. ✅ Gallery — with lightbox
5. ✅ Testimonials — 3–6 reviews
6. ✅ Contact form — Name/Phone/Email/Message, validated
7. ✅ Google Map — embedded
8. ✅ Floating WhatsApp button → RavyaWorks lead-gen
9. ✅ Footer — hours, address, social
10. ✅ "Request Similar Website" CTA → RavyaWorks lead-gen
11. ✅ SEO — title, meta, OG tags, JSON-LD schema, semantic HTML, mobile-responsive, fast

---

## Tech Stack

- **HTML5** — semantic, accessible
- **CSS3** — custom properties for theming, no preprocessor
- **Vanilla JS** — no jQuery, no framework, ~400 lines
- **Fonts** — Google Fonts (Poppins + Inter)
- **Images** — local (downloaded into `assets/`)

No npm, no build step, no dependencies. Open `index.html` and it works.
