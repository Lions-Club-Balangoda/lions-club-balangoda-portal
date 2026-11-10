# Club-Supplied Data Handover & Asset Ingestion Tracker

**Project:** Web Portal & Content Management System for Lions Club of Balangoda  
**Course:** IS5109 – Information Systems Project for Community (Group 14)  
**Institution:** Sabaragamuwa University of Sri Lanka  
**Client:** Lions Club of Balangoda (Lions Clubs International District 306)  
**Liaison Leads:** M.H.M Yoosuf (22FIS0519) & M.P Asmad Sahee (22FIS0543)  
**Client Representatives:** Lion Prof. T. Sanjeewa Prasad Jayaweera & Lion H.M. Bandara  
**Scope Reference:** [MVP Scope Freeze Specification](mvp-scope-specification.md)  
**Status:** **ACTIVE TRACKER** | **Last Verified:** 2026-10-07

---

## 1. Asset Delivery Tracking Register

| Asset ID | Data Item & Required Format | Designated Club Owner | Due Date | Ingestion Status | Target Codebase Location / Storage | Verified By |
|---|---|---|---|---|---|---|
| **D1** | **Balangoda Charter History & Mission:** 500-word historical brief (Docx/PDF). | **Lion H.M. Bandara** (Secretary) | **Oct 16, 2026** | 🟡 *In Preparation* | `src/data/club-history.ts` & `/about` page | Yoosuf |
| **D2** | **Brand Crests & Logos:** High-resolution vector / PNG of Lions International District 306 logo and club crest. | **Lion Prof. T. Sanjeewa Prasad Jayaweera** (President) | **Oct 12, 2026** | 🟢 **Delivered (Verified)** | `public/images/branding/` | Jinos |
| **D3** | **Executive Board Directory Records:** High-res portrait photos, full names, designations, and contacts for 2025–2026 & 2024–2025 terms. | **Lion H.M. Bandara** (Secretary) | **Oct 20, 2026** | 🟡 *In Preparation* | `src/data/board-members.ts` & Cloudinary `/board` folder | Asmad |
| **D4** | **Flagship Projects Archive (5–10 initiatives):** Titles, summaries, beneficiary counts, and 5–8 photos per project across Healthcare, Education, Environment, Relief. | **Lion Dr. R.M. Senarathne** (Project Chair) | **Oct 23, 2026** | 🟡 *In Progress (3 of 6 received)* | `src/data/mock-projects.ts` & `database/seeds/001_initial_seed.sql` | Ahnaf |
| **D5** | **Secretariat Physical Coordinates & Contacts:** Office location, Google Maps coordinates, phone numbers, and official club email (`lionsbalangoda@gmail.com`). | **Lion H.M. Bandara** (Secretary) | **Oct 14, 2026** | 🟢 **Delivered (Verified)** | `src/data/club-contact.ts` & `/contact` page | Yoosuf |
| **D6** | **Bank Account Wire Transfer Information:** Official club bank account name, number, branch, and SWIFT code for public donations. | **Lion K.G. Wijeratne** (Treasurer) | **Oct 19, 2026** | 🟡 *In Preparation* | `src/data/donation-details.ts` & `/donate` info block | Zeenath |
| **D7** | **Domain Registration & Hosting Invoicing:** Payment receipt for `lionsbalangoda.org` / `.lk` registration and server provisioning. | **Lion K.G. Wijeratne** (Treasurer) | **Oct 23, 2026** | 🟡 *Processing Payment* | Project Invoicing Records & Deployment Config | Nafris |

---

## 2. Ingestion Protocols & Validation Standards

1. **Photographic & Visual Quality:**
   - All event and portrait photos must have a minimum resolution of `1200x800 px` in JPEG/WebP.
   - Images depicting beneficiaries in sensitive situations (e.g., medical screenings or minor children) must carry verified consent from the club committee.
2. **Copywriting & Language Standards:**
   - Textual copy provided by the club will be reviewed by the student editorial team for grammatical clarity and community accessibility prior to publishing in production.
3. **Storage Pipeline:**
   - Raw master assets are archived in the club's shared Google Drive repository.
   - Web-optimized assets are uploaded to the Cloudinary CDN under folder `lions-balangoda/`.
