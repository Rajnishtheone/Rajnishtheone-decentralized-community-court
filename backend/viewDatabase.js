import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/dcc-court');
    console.log('✅ Connected to MongoDB successfully');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message);
    process.exit(1);
  }
};

// View all users
const viewUsers = async () => {
  try {
    const User = mongoose.model('User', new mongoose.Schema({}, { strict: false }));
    const users = await User.find({}).select('-password');
    
    console.log('\n📊 ALL USERS IN DATABASE:');
    console.log('='.repeat(80));
    
    if (users.length === 0) {
      console.log('❌ No users found in database');
      return;
    }
    
    users.forEach((user, index) => {
      console.log(`\n👤 User ${index + 1}:`);
      console.log(`   ID: ${user._id}`);
      console.log(`   Username: ${user.username || 'N/A'}`);
      console.log(`   Email: ${user.email || 'N/A'}`);
      console.log(`   Role: ${user.role || 'N/A'}`);
      console.log(`   Phone: ${user.phone || 'N/A'}`);
      console.log(`   Building: ${user.building || 'N/A'}`);
      console.log(`   Flat: ${user.flat || 'N/A'}`);
      console.log(`   Date of Birth: ${user.dateOfBirth || 'N/A'}`);
      console.log(`   Gender: ${user.gender || 'N/A'}`);
      console.log(`   Age: ${user.age || 'N/A'}`);
      console.log(`   Created: ${user.createdAt || 'N/A'}`);
      console.log(`   Active: ${user.isActive !== false ? 'Yes' : 'No'}`);
    });
    
    // Find admin users
    const admins = users.filter(user => user.role === 'admin');
    console.log('\n👑 ADMIN USERS:');
    console.log('='.repeat(80));
    
    if (admins.length === 0) {
      console.log('❌ No admin users found');
    } else {
      admins.forEach((admin, index) => {
        console.log(`\n👑 Admin ${index + 1}:`);
        console.log(`   Username: ${admin.username}`);
        console.log(`   Email: ${admin.email}`);
        console.log(`   Created: ${admin.createdAt}`);
      });
    }
    
    // Find judge users
    const judges = users.filter(user => user.role === 'judge');
    console.log('\n⚖️ JUDGE USERS:');
    console.log('='.repeat(80));
    
    if (judges.length === 0) {
      console.log('❌ No judge users found');
    } else {
      judges.forEach((judge, index) => {
        console.log(`\n⚖️ Judge ${index + 1}:`);
        console.log(`   Username: ${judge.username}`);
        console.log(`   Email: ${judge.email}`);
        console.log(`   Created: ${judge.createdAt}`);
      });
    }
    
    // Find regular members
    const members = users.filter(user => user.role === 'member');
    console.log('\n👥 MEMBER USERS:');
    console.log('='.repeat(80));
    console.log(`Total Members: ${members.length}`);
    
  } catch (error) {
    console.error('❌ Error viewing users:', error.message);
  }
};

// View all cases
const viewCases = async () => {
  try {
    const Case = mongoose.model('Case', new mongoose.Schema({}, { strict: false }));
    const cases = await Case.find({}).populate('filedBy', 'username email');
    
    console.log('\n📋 ALL CASES IN DATABASE:');
    console.log('='.repeat(80));
    
    if (cases.length === 0) {
      console.log('❌ No cases found in database');
      return;
    }
    
    cases.forEach((caseItem, index) => {
      console.log(`\n📄 Case ${index + 1}:`);
      console.log(`   ID: ${caseItem._id}`);
      console.log(`   Title: ${caseItem.title || 'N/A'}`);
      console.log(`   Status: ${caseItem.status || 'N/A'}`);
      console.log(`   Category: ${caseItem.category || 'N/A'}`);
      console.log(`   Filed By: ${caseItem.filedBy?.username || 'N/A'}`);
      console.log(`   Created: ${caseItem.createdAt || 'N/A'}`);
      console.log(`   Verdict: ${caseItem.verdict || 'N/A'}`);
    });
    
  } catch (error) {
    console.error('❌ Error viewing cases:', error.message);
  }
};

// Main function
const main = async () => {
  await connectDB();
  await viewUsers();
  await viewCases();
  
  console.log('\n✅ Database inspection complete!');
  process.exit(0);
};

main(); 