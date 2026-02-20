const mongoose = require('mongoose');

const contestantSchema = new mongoose.Schema({
    name: { type: String, required: true },
    age: { type: Number, required: true },
    teamId: { type: mongoose.Schema.Types.ObjectId, ref: 'Team', required: true },
    // Removed quizId and isActive as contestants belong to global teams
}, { timestamps: true });

module.exports = mongoose.model('Contestant', contestantSchema);
