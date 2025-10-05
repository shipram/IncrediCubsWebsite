# IncrediCubs — First LEGO League Team Website

This is a lightweight static website for the IncrediCubs FLL team. It's intentionally simple so it's easy to host and modify.

What you get
- `index.html` — main site
- `css/styles.css` — styles
- `js/script.js` — small client-side script (loads `data/members.json`)
- `data/members.json` — example roster
- `images/logo.svg` — simple logo

Optional: use the provided team logo
- Place your PNG logo at `images/logo.png`. The site header prefers `logo.png` and falls back to `logo.svg`.
- Place your PNG logo at `images/IncrediCubs-Smaller.png`. The site header prefers `IncrediCubs-Smaller.png` and falls back to `logo.svg`.
- If you replace an existing image and don't see the change, clear your browser cache or open in an Incognito window.

Quick start (open locally)
- Option A: Open `index.html` in your browser (file://). Some features (fetching `members.json`) may be blocked by the browser.
- Option B (recommended): Run a simple local server (python) and open http://localhost:8000

  ```bash
  # from the project root
  python3 -m http.server 8000
  # or (for older macs)
  python -m SimpleHTTPServer 8000
  ```

Optional: Install a tiny node dev server

  ```bash
  npm init -y
  npm install --save-dev http-server
  npx http-server -p 8080
  ```

How to update
- Edit `index.html` for content changes.
- Edit `data/members.json` to change the roster; the page will auto-populate when served over HTTP.

How to wire up contact form
- The contact form is a placeholder and does not send messages. You can replace it with a `mailto:` link or implement a tiny serverless function (Netlify/Lambda) to accept submissions.

License
- MIT
