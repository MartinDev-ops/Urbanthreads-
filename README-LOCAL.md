Local dev server

This project includes a tiny Express dev server to serve the static site and
provide a `/seed.json` endpoint that returns the sample products catalog.

Install and run:

```bash
cd /path/to/urban-threads\ 4
npm install
npm start
```

Open the site in your browser:

- Main site: http://localhost:8080/
- Seed page: http://localhost:8080/seed.html
- Seed API (JSON): http://localhost:8080/seed.json

Notes:
- `package.json` sets `type: "module"` so the server can import `js/sample-products.js`.
- If you prefer using a different port, set the `PORT` environment variable:

```bash
PORT=3000 npm start
```
