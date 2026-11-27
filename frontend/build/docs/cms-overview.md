# Intermaven Mother-CMS — Product & Architecture Overview

> **One source of truth. Every portal. Every region. Every audience.**

Intermaven **Mother-CMS** is a multi-portal, geo-aware headless content management system built natively into the Intermaven Creative & Business Operating System.

## Core Capabilities

1. **4-Tier Portal & Regional Resolution**
   Every content key resolves automatically using most-specific-first priority:
   - `portals[portal][region]` (e.g., `business` + `KE`)
   - `portals[portal]["default"]` (e.g., `music` / `hospitality` / `business`)
   - `regions[region]` (e.g., `KE`, `US`, `GB`, `CA`, `NG`, `ZA`)
   - `default` (Global fallback)

2. **Visual Studio Control Center**
   - Switch instantaneously across **Global**, **Business**, **Music (TuneMavens)**, and **Hospitality** portals.
   - Preview all 4 Homepage Hero Carousel slides live before publishing.
   - Rewrite or localize copy in 1 click using the integrated **Maven AI Copywriter** (`/api/ai/cms-assist`).
   - Manage hero backgrounds, banners, logos, and icons in the **Site Media Asset Library**.

3. **Immutable Revision History & 1-Click Rollback**
   - Every `PUT /api/admin/cms/{key}` snapshots the prior state (`default`, `regions`, `portals`, actor, timestamp).
   - Restore any historic revision safely in one click without redeploying code.

## Public API Quickstart

### Single Key Lookup
```http
GET /api/cms/pricing.callout.title?region=KE&portal=business
```

### Bulk Preload Lookup
```http
GET /api/cms/bulk/lookup?keys=homepage.hero.slide1.title,pricing.callout.title&region=US&portal=music
```
