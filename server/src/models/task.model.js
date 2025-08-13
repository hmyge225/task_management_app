const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    dueDate: { type: Date },
    status: { type: String, enum: ['todo', 'in_progress', 'done'], default: 'todo', index: true },
    priority: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
    tags: { type: [String], default: [], index: true },
    checklist: {
      type: [
        new mongoose.Schema(
          {
            text: { type: String, required: true, trim: true },
            done: { type: Boolean, default: false },
            createdAt: { type: Date, default: Date.now },
          },
          { _id: true }
        ),
      ],
      default: [],
    },
    deletedAt: { type: Date, default: null, index: true },
  },
  { timestamps: true }
);

// Index texte pour la recherche plein texte (title, description)
taskSchema.index({ title: 'text', description: 'text' });
// Index composés utiles pour filtres fréquents
taskSchema.index({ user: 1, status: 1, dueDate: 1 });
taskSchema.index({ user: 1, deletedAt: 1 });
taskSchema.index({ user: 1, tags: 1 });

module.exports = mongoose.model('Task', taskSchema);


