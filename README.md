# Art Scan PWA

A modern Progressive Web App (PWA) for scanning or uploading images of artworks and automatically extracting structured metadata using Google Gemini AI. Users can review, edit, and confirm the metadata, then submit it to a Google Sheet via Apps Script. The app is installable, works offline, and is mobile-friendly.

## Features
- Upload or take a photo of an artwork (camera capture on mobile supported)
- Automatic extraction of artwork metadata (title, artist, year, medium, description, confidence) using Gemini AI
- Editable metadata form if AI confidence is low or user wants to correct details
- Submit confirmed metadata to a Google Sheet via Apps Script
- PWA: installable, offline support, custom icon, and manifest
- Beautiful, mobile-first UI with background image and custom font

## Tech Stack
- [Next.js](https://nextjs.org/) (App Router)
- [React](https://react.dev/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Google Gemini API](https://ai.google.dev/)
- [Google Apps Script](https://script.google.com/)
- [react-icons](https://react-icons.github.io/react-icons/)

## Getting Started

### 1. Clone the repo
```bash
git clone https://github.com/yourusername/art-scan.git
cd art-scan
```

### 2. Install dependencies
```bash
npm install
```

### 3. Set up environment variables
Create a `.env.local` file in the root:
```
GEMINI_API_KEY=your-gemini-api-key-here
```

### 4. Add your assets
- Place your logo at `public/assets/images/logo.png` (recommended: 512x512 PNG)
- Place your background image at `public/assets/images/background.png`
- Place your custom font at `public/assets/SilkaMono-Regular.otf`

### 5. Run the development server
```bash
npm run dev
```
Visit [http://localhost:3000](http://localhost:3000) in your browser.

### 6. Test on your phone
- Start the dev server with network access:
  ```bash
  npm run dev -- --hostname 0.0.0.0
  ```
- Find your computer's IP and open `http://<your-ip>:3000` on your phone.

## Deployment
- **Recommended:** [Vercel](https://vercel.com/) (auto-detects Next.js, easy CI/CD)
- Set your `GEMINI_API_KEY` in the Vercel dashboard under Project Settings > Environment Variables.
- For PWA, ensure your icons and manifest are correct and accessible.

## Google Apps Script Integration
- The app submits confirmed metadata to your Google Apps Script endpoint (see `src/app/page.tsx`).
- Make sure your Apps Script is deployed as a web app and allows POST requests from anyone.

## Customization
- Update the logo, background, and font by replacing the files in `public/assets/`.
- Adjust colors and layout in `src/app/globals.css` and `src/app/page.tsx`.

## Credits
- UI/UX: [Your Name]
- AI: Google Gemini
- Icons: [react-icons](https://react-icons.github.io/react-icons/)
- Font: SilkaMono

---

MIT License
