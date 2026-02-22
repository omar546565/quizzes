const mongoose = require('mongoose');

const infoModelSchema = new mongoose.Schema({
    categoryId: { type: mongoose.Schema.Types.ObjectId, ref: 'InfoCategory', required: true },
    name: { type: String, required: true },
    order: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model('InfoModel', infoModelSchema);
