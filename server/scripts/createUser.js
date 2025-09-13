// server/scripts/createUser.js
require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const User = require('../models/User');

(async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });

    const username = process.argv[2] || 'teacher';
    const password = process.argv[3] || '1234';
    const role = process.argv[4] || (username === 'teacher' ? 'teacher' : 'user');

    const existing = await User.findOne({ username });
    if (existing) {
      console.log('User exists — updating password and role...');
      existing.passwordHash = await bcrypt.hash(password, 10);
      existing.role = role;
      await existing.save();
      console.log('Updated', username);
      process.exit(0);
    }

    const hash = await bcrypt.hash(password, 10);
    const u = await User.create({ username, passwordHash: hash, role });
    console.log('Created user:', u.username, 'role=', u.role);
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
})();
