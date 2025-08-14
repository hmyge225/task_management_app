const mongoose = require('mongoose');

async function connectToDatabase() {
  const mongoUri = process.env.MONGODB_URI || 'mongodb+srv://root:root@cluster0.g4khh9g.mongodb.net/task_db';

  mongoose.set('strictQuery', true);

  await mongoose.connect(mongoUri, {
    autoIndex: true,
  });
}

module.exports = connectToDatabase; 