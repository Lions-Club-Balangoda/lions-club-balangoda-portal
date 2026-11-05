# Requirements Validation Session Minutes & Scope Freeze Record

**Course:** IS5109 – Information Systems Project for Community (Group 14)  
**Project:** Web Portal & Content Management System for Lions Club of Balangoda  
**Institution:** Department of Computing & Information Systems, Sabaragamuwa University of Sri Lanka  
**Client:** Lions Club of Balangoda (Lions Clubs International District 306)  
**Task:** Run requirements validation session with club officers and freeze MVP scope  
**Priority:** Highest | **Paired Leads:** M.H.M Yoosuf (22FIS0519) & M.P Asmad Sahee (22FIS0543)  
**Reviewer:** M.A.J.A Ahnaf (22FIS0569)  
**Status:** **OFFICIALLY RATIFIED BY CLUB OFFICERS**  
**Session Date:** Wednesday, October 07, 2026 | **Time:** 10:00 AM – 12:45 PM (+05:30)  
**Location:** Lions Activity Centre & Secretariat, Balangoda (Hybrid: In-Person & Google Meet)

---

## 1. Meeting Overview & Attendance

The purpose of this session was to conduct a comprehensive walkthrough of all Functional Requirements (`FR-01` to `FR-07`), Non-Functional Requirements (`NFR-01` to `NFR-04`), and Security Constraints (`SEC-01` to `SEC-05`) with authorized executive officers of the Lions Club of Balangoda. The session formally identified features included in the Minimum Viable Product (MVP), recorded modifications, deferred non-essential capabilities to post-MVP Phase 2, established club-supplied data ownership, and resolved key operational questions.

### 1.1 Attendees & Verification Ledger

| # | Participant | Role / Designation | Organization | Attendance Mode |
|---|---|---|---|---|
| **1** | **Lion Prof. T. Sanjeewa Prasad Jayaweera** | Club President (Authorized Client Signatory) | Lions Club of Balangoda | In-Person |
| **2** | **Lion H.M. Bandara** | Club Secretary & Administrative Officer | Lions Club of Balangoda | In-Person |
| **3** | **Lion Dr. R.M. Senarathne** | Project Committee Chair (Healthcare & Eye Camps) | Lions Club of Balangoda | In-Person |
| **4** | **Lion K.G. Wijeratne** | Club Treasurer & Finance Director | Lions Club of Balangoda | Google Meet |
| **5** | **Mr. K. P. D. P. Patabandi** | Internal Academic Supervisor (Lecturer) | Sabaragamuwa University of Sri Lanka | Google Meet |
| **6** | **M.H.M Yoosuf** (22FIS0519) | Sprint 1 Facilitator & Stakeholder Coordinator | Student Team (Group 14 Lead) | In-Person |
| **7** | **M.P Asmad Sahee** (22FIS0543) | Backlog Quality Coordinator & DB Architect | Student Team (Group 14) | In-Person |
| **8** | **M.A.J.A Ahnaf** (22FIS0569) | Testing Strategy & QA Lead | Student Team (Group 14) | In-Person |
| **9** | **M.N.M Nafris** (22FIS0545) | Technical Architecture Lead | Student Team (Group 14) | In-Person |
| **10** | **M.J.A Jinos** (22FIS0572) | UI/UX Consistency Lead | Student Team (Group 14) | In-Person |
| **11** | **M.S.F.I. Zeenath** (22FIS0593) | Deployment Readiness & Documentation Lead | Student Team (Group 14) | Google Meet |

---

## 2. Session Proceedings & Discussion Points

### 2.1 Opening & Benchmark Validation (10:00 – 10:25 AM)
- **Yoosuf (Team Lead)** welcomed the attendees and outlined the agenda. He demonstrated the architectural benchmark ([sabraleos.org](https://sabraleos.org)) and explained how the proposed portal will adapt this proven design to serve the Balangoda community.
- **Lion Prof. Jayaweera (President)** stated that the club’s primary goal is global credibility and local engagement. Overseas benefactors and Lions International District 306 leadership must be able to view verified project briefs, audit impact metrics, and validate executive board credentials without wading through disorganized social media pages.

### 2.2 Walkthrough of Functional Requirements FR-01 through FR-07 (10:25 – 11:30 AM)
The student team led by Yoosuf and Asmad systematically presented each requirement:

1. **FR-01 (Homepage & Service Pillars):**
   - *Discussion:* The club officers confirmed the 4 core humanitarian pillars: **Healthcare** (cataract camps & diabetes clinics), **Education** (school bags, books, scholarships), **Environment** (watershed reforestation & cleanups), and **Poverty Relief** (dry ration distributions and emergency flood response).
   - *Decision:* Confirmed for MVP. Club will also provide the historical narrative of the Balangoda Charter.

2. **FR-02 (Projects Archive & Filtering):**
   - *Discussion:* Ahnaf demonstrated the prototype filtering by pillar, year, and keyword.
   - *Officer Feedback:* Lion Dr. Senarathne commended the search and asked if past projects from 2024 and 2025 could be loaded. Team confirmed that 5–10 historical flagship projects will be seeded in MVP.
   - *Decision:* Confirmed for MVP.

3. **FR-03 (Project Details & Lightbox Gallery):**
   - *Discussion:* Club officers emphasized that visual proof (photos of spectacles handed over, saplings planted) is critical for donor transparency.
   - *Decision:* Confirmed for MVP. High-resolution gallery with responsive lightbox preview for every project.

4. **FR-04 (Executive Board Directory):**
   - *Discussion:* Lion Secretary Bandara explained that club elections occur annually in June, transitioning every July (Lionistic Year format: e.g., `2024-2025`, `2025-2026`).
   - *Decision:* Confirmed for MVP. Directory must support filtering by Lionistic Year, with current executive committee prominently highlighted.

5. **FR-05 (Volunteer Signup & General Inquiries):**
   - *Discussion:* The proposal initially grouped inquiries and volunteers into one generic table. Asmad explained the architectural revision to separate volunteer registrations (which need skillsets and availability) from general inquiries.
   - *Officer Feedback:* Lion Secretary Bandara strongly supported the separation. He requested an automated email confirmation sent to the applicant, plus an instant alert sent to the club’s official Gmail (`lionsbalangoda@gmail.com`).
   - *Decision:* Confirmed with enhancement for MVP.

6. **FR-06 (Admin CMS for Projects, News, and Board):**
   - *Discussion:* Asmad and Yoosuf clarified Proposal Gap #2: `NewsAnnouncement` was missing from the proposal ER. The team proposed adding full News & Announcements management alongside Projects and Board members.
   - *Officer Feedback:* Club President enthusiastically approved. Club officers also requested an easy, code-free rich text editor so non-technical officers can format text without HTML.
   - *Decision:* Confirmed with News inclusion for MVP.

7. **FR-07 (Review, Status Management & Export of Submissions):**
   - *Discussion:* Club Secretary needs to export received volunteer lists to CSV/Excel for organizing health camps.
   - *Decision:* Confirmed for MVP (CSV export format agreed).

---

### 2.3 Non-Functional & Security Walkthrough (11:30 – 12:00 PM)

1. **NFR-01 (Performance < 2.5s on 4G):**
   - Nafris and Yoosuf explained that Cloudinary CDN image compression and Next.js SSR will ensure ultra-fast load times even on rural mobile connections around Balangoda and Kaltota.
   - *Decision:* Confirmed for MVP.

2. **NFR-02 (Usability & Responsiveness):**
   - Jinos explained mobile-first testing from 360px (smartphones) up to 1920px (desktop monitors), following Lions Clubs International Gold (`#F2A900`) and Navy Blue (`#003366`) brand guidelines.
   - *Decision:* Confirmed for MVP.

3. **NFR-03 & NFR-04 (Availability & Maintainability):**
   - 99.5% uptime target, weekly automated database backups, clean MVC codebase.
   - *Decision:* Confirmed for MVP.

4. **Security Requirements (SEC-01 to SEC-05):**
   - Nafris presented HTTPS enforcement, parameterized queries, bcrypt password hashing, and CSRF token defenses.
   - *Decision:* Confirmed for MVP.

---

### 2.4 Scope Freezing & Deferrals (12:00 – 12:30 PM)

The attendees agreed upon the boundary separating **MVP (Sprints 1–3)** from **Post-MVP (Phase 2)**:

1. **Direct Online Payment Gateway (Donations):**
   - *Discussion:* The club previously considered direct online card donations. However, setting up a merchant Internet Payment Gateway (IPG) in Sri Lanka involves banking compliance and merchant fees outside the academic timeline and budget (LKR 17,500).
   - *Decision:* **DEFERRED TO PHASE 2**. For MVP, the portal will display verified Club Bank Account transfer details and an online donation inquiry form.

2. **Multi-Language Localization (Sinhala & Tamil):**
   - *Discussion:* Translating dynamic project archives into three languages requires specialized translation workflows.
   - *Decision:* **DEFERRED TO PHASE 2**. MVP will launch in English, using clear, accessible community language.

3. **Public Member Discussion Forum:**
   - *Discussion:* Public comments or community forums would require active content moderation and spam filtering.
   - *Decision:* **DEFERRED TO PHASE 2**.

4. **Automated SMS Alerts:**
   - *Discussion:* SMS gateways in Sri Lanka require per-SMS billing.
   - *Decision:* **DEFERRED TO PHASE 2**. Transactional Email notifications via SMTP/Resend confirmed for MVP.

---

## 3. Formal Officer Ratification & Session Closure (12:30 – 12:45 PM)

Lion Prof. T. Sanjeewa Prasad Jayaweera formally ratified the session decisions:

> *"On behalf of the Lions Club of Balangoda, I confirm that the scope outlined during this session accurately captures our operational requirements. The freeze on MVP deliverables is approved. The club commits to delivering the necessary historical text, photos, and verified records per the data handover schedule."*

**Certified by:**
- **Lion Prof. T. Sanjeewa Prasad Jayaweera** — President, Lions Club of Balangoda
- **Lion H.M. Bandara** — Secretary, Lions Club of Balangoda
- **M.H.M Yoosuf** — Team Lead / Sprint Facilitator, SUSL Group 14
- **M.P Asmad Sahee** — Backlog Quality Coordinator, SUSL Group 14
