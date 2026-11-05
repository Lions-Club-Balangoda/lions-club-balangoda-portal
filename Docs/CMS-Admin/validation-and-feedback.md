# CMS Admin Validation & Feedback Specification

**Project:** Lions Club of Balangoda Web Portal & Content Management System  
**Course:** IS5109 Community Project (Group 14)  
**Target Users:** Non-Technical Club Officers  
**Requirement Mapping:** FR-06 & FR-07 (Security SEC-01–SEC-05, Usability NFR-02)  
**Reviewer:** Jinos  
**Author:** Ahmed Ahnaf (Branch: `ahmed_ahnaf`)  

---

## 1. Usability Principles for Validation & Feedback

For club officers who are non-technical volunteers, error messages must be constructive, compassionate, and actionable. 

Key principles applied across all CMS interfaces:
1. **Plain Language:** Avoid technical jargon (e.g., replace *"HTTP 500 internal server error"* with *"We couldn't save your changes due to a temporary server issue"*).
2. **Inline Guidance:** Errors appear immediately beside the offending field with red highlighting, rather than in generic popups.
3. **Preservation of Work:** Validation failures never erase form entries or rich-text paragraphs.
4. **Actionable Correction:** Every error message tells the officer exactly how to fix the issue.
5. **Positive Reinforcement:** Successful actions always provide immediate visual feedback (toasts and status badges).

---

## 2. Comprehensive Validation & Feedback Matrix

| Field / Operation | Validation Condition | Plain-Language Error Message | Action Blocked? | How the Admin Can Correct the Issue | Source / Rule Status |
|---|---|---|---|---|---|
| **Admin Login: Email** | Empty field upon submission | *"Please enter your official email address."* | **Yes** | Type your club officer email into the email box. | Required Field Check |
| **Admin Login: Email Format** | String does not conform to email pattern (`user@domain.com`) | *"Please enter a valid email address (e.g., officer@balangodalions.org)."* | **Yes** | Check for typos or missing `@` symbol in the email address. | Standard Email Validation |
| **Admin Login: Password** | Empty password field | *"Please enter your password."* | **Yes** | Type your officer account password. | Required Field Check |
| **Admin Login: Authentication** | Email not found or password hash mismatch | *"Incorrect email or password. Please double-check your credentials and try again."* | **Yes** | Verify caps lock is off. If forgotten, click "Forgot password?" to reset via email. | Security Requirement SEC-04 |
| **Project Title** | Blank or fewer than 5 characters | *"Please enter a project title (minimum 5 characters)."* | **Yes** | Enter a descriptive name for the project (e.g., "Free Vision Camp 2026"). | Database Schema `VARCHAR(150) NOT NULL` |
| **Project Title Length** | Exceeds 150 characters | *"Project title is too long (maximum 150 characters)."* | **Yes** | Shorten the headline. Additional details can be placed in the summary or body. | Schema Constraint |
| **Project Slug** | Contains invalid URL characters | *"Web links can only contain lowercase letters, numbers, and hyphens."* | **Yes** | The system will auto-format this for you, or you can remove special punctuation manually. | URL Routing Rule |
| **Project Slug Uniqueness** | Slug already exists in database | *"A project with this web link already exists. Please choose a slightly different title or link."* | **Yes** | Add the year or location to the end of the title (e.g., "-balangoda"). | Schema Constraint `UNIQUE` |
| **Project Category** | Not selected from list | *"Please select a service pillar category for this project."* | **Yes** | Click the dropdown and select one of the club's 5 service pillars. | Proposal Service Pillars |
| **Project Event Date** | Blank or unparseable date | *"Please select the date when this project took place."* | **Yes** | Click the calendar icon and select a valid date. | Schema `DATE NOT NULL` |
| **Project Location** | Blank or under 2 characters | *"Please enter the location or venue of the project."* | **Yes** | Type the town, hospital, or hall name where the activity occurred. | Schema `VARCHAR(100) NOT NULL` |
| **Project Cover Image** | Missing when clicking "Publish Now" | *"A cover photo is required before publishing a project to the public website."* | **Yes** | Click "Select Cover Photo" and upload or choose an image. (You can save as Draft without a photo). | Public Portal Rule |
| **Project Summary** | Blank or fewer than 10 characters | *"Please write a short summary (at least 1–2 sentences) explaining the project."* | **Yes** | Provide a brief overview of the project's goal and community impact. | Schema `VARCHAR(500) NOT NULL` |
| **Project Summary Length** | Exceeds 500 characters | *"Summary is too long (maximum 500 characters). Please move full stories to the main text box below."* | **Yes** | Shorten the preview text. | Schema Constraint |
| **Project Body Content** | Blank or under 20 characters | *"Please enter the full project story and impact details."* | **Yes** | Type or paste the project report into the rich-text editor. | Schema `TEXT NOT NULL` |
| **Project Gallery Count** | More than 20 photos attached | *"You can attach a maximum of 20 photos to a single project gallery."* | **Yes** | Remove extra images from the gallery selection grid before saving. | Usability & Storage Limit (Proposed) |
| **News Article Headline** | Blank or fewer than 5 characters | *"Please enter a headline for the news article."* | **Yes** | Type the announcement or article headline. | Schema `VARCHAR(200) NOT NULL` |
| **News Type** | Not selected | *"Please select the type of news (News, Announcement, or Press Release)."* | **Yes** | Choose the appropriate item type from the dropdown. | Schema Enum `news_type_enum` |
| **News Article Content** | Blank content | *"Please provide the body content for this news article."* | **Yes** | Write the details of the news announcement in the text editor. | Schema `TEXT NOT NULL` |
| **News Expiration Date** | Date selected is in the past | *"The auto-unpin date must be in the future."* | **Yes** | Pick a date after today from the calendar, or clear the date field if not needed. | Logic Constraint |
| **Board Member: Name** | Blank or under 2 characters | *"Please enter the officer's full name."* | **Yes** | Enter the member's legal or recognized full name. | Schema `VARCHAR(150) NOT NULL` |
| **Board Member: Designation**| Blank or under 2 characters | *"Please specify the club office or designation (e.g., President, Secretary)."* | **Yes** | Type the official club position held by the member. | Schema `VARCHAR(100) NOT NULL` |
| **Board Member: Term Year** | Term not selected | *"Please select the Lionistic administrative year for this officer."* | **Yes** | Select the term year (e.g., 2026/2027) from the dropdown list. | Foreign Key to `board_terms` |
| **Board Member: Display Order**| Blank, negative, or non-numeric | *"Display order must be a positive whole number (e.g., 1 for President)."* | **Yes** | Enter 1, 2, 3, etc., to control where this officer appears on the roster. | Schema `INTEGER NOT NULL DEFAULT 0` |
| **Board Member: Email** | Invalid email format | *"Please enter a valid contact email address or leave the field blank."* | **Yes** | Correct the email address syntax. | Email Validation |
| **Media File: Type** | File extension not JPG, PNG, WebP | *"Unsupported file type. Please upload images in JPG, PNG, or WebP format."* | **Yes** | Select an image file with `.jpg`, `.jpeg`, `.png`, or `.webp` extension. PDF or Word documents are not supported as photos. | Media Security Rule |
| **Media File: Size** | File size exceeds 5.0 MB | *"This image is too large ([X] MB). The maximum allowed size is 5.0 MB."* | **Yes** | Choose a smaller image or resize the photo using a free image editor before uploading. | NFR-01 Performance Rule |
| **Media File: Corrupt Upload** | Upload interrupted by network failure | *"Upload was interrupted. Please check your internet connection and try again."* | **Yes** | Click the retry icon on the failed thumbnail. | Network Resilience |
| **Volunteer Notes Length** | Administrative notes exceed 1,000 characters | *"Internal notes cannot exceed 1,000 characters."* | **Yes** | Trim down lengthy interview notes. | Schema Constraint |
| **Network Failure on Save** | Server unreachable / connection lost | *"We could not connect to the server. Your unsaved text has been kept in your browser. Please check your internet connection and click Save again."* | **Yes** | Verify internet connection; click Save again without refreshing the page. | Resilience & Usability |
| **Database Server Error** | HTTP 500 returned by API | *"Something went wrong on our server while saving. Please try again in a few moments. If the problem persists, please contact the IT team."* | **Yes** | Wait a few moments and click Save again. | Error Handling NFR-04 |

---

## 3. Success Feedback Standards

All successful actions must provide immediate, unambiguous feedback to give officers confidence that their work has been saved.

### Toast Notification Patterns
Toasts appear in the top-right corner of the viewport, auto-dismiss after 4.5 seconds, and include a manual close icon:
- **Project Created & Published:**  
  `[Green Checkmark Icon]` *"Project 'Free Vision Screening Camp' is now live on the website!"*
- **Project Saved as Draft:**  
  `[Blue Info Icon]` *"Project 'Annual Book Donation' has been saved as a draft. It is not visible to the public."*
- **Project Updated:**  
  `[Green Checkmark Icon]` *"Changes to 'Free Vision Screening Camp' have been saved."*
- **Project Unpublished:**  
  `[Amber Warning Icon]` *"Project 'Free Vision Screening Camp' was unpublished and moved to Drafts."*
- **Project Deleted:**  
  `[Green Checkmark Icon]` *"Project '[Title]' was permanently deleted."*
- **Media Uploaded:**  
  `[Green Checkmark Icon]` *"Photo '[filename.jpg]' was successfully uploaded and optimized."*
- **Submission Status Updated:**  
  `[Green Checkmark Icon]` *"Volunteer application for [Name] updated to [ACCEPTED]."*
- **CSV Download Started:**  
  `[Blue Download Icon]` *"Generating export file... Your spreadsheet download has started."*

---

## 4. Visual Badging & State Indicators

To ensure officers understand the publication state of any content at a glance, standard visual color tokens are utilized across all CMS tables:

- **`PUBLISHED` (Live on Public Portal):** Solid Green Pill (`bg-green-100 text-green-800 border-green-300`).
- **`DRAFT` (Saved in CMS Only):** Solid Amber Pill (`bg-amber-100 text-amber-800 border-amber-300`).
- **`ARCHIVED` (Historic Record):** Solid Gray Pill (`bg-gray-100 text-gray-700 border-gray-300`).
- **`PINNED` (Featured Announcement):** Red Tag with Pin Icon (`📌 Featured on Homepage`).
- **`PENDING` (Volunteer Signup):** Blue Warning Pill (`bg-blue-100 text-blue-800`).
- **`NEW` (Public Inquiry):** Indigo Notification Pill (`bg-indigo-100 text-indigo-800`).
- **`RESOLVED` (Public Inquiry):** Gray Checkmark Pill (`bg-gray-100 text-gray-600`).
