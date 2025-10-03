import { Notice } from "../models/societyM/notices.models.js";

export const createNotice = async (req, res, next) => {
  try {
    const { title, content, expiryDate, priority } = req.body;

    const notice = new Notice({
      title,
      content,
      createdBy: req.user.id,
      expiryDate,
      priority,
    });

    // Handle file upload
    if (req.file) {
      notice.attachment = {
        filename: req.file.originalname,
        path: req.file.path || req.file.location, // handles both local and Cloudinary URLs
        mimetype: req.file.mimetype,
      };
    }

    await notice.save();
    res.status(201).json({
      success: true,
      message: "Notice created successfully",
      notice,
    });
  } catch (error) {
    next(error);
  }
};

export const getNotices = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, priority, search } = req.query;

    const query = {};

    if (priority) {
      query.priority = priority;
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { content: { $regex: search, $options: "i" } },
      ];
    }

    const notices = await Notice.find(query)
      .sort({ createdAt: -1 })
      .populate("createdBy", "username Flat_no")
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Notice.countDocuments(query);

    res.status(200).json({
      success: true,
      notices,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total,
    });
  } catch (error) {
    next(error);
  }
};

export const getNoticeById = async (req, res, next) => {
  try {
    const notice = await Notice.findById(req.params.id).populate(
      "createdBy",
      "username Flat_no"
    );

    if (!notice) {
      const error = new Error("Notice not found");
      error.statusCode = 404;
      throw error;
    }

    res.status(200).json({
      success: true,
      notice,
    });
  } catch (error) {
    next(error);
  }
};

export const updateNotice = async (req, res, next) => {
  try {
    const { title, content, expiryDate, priority } = req.body;

    const notice = await Notice.findById(req.params.id);

    if (!notice) {
      const error = new Error("Notice not found");
      error.statusCode = 404;
      throw error;
    }

    // Check authorization
    if (notice.createdBy.toString() !== req.user.id && !req.user.isAdmin) {
      const error = new Error("Not authorized to update this notice");
      error.statusCode = 403;
      throw error;
    }

    notice.title = title || notice.title;
    notice.content = content || notice.content;
    notice.expiryDate = expiryDate || notice.expiryDate;
    notice.priority = priority || notice.priority;

    // Handle new file upload if provided
    if (req.file) {
      notice.attachment = {
        filename: req.file.originalname,
        path: req.file.path || req.file.location,
        mimetype: req.file.mimetype,
      };
    }

    await notice.save();

    res.status(200).json({
      success: true,
      message: "Notice updated successfully",
      notice,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteNotice = async (req, res, next) => {
  try {
    const notice = await Notice.findById(req.params.id);

    if (!notice) {
      const error = new Error("Notice not found");
      error.statusCode = 404;
      throw error;
    }

    // Check authorization
    if (notice.createdBy.toString() !== req.user.id && !req.user.isAdmin) {
      const error = new Error("Not authorized to delete this notice");
      error.statusCode = 403;
      throw error;
    }

    await notice.deleteOne();

    res.status(200).json({
      success: true,
      message: "Notice deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};
