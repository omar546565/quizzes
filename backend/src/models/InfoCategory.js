const mongoose = require('mongoose');

const infoCategorySchema = new mongoose.Schema({
    name: { type: String, required: true },
    icon: { type: String, default: '📚' },
    color: { type: String, default: '#D4AF37' } // Gold
}, { timestamps: true });

module.exports = mongoose.model('InfoCategory', infoCategorySchema);
