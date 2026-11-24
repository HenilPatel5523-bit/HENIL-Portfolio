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
    topic: 'Friendly Wishes & Encouragement',
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

let cachedReviews = [...DEFAULT_REVIEWS];

module.exports = (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method === 'POST') {
    let body = req.body;
    if (typeof body === 'string') {
      try {
        body = JSON.parse(body);
      } catch (e) {
        body = {};
      }
    }
    body = body || {};

    if (req.url && req.url.includes('/reset')) {
      cachedReviews = [...DEFAULT_REVIEWS];
      return res.status(200).json({ success: true, reviews: DEFAULT_REVIEWS });
    }

    if (!body.comment) {
      return res.status(400).json({ error: 'Comment is required' });
    }

    const entry = {
      id: Date.now(),
      name: body.name || 'Unknown Visitor',
      role: body.role || 'Unknown Visitor / Guest',
      topic: body.topic || 'General Portfolio Feedback',
      category: body.category || (body.role && body.role.includes('Friend') ? 'friend' : (body.role && (body.role.includes('Unknown') || body.role.includes('Visitor')) ? 'visitor' : 'peer')),
      stars: Number(body.stars) || 5,
      comment: body.comment,
      date: body.date || new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    };

    cachedReviews.unshift(entry);
    return res.status(200).json({ success: true, review: entry, reviews: cachedReviews });
  }

  return res.status(200).json(cachedReviews);
};
