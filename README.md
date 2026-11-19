# 3d studio — Dubai 3D Printing & Custom Creations (`print-studio-website`)

The independent, public-facing website for **LayerCraft 3D** — a premium design and 3D printing studio based in the Al Quoz Creative District, Dubai, United Arab Emirates.

Ported directly from the Google AI Studio prototype into a standalone, production-ready **Next.js 15 (App Router)** architecture compatible with **Cloudflare Pages static HTML export** (`output: 'export'`).

---

## 1. Core Principles & Business Boundary

- **Enquiry-Focused**: This website is an inquiry and custom fabrication showcase, **not** an e-commerce checkout platform.
- **No Cart or Checkout**: No shopping carts, payment gateways, Stripe, or checkout funnels exist. Customers browse creations, request custom prints, or submit inquiries directly to WhatsApp or the studio team.
- **Cloudflare Pages Static Export**: Built with `output: 'export'`, pre-rendering all routes and dynamic product detail pages (`generateStaticParams`) into high-performance static HTML/CSS/JS.
- **REST API Boundary**: Connects exclusively via `NEXT_PUBLIC_API_BASE_URL` to the public store endpoints exposed by the separate Vercel-hosted dashboard.
- **Zero Secrets / Zero Database Access**: No PostgreSQL credentials, no admin routes, no internal costing formulas, and no database connection strings are present in this repository.

---

## 2. Technology Stack

- **Framework**: Next.js 15 (App Router)
- **UI Library**: React 19
- **Language**: TypeScript (Strict Mode)
- **Styling**: Tailwind CSS v4 with custom `@theme` brand design tokens
- **Typography**: Google Fonts — Outfit (headings), Plus Jakarta Sans (body), JetBrains Mono (codes/references)
- **Icons**: Lucide React + custom SVG icons (`InstagramIcon`, `WhatsAppButton`, `BrandLogo`)
- **State Management**: React Context (`StoreContext`) with LocalStorage persistence for wishlist and simulated enquiry records

---

## 3. Brand & Visual Design System

- **Background / Canvas**: `#FCF2EC` (Warm Alabaster Cream)
- **Primary / Brand Navy**: `#0D1B35` (Deep Arabian Obsidian Navy)
- **Accent / Electric Orange**: `#F45A00` (Electric Warm Orange)
- **Subtle Accents**: Soft Peach (`#FCE3CB`), Muted Slate (`#737373`), Emerald (`#10B981`)
- **Studio Aesthetics**: High-end product photography, warm lighting, generous whitespace, rounded modern cards (`rounded-2xl`, `rounded-3xl`), and Dubai-market presentation.

---

## 4. Public API Integration

The website consumes the existing dashboard public endpoints:

| Endpoint | Method | Purpose |
| :--- | :--- | :--- |
| `GET /api/store/products` | `GET` | Fetches live catalog products with category and limit parameters |
| `GET /api/store/products/[slug]` | `GET` | Fetches individual product details by slug or ID |
| `POST /api/store/enquiries` | `POST` | Submits general inquiries or specific product inquiries |
| `POST /api/store/quotes` | `POST` | Submits custom 3D printing CAD quote requests (RFQ) |

When the API is connected (`NEXT_PUBLIC_API_BASE_URL`), live products are fetched on load and merged into the catalogue. In offline or demo mode, high-fidelity mock studio creations are displayed seamlessly with fallback references (`LC-ENQ-XXXXXX`, `LC-CUSTOM-XXXXXX`).

---

## 5. Routes & Pages

- **`/` (Homepage)**:
  - Hero banner with primary WhatsApp & catalogue CTAs
  - 4 Featured Category cards (Home Decor, Desk & Office, Toys & Figures, Corporate Gifts)
  - Curated Best Sellers carousel with Quick View and Enquire modals
  - Custom 3D Printing highlight with material badges (PLA, PETG, ABS, Resin)
  - Why LayerCraft 3D studio value propositions
  - Live Instagram Showcase linking to Instagram profile
- **`/shop` & `/products`**:
  - Full product catalogue with live search, price slider (up to AED 500), sort options (Featured, Price Low-High, Price High-Low, Newest)
  - Category selector pills (All, Home Decor, Desk & Office, Toys & Figures, Corporate Gifts)
  - Responsive product grid with wishlist toggling, quick view, and direct inquiry modal
- **`/products/[slug]`**:
  - Deep-linkable product detail page with thumbnail gallery switcher
  - Dynamic stock badge, color selector, quantity stepper, and AED pricing
  - Direct WhatsApp CTA pre-formatted with product name, quantity, and selected color
  - Detailed product specifications (Material, Dimensions, Lead time, Layer height, Shipping)
  - Related items carousel
- **`/custom-print` & `/custom`**:
  - Interactive Custom 3D Printing Quote estimator & RFQ request
  - Drag-and-drop CAD file uploader (.stl, .obj, .step, .3mf) with 25MB validation and progress simulation
  - Material guidance, custom dimensions, color selection, quantity, and required date
  - Direct WhatsApp RFQ message generator
- **`/about`**:
  - Studio founding story, Al Quoz Creative District workshop overview
  - Fleet capabilities (Bambu Lab high-speed printers, resin SLA, multi-color engineering)
  - UAE nationwide courier delivery coverage
- **`/contact`**:
  - Studio coordinates, operating hours, studio email, and Instagram handle
  - Instant WhatsApp support banner
  - Interactive enquiry form submitting to dashboard API and saving local reference code
- **`/_not-found` (`404.html`)**:
  - Styled 404 page matching the warm cream/navy brand design

---

## 6. Local Development Setup

### Prerequisites
- Node.js 20+ (tested on Node v26)
- npm 10+

### Installation & Run

1. Navigate to the project directory:
   ```bash
   cd "print-studio-website"
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure environment variables in `.env.local`:
   ```bash
   cp .env.example .env.local
   ```
   Default `.env.local`:
   ```env
   # Backend API Base URL (points to your Vercel-hosted dashboard)
   NEXT_PUBLIC_API_BASE_URL=http://localhost:3000

   # WhatsApp Business Contact (international format without + or spaces)
   NEXT_PUBLIC_WHATSAPP_NUMBER=971500000000

   # Social handles & Studio Coordinates
   NEXT_PUBLIC_INSTAGRAM_HANDLE=@3dstudio.dubai
   NEXT_PUBLIC_INSTAGRAM_URL=https://instagram.com/3dstudio.dubai
   NEXT_PUBLIC_STUDIO_LOCATION="Al Quoz Creative District, Dubai, UAE"
   NEXT_PUBLIC_STUDIO_EMAIL=hello@3dstudio.demo
   NEXT_PUBLIC_CURRENCY=AED
   ```

4. Start development server:
   ```bash
   npm run dev -- -p 3001
   ```

5. Open [http://localhost:3001](http://localhost:3001) in your browser.

---

## 7. Build & Static Export

Verify TypeScript types:
```bash
npm run typecheck
```

Build static export:
```bash
npm run build
```
This generates the optimized static bundle in the `out/` directory.

---

## 8. Cloudflare Pages Deployment

1. Push this repository to GitHub or GitLab.
2. In the [Cloudflare Dashboard](https://dash.cloudflare.com/), go to **Workers & Pages** > **Create Application** > **Pages** > **Connect to Git**.
3. Select this repository (`print-studio-website`).
4. Set Build Settings:
   - **Framework preset**: `Next.js (Static HTML Export)`
   - **Build command**: `npm run build`
   - **Build output directory**: `out`
5. Add Environment Variables:
   - `NODE_VERSION`: `20.18.0`
   - `NEXT_PUBLIC_API_BASE_URL`: `https://your-dashboard-domain.vercel.app`
   - `NEXT_PUBLIC_WHATSAPP_NUMBER`: `971500000000`
6. Deploy! Cloudflare Pages distributes the static assets to 300+ global edge locations.
