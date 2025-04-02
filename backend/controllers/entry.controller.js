import Entry from "../models/entry.model.js";
import Tag from "../models/tag.model.js";
import { aiService } from "../aiServices.js";
import { uploadFile } from "../uploadCare.service.js";

export const deleteEntry = async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;
  try {
    const existingEntry = await Entry.findOne({ _id: id, userId });
    if (!existingEntry) {
      return res.status(404).json({
        success: false,
        message: "Entry not found or not authorized",
      });
    }
    await Entry.findByIdAndDelete(id);
    res.status(200).json({ success: true, message: "Entry deleted" });
  } catch (error) {
    console.error("Error in Delete Entry:", error.message);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};
export const updateEntry = async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;
  const entry = req.body;

  try {
    const existingEntry = await Entry.findOne({ _id: id, userId });
    if (!existingEntry) {
      return res.status(404).json({
        success: false,
        message: "Entry not found or not authorized",
      });
    }

    const updatedEntry = await Entry.findByIdAndUpdate(
      id,
      {
        ...entry,
        userId,
      },
      { new: true }
    ).populate("tags");

    res.status(200).json({ success: true, data: updatedEntry });
  } catch (error) {
    console.error("Update error:", error.message);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};
export const createEntry = async (req, res) => {
  try {
    const { content, selectedTags } = req.body;
    const files = req.files;
    const userId = req.user.id;

    let uploadedFiles = [];
    let uploadErrors = [];

    if (files && files.length > 0) {
      for (const file of files) {
        try {
          console.log("Processing file:", file.originalname);

          const result = await uploadFile(file.buffer, file.originalname);
          if (result && result.cdnUrl) {
            uploadedFiles.push(result);
            console.log("File uploaded successfully:", result.cdnUrl);
          }
        } catch (err) {
          console.error(`Error uploading file ${file.originalname}:`, err);
          uploadErrors.push({
            fileName: file.originalname,
            error: err.message,
          });
        }
      }
    }

    const aiResult = await aiService.getAdvice(content);
    let aiContentText = "";

    if (aiResult.error) {
      aiContentText = "";
    } else {
      aiContentText = aiResult.text || "";
    }

    const parsedTags =
      typeof selectedTags === "string"
        ? JSON.parse(selectedTags)
        : selectedTags;

    const newEntry = new Entry({
      content,
      tags: parsedTags,
      aiContent: aiContentText,
      files: uploadedFiles.map((file) => file.cdnUrl),
      userId,
    });

    const savedEntry = await newEntry.save();

    res.status(201).json({
      success: true,
      data: savedEntry,
      message: "Entry created successfully",
      uploadErrors: uploadErrors.length > 0 ? uploadErrors : null,
    });
  } catch (error) {
    console.error("Entry creation error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to create entry",
      uploadErrors: error.uploadErrors || [],
    });
  }
};
export const getAllEntries = async (req, res) => {
  try {
    const { query, user } = req;
    const { searchvalue, skip = 0, limit = 4 } = query;
    const { id: userId } = user;

    const queryObj = { userId };
    if (searchvalue) {
      queryObj.content = { $regex: searchvalue, $options: "i" };
    }

    const entries = await Entry.find(queryObj)
      .skip(parseInt(skip))
      .limit(parseInt(limit))
      .select("_id content tags createdAt aiContent isPinned files")
      .populate("tags", "name color bgColor borderColor")
      .sort({ isPinned: -1, createdAt: -1 });

    const totalCount = await Entry.countDocuments(queryObj);

    return res.status(200).json({
      success: true,
      data: entries,
      totalCount,
    });
  } catch (error) {
    console.error("Error in Fetch All Entries:", error.message);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};
export const getEntryById = async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  try {
    const entry = await Entry.findOne({ _id: id, userId }).populate(
      "tags",
      "name color"
    );

    if (!entry) {
      return res.status(404).json({
        success: false,
        message: "Entry not found or not authorized",
      });
    }

    res.status(200).json({
      success: true,
      data: entry,
    });
  } catch (error) {
    console.error("Error in Fetch Entry by Id:", error.message);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};
export const getEntriesByTag = async (req, res) => {
  const { tagname } = req.params;
  const userId = req.user.id;

  try {
    const tag = await Tag.findOne({
      name: tagname,
      userId,
    });

    if (!tag) {
      return res.status(404).json({
        success: false,
        message: "Tag not found",
      });
    }

    const entries = await Entry.find({
      tags: tag._id,
      userId,
    })
      .select("_id content tags createdAt aiContent")
      .populate("tags", "name color");

    res.status(200).json({
      success: true,
      data: entries,
    });
  } catch (error) {
    console.error("Error in Fetch Entries by Tag:", error.message);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};
export const getAIAdvice = async (req, res) => {
  const { content } = req.body;
  try {
    const result = await aiService.getAdvice(content);

    if (result.error) {
      return res.status(200).json({
        success: true,
        error: true,
        message: result.message,
      });
    }

    let cleanedText = result.text;

    cleanedText = cleanedText.replace(/^\s*<p>(.*)<\/p>\s*$/s, "$1");

    res.status(200).json({
      success: true,
      error: false,
      data: cleanedText,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const fixGrammar = async (req, res) => {
  const { content } = req.body;
  try {
    const result = await aiService.fixGrammar(content);

    if (result.error) {
      return res.status(200).json({
        success: true,
        error: true,
        message: result.message,
      });
    }

    res.status(200).json({
      success: true,
      error: false,
      data: result.text,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const uploadFiles = async (req, res) => {
  try {
    const files = req.files;

    if (!files || files.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No files provided",
      });
    }

    const uploadResults = await Promise.all(
      files.map(async (file) => {
        try {
          const result = await uploadFile(file.buffer, file.originalname);
          return result;
        } catch (err) {
          console.error(`Error uploading file ${file.originalname}:`, err);
          return null;
        }
      })
    );

    const successfulUploads = uploadResults.filter((result) => result !== null);

    if (successfulUploads.length === 0) {
      return res.status(500).json({
        success: false,
        message: "All file uploads failed",
      });
    }

    res.status(200).json({
      success: true,
      data: successfulUploads.map((file) => file.cdnUrl),
    });
  } catch (error) {
    console.error("File upload error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "File upload failed",
    });
  }
};
