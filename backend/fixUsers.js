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

// Fix user data issues
const fixUsers = async () => {
  try {
    const User = mongoose.model('User', new mongoose.Schema({}, { strict: false }));
    
    // Find users with missing name or invalid age
    const problematicUsers = await User.find({
      $or: [
        { name: { $exists: false } },
        { name: null },
        { name: '' },
        { age: { $lt: 0 } },
        { age: 0 }
      ]
    });
    
    console.log(`\n🔧 Found ${problematicUsers.length} users with data issues:`);
    
    if (problematicUsers.length === 0) {
      console.log('✅ No users need fixing!');
      return;
    }
    
    for (const user of problematicUsers) {
      console.log(`\n👤 Fixing user: ${user.email || user.username}`);
      
      const updates = {};
      
      // Fix missing name
      if (!user.name || user.name === '') {
        updates.name = user.username || 'User';
        console.log(`   ➕ Added name: ${updates.name}`);
      }
      
      // Fix invalid age
      if (user.age === 0 || user.age < 0) {
        updates.age = null; // Set to null instead of 0
        console.log(`   🔧 Fixed age: null`);
      }
      
      // Update the user
      if (Object.keys(updates).length > 0) {
        await User.updateOne(
          { _id: user._id },
          { $set: updates }
        );
        console.log(`   ✅ Updated successfully`);
      }
    }
    
    console.log('\n🎉 User data fixing complete!');
    
  } catch (error) {
    console.error('❌ Error fixing users:', error.message);
  }
};

// Main function
const main = async () => {
  await connectDB();
  await fixUsers();
  
  console.log('\n✅ Database cleanup complete!');
  process.exit(0);
};

main(); 