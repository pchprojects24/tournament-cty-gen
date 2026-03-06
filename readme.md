# 🏆 Tournament Generator

A fully-featured, mobile-first tournament management web app built with pure HTML, CSS, and Vanilla JavaScript. No frameworks, no backend, no dependencies — works entirely in the browser.

---

## Features

### Tournament Setup
- Enter a custom tournament name
- Add players or teams individually or paste multiple names at once
- Remove players from the list
- Randomize player order with one tap
- Manually reorder players via drag-and-drop (desktop and iOS touch)

### Tournament Types

**Single Elimination**
- Automatic bracket generation with seeding
- Automatic byes when the number of players is not a power of two
- Clickable matches to enter scores and select winners
- Winners advance automatically to the next round
- Champion display when the tournament concludes

**Round Robin**
- Full schedule where every participant plays every other participant
- Match list organized by round
- Live standings table showing wins, losses, games played, goals for/against

### Match Management
- Enter scores for each match
- Select the winner manually or let scores auto-determine the winner
- Edit or clear any match result at any time

### Saving & Loading
- Save the current tournament to browser localStorage
- Load any previously saved tournament
- Delete saved tournaments
- Multiple tournaments can be saved simultaneously

### Extra Features
- Reset tournament button (clears all results, keeps players)
- Export tournament data as a JSON file
- Import a previously exported JSON file
- Print-friendly bracket layout (use browser print or Ctrl+P / Cmd+P)
- Dark mode toggle (preference is saved between sessions)

---

## Project Structure

```
tournament-generator/
├── index.html    — Main HTML structure and layout
├── style.css     — All styles, dark mode, responsive design, print styles
├── app.js        — All application logic (no external libraries)
└── README.md     — This file
```

---

## Deploying to Netlify (Drag & Drop)

Deploying this app to Netlify takes less than 2 minutes and requires no account setup beyond a free Netlify account.

### Step 1 — Create a Netlify account
Go to [netlify.com](https://www.netlify.com) and sign up for a free account if you don't already have one.

### Step 2 — Prepare the folder
Make sure your `tournament-generator` folder contains these four files:
```
tournament-generator/
├── index.html
├── style.css
├── app.js
└── README.md
```

### Step 3 — Deploy via drag and drop
1. Log in to your Netlify dashboard at [app.netlify.com](https://app.netlify.com)
2. On the main dashboard, scroll down to the section that says **"Want to deploy a new site without connecting to Git?"**
3. Drag and drop your entire `tournament-generator` folder onto the dashed drop zone
4. Netlify will automatically upload and deploy your site
5. Within seconds, your app will be live at a URL like `https://random-name-123.netlify.app`

### Step 4 — (Optional) Set a custom site name
1. In your Netlify dashboard, click on your newly deployed site
2. Go to **Site configuration → General → Site details**
3. Click **Change site name** and enter a name like `my-tournament-app`
4. Your app will now be available at `https://my-tournament-app.netlify.app`

---

## Using the App

### Creating a Tournament
1. Enter a tournament name in the **Tournament Name** field
2. Select **Single Elimination** or **Round Robin**
3. Add players by typing names and clicking **Add**, or paste multiple names (one per line) and click **Import from Paste**
4. Optionally reorder players by dragging them, or click **Randomize**
5. Click **Generate Tournament**

### Recording Match Results
1. Tap any match card in the bracket or schedule
2. Enter scores in the score fields (optional)
3. Select the winner by tapping a winner button or clicking a team card
4. Tap **Save Result** — the bracket updates automatically

### Saving Your Work
- Tap **💾 Save** in the bracket section to save to browser storage
- Saved tournaments appear in the **Saved Tournaments** section at the bottom
- Tap **Load** to restore a saved tournament

### Exporting & Importing
- **⬇ Export JSON** — Downloads the current tournament as a `.json` file
- **⬆ Import JSON** — Loads a previously exported `.json` file

---

## Browser Compatibility

| Browser | Support |
|---------|---------|
| Safari (iOS 14+) | ✅ Full support |
| Chrome (Android) | ✅ Full support |
| Chrome (Desktop) | ✅ Full support |
| Firefox | ✅ Full support |
| Safari (macOS) | ✅ Full support |
| Edge | ✅ Full support |

---

## Notes

- All data is stored in **browser localStorage** — clearing browser data will remove saved tournaments. Use the JSON export feature to back up important tournaments.
- The app works fully offline once loaded (no network requests are made after the initial page load).
- For best results on iOS, add the app to your Home Screen via Safari's Share menu for a native app-like experience.

---

## License

MIT — Free to use, modify, and distribute.
