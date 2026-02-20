const Contestant = require('../models/Contestant');
const Team = require('../models/Team');
const Quiz = require('../models/Quiz');

exports.registerContestant = async (req, res) => {
    try {
        const { name, age, teamId, quizId } = req.body;

        // Check if registration is open for specific quiz
        if (quizId) {
            const quiz = await Quiz.findById(quizId);
            if (quiz && !quiz.registrationOpen) {
                return res.status(403).json({ message: 'عذراً، التسجيل لهذه المسابقة مغلق حالياً' });
            }
        }

        let contestant;
        // Strict name uniqueness check
        contestant = await Contestant.findOne({ name: { $regex: new RegExp(`^${name}$`, 'i') } });

        if (contestant) {
            // If already exists and we have a quizId, just add the quizId to their list
            if (quizId) {
                if (!contestant.registeredQuizzes.includes(quizId)) {
                    contestant.registeredQuizzes.push(quizId);
                    await contestant.save();
                    await autoFairBalance(quizId);
                }
                return res.status(200).json(contestant);
            }
            return res.status(400).json({ message: 'هذا الاسم مسجل مسبقاً، يرجى استخدام اسم مختلف' });
        }

        contestant = new Contestant({ name, age });

        if (teamId) {
            contestant.teamId = teamId;
        }

        if (quizId) {
            if (!contestant.registeredQuizzes.includes(quizId)) {
                contestant.registeredQuizzes.push(quizId);
            }
        }

        await contestant.save();

        // If registered for a specific quiz, trigger fair balancing
        if (quizId) {
            await autoFairBalance(quizId);
        }

        res.status(201).json(contestant);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const autoFairBalance = async (quizId) => {
    const quiz = await Quiz.findById(quizId);
    if (!quiz || !quiz.participations.teamA.teamId || !quiz.participations.teamB.teamId) {
        return;
    }

    const teamAId = quiz.participations.teamA.teamId;
    const teamBId = quiz.participations.teamB.teamId;

    // Find all contestants registered for this quiz
    const contestants = await Contestant.find({ registeredQuizzes: quizId }).sort({ age: 1 });

    const updates = [];
    contestants.forEach((c, index) => {
        // Snake pattern distribution (A, B, B, A, A, B, B, A...)
        const group = Math.floor(index / 2);
        const isEvenGroup = group % 2 === 0;
        const isFirstInGroup = index % 2 === 0;

        let assignedTeamId = teamAId;
        if (isEvenGroup) {
            assignedTeamId = isFirstInGroup ? teamAId : teamBId;
        } else {
            assignedTeamId = isFirstInGroup ? teamBId : teamAId;
        }

        updates.push(Contestant.findByIdAndUpdate(c._id, { teamId: assignedTeamId }));
    });

    await Promise.all(updates);
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
