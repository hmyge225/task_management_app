const { validationResult } = require('express-validator');
const mongoose = require('mongoose');
const Task = require('../models/task.model');

exports.createTask = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const payload = {
      user: req.user.id,
      title: req.body.title,
      description: req.body.description || '',
      dueDate: req.body.dueDate,
      status: req.body.status,
      priority: req.body.priority,
      tags: Array.isArray(req.body.tags) ? req.body.tags : [],
      checklist: Array.isArray(req.body.checklist) ? req.body.checklist : [],
    };

    const task = await Task.create(payload);
    return res.status(201).json(task);
  } catch (error) {
    return next(error);
  }
};

exports.getTasks = async (req, res, next) => {
  try {
    // Filtres
    const { status, priority, q, from, to, tag } = req.query;
    const includeDeleted = req.query.includeDeleted === 'true';
    const filter = { user: req.user.id };

    if (status) filter.status = status;
    if (priority) filter.priority = priority;
    if (!includeDeleted) filter.deletedAt = null;
    if (from || to) {
      filter.dueDate = {};
      if (from) filter.dueDate.$gte = new Date(from);
      if (to) filter.dueDate.$lte = new Date(to);
    }

    // Recherche texte
    if (q) {
      filter.$text = { $search: q };
    }

    // Filtre par tag (un seul ou plusieurs via répétition de paramètre)
    const tagsParam = req.query.tags || tag;
    if (tagsParam) {
      const tags = Array.isArray(tagsParam) ? tagsParam : [tagsParam];
      filter.tags = { $all: tags };
    }

    // Tri et pagination
    const sortBy = req.query.sortBy || 'createdAt';
    const sortOrder = req.query.sortOrder === 'asc' ? 1 : -1;
    const page = Math.max(parseInt(req.query.page || '1', 10), 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit || '10', 10), 1), 100);
    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      Task.find(filter)
        .sort({ [sortBy]: sortOrder })
        .skip(skip)
        .limit(limit),
      Task.countDocuments(filter),
    ]);

    return res.json({
      items,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    return next(error);
  }
};

exports.getTaskById = async (req, res, next) => {
  try {
    const base = { _id: req.params.id, user: req.user.id };
    const includeDeleted = req.query.includeDeleted === 'true';
    if (!includeDeleted) base.deletedAt = null;
    const task = await Task.findOne(base);
    if (!task) {
      return res.status(404).json({ message: 'Tâche non trouvée' });
    }
    return res.json(task);
  } catch (error) {
    return next(error);
  }
};

exports.updateTask = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const updates = {
      title: req.body.title,
      description: req.body.description,
      dueDate: req.body.dueDate,
      status: req.body.status,
      priority: req.body.priority,
      tags: req.body.tags,
    };

    const task = await Task.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      updates,
      { new: true, runValidators: true }
    );

    if (!task) {
      return res.status(404).json({ message: 'Tâche non trouvée' });
    }

    return res.json(task);
  } catch (error) {
    return next(error);
  }
};

exports.deleteTask = async (req, res, next) => {
  try {
    const task = await Task.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id, deletedAt: null },
      { $set: { deletedAt: new Date() } },
      { new: true }
    );
    if (!task) {
      return res.status(404).json({ message: 'Tâche non trouvée' });
    }
    return res.status(200).json({ message: 'Tâche supprimée (soft delete)' });
  } catch (error) {
    return next(error);
  }
};

// Restauration d'une tâche soft-supprimée
exports.restoreTask = async (req, res, next) => {
  try {
    const task = await Task.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id, deletedAt: { $ne: null } },
      { $set: { deletedAt: null } },
      { new: true }
    );
    if (!task) {
      return res.status(404).json({ message: 'Tâche non trouvée ou non supprimée' });
    }
    return res.json(task);
  } catch (error) {
    return next(error);
  }
};

// Suppression définitive
exports.deleteTaskPermanent = async (req, res, next) => {
  try {
    const task = await Task.findOneAndDelete({ _id: req.params.id, user: req.user.id });
    if (!task) {
      return res.status(404).json({ message: 'Tâche non trouvée' });
    }
    return res.status(204).send();
  } catch (error) {
    return next(error);
  }
};

// Checklist - ajouter un item
exports.addChecklistItem = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const { text } = req.body;
    const task = await Task.findOne({ _id: req.params.id, user: req.user.id, deletedAt: null });
    if (!task) return res.status(404).json({ message: 'Tâche non trouvée' });

    task.checklist.push({ text });
    await task.save();
    return res.status(201).json(task);
  } catch (error) {
    return next(error);
  }
};

// Checklist - mettre à jour un item (texte/done)
exports.updateChecklistItem = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const { itemId } = req.params;
    const { text, done } = req.body;
    const task = await Task.findOne({ _id: req.params.id, user: req.user.id, deletedAt: null });
    if (!task) return res.status(404).json({ message: 'Tâche non trouvée' });

    const item = task.checklist.id(itemId);
    if (!item) return res.status(404).json({ message: 'Item non trouvé' });
    if (typeof text === 'string') item.text = text;
    if (typeof done === 'boolean') item.done = done;
    await task.save();
    return res.json(task);
  } catch (error) {
    return next(error);
  }
};

// Checklist - supprimer un item
exports.deleteChecklistItem = async (req, res, next) => {
  try {
    const { itemId } = req.params;
    const task = await Task.findOne({ _id: req.params.id, user: req.user.id, deletedAt: null });
    if (!task) return res.status(404).json({ message: 'Tâche non trouvée' });
    const item = task.checklist.id(itemId);
    if (!item) return res.status(404).json({ message: 'Item non trouvé' });
    item.deleteOne();
    await task.save();
    return res.status(204).send();
  } catch (error) {
    return next(error);
  }
};

// Mise à jour du statut en lot
exports.bulkUpdateStatus = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const { ids, status } = req.body;

    const result = await Task.updateMany(
      { _id: { $in: ids }, user: req.user.id },
      { $set: { status } }
    );
    return res.json({ matched: result.matchedCount, modified: result.modifiedCount });
  } catch (error) {
    return next(error);
  }
};

// Suppression en lot (soft delete pour cohérence)
exports.bulkDelete = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const { ids } = req.body;
    const result = await Task.updateMany(
      { _id: { $in: ids }, user: req.user.id, deletedAt: null },
      { $set: { deletedAt: new Date() } }
    );
    return res.json({ matched: result.matchedCount, modified: result.modifiedCount });
  } catch (error) {
    return next(error);
  }
};

// Statistiques rapides
exports.stats = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const [byStatus, overdueCount] = await Promise.all([
      Task.aggregate([
        { $match: { user: new mongoose.Types.ObjectId(userId), deletedAt: null } },
        { $group: { _id: '$status', count: { $sum: 1 } } },
      ]),
      Task.countDocuments({ user: userId, deletedAt: null, dueDate: { $lt: new Date() }, status: { $ne: 'done' } }),
    ]);

    const formatted = byStatus.reduce((acc, cur) => {
      acc[cur._id] = cur.count;
      return acc;
    }, {});

    return res.json({ byStatus: formatted, overdue: overdueCount });
  } catch (error) {
    return next(error);
  }
};


