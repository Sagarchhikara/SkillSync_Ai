# SkillSync-Ai: Detailed System Summary

SkillSync-Ai is a web application designed to evaluate resume-job compatibility using NLP-based skill extraction and cosine similarity matching. Below is a detailed breakdown of its implemented features, core logic, API endpoints, and frontend integration.

---

## 1. Implemented Features

### Backend (Node.js/Express)
- **User Authentication:** 
  - Signup and Login mechanisms with JWT-based sessions.
- **Resume Processing:** 
  - Supports uploading `.pdf` and `.docx` files via `multer`.
  - Extracts raw text using `pdf-parse` (for PDFs) and `mammoth` (for DOCX).
  - Uses a Dictionary-based NLP approach to extract technical skills and normalize abbreviations (e.g., "NodeJS" -> "node.js").
- **Job Management:** 
  - Capability to create single jobs via API.
  - A handy "seed" endpoint to populate the database with realistic dummy jobs for testing.
  - Fetching a list of all available jobs.
- **Matching Engine:** 
  - Auto-matching between a user's latest uploaded resume and all existing jobs.
  - Calculates a "Match Percentage" based on the overlap between resume skills and required job skills.
  - Identifies exactly which skills are matched and which are missing.
- **User Profile & Saved Jobs:**
  - Persists extracted skills and education into the user profile.
  - Allows users to bookmark/save specific job recommendations.

### Frontend (React/Vite/Tailwind + shadcn/ui)
- **Landing & Auth Pages:** 
  - Welcoming landing page.
  - Dedicated Login and Signup forms.
- **Dashboard:**
  - **Overview Stats:** Displays key metrics like total uploaded resumes, jobs matched, and average match score.
  - **Resume Uploader:** A drag-and-drop interface for uploading resumes. Once uploaded, it instantly displays the parsed skills.
  - **Job Matching Analysis:** A fully fleshed-out view that ranks jobs against the user's resume. Displays a circular "Match Score" ring and provides a "You Have" vs "Missing" breakdown for skills.
  - **Job Uploader/Management:** A form to create custom job postings, or easily generate dummy jobs with a single click.
  - **Saved Jobs View:** Displays the list of jobs the user has actively bookmarked.

---

## 2. API Endpoints

### Authentication
- `POST /api/auth/signup`: Create a new user account.
- `POST /api/auth/login`: Authenticate an existing user.

### Resumes
- `POST /api/resume/upload`: Uploads a file (multipart/form-data with field `resume`), parses the text, extracts skills, and saves it to the database.

### Jobs
- `POST /api/jobs`: Create a new job listing.
- `GET /api/jobs`: Retrieve all job listings.
- `POST /api/jobs/seed`: Clears existing dummy jobs and re-seeds the database with sample jobs for testing.

### Matching
- `GET /api/match/auto/:userId`: Finds the most recent resume for the given `userId` and runs it against all jobs in the database. Returns a sorted list of ranked jobs with detailed match metrics.
- `GET /api/match/:resumeId/:jobId`: Calculates a real-time match percentage and skill delta between a specific resume and a specific job.

### Users
- `GET /api/users/:userId/profile`: Retrieves user profile information, including skills and education.
- `POST /api/users/:userId/jobs/:jobId`: Saves/bookmarks a specific job to the user's profile.
- `GET /api/users/:userId/jobs`: Retrieves all saved/bookmarked jobs for the user.
- `DELETE /api/users/:userId/jobs/:jobId`: Removes a saved job from the user's profile.

---

## 3. How It Works (The Core Logic)

### Step 1: Resume Parsing
When a user drops a resume into the **ResumeUploader** component, it hits `POST /api/resume/upload`. 
- `fileParserService.js` detects the file type.
- For PDFs, `pdf-parse` gets the raw text. For Document files, `mammoth` handles the extraction.

### Step 2: Skill Extraction
The raw text is then passed to `skillExtractionService.js`.
- **Normalization:** The text is converted to lowercase, extra spaces/newlines are wiped out.
- **Dictionary Lookup:** A predefined dictionary of hundreds of technical skills is matched against the text using boundary regex constraints (`\\s,.\/;:\\-"'\`()!`).
- **Standardization:** A mapping layer converts variations to a single source of truth (e.g., `react.js` and `reactjs` both become `react`).

### Step 3: Job Matching Algorithm
When the user goes to the **MatchResults** component, it invokes `GET /api/match/auto/:userId`.
- The backend retrieves the user's latest parsed resume and all system jobs.
- The `matchService.js` pure logic computes the match:
  1. Both the resume skills and the job's required skills are placed into Sets.
  2. The service checks the intersection (Matched Skills) and the difference (Missing Skills).
  3. Formula: `(Total Matched Skills / Total Required Skills) * 100` calculates the percentage.
- The backend sorts the results so the highest match percentage is at the top and sends the ranked payload back to the React frontend.

### Step 4: UI Representation
- The React application parses the matching output and renders interactive **Score Cards**. 
- Users are visually shown green pills for matched skills and red pills for missing ones, offering actionable insights into their skillset gaps.
