const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

exports.login = async (req, res) => {
    const { username, password } = req.body;

    const adminUser = process.env.ADMIN_USER || 'admin';
    const adminPass = process.env.ADMIN_PASS || '123456'; // In production, use hashed passwords

    if (username === adminUser && password === adminPass) {
        const token = jwt.sign(
            { username },
            process.env.JWT_SECRET || 'ramadan_secret_key',
            { expiresIn: '24h' }
        );
        return res.json({ token });
    }

    res.status(401).json({ message: 'بيانات الدخول غير صحيحة' });
};
