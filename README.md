# Payroll Technician Exam Prep

A production-quality practice site for Payroll Technician certification prep. Built with Vite + React + TypeScript + Tailwind CSS.

## Features
- Timed exam simulator with navigation grid, timer, and review mode.
- Topic practice with configurable domains, difficulty, and question types.
- Flashcards with spaced repetition-lite scheduling.
- Progress analytics with charts and remediation guidance.
- Question bank browser with optional Author Mode.
- Local-only persistence with export/import.
- Optional cloud sync (Firebase Auth + Firestore) for multi-device continuity.

## Local development
```bash
npm install
npm run dev
```

## Build
```bash
npm run build
npm run preview
```

## GitHub Pages deployment
This repo includes a GitHub Actions workflow that builds and deploys to GitHub Pages on every push to `main`.

### Setup
1. In your repository settings, enable GitHub Pages and set the source to **GitHub Actions**.
2. Push to `main` or run the workflow manually from the Actions tab.

The Vite configuration auto-detects the GitHub repository name via the `GITHUB_REPOSITORY` environment variable and sets the correct base path.

## Cloud mode (Firebase)
Cloud mode is optional and the app works fully offline without it.

### 1) Create a Firebase project
- Enable **Authentication** (Email/Password and Google)
- Enable **Firestore**

### 2) Add environment variables
Create a `.env.local` file with:
```
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
```

You can also add these as GitHub Actions secrets to enable cloud mode in production builds.

### 3) Turn on Cloud Mode
Open Settings → Cloud Mode. If keys are missing, the UI will show a “Cloud features unavailable” message.

## Updating the question bank
- Base question bank is defined in `src/data/questionBank.ts`.
- Author Mode lets you create/edit questions locally in the Question Bank page and stores them in localStorage.
- Use Settings → Export to download JSON for backups.

## Author Mode
Enable Author Mode in Settings to add/edit/delete questions locally. Export JSON to keep your updated bank.
