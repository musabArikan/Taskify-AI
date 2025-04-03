import express from "express";
import dotenv from "dotenv";
import multer from "multer";
import { connectDB } from "./config/db.js";
import entryRoutes from "./routes/entry.route.js";
import userRoutes from "./routes/user.route.js";
import tagRoutes from "./routes/tag.route.js";
import cors from "cors";

dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
  fileFilter: (req, file, cb) => {
    const allowedMimes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Invalid file type. Only JPEG, PNG and GIF are allowed."));
    }
  },
});

app.use(
  cors({
    origin: ["http://localhost:5173", "http://localhost:5174","https://taskifyai-com.onrender.com"],
    credentials: true,
  })
);

app.use(express.json());
app.use("/api/user", userRoutes);

app.use("/api/entry", (req, res, next) => {
  if (req.path === "/create") {
    upload.array("files")(req, res, next);
  } else {
    next();
  }
});

app.use("/api/entry", entryRoutes);
app.use("/api/tag", tagRoutes);

app.listen(PORT, () => {
  connectDB();
  console.log("Server is running on port http://localhost:" + PORT);
});
