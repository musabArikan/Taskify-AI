import express from "express";
const router = express.Router();

import {
  signupUser,
  loginUser,
  refreshTokenUser,
} from "../controllers/user.controller.js";
router.post("/signup", signupUser);
router.post("/login", loginUser);
router.post("/refresh-token", refreshTokenUser);
export default router;
