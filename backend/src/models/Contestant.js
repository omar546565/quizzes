const mongoose = require('mongoose');

const contestantSchema = new mongoose.Schema({
    name: { type: String, required: true },
    age: { type: Number, required: true },
    teamId: { type: mongoose.Schema.Types.ObjectId, ref: 'Team' },
    registeredQuizzes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Quiz' }],
}, { timestamps: true });

module.exports = mongoose.model('Contestant', contestantSchema);
