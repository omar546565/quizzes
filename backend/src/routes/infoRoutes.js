const express = require('express');
const router = express.Router();
const infoController = require('../controllers/infoController');
const auth = require('../middleware/auth');

// --- Categories ---
router.get('/categories', infoController.getAllCategories);
router.post('/categories', auth, infoController.createCategory);
router.put('/categories/:id', auth, infoController.updateCategory);
router.delete('/categories/:id', auth, infoController.deleteCategory);

// --- Models ---
router.get('/models/:categoryId', infoController.getModelsByCategory);
router.post('/models', auth, infoController.createModel);
router.put('/models/:id', auth, infoController.updateModel);
router.delete('/models/:id', auth, infoController.deleteModel);

// --- Questions ---
router.get('/questions/:modelId', infoController.getQuestionsByModel);
router.post('/questions', auth, infoController.createQuestion);
router.put('/questions/:id', auth, infoController.updateQuestion);
router.delete('/questions/:id', auth, infoController.deleteQuestion);

// --- Competition Logic ---
router.post('/generate-competition', auth, infoController.generateCompetitionQuestions);

module.exports = router;
