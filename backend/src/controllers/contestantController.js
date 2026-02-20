const Contestant = require('../models/Contestant');
const Team = require('../models/Team');

exports.registerContestant = async (req, res) => {
    try {
        const { name, age, teamId } = req.body;

        const team = await Team.findById(teamId);
        if (!team) return res.status(404).json({ message: 'Team not found' });

        const contestant = new Contestant({ name, age, teamId });
        await contestant.save();

        res.status(201).json(contestant);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getContestantsByTeam = async (req, res) => {
    try {
        const contestants = await Contestant.find({ teamId: req.params.teamId });
        res.json(contestants);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.deleteContestant = async (req, res) => {
    try {
        await Contestant.findByIdAndDelete(req.params.id);
        res.json({ message: 'Contestant deleted' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
