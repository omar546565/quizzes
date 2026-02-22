const InfoCategory = require('../models/InfoCategory');
const InfoModel = require('../models/InfoModel');
const InfoQuestion = require('../models/InfoQuestion');

// --- Categories ---
exports.createCategory = async (req, res) => {
    try {
        const category = new InfoCategory(req.body);
        await category.save();
        res.status(201).json(category);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getAllCategories = async (req, res) => {
    try {
        const categories = await InfoCategory.find().sort({ createdAt: -1 });
        res.json(categories);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.updateCategory = async (req, res) => {
    try {
        const category = await InfoCategory.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(category);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.deleteCategory = async (req, res) => {
    try {
        await InfoCategory.findByIdAndDelete(req.params.id);
        // Also delete models and questions under this category? 
        // For simplicity, we just delete the category.
        res.json({ message: 'Category deleted' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// --- Models ---
exports.createModel = async (req, res) => {
    try {
        const model = new InfoModel(req.body);
        await model.save();
        res.status(201).json(model);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getModelsByCategory = async (req, res) => {
    try {
        const models = await InfoModel.find({ categoryId: req.params.categoryId }).sort({ order: 1 });
        res.json(models);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.updateModel = async (req, res) => {
    try {
        const model = await InfoModel.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(model);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.deleteModel = async (req, res) => {
    try {
        await InfoModel.findByIdAndDelete(req.params.id);
        res.json({ message: 'Model deleted' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// --- Questions ---
exports.createQuestion = async (req, res) => {
    try {
        const question = new InfoQuestion(req.body);
        await question.save();
        res.status(201).json(question);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getQuestionsByModel = async (req, res) => {
    try {
        const questions = await InfoQuestion.find({ modelId: req.params.modelId });
        res.json(questions);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.updateQuestion = async (req, res) => {
    try {
        const question = await InfoQuestion.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(question);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.deleteQuestion = async (req, res) => {
    try {
        await InfoQuestion.findByIdAndDelete(req.params.id);
        res.json({ message: 'Question deleted' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// --- Competition Logic ---
exports.generateCompetitionQuestions = async (req, res) => {
    try {
        const { modelIds } = req.body; // Array of InfoModel IDs
        if (!modelIds || modelIds.length === 0) {
            return res.status(400).json({ error: 'No models selected' });
        }

        const questionsPerModel = Math.floor(20 / modelIds.length);
        const extraQuestions = 20 % modelIds.length;

        let selectedQuestions = [];

        for (let i = 0; i < modelIds.length; i++) {
            const count = questionsPerModel + (i < extraQuestions ? 1 : 0);
            const questions = await InfoQuestion.aggregate([
                { $match: { modelId: new mongoose.Types.ObjectId(modelIds[i]) } },
                { $sample: { size: count } }
            ]);
            selectedQuestions = selectedQuestions.concat(questions);
        }

        // Shuffle the result
        selectedQuestions = selectedQuestions.sort(() => Math.random() - 0.5);

        res.json(selectedQuestions);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
