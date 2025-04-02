import Tag from "../models/tag.model.js";

export const createTag = async (req, res) => {
  const tag = req.body;
  const userId = req.user.id;

  if (!tag.name) {
    return res.status(400).json({
      success: false,
      message: "Tag name is required",
    });
  }

  try {
    const newTag = new Tag({
      ...tag,
      userId,
    });

    await newTag.save();

    res.status(201).json({
      success: true,
      data: newTag,
    });
  } catch (error) {
    console.error("Error in Create Tag:", error.message);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};
export const updateTag = async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;
  const tag = req.body;

  try {
    const existingTag = await Tag.findOne({ _id: id, userId });
    if (!existingTag) {
      return res.status(404).json({
        success: false,
        message: "Tag not found or not authorized",
      });
    }

    const updatedTag = await Tag.findByIdAndUpdate(
      id,
      {
        ...tag,
        userId,
      },
      { new: true }
    );

    res.status(200).json({ success: true, data: updatedTag });
  } catch (error) {
    console.error("Error in Update Tag:", error.message);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

export const deleteTag = async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  try {
    const existingTag = await Tag.findOne({ _id: id, userId });
    if (!existingTag) {
      return res.status(404).json({
        success: false,
        message: "Tag not found or not authorized",
      });
    }

    await Tag.findByIdAndDelete(id);
    res.status(200).json({ success: true, message: "Tag deleted" });
  } catch (error) {
    console.error("Error in Delete Tag:", error.message);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};
export const getTagById = async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  try {
    const tag = await Tag.findOne({ _id: id, userId });
    if (!tag) {
      return res.status(404).json({
        success: false,
        message: "Tag not found or not authorized",
      });
    }

    res.status(200).json({
      success: true,
      data: tag,
    });
  } catch (error) {
    console.error("Error in Get Tag:", error.message);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};
export const getAllTags = async (req, res) => {
  const userId = req.user.id;
  try {
    const tags = await Tag.find({ userId }).select("name color bgColor");

    res.status(200).json({
      success: true,
      data: tags,
    });
  } catch (error) {
    console.error("Error in Fetch Tags:", error.message);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};
