import express from "express";
const router = express.Router();
import { authMiddleware } from "../middlewares/auth.js";
import {
  createTag,
  updateTag,
  deleteTag,
  getTagById,
  getAllTags,
} from "../controllers/tag.controller.js";
router.use(authMiddleware);
router.post("/create", createTag);
router.put("/update/:id", updateTag);
router.delete("/delete/:id", deleteTag);
router.get("/detail/:id", getTagById);
router.get("/all", getAllTags);
export default router;
