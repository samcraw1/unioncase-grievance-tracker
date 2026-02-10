import { checkDeadlines } from '../../server/src/services/notificationScheduler.js';

export default async function handler(req, res) {
  if (req.headers.authorization !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  await checkDeadlines();
  res.json({ ok: true });
}
