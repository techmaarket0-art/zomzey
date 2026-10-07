# 01 — Audit of the current ZOMZEY homepage

> **Method note.** zomzey.io could not be loaded directly from the design environment
> (the network policy blocks the domain). The audit below is built from search-index
> snapshots of `zomzey.io/` ("Zomzey: Discover"), `/for-tiktok-creators/`,
> `/travel-gear-guide-makers/`, `/influencer-pricing-calculator/`, a public vendor
> profile, the older waitlist page, ZOMZEY's own recruitment brief, and the Companies
> House record for ITXL LTD. Copy is quoted only where the snapshots carried it.
> Visual observations are inferred from page structure rather than from a rendered
> screenshot, and are flagged as such.

## What ZOMZEY is (in its own words)

- **"ZOMZEY™ – the world's first opportunity-led platform."**
- **"Welcome to ZOMZEY, the platform where everybody wins."**
- "ZOMZEY is the place where people with something to sell, who want sales, traction or
  a bigger audience, post their needs in their ZOMZEY dashboard. Professional
  Influencers and real-world venues then pitch to win that work."
- **"Pioneers post, members pitch to win."** (heading over the live feed)
- **"Pioneers, Influencers and Hubs all under one roof, so every deal starts and finishes here."**

## The three sides (real terminology)

| Side | Who (as listed on the site) | Role |
|---|---|---|
| **Pioneers** | Brands, authors, founders, small businesses. Category pages: Beauty & Cosmetics, Fashion, Food & Drink, Fitness & Wellness, Kids & Parenting makers, Authors, Course creators, App & SaaS founders, Travel gear & guide makers | Post opportunities (free) |
| **Influencers** | YouTubers, Instagram influencers, TikTok creators, bloggers, Twitch streamers, podcasters, newsletter writers, TV & radio personalities; musicians and bands are named in ZOMZEY's recruitment brief | Pitch / send offers |
| **Hubs** | Bookshops, libraries, clubs, venues, cafés, community groups, book clubs, independent retailers, subscription boxes, trade shows, awards panels, trade press | Pitch / send offers. "The only marketplace connecting you direct to bookshops, libraries, clubs and venues." |
| **Agencies** | Talent agencies / management | "Bring your whole roster"; send offers on behalf of talent |

## How a deal works

1. A Pioneer posts an opportunity (product, audience, appeal, budget). Posting is free.
2. Influencers and Hubs respond with **priced proposals** (e.g. packing feature, field
   review, guide tie-in, retail placement, stocking a title, a book-club pick).
3. Both sides compare and negotiate in a **secure live chat**.
4. Money goes into **Protected Payments**: "held in escrow before you film",
   "only released when the work is approved".
5. If something goes wrong: "a fair and clear process has your back." (**Disputes covered**)

## Trust claims that can be reused (verified on the site)

- "Every Deal Protected · Verified Members · Disputes Covered · Secure payments · powered by **Stripe**"
- "Every brand on ZOMZEY is verified."
- Linking social accounts unlocks the ZOMZEY verified badge; each completed deal adds to a verified track record.
- "Join, build your profile, browse and pitch for nothing. **You only pay on a real deal.**"
- "A small commission keeps the platform running." (rate not published in the snapshots — **not used**)
- Every paid collaboration should be labelled as an ad (ASA guidance).
- Footer: "A trading name of ITXL LTD", company no. 17060034, 169 Great Portland Street, London.

**Deliberately not used in the redesign:** member counts, deal volumes, commission %,
the "world's first" superlative, and the time-limited "3 months Pro free" offer — none can be
verified from the material available, and unverifiable claims weaken trust.

## Product features & tools

- **ZAi** — "drafts with you, suggests strong matches, and sharpens everything you put out…
  You approve every word, nothing auto-publishes."
- **ZBeacon** — "The engine that fills ZOMZEY with opportunity." Finds people who are not on
  ZOMZEY yet "and brings them in with your offer attached."
- **Smart filters** — "narrow by niche, reach, engagement, price and location in seconds."
- **Profiles** — "Showcase your best photo, video and packages so buyers see exactly what they get."
- **Live dashboard** — "tracks offers, deals and earnings in one clear view. Built for your phone."
- **Affiliate** — "Become an affiliate the moment you join and earn every time you refer someone in."
- **Free tools** — Influencer Pricing Calculator (rough benchmark ≈ £10 per 1,000 followers for a feed
  post; nano 1k–10k "a few pounds up to around £100"), Engagement Rate Calculator, Campaign Brief
  Generator, Hub Earnings Estimator ("Shops, cafés, venues, communities: see what your space and
  audience could be earning"), Keep Calculator ("Honest maths, no small print").
- Currency shown in **£ and $**; members are international (e.g. a verified UGC creator in Tijuana).

## Target users

1. **Promoters (Pioneers):** small brands, indie authors, founders, makers who need reach but cannot
   afford an agency.
2. **Earners (Members):** nano/micro creators, musicians, and — uniquely — physical Hubs
   (bookshops, venues, clubs, cafés, libraries) that have an audience but no way to monetise it.
3. **Multipliers:** talent agencies, community admins and talent managers (affiliate).

## UX & content weaknesses

| # | Issue | Evidence | Consequence |
|---|---|---|---|
| 1 | **Diluted primary action** | "Lets Get started →" (missing apostrophe), "Get started here", "Signup here", "Sign up free" all compete | Visitors aren't told *which* door is theirs |
| 2 | **The two intents aren't separated at the entrance** | Hero speaks to everyone at once | A venue owner and an author read the same generic line |
| 3 | **The real differentiator is buried** | Hubs (bookshops, libraries, venues, clubs) appear as one bullet in a "Why ZOMZEY" list | Site reads as "yet another influencer marketplace" |
| 4 | **Terminology drift** | Creators vs Influencers vs Members; Pioneers defined differently on two pages | Extra cognitive load for new users |
| 5 | **Feature list instead of a story** | Filters, profiles, affiliate, dashboard listed with equal weight | Nothing explains *how a deal actually feels* |
| 6 | **Trust is a badge strip** | "Every Deal Protected ✓ Verified Members ⚖ Disputes Covered" as icons | Strong safety mechanics are asserted, not shown |
| 7 | **Unverifiable superlative leads** | "World's first opportunity-led platform" | Feels promotional where it should feel safe |
| 8 | **Free tools hidden in the menu** | Calculators/estimators only reachable via navigation | Lost acquisition and lost proof of transparency |
| 9 | **Weak page title** | `<title>Zomzey: Discover</title>` | Poor search/share preview |
| 10 | **Visual (inferred)** | Template-like stacked sections with equal-weight blocks | No memorable image of "a network" |

## Design brief distilled

- Lead with the **mechanic** (post → pitch → protected payment), not a superlative.
- Make **two doors** obvious: *I need promotion* / *I want to earn*.
- Show **variety** — books, music, venues, food, beauty, apps, travel — so it never reads as influencer-only.
- **Show** trust in the flow of a deal; keep Stripe/verification/disputes claims exactly as the site states them.
- Surface the free tools as proof of transparency.
