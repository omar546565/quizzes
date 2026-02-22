const Contestant = require('../models/Contestant');
const InfoCategory = require('../models/InfoCategory');
const InfoModel = require('../models/InfoModel');
const InfoQuestion = require('../models/InfoQuestion');
const Quiz = require('../models/Quiz');
const Team = require('../models/Team');

exports.exportData = async (req, res) => {
    try {
        const data = {
            contestants: await Contestant.find({}),
            infoCategories: await InfoCategory.find({}),
            infoModels: await InfoModel.find({}),
            infoQuestions: await InfoQuestion.find({}),
            quizzes: await Quiz.find({}),
            teams: await Team.find({})
        };
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.importData = async (req, res) => {
    try {
        const { backupData } = req.body;
        if (!backupData) {
            return res.status(400).json({ error: 'No backup data provided' });
        }

        // Clear existing data safely
        await Contestant.deleteMany({});
        await InfoCategory.deleteMany({});
        await InfoModel.deleteMany({});
        await InfoQuestion.deleteMany({});
        await Quiz.deleteMany({});
        await Team.deleteMany({});

        // Restore data
        if (backupData.contestants) await Contestant.insertMany(backupData.contestants);
        if (backupData.infoCategories) await InfoCategory.insertMany(backupData.infoCategories);
        if (backupData.infoModels) await InfoModel.insertMany(backupData.infoModels);
        if (backupData.infoQuestions) await InfoQuestion.insertMany(backupData.infoQuestions);
        if (backupData.quizzes) await Quiz.insertMany(backupData.quizzes);
        if (backupData.teams) await Team.insertMany(backupData.teams);

        res.json({ message: 'Data restored successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
