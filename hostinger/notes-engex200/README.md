# Hostinger redirect for hitengupta.com/notes/engex200

Not part of the GitHub Pages site — these two files live on **Hostinger**, not GitHub.
The actual notes are served from GitHub Pages at:
https://adelaideuni-hiten.github.io/ENGEX200-Notes/

## Setup (one-time)

1. In Hostinger's File Manager (or via FTP/SFTP), create the folder path `notes/engex200/` under your site's public root (usually `public_html/`).
2. Upload both `.htaccess` and `index.html` from this folder into `public_html/notes/engex200/`.
3. Visit `https://hitengupta.com/notes/engex200/` — it should redirect (302) to the GitHub Pages site. Any sub-path (e.g. `.../notes/engex200/note.html?id=timers`) should forward too, via the `.htaccess` rule.

## If `.htaccess` doesn't work

Some Hostinger shared-hosting configurations restrict `RewriteEngine`. If the `.htaccess` redirect isn't working, `index.html`'s meta-refresh + JS redirect still covers the root URL (and preserves sub-paths/query/hash via JS), so the site remains reachable even without mod_rewrite.

## Note

This is an HTTP redirect — the browser's address bar will change to the GitHub Pages URL. A real Hostinger VPS plan (with server/reverse-proxy access) would be needed to keep the `hitengupta.com/notes/engex200` URL in the address bar while serving GitHub Pages content transparently.
