const Quiz = require('../models/Quiz');

exports.createQuiz = async (req, res) => {
    try {
        const quiz = new Quiz(req.body);
        await quiz.save();
        res.status(201).json(quiz);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getAllQuizzes = async (req, res) => {
    try {
        const quizzes = await Quiz.find().select('name day registrationOpen createdAt');
        res.json(quizzes);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getQuizById = async (req, res) => {
    try {
        const quiz = await Quiz.findById(req.params.id)
            .populate('participations.teamA.teamId')
            .populate('participations.teamB.teamId')
            .populate('participations.teamA.activeContestants')
            .populate('participations.teamB.activeContestants');
        if (!quiz) return res.status(404).json({ message: 'Quiz not found' });
        res.json(quiz);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.updateQuiz = async (req, res) => {
    try {
        const quiz = await Quiz.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!quiz) return res.status(404).json({ message: 'Quiz not found' });
        res.json(quiz);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.deleteQuiz = async (req, res) => {
    try {
        const quiz = await Quiz.findByIdAndDelete(req.params.id);
        if (!quiz) return res.status(404).json({ message: 'Quiz not found' });
        res.json({ message: 'Quiz deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.updateScore = async (req, res) => {
    try {
        const { quizId, teamType, points, currentQuestionIndex, currentTeamType } = req.body;

        const update = {};
        if (points !== undefined && teamType) {
            update.$inc = { [`participations.${teamType}.score`]: points };
        }

        if (currentQuestionIndex !== undefined) {
            update.currentQuestionIndex = currentQuestionIndex;
        }

        if (currentTeamType) {
            update.currentTeamType = currentTeamType;
        }

        const quiz = await Quiz.findByIdAndUpdate(
            quizId,
            update,
            { new: true }
        ).populate('participations.teamA.teamId')
            .populate('participations.teamB.teamId')
            .populate('participations.teamA.activeContestants')
            .populate('participations.teamB.activeContestants');
        res.json(quiz);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.resetQuizResults = async (req, res) => {
    try {
        const quiz = await Quiz.findByIdAndUpdate(
            req.params.id,
            {
                'participations.teamA.score': 0,
                'participations.teamB.score': 0,
                currentQuestionIndex: 0,
                currentTeamType: 'teamA'
            },
            { new: true }
        ).populate('participations.teamA.teamId')
            .populate('participations.teamB.teamId')
            .populate('participations.teamA.activeContestants')
            .populate('participations.teamB.activeContestants');

        if (!quiz) return res.status(404).json({ message: 'Quiz not found' });
        res.json(quiz);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
