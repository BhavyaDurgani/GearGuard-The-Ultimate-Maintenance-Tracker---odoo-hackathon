const db = require('../db');

async function ensureTeamMember(req, res, next) {
  try {
    const userId = req.user && req.user.id;
    const requestId = req.params.id;
    if (!userId) return res.status(401).json({ error: 'Not authenticated' });
    const { rows } = await db.query('SELECT team_id FROM maintenance_requests WHERE id=$1', [requestId]);
    if (!rows[0]) return res.status(404).json({ error: 'Request not found' });
    const teamId = rows[0].team_id;
    if (!teamId) return res.status(403).json({ error: 'No team assigned' });

    const memberRes = await db.query('SELECT 1 FROM team_members WHERE team_id=$1 AND user_id=$2', [teamId, userId]);
    const isMember = memberRes.rowCount > 0;
    if (!isMember && req.user.role !== 'manager' && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Not allowed' });
    }
    next();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
}

module.exports = ensureTeamMember;
