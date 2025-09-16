// server/scripts/createUser.js
require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const User = require('../models/User');

(async () => {
  try {
    console.log('🔄 Connecting to database...');
    await mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log('✅ Connected to database');

    // Clear all existing users
    console.log('🗑️ Clearing existing users...');
    await User.deleteMany({});
    console.log('✅ Existing users cleared');

    // Create teacher user
    console.log('👨‍🏫 Creating teacher user...');
    const teacherHash = await bcrypt.hash('1234', 10);
    const teacher = await User.create({
      username: 'teacher',
      passwordHash: teacherHash,
      role: 'teacher'
    });
    console.log('✅ Teacher created:', teacher.username);

    // Create admin user
    console.log('👤 Creating admin user...');
    const adminHash = await bcrypt.hash('1234', 10);
    const admin = await User.create({
      username: 'admin',
      passwordHash: adminHash,
      role: 'teacher'
    });
    console.log('✅ Admin created:', admin.username);

    // Create student user
    console.log('👨‍🎓 Creating student user...');
    const studentHash = await bcrypt.hash('1234', 10);
    const student = await User.create({
      username: 'student',
      passwordHash: studentHash,
      role: 'user'
    });
    console.log('✅ Student created:', student.username);

    // Test all passwords
    console.log('\n🧪 Testing passwords...');
    const teacherTest = await bcrypt.compare('1234', teacher.passwordHash);
    const adminTest = await bcrypt.compare('1234', admin.passwordHash);
    const studentTest = await bcrypt.compare('1234', student.passwordHash);

    console.log('Teacher test:', teacherTest ? '✅ PASS' : '❌ FAIL');
    console.log('Admin test:', adminTest ? '✅ PASS' : '❌ FAIL');
    console.log('Student test:', studentTest ? '✅ PASS' : '❌ FAIL');

    console.log('\n🎉 NEW LOGIN CREDENTIALS:');
    console.log('Teacher: username="teacher", password="1234"');
    console.log('Admin:   username="admin", password="1234"');
    console.log('Student: username="student", password="1234"');

    process.exit(0);
  } catch (err) {
    console.error('❌ Error:', err);
    process.exit(1);
  }
})();