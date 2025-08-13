const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const User = require('../models/user.model');

function createJwtToken(userId) {
  const secret = process.env.JWT_SECRET || 'dev_secret';
  const expiresIn = '7d';
  return jwt.sign({ id: userId }, secret, { expiresIn });
}

exports.register = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, password } = req.body;

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(409).json({ message: 'Un utilisateur avec cet email existe déjà' });
    }

    const passwordHash = await User.hashPassword(password);
    const user = await User.create({ name, email, passwordHash });

    const token = createJwtToken(user._id);
    return res.status(201).json({
      user: { id: user._id, name: user.name, email: user.email },
      token,
    });
  } catch (error) {
    return next(error);
  }
};

exports.login = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Identifiants invalides' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Identifiants invalides' });
    }

    const token = createJwtToken(user._id);
    return res.json({ user: { id: user._id, name: user.name, email: user.email }, token });
  } catch (error) {
    return next(error);
  }
};

exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select('_id name email');
    if (!user) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }
    return res.json({ id: user._id, name: user.name, email: user.email });
  } catch (error) {
    return next(error);
  }
};

exports.updateMe = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, currentPassword, newPassword } = req.body;

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }

    if (email && email !== user.email) {
      const emailExists = await User.findOne({ email });
      if (emailExists) {
        return res.status(409).json({ message: "Cet email est déjà utilisé" });
      }
      user.email = email;
    }

    if (name) user.name = name;

    // Le changement de mot de passe se fait désormais via /change-password

    await user.save();

    return res.json({ id: user._id, name: user.name, email: user.email });
  } catch (error) {
    return next(error);
  }
};

exports.changePassword = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }

    const ok = await user.comparePassword(currentPassword);
    if (!ok) {
      return res.status(401).json({ message: 'Mot de passe actuel invalide' });
    }

    user.passwordHash = await User.hashPassword(newPassword);
    await user.save();

    return res.json({ message: 'Mot de passe mis à jour' });
  } catch (error) {
    return next(error);
  }
};


// Changement de mot de passe dédié
exports.changePassword = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }

    const isCurrentValid = await user.comparePassword(currentPassword);
    if (!isCurrentValid) {
      return res.status(401).json({ message: 'Mot de passe actuel invalide' });
    }

    user.passwordHash = await User.hashPassword(newPassword);
    await user.save();

    const token = createJwtToken(user._id);
    return res.json({ message: 'Mot de passe mis à jour avec succès', token });
  } catch (error) {
    return next(error);
  }
};


