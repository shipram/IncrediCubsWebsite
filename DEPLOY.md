Deployment notes

This repository includes a GitHub Actions workflow to publish the site to GitHub Pages whenever `main` is pushed.

Custom domain
- The CNAME file includes `www.theincredicubs.com`.
- To complete the custom domain setup, add a CNAME record at your DNS provider:

  Host: www
  Type: CNAME
  Value: shipram.github.io

- After DNS propagates, go to the repository Settings → Pages and ensure the custom domain is set and HTTPS is enabled.

Notes
- The Actions workflow publishes the repository root. If you only want to publish a build output (e.g., `dist/`), update the upload action path accordingly.
