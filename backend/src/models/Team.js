const mongoose = require('mongoose');

const teamSchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true },
    description: { type: String },
    // Removed quizId and score as teams are now global
}, { timestamps: true });

module.exports = mongoose.model('Team', teamSchema);
