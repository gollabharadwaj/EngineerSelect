const express = require('express');
const router = express.Router();
const College = require('../models/Data');

// Route to fetch all colleges
router.get("/colleges", async (req, res) => {
  try {
    const colleges = await College.find({}, 'name'); // Fetch only the 'name' field of colleges
    res.status(200).json(colleges);
  } catch (err) {
    console.error("Error fetching colleges:", err);
    res.status(500).json({ error: "Error fetching college names." });
  }
});

router.get("/colleges/:id", async (req, res) => {
  try {
    const college = await College.findById(req.params.id);
    if (!college) {
      return res.status(404).json({ error: "College not found." });
    }
    res.status(200).json(college);
  } catch (err) {
    console.error("Error fetching college details:", err);
    res.status(500).json({ error: "Error fetching college details." });
  }
});
router.post("/", async (req, res) => {
  try {
    const newCollege = await College.create(req.body);
    res.status(201).json(newCollege);
  } catch (err) {
    console.error(err); // Log the error for debugging
    res.status(500).json({ error: "Error creating college details." });
  }
});

// UPDATE College
router.put("/:id", async (req, res) => {
  try {
    const updatedCollege = await College.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    );
    res.status(200).json(updatedCollege);
  } catch (err) {
    console.error(err); // Log the error for debugging
    res.status(500).json({ error: "Error updating college details." });
  }
});

// DELETE College
router.delete("/:id", async (req, res) => {
  try {
    await College.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "College details deleted successfully." });
  } catch (err) {
    console.error(err); // Log the error for debugging
    res.status(500).json({ error: "Error deleting college details." });
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

module.exports = router;
