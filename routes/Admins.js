const express = require('express');
const router = express.Router();
const Admin = require('../models/Admin');
const bcrypt = require('bcrypt');

// Update Admin
router.put("/:id", async (req, res) => {
  try {
    // Check if the provided user ID matches the ID in the request URL
    if (req.body.userId === req.params.id) {
      // Prepare the update object with only username and password
      const updateFields = {};
      if (req.body.username) {
        updateFields.username = req.body.username;
      }
      if (req.body.password) {
        const salt = await bcrypt.genSalt(10);
        updateFields.password = await bcrypt.hash(req.body.password, salt);
      }
      // Find and update the admin by ID
      const updatedAdmin = await Admin.findByIdAndUpdate(
        req.params.id,
        { $set: updateFields },
        { new: true }
      );
      res.status(200).json(updatedAdmin);
    } else {
      res.status(401).json("You can update only your account!");
    }
  } catch (err) {
    res.status(500).json(err);
  }
});
// Delete Admin
router.delete("/:id", async (req, res) => {
  try {
    // Find admin by ID
    const admin = await Admin.findById(req.params.id);
    if (admin) {
      // If admin exists, delete it
      await Admin.findByIdAndDelete(req.params.id);
      res.status(200).json("Admin has been deleted...");
    } else {
      res.status(404).json("Admin not found!");
    }
  } catch (err) {
    res.status(500).json(err);
  }
});

router.get("/:id", async (req, res) => {
  try {
    const admin = await Admin.findById(req.params.id).select("-password");
    res.status(200).json(admin);
  } catch (err) {
    res.status(500).json(err);
  }
});
module.exports = router;
