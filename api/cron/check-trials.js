import { checkTrialExpirations } from '../../server/src/services/notificationScheduler.js';

export default async function handler(req, res) {
  if (!process.env.CRON_SECRET || req.headers.authorization !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  await checkTrialExpirations();
  res.json({ ok: true });
}
