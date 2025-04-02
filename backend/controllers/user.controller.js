import jwt from "jsonwebtoken";
import Token from "../models/token.model.js";
import User from "../models/user.model.js";
import bcrypt from "bcryptjs";

const generateTokens = (user) => {
  const accessToken = jwt.sign(
    { id: user._id, email: user.email },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: "1y" }
  );

  const refreshToken = jwt.sign(
    { id: user._id },
    process.env.REFRESH_TOKEN_SECRET,
    { expiresIn: "7d" }
  );

  return { accessToken, refreshToken };
};

export const signupUser = async (req, res) => {
  try {
    const { email, name, password, surname } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User already exists!",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({
      email,
      name,
      surname,
      password: hashedPassword,
    });

    await newUser.save();

    const { accessToken, refreshToken } = generateTokens(newUser);

    await Token.create({
      userId: newUser._id,
      refreshToken,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });

    res.status(201).json({
      success: true,
      accessToken,
      refreshToken,
      user: {
        id: newUser._id,
        email: newUser.email,
        name: newUser.name,
        surname: newUser.surname,
      },
    });
  } catch (error) {
    console.error("Error in Create user:", error.message);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(400).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    const { accessToken, refreshToken } = generateTokens(user);

    await Token.create({
      userId: user._id,
      refreshToken,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });

    res.status(200).json({
      success: true,
      accessToken,
      refreshToken,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        surname: user.surname,
      },
    });
  } catch (error) {
    console.error("Error in Login:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

export const refreshTokenUser = async (req, res) => {
  try {
    const { refreshToken: requestToken } = req.body;

    if (!requestToken) {
      return res.status(400).json({
        success: false,
        message: "Refresh token is required",
      });
    }

    const refreshTokenDoc = await Token.findOne({ refreshToken: requestToken });

    if (!refreshTokenDoc) {
      return res.status(401).json({
        success: false,
        message: "Refresh token is not valid",
      });
    }

    if (refreshTokenDoc.expiresAt < new Date()) {
      await Token.findByIdAndDelete(refreshTokenDoc._id);
      return res.status(401).json({
        success: false,
        message: "Refresh token expired. Please login again",
      });
    }

    let userData;
    try {
      userData = jwt.verify(requestToken, process.env.REFRESH_TOKEN_SECRET);
    } catch (err) {
      await Token.findByIdAndDelete(refreshTokenDoc._id);
      return res.status(401).json({
        success: false,
        message: "Invalid refresh token",
      });
    }

    const user = await User.findById(userData.id);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not found",
      });
    }

    const { accessToken, refreshToken } = generateTokens(user);

    await Token.findByIdAndDelete(refreshTokenDoc._id);
    await Token.create({
      userId: user._id,
      refreshToken,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });

    return res.status(200).json({
      success: true,
      accessToken,
      refreshToken,
    });
  } catch (error) {
    console.error("Refresh token error:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};
