const express = require('express');
const router = express.Router();
const contestantController = require('../controllers/contestantController');
const auth = require('../middleware/auth');

router.post('/register', contestantController.registerContestant);
router.get('/team/:teamId', contestantController.getContestantsByTeam);
router.delete('/:id', auth, contestantController.deleteContestant);

module.exports = router;
