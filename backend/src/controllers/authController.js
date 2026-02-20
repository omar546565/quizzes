const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

exports.login = async (req, res) => {
    try {
        const { username, password } = req.body;
        console.log('Login attempt for:', username);

        const adminUser = process.env.ADMIN_USER || 'admin';
        const adminPass = process.env.ADMIN_PASS || '123456';

        if (username === adminUser && password === adminPass) {
            const token = jwt.sign(
                { username },
                process.env.JWT_SECRET || 'ramadan_secret_key',
                { expiresIn: '24h' }
            );
            return res.json({ token });
        }

        console.log('Login failed: Invalid credentials');
        res.status(401).json({ message: 'بيانات الدخول غير صحيحة' });
    } catch (error) {
        console.error('LOGIN ERROR:', error);
        res.status(500).json({ error: error.message });
    }
};
