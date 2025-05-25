import User from "../models/User.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import mongoose from "mongoose";

dotenv.config();

export function createUser(req, res) {
  const newUserData = req.body;

  if (newUserData.type == "admin") {
    if (req.user == null) {
      res.json({
        message: "Please login as administrator to create admin account",
      });
      return;
    }

    if (req.user.type != "admin") {
      res.json({
        message: "Please login as administrator to create admin account",
      });
      return;
    }
  }
  newUserData.password = bcrypt.hashSync(newUserData.password, 10);

  const user = new User(newUserData);

  user
    .save()
    .then(() => {
      res.json({
        message: "User created",
      });
    })
    .catch(() => {
      res.json({
        message: "Error User not created",
      });
    });
}
export function userLogin(req, res) {
  User.find({ email: req.body.email }).then((users) => {
    if (users.length == 0) {
      res.json({
        message: "User Not found",
      });
    } else {
      const user = users[0];
      const isPasswordCorrect = bcrypt.compareSync(
        req.body.password,
        user.password
      );

      if (isPasswordCorrect) {
        const token = jwt.sign(
          {
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            type: user.type,
            isBlocked: user.isBlocked,
            profilePic: user.profilePic,
          },
          process.env.SECRETE
        );
        res.json({
          success: true,
          message: "User Logged in",
          token: token,
          user: {
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            profilePic: user.profilePic,
            type: user.type,
          },
        });
      } else {
        res.json({
          success: false,
          message: "User not Logged in ,Invalid Password ",
        });
      }
    }
  });
}
export async function getUsers(req, res) {
  await User.find({})
    .then((users) => {
      res.json({
        list: users,
      });
    })
    .catch((error) => {
      res.json({
        message: error,
      });
    });
}
export function isAdmin(req) {
  if (req.user == null) {
    return false;
  }
  if (req.user.type != "admin") {
    return false;
  }
  return true;
}

export function isCustomer(req) {
  if (req.user == null) {
    return false;
  }
  if (req.user.type != "customer") {
    return false;
  }
  return true;
}
export async function updateUserStatus(req, res) {
  // Only admin can update user status
  if (!isAdmin(req)) {
    return res
      .status(403)
      .json({ message: "Only admin can update user status" });
  }
  const { id } = req.params;
  const { isBlocked } = req.body;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: "Invalid user ID" });
  }
  try {
    const updatedUser = await User.findByIdAndUpdate(
      id,
      { isBlocked },
      { new: true }
    );
    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json({ message: "User status updated", user: updatedUser });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

// Middleware to get user from token (add this if not already present)
function getUserFromRequest(req) {
  // Assuming you use JWT and set req.user in auth middleware
  return req.user;
}

// GET /api/users/profile
export function getUserProfile(req, res) {
  const user = getUserFromRequest(req);
  if (!user) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  User.findOne({ email: user.email })
    .then((dbUser) => {
      if (!dbUser) return res.status(404).json({ message: "User not found" });
      res.json({
        firstName: dbUser.firstName,
        lastName: dbUser.lastName,
        email: dbUser.email,
        profilePic: dbUser.profilePic,
        type: dbUser.type,
        isBlocked: dbUser.isBlocked,
      });
    })
    .catch(() => res.status(500).json({ message: "Error fetching profile" }));
}

// PUT /api/users/profile
export function updateUserProfile(req, res) {
  const user = getUserFromRequest(req);
  if (!user) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  const { firstName, lastName, profilePic } = req.body;
  User.findOneAndUpdate(
    { email: user.email },
    { firstName, lastName, profilePic },
    { new: true }
  )
    .then((updatedUser) => {
      if (!updatedUser)
        return res.status(404).json({ message: "User not found" });
      res.json({ message: "Profile updated", user: updatedUser });
    })
    .catch(() => res.status(500).json({ message: "Error updating profile" }));
}

// PUT /api/users/password
export function updateUserPassword(req, res) {
  console.log("Password route hit");
  const user = getUserFromRequest(req);
  if (!user) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  const { oldPassword, newPassword } = req.body;
  User.findOne({ email: user.email })
    .then((dbUser) => {
      if (!dbUser) return res.status(404).json({ message: "User not found" });
      console.log("Comparing:", oldPassword, dbUser.password); // Add this line
      const isPasswordCorrect = bcrypt.compareSync(
        oldPassword,
        dbUser.password
      );
      if (!isPasswordCorrect) {
        return res.status(400).json({ message: "Old password is incorrect" });
      }
      dbUser.password = bcrypt.hashSync(newPassword, 10);
      return dbUser.save();
    })
    .then(() => res.json({ message: "Password updated" }))
    .catch(() => res.status(500).json({ message: "Error updating password" }));
}

// johndoe@example.com  securepassword123 - admin
//kavidu100@example.com  securepassword123 - customer
