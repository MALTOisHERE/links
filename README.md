# MALTO Links

MALTO's personal link hub. Plain HTML, CSS, and vanilla JavaScript.
No framework, no build step.

## Project structure

```
index.html              Page markup
404.html                Not-found page (used by GitHub Pages)
data/links.yaml         ← Edit this file to add/change content
assets/css/style.css    All styling, theme tokens, @font-face rules
assets/js/theme.js      Theme toggle logic
assets/js/main.js       Loads data/links.yaml and renders the page
assets/fonts/           Self-hosted Inter & JetBrains Mono woff2 files
site.webmanifest        Web app manifest
CNAME                   Custom domain for GitHub Pages
robots.txt              Crawler rules
```

## Configuration

Everything on the page (tagline, links, socials, contact email) comes
from one file:

```
data/links.yaml
```

- **`profile`**: `name`, `tagline`, `homeUrl`, `logoUrl`. Shown once
  in the header.
- **`socials`**: icon row under the name. Each entry has `label`,
  `icon`, `url`. `icon` is a slug from
  [Simple Icons](https://simpleicons.org) (e.g. `github`, `discord`);
  the real brand icon is fetched by that slug at runtime via Iconify.
  Leave `url` empty to hide an entry.
- **`links`**: the main content, one full-width row per entry.
  Enabled links keep the order listed; disabled ones always sort to
  the bottom regardless of position in the file. Fields: `name`,
  `category` (optional one-line subtitle), `url`, `disabled`. Set
  `disabled: true` and leave `url` empty for a greyed-out, unclickable
  "coming soon" row.
- **`contact.email`**: leave empty to hide the contact icon; when
  set, it's rendered as a mail icon next to the socials, not as a row
  in the link list.

Adding a link or a new social platform is a YAML-only edit; no other
file needs to change.

## Local development

The page must be served over `http://`, not opened as a `file://`
path, because `main.js` fetches `data/links.yaml` and browsers block
that from local files:

```
python -m http.server 8080
# or
npx serve .
```

Then visit `http://localhost:8080`. Hard-refresh (Ctrl+Shift+R) after
editing CSS/JS, since the dev server sends no cache headers.

## Deploying to GitHub Pages

1. Push to GitHub.
2. **Settings → Pages** → Source: `Deploy from a branch`, branch
   `main`, folder `/ (root)`.
3. **Custom domain**: enter `links.malto.icu` (the `CNAME` file in
   this repo already matches).
4. Once DNS below has propagated, enable **Enforce HTTPS** on that
   same Settings → Pages screen.

### DNS

At the DNS provider for `malto.icu`, add:

| Type  | Name    | Value                   |
| ----- | ------- | ----------------------- |
| CNAME | `links` | `MALTOisHERE.github.io` |

## Dependencies

Everything else is self-contained (fonts self-hosted in
`assets/fonts/`, no analytics). Two things load from the network at
runtime:

- **js-yaml** (jsDelivr, pinned to `4.1.0`, SRI-checked): parses
  `data/links.yaml` in the browser.
- **Iconify** (`api.iconify.design`): fetches each configured
  social platform's brand icon by its Simple Icons slug. Used instead
  of simpleicons.org's own CDN because that CDN has dropped a few
  brands (LinkedIn included) after trademark requests; Iconify's
  mirror still serves them.

Both fail gracefully: if either is unreachable, the static page still
loads, just without that dynamic piece.
