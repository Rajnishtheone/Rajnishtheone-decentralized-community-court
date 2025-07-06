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

// Make user admin
const makeAdmin = async (email) => {
  try {
    // Use the existing User model from the application
    const User = mongoose.models.User || mongoose.model('User', new mongoose.Schema({
      username: String,
      email: String,
      role: String
    }, { strict: false }));
    
    // Find user by email
    const user = await User.findOne({ email });
    
    if (!user) {
      console.log(`❌ User with email ${email} not found`);
      return;
    }
    
    console.log(`Found user: ${user.username} (${user.email}) - Current role: ${user.role}`);
    
    // Update user role to admin
    const result = await User.updateOne(
      { email: email },
      { $set: { role: 'admin' } }
    );
    
    if (result.modifiedCount > 0) {
      console.log(`✅ Successfully promoted ${user.username} (${user.email}) to ADMIN role`);
    } else {
      console.log(`❌ Failed to update user role`);
    }
    
  } catch (error) {
    console.error('❌ Error making user admin:', error.message);
  }
};

// List all users for reference
const listUsers = async () => {
  try {
    const User = mongoose.models.User || mongoose.model('User', new mongoose.Schema({
      username: String,
      email: String,
      role: String
    }, { strict: false }));
    
    const users = await User.find({}).select('username email role');
    
    console.log('\n👥 Available Users:');
    console.log('='.repeat(50));
    
    users.forEach((user, index) => {
      console.log(`${index + 1}. ${user.username} (${user.email}) - ${user.role}`);
    });
    
  } catch (error) {
    console.error('❌ Error listing users:', error.message);
  }
};

// Main function
const main = async () => {
  await connectDB();
  
  // List all users first
  await listUsers();
  
  // Get email from command line argument
  const email = process.argv[2];
  
  if (!email) {
    console.log('\n❌ Please provide an email address to promote to admin');
    console.log('Usage: node makeAdmin.js <email>');
    console.log('\nExample: node makeAdmin.js rajni@example.com');
    process.exit(1);
  }
  
  await makeAdmin(email);
  
  console.log('\n✅ Admin promotion complete!');
  process.exit(0);
};

main(); 