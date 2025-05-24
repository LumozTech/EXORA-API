import User from "../models/User.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

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
// johndoe@example.com  securepassword123 - admin
//kavidu100@example.com  securepassword123 - customer
export async function updateUserStatus(req, res) {
  // Only admin can block/unblock users
  if (!isAdmin(req)) {
    return res
      .status(403)
      .json({ message: "Only admin can update user status" });
  }
  try {
    const { id } = req.params;
    const { isBlocked } = req.body;
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
