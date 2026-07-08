# 🎨 Code Migration Tool - Frontend Interface

This is the frontend client for the **Code Migration Tool**, built using React, Vite, Tailwind CSS, and TypeScript. It provides a visual workspace to upload projects, inspect auto-detected frameworks, customize target translation architectures, and monitor background compilation progress.

---

## ✨ Features

*   **Drag-and-Drop Uploader**: Seamlessly drag and drop your legacy project ZIP archives to initialize analysis.
*   **Auto-Detection Display**: Highlights the source framework automatically determined by the backend parser.
*   **Custom Framework Overrides**: Allows developers to explicitly set source-target matrices (e.g. override React detection to migrate to Next.js).
*   **Live Compilation Progress**: Polls status updates (`pending`, `completed`, `failed`) and streams results from the background worker.
*   **Result Download Hub**: Instantly downloads successfully restructured files as a clean, ready-to-run ZIP archive.
*   **Premium Visual Experience**: Beautiful responsive styling powered by Tailwind CSS and modern UI icons via `lucide-react`.

---

## 🛠️ Project Structure

The interface files are laid out as follows:

*   [`/src/components`](file:///d:/ashif/Resume%20Projects/migration-tool/packages/frontend/src/components): Interactive components:
    *   [`UploadZone.tsx`](file:///d:/ashif/Resume%20Projects/migration-tool/packages/frontend/src/components/UploadZone.tsx) - Handles file analysis uploads and migration configuration selectors.
    *   `ProcessingZone.tsx` - Visual progress tracker for active compilation tasks.
    *   `DownloadZone.tsx` - Handles completed downloads and metric report summaries.
*   [`/src/services`](file:///d:/ashif/Resume%20Projects/migration-tool/packages/frontend/src/services): API connector files mapping backend endpoints.
*   `src/App.tsx`: Layout wrapper organizing active workflow steps.

---

## 📦 Getting Started

### Installation
From the frontend directory or the monorepo root:
```bash
npm install
```

### Dev Server
Starts the frontend client locally:
```bash
npm run dev
```
The server will run on `http://localhost:5173`.

### Configuration
By default, the client communicates with the backend API running at `http://localhost:4000`. If you need to customize the backend URL endpoint, configure your API values inside the frontend services.

### Build
Builds the optimized production assets:
```bash
npm run build
```
