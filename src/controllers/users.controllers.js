import { User } from "../models/auth/user.models.js";
import bcrypt from "bcryptjs";
import { generateToken } from "../utils/jwt.js";


export const createUser = async (req, res) => {
  const { username, email, password, Flat_no } = req.body;
  console.log(req.body);
  try {
    if (!username || !email || !password || !Flat_no) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Prevent duplicates by either email OR Flat_no
    const existingUser = await User.findOne({
      $or: [
        { email: email },
        { Flat_no: Flat_no }
      ]
    });
    if (existingUser) {
      return res.status(409).json({ message: "User already exists" });
    }
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      username,
      email,
      password: hashedPassword,
      Flat_no,
    });

    await newUser.save();

    res.status(201).json({ message: "User created successfully" });
  } catch (error) {
    // Handle duplicate key error from DB if unique indexes are set
    if (error && (error.code === 11000 || error.name === "MongoServerError")) {
      return res
        .status(409)
        .json({ message: "User already exists", error: error.message });
    }
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const loginUser = async (req, res) => {
  const { email, password, Flat_no } = req.body;
  if (!email || !password || !Flat_no) {
    return res.status(400).json({ message: "All fields are required" });
  }
  try {
    const user = await User.findOne({ email, Flat_no });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    try {
      // Update last login time
      user.lastLogin = new Date();
      await user.save();

      const token = generateToken(user);
      
      // Set cookie with token
      res.cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 24 * 60 * 60 * 1000, // 1 day
      });

      // Send token in response body
      res.status(200).json({ 
        message: "Login successful",
        token,
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          Flat_no: user.Flat_no
        },
        // Add Postman test script
        postmanScript: `
        pm.test("Login Successful", function() {
          pm.response.to.have.status(200);
          var jsonData = pm.response.json();
          pm.environment.set("token", jsonData.token);
        });
        `
      });
    } catch (error) {
      console.error('Token Generation Error:', error);
      return res.status(500).json({ 
        message: "Error generating authentication token",
        error: error.message 
      });
    }
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
};

export const logout = async (req, res) => {
  try {
    // Clear the cookie
    res.clearCookie("token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });

    // Update user's last activity
    if (req.user && req.user.id) {
      await User.findByIdAndUpdate(req.user.id, {
        $set: { lastLogout: new Date() }
      });
    }

    res.status(200).json({ message: "Logout successful" });
  } catch (error) {
    res.status(500).json({ message: "Error during logout", error: error.message });
  }
};

export const getUser = async (req, res) => {
  try {
    // Only accept flat number from params for consistency
    const Flat_no = req.params?.Flat_no;
    if (!Flat_no) {
      return res.status(400).json({ message: "Flat number is required" });
    }
    const user = await User.findOne({ Flat_no }).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

