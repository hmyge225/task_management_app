const { Router } = require('express');
const { body, param } = require('express-validator');
const auth = require('../middleware/auth');
const {
  createTask,
  getTasks,
  getTaskById,
  updateTask,
  deleteTask,
  bulkUpdateStatus,
  bulkDelete,
  stats,
  restoreTask,
  deleteTaskPermanent,
  addChecklistItem,
  updateChecklistItem,
  deleteChecklistItem,
} = require('../controllers/task.controller');

const router = Router();

router.use(auth);

router.get('/', getTasks);

router.get(
  '/:id',
  [param('id').isMongoId().withMessage('ID invalide')],
  getTaskById
);

router.post(
  '/',
  [
    body('title').isString().trim().notEmpty().withMessage('Le titre est requis'),
    body('description').optional().isString(),
    body('dueDate').optional().isISO8601().toDate(),
    body('status').optional().isIn(['todo', 'in_progress', 'done']),
    body('priority').optional().isIn(['low', 'medium', 'high']),
    body('tags').optional().isArray(),
    body('tags.*').optional().isString(),
  ],
  createTask
);

router.put(
  '/:id',
  [
    param('id').isMongoId().withMessage('ID invalide'),
    body('title').optional().isString().trim().notEmpty(),
    body('description').optional().isString(),
    body('dueDate').optional().isISO8601().toDate(),
    body('status').optional().isIn(['todo', 'in_progress', 'done']),
    body('priority').optional().isIn(['low', 'medium', 'high']),
    body('tags').optional().isArray(),
    body('tags.*').optional().isString(),
  ],
  updateTask
);

router.delete('/:id', [param('id').isMongoId().withMessage('ID invalide')], deleteTask);

// Restore & delete permanent
router.post('/:id/restore', [param('id').isMongoId().withMessage('ID invalide')], restoreTask);
router.delete('/:id/permanent', [param('id').isMongoId().withMessage('ID invalide')], deleteTaskPermanent);

// Checklist
router.post(
  '/:id/checklist',
  [param('id').isMongoId().withMessage('ID invalide'), body('text').isString().trim().notEmpty()],
  addChecklistItem
);
router.patch(
  '/:id/checklist/:itemId',
  [
    param('id').isMongoId().withMessage('ID invalide'),
    param('itemId').isMongoId().withMessage('ID item invalide'),
    body('text').optional().isString().trim().notEmpty(),
    body('done').optional().isBoolean(),
  ],
  updateChecklistItem
);
router.delete(
  '/:id/checklist/:itemId',
  [param('id').isMongoId().withMessage('ID invalide'), param('itemId').isMongoId().withMessage('ID item invalide')],
  deleteChecklistItem
);

// Bulk operations
router.post(
  '/bulk/status',
  [
    body('ids').isArray({ min: 1 }).withMessage('ids doit être un tableau non vide'),
    body('ids.*').isMongoId().withMessage('ids doit contenir des ObjectId valides'),
    body('status').isIn(['todo', 'in_progress', 'done']).withMessage('Statut invalide'),
  ],
  bulkUpdateStatus
);

router.post(
  '/bulk/delete',
  [
    body('ids').isArray({ min: 1 }).withMessage('ids doit être un tableau non vide'),
    body('ids.*').isMongoId().withMessage('ids doit contenir des ObjectId valides'),
  ],
  bulkDelete
);

// Stats
router.get('/stats/summary', stats);

module.exports = router;


