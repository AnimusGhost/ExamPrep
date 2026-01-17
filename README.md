# Payroll Technician Exam Prep

A production-quality practice site for Payroll Technician certification prep. Built with Vite + React + TypeScript + Tailwind CSS.

## Features
- Timed exam simulator with navigation grid, timer, and review mode.
- Topic practice with configurable domains, difficulty, and question types.
- Flashcards with spaced repetition-lite scheduling.
- Progress analytics with charts and remediation guidance.
- Question bank browser with optional Author Mode.
- Local-only persistence with export/import.

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
2. Push to `main`. The workflow will build and deploy automatically.

The Vite configuration auto-detects the GitHub repository name via the `GITHUB_REPOSITORY` environment variable and sets the correct base path.

## Updating the question bank
- Base question bank is defined in `src/data/questionBank.ts`.
- Author Mode lets you create/edit questions locally in the Question Bank page and stores them in localStorage.
- Use Settings → Export to download JSON for backups.

## Author Mode
Enable Author Mode in Settings to add/edit/delete questions locally. Export JSON to keep your updated bank.
