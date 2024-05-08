const express = require('express');
const router = express.Router();
const College = require('../models/Data');
const Bookmark = require('../models/Bookmark');
// GET all colleges
router.get("/colleges", async (req, res) => {
  try {
    const colleges = await College.find();
    res.status(200).json(colleges);
  } catch (err) {
    res.status(500).json({ error: "Error fetching colleges." });
  }
});

// GET college by ID
router.get("/colleges/:id", async (req, res) => {
  try {
    const college = await College.findById(req.params.id);
    if (!college) {
      return res.status(404).json({ error: "College not found." });
    }
    res.status(200).json(college);
  } catch (err) {
    res.status(500).json({ error: "Error fetching college." });
  }
});
router.get("/colleges/search/:name", async (req, res) => {
  try {
    let inputName = req.params.name.trim().toLowerCase(); 
    const colleges = await College.find({ 
      name: { 
        $regex: new RegExp(`.*${inputName.split('').join('.*')}.*`, 'i') 
      }
    }).lean(); 

    if (colleges.length === 0) {
      return res.status(404).json({ error: "No colleges found for the provided search name." });
    }

    res.status(200).json(colleges);
  } catch (err) {
    console.error("Error searching for colleges:", err);
    res.status(500).json({ error: "Error searching for colleges." });
  }
});
router.get("/bookmarks/:userId", async (req, res) => {
  try {
    const userId = req.params.userId;
    const bookmarks = await Bookmark.find({ userId }).populate('collegeId');
    res.status(200).json(bookmarks);
  } catch (err) {
    res.status(500).json({ error: "Error fetching bookmarks." });
  }
});

// POST add bookmark
router.post("/bookmarks/add", async (req, res) => {
  try {
    const { userId, collegeId } = req.body;
    const existingBookmark = await Bookmark.findOne({ userId, collegeId });
    if (existingBookmark) {
      return res.status(400).json({ error: "Bookmark already exists." });
    }
    const bookmark = new Bookmark({ userId, collegeId });
    await bookmark.save();
    res.status(200).json({ message: "Bookmark added successfully." });
  } catch (err) {
    res.status(500).json({ error: "Error adding bookmark." });
  }
});

// POST remove bookmark
router.post("/bookmarks/remove", async (req, res) => {
  try {
    const { userId, collegeId } = req.body;
    await Bookmark.findOneAndDelete({ userId, collegeId });
    res.status(200).json({ message: "Bookmark removed successfully." });
  } catch (err) {
    res.status(500).json({ error: "Error removing bookmark." });
  }
});

module.exports = router;
