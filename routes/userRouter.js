import express from "express";
import {
  createUser,
  getUsers,
  userLogin,
  updateUserStatus,
} from "../controllers/UserController.js";

const userRouter = express.Router();

userRouter.post("/", createUser);

userRouter.get("/", getUsers);
userRouter.post("/login", userLogin);
userRouter.patch("/:id", updateUserStatus);
export default userRouter;
