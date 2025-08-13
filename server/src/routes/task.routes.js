const { Router } = require('express');
const { body, param } = require('express-validator');
const auth = require('../middleware/auth');
const {
  createTask,
  getTasks,
  getTaskById,
  updateTask,
  deleteTask,
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
  ],
  updateTask
);

router.delete('/:id', [param('id').isMongoId().withMessage('ID invalide')], deleteTask);

module.exports = router;


