import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { SAMPLE_PRODUCTS } from './js/sample-products.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 8080;

// Serve static files from project root
app.use(express.static(path.join(__dirname)));

// Seed API: returns sample products as JSON
app.get('/seed.json', (req, res) => {
  res.json(SAMPLE_PRODUCTS);
});

// Serve the seed.html page explicitly
app.get('/seed.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'seed.html'));
});

app.listen(PORT, () => {
  console.log(`Dev server running at http://localhost:${PORT}`);
});
