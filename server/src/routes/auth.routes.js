const { Router } = require('express');
const { body } = require('express-validator');
const { register, login, getMe, updateMe, changePassword } = require('../controllers/auth.controller');
const auth = require('../middleware/auth');

const router = Router();

router.post(
  '/register',
  [
    body('name').isString().trim().notEmpty().withMessage('Le nom est requis'),
    body('email').isEmail().normalizeEmail().withMessage('Email invalide'),
    body('password').isLength({ min: 6 }).withMessage('Mot de passe trop court (min 6)'),
  ],
  register
);

router.post(
  '/login',
  [
    body('email').isEmail().normalizeEmail().withMessage('Email invalide'),
    body('password').isString().notEmpty().withMessage('Mot de passe requis'),
  ],
  login
);

module.exports = router;

// Profile routes
router.get('/me', auth, getMe);
router.put(
  '/me',
  auth,
  [
    body('name').optional().isString().trim().notEmpty(),
    body('email').optional().isEmail().normalizeEmail(),
    body('currentPassword').optional().isString().isLength({ min: 6 }),
    body('newPassword').optional().isString().isLength({ min: 6 }),
  ],
  updateMe
);

// Change password (dédié)
router.post(
  '/change-password',
  auth,
  [
    body('currentPassword').isString().isLength({ min: 6 }).withMessage('Mot de passe actuel requis (min 6)'),
    body('newPassword').isString().isLength({ min: 6 }).withMessage('Nouveau mot de passe requis (min 6)'),
  ],
  changePassword
);


