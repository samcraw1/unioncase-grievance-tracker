import express from 'express';
import { authenticate } from '../middleware/auth.js';
import { requireActiveSubscription } from '../middleware/subscription.js';
import { createInfoRequest, getInfoRequests, updateInfoRequest } from '../controllers/infoRequestController.js';
import { getTemplates, getTemplateById } from '../controllers/templateController.js';
import { getCollaborators, addCollaborator, removeCollaborator } from '../controllers/collaboratorController.js';
import { getCalendarFeed } from '../controllers/calendarController.js';
import { getStewardWorkload } from '../controllers/stewardDashboardController.js';
import { subscribe, unsubscribe } from '../controllers/pushController.js';

const router = express.Router();

router.use(authenticate);
router.use(requireActiveSubscription);

// --- Information Requests ---
router.post('/grievances/:grievanceId/info-requests', createInfoRequest);
router.get('/grievances/:grievanceId/info-requests', getInfoRequests);
router.patch('/info-requests/:id', updateInfoRequest);

// --- Case Templates ---
router.get('/templates', getTemplates);
router.get('/templates/:id', getTemplateById);

// --- Collaborators ---
router.get('/grievances/:grievanceId/collaborators', getCollaborators);
router.post('/grievances/:grievanceId/collaborators', addCollaborator);
router.delete('/grievances/:grievanceId/collaborators/:userId', removeCollaborator);

// --- Calendar Feed ---
router.get('/calendar/feed.ics', getCalendarFeed);

// --- Steward Workload Dashboard ---
router.get('/steward/workload', getStewardWorkload);

// --- Push Subscriptions ---
router.post('/push/subscribe', subscribe);
router.post('/push/unsubscribe', unsubscribe);

export default router;
