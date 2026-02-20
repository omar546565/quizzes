const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/quizzes', require('./routes/quizRoutes'));
app.use('/api/contestants', require('./routes/contestantRoutes'));
app.use('/api/teams', require('./routes/teamRoutes'));

app.get('/health', (req, res) => {
    res.json({ status: 'ok', time: new Date() });
});

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/ramadan_quiz')
    .then(() => {
        console.log('Connected to MongoDB');
        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });
    })
    .catch(err => {
        console.error('MongoDB connection error:', err);
    });
