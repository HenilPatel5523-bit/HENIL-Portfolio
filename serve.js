const http = require('http');
const fs = require('fs');
const path = require('path');

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.json': 'application/json; charset=utf-8',
  '.ico': 'image/x-icon'
};

const REVIEWS_FILE = path.join(__dirname, 'reviews.json');

const DEFAULT_REVIEWS = [
  {
    id: 1,
    name: 'Prof. K. R. Mehta',
    role: 'Faculty / Professor',
    topic: 'Fan Cleaning Robot (3D Model)',
    category: 'faculty',
    stars: 5,
    comment: 'Exceptional electromechanical presentation by Henil Patel. The automatic rodless clamp architecture and counter-rotating microfiber roller design solve an authentic high-risk household issue. Well-structured CAD engineering and clear leadership.',
    date: 'Nov 17, 2026'
  },
  {
    id: 2,
    name: 'Aarav V. Sharma',
    role: 'Classmate / Peer',
    topic: 'Fan Cleaning Robot (3D Model)',
    category: 'peer',
    stars: 5,
    comment: 'The 3D model demonstration was the highlight of our lab session. Henil\'s explanation of the H-bridge motor driver circuitry and lateral guide wheels showed true hands-on team leadership.',
    date: 'Nov 17, 2026'
  },
  {
    id: 3,
    name: 'Pooja Trivedi',
    role: 'Lab Reviewer',
    topic: 'Circuit & Network Analysis',
    category: 'faculty',
    stars: 5,
    comment: 'Thorough understanding of Star-Delta derivations and multi-loop nodal equations. High attention to hardware tolerances and systematic breadboard debugging.',
    date: 'Nov 16, 2026'
  },
  {
    id: 4,
    name: 'Dhruv Parekh',
    role: 'Friend / Personal Connection',
    topic: 'Friendly Wishes & Personal Feedback',
    category: 'friend',
    stars: 5,
    comment: 'Known Henil for years — his dedication to electronics and late-night soldering sessions is unmatched. The 3D robot model looks incredible. Keep inspiring everyone bro! 🔥',
    date: 'Nov 18, 2026'
  },
  {
    id: 5,
    name: 'Unknown Visitor',
    role: 'Unknown Visitor / Guest',
    topic: 'General Portfolio Feedback',
    category: 'visitor',
    stars: 5,
    comment: 'Stumbled upon this portfolio from LinkedIn. The interactive 3D robot model and clean drafting layout are super impressive. Great work on the hardware documentation!',
    date: 'Nov 20, 2026'
  }
];

function getStoredReviews() {
  try {
    if (fs.existsSync(REVIEWS_FILE)) {
      const data = fs.readFileSync(REVIEWS_FILE, 'utf-8');
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (err) {
    console.error('Error reading reviews file:', err);
  }
  return DEFAULT_REVIEWS;
}

function saveReviews(reviews) {
  try {
    fs.writeFileSync(REVIEWS_FILE, JSON.stringify(reviews, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error saving reviews file:', err);
  }
}

function startServer(port) {
  const server = http.createServer((req, res) => {
    // Enable CORS for all requests
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
      res.writeHead(204);
      res.end();
      return;
    }

    const parsedUrl = new URL(req.url, `http://localhost:${port}`);
    const pathname = parsedUrl.pathname;

    // API: Reviews endpoints
    if (pathname === '/api/reviews') {
      if (req.method === 'GET') {
        const reviews = getStoredReviews();
        res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-cache' });
        res.end(JSON.stringify(reviews));
        return;
      }

      if (req.method === 'POST') {
        let body = '';
        req.on('data', chunk => { body += chunk; });
        req.on('end', () => {
          try {
            const newReview = JSON.parse(body);
            if (!newReview.comment) {
              res.writeHead(400, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ error: 'Comment is required' }));
              return;
            }
            const reviews = getStoredReviews();
            const entry = {
              id: Date.now(),
              name: newReview.name || 'Unknown Visitor',
              role: newReview.role || 'Unknown Visitor / Guest',
              topic: newReview.topic || 'General Portfolio Feedback',
              category: newReview.category || (newReview.role && newReview.role.includes('Friend') ? 'friend' : (newReview.role && (newReview.role.includes('Unknown') || newReview.role.includes('Visitor')) ? 'visitor' : 'peer')),
              stars: Number(newReview.stars) || 5,
              comment: newReview.comment,
              date: newReview.date || new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
            };
            reviews.unshift(entry);
            saveReviews(reviews);
            res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
            res.end(JSON.stringify({ success: true, review: entry, reviews: reviews }));
          } catch (err) {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Invalid JSON payload' }));
          }
        });
        return;
      }
    }

    if (pathname === '/api/reviews/reset' && req.method === 'POST') {
      saveReviews(DEFAULT_REVIEWS);
      res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
      res.end(JSON.stringify({ success: true, reviews: DEFAULT_REVIEWS }));
      return;
    }

    // Static file serving with extension fallback (.jpg <-> .png)
    let reqPath = decodeURI(pathname);
    if (reqPath === '/') reqPath = '/index.html';
    let filePath = path.join(__dirname, reqPath);

    function serveFile(resolvedPath) {
      const ext = path.extname(resolvedPath).toLowerCase();
      const contentType = MIME_TYPES[ext] || 'application/octet-stream';
      res.writeHead(200, {
        'Content-Type': contentType,
        'Cache-Control': 'no-cache'
      });
      fs.createReadStream(resolvedPath).pipe(res);
    }

    fs.stat(filePath, (err, stats) => {
      if (!err && stats.isFile()) {
        serveFile(filePath);
        return;
      }

      // Fallback for image extensions (.png <-> .jpg <-> .jpeg)
      const parsedPath = path.parse(filePath);
      const ext = parsedPath.ext.toLowerCase();
      const altExts = ext === '.png' ? ['.jpg', '.jpeg'] : (ext === '.jpg' || ext === '.jpeg') ? ['.png'] : [];

      for (const alt of altExts) {
        const altPath = path.join(parsedPath.dir, parsedPath.name + alt);
        if (fs.existsSync(altPath) && fs.statSync(altPath).isFile()) {
          serveFile(altPath);
          return;
        }
      }

      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('404 Not Found');
    });
  });

  server.on('error', (e) => {
    if (e.code === 'EADDRINUSE') {
      console.log(`Port ${port} in use, trying ${port + 1}...`);
      startServer(port + 1);
    } else {
      console.error('Server error:', e);
    }
  });

  server.listen(port, '127.0.0.1', () => {
    console.log(`PORTFOLIO_SERVER_READY: http://localhost:${port}/`);
  });
}

startServer(3000);
