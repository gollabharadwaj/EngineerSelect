const express = require('express');
const router = express.Router(); // Define the router once
const bcrypt = require('bcrypt');
const User = require('../models/User');
const Admin = require('../models/Admin');
const session = require('express-session');
const multer = require('multer');
const dotenv = require('dotenv');
dotenv.config();
router.use(session({
  secret: 'your-secret-key', // Change this to a random secret key
  resave: false,
  saveUninitialized: false
}));
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "images");
  },
  filename: (req, file, cb) => {
    cb(null, req.body.name);
  },
});
const upload = multer({ storage: storage });
// USER REGISTRATION under /api/auth/user/register
router.post('/user/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Check if the email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'Email is already registered!' });
    }

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPass = await bcrypt.hash(password, salt);

    // Create a new user
    const newUser = new User({
      username,
      email,
      password: hashedPass,
    });

    // Save the new user to the database
    const user = await newUser.save();
    res.status(200).json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Error during user registration.' });
  }
});

// USER LOGIN
router.post('/user/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: 'User not found!' });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(400).json({ error: 'Invalid credentials!' });
    }

    // Omitting password from the response
    const { password: omitPass, ...others } = user._doc;
    res.status(200).json(others);
  } catch (err) {
    res.status(500).json({ error: 'Error during user login.' });
  }
});

// ADMIN REGISTRATION
router.post('/admin/register', async (req, res) => {
  try {
    const { username, email, password, securityKey } = req.body;
    const hashedSecurityKey = await bcrypt.hash(securityKey, 10); // Hash the security key

    if (securityKey !== process.env.ADMIN_SECURITY_KEY) {
      return res.status(403).json({ error: 'Invalid security key.' });
    }

    // Check if the email already exists
    const existingAdmin = await Admin.findOne({ email });
    if (existingAdmin) {
      return res.status(400).json({ error: 'Email is already registered!' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPass = await bcrypt.hash(password, salt);
    const newAdmin = new Admin({
      username,
      email,
      password: hashedPass,
      securityKey: hashedSecurityKey,
    });

    const admin = await newAdmin.save();
    res.status(200).json(admin);
  } catch (err) {
    res.status(500).json({ error: 'Error during admin registration.' });
  }
});

// ADMIN LOGIN
router.post('/admin/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const admin = await Admin.findOne({ email });
    if (!admin) {
      return res.status(404).json({ error: 'Admin not found!' });
    }

    const validated = await bcrypt.compare(password, admin.password);
    if (!validated) {
      return res.status(400).json({ error: 'Invalid credentials!' });
    }

    const { password: omitPass, ...others } = admin._doc;
    res.status(200).json(others);
  } catch (err) {
    res.status(500).json({ error: 'Error during admin login.' });
  }
});
router.post('/logout', (req, res) => {
  req.session.destroy()
});
router.post('/upload-photo', upload.single('photo'), async (req, res) => {
  try {
      const { filename } = req.file; // Get the filename of the uploaded photo
      await Admin.findByIdAndUpdate(req.user._id, { profilePic: filename });
      res.status(200).json({ message: 'Photo uploaded successfully' });
  } catch (error) {
      console.error('Error uploading photo:', error);
      res.status(500).json({ error: 'Internal server error' });
  }
});
router.post('/admin/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;

    // Check if the email exists in the database
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: 'User not found!' });
    }

    // Generate a unique reset token (replace this with your own method)
    const resetToken = generateResetToken();

    // Store the reset token and expiration time in the user's document (you need to implement this part)
    user.resetToken = resetToken;
    user.resetTokenExpiration = Date.now() + 3600000; // Token expires in 1 hour

    await user.save();

    // Send password reset email
    await sendResetEmail(email, resetToken);

    // Now, directly make a PUT request to update the user's document with reset token and expiration time
    const response = await fetch('http://localhost:5000/api/auth/user/reset-password', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email,
        resetToken,
        resetTokenExpiration: user.resetTokenExpiration
      })
    });

    if (response.ok) {
      res.status(200).json({ message: 'Password reset link sent successfully.' });
    } else {
      res.status(500).json({ error: 'Failed to send password reset link.' });
    }
  } catch (err) {
    console.error('Error during password reset:', err);
    res.status(500).json({ error: 'Error during password reset. Please try again later.' });
  }
});


module.exports = router;
