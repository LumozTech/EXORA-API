import express from "express";
import {
  createUser,
  getUsers,
  userLogin,
  updateUserStatus,
  getUserProfile,
  updateUserProfile,
  updateUserPassword,
} from "../controllers/UserController.js";

const userRouter = express.Router();

userRouter.post("/", createUser);

userRouter.get("/", getUsers);
userRouter.post("/login", userLogin);
userRouter.patch("/:id", updateUserStatus);
userRouter.get("/profile", getUserProfile);
userRouter.put("/profile", updateUserProfile);
userRouter.put("/password", updateUserPassword);

export default userRouter;
