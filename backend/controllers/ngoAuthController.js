// backend/controllers/ngoAuthController.js
import NGO from "../models/NGO.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { validationResult } from "express-validator";

const JWT_SECRET = process.env.JWT_SECRET || "dev_secret";

export const registerNGO = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const {
      name,
      email,
      password,
      organizationName,
      registrationNumber,
      description,
      contactNumber,
      categories
    } = req.body;

    // Check if NGO already exists
    let ngo = await NGO.findOne({ $or: [{ email }, { registrationNumber }] });
    if (ngo) {
      return res.status(400).json({ 
        message: "NGO with this email or registration number already exists" 
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create NGO
    ngo = new NGO({
      name,
      email,
      password: hashedPassword,
      organizationName,
      registrationNumber,
      description,
      contactNumber,
      categories
    });

    await ngo.save();

    // Generate JWT
    const token = jwt.sign(
      { 
        ngoId: ngo._id,
        type: 'ngo' // Important: distinguish from user tokens
      },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.status(201).json({
      message: "NGO registered successfully",
      token,
      ngo: {
        id: ngo._id,
        name: ngo.name,
        email: ngo.email,
        organizationName: ngo.organizationName,
        verified: ngo.verified
      }
    });
  } catch (err) {
    console.error("NGO registration error:", err);
    res.status(500).json({ message: "Server error during registration" });
  }
};

export const loginNGO = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { email, password } = req.body;

    // Check if NGO exists
    const ngo = await NGO.findOne({ email });
    if (!ngo) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Verify password
    const isMatch = await bcrypt.compare(password, ngo.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Generate JWT
    const token = jwt.sign(
      { 
        ngoId: ngo._id,
        type: 'ngo'
      },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      message: "Login successful",
      token,
      ngo: {
        id: ngo._id,
        name: ngo.name,
        email: ngo.email,
        organizationName: ngo.organizationName,
        verified: ngo.verified
      }
    });
  } catch (err) {
    console.error("NGO login error:", err);
    res.status(500).json({ message: "Server error during login" });
  }
};

export const getNGOProfile = async (req, res) => {
  try {
    const ngo = await NGO.findById(req.ngo.id)
      .select("-password")
      .populate('eventsCreated');
    
    if (!ngo) {
      return res.status(404).json({ message: "NGO not found" });
    }

    res.json({ ngo });
  } catch (err) {
    console.error("Get NGO profile error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

export const updateNGOProfile = async (req, res) => {
  try {
    const {
      name,
      organizationName,
      description,
      contactNumber,
      address,
      categories,
      website
    } = req.body;

    const ngo = await NGO.findById(req.ngo.id);
    if (!ngo) {
      return res.status(404).json({ message: "NGO not found" });
    }

    // Update fields
    if (name) ngo.name = name;
    if (organizationName) ngo.organizationName = organizationName;
    if (description) ngo.description = description;
    if (contactNumber) ngo.contactNumber = contactNumber;
    if (address) ngo.address = address;
    if (categories) ngo.categories = categories;
    if (website) ngo.website = website;

    await ngo.save();

    const updatedNGO = await NGO.findById(req.ngo.id).select("-password");
    res.json({
      message: "Profile updated successfully",
      ngo: updatedNGO
    });
  } catch (err) {
    console.error("Update NGO profile error:", err);
    res.status(500).json({ message: "Server error" });
  }
};