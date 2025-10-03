import { Complaint } from "../models/societyM/complaint.models.js";

export const createComplaint = async (req, res) => {
    try {
        const { title, description, category, priority } = req.body;
        const complaint = new Complaint({
            userId: req.user.id,
            title,
            description,
            category,
            priority
        });
        await complaint.save();
        res.status(201).json(complaint);
    } catch (error) {
        res.status(500).json({ 
            message: 'Error creating complaint',
            error: error.message 
        });
    }
};

export const getAllComplaints = async (req, res) => {
    try {
        const { status, priority, category, page = 1, limit = 10 } = req.query;
        const filter = {};
        
        // If not admin, only show user's complaints
        if (!req.user.isAdmin) {
            filter.userId = req.user.id;
        }
        
        if (status) filter.status = status;
        if (priority) filter.priority = priority;
        if (category) filter.category = category;

        const complaints = await Complaint.find(filter)
            .populate('userId', 'username email Flat_no')
            .populate('assignedTo', 'username')
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(parseInt(limit));

        const total = await Complaint.countDocuments(filter);

        res.json({
            complaints,
            totalPages: Math.ceil(total / limit),
            currentPage: page,
            totalComplaints: total
        });
    } catch (error) {
        res.status(500).json({ 
            message: 'Error fetching complaints',
            error: error.message 
        });
    }
};

export const getComplaintById = async (req, res) => {
    try {
        const complaint = await Complaint.findById(req.params.id)
            .populate('userId', 'username email Flat_no')
            .populate('assignedTo', 'username')
            .populate('comments.user', 'username');

        if (!complaint) {
            return res.status(404).json({ message: 'Complaint not found' });
        }

        // Check if user has access to this complaint
        if (!req.user.isAdmin && complaint.userId.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Access denied' });
        }

        res.json(complaint);
    } catch (error) {
        res.status(500).json({ 
            message: 'Error fetching complaint',
            error: error.message 
        });
    }
};

export const updateComplaint = async (req, res) => {
    try {
        const { title, description, category, priority } = req.body;
        const complaint = await Complaint.findById(req.params.id);

        if (!complaint) {
            return res.status(404).json({ message: 'Complaint not found' });
        }

        // Check if user has access to update this complaint
        if (!req.user.isAdmin && complaint.userId.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Access denied' });
        }

        complaint.title = title || complaint.title;
        complaint.description = description || complaint.description;
        complaint.category = category || complaint.category;
        complaint.priority = priority || complaint.priority;
        complaint.updatedAt = new Date();

        await complaint.save();
        res.json(complaint);
    } catch (error) {
        res.status(500).json({ 
            message: 'Error updating complaint',
            error: error.message 
        });
    }
};

export const updateStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const complaint = await Complaint.findById(req.params.id);

        if (!complaint) {
            return res.status(404).json({ message: 'Complaint not found' });
        }

        // Only admin can update status
        if (!req.user.isAdmin) {
            return res.status(403).json({ message: 'Access denied' });
        }

        complaint.status = status;
        complaint.assignedTo = req.user.id;
        complaint.updatedAt = new Date();

        await complaint.save();
        res.json(complaint);
    } catch (error) {
        res.status(500).json({ 
            message: 'Error updating complaint status',
            error: error.message 
        });
    }
};

export const addComment = async (req, res) => {
    try {
        const { text } = req.body;
        const complaint = await Complaint.findById(req.params.id);

        if (!complaint) {
            return res.status(404).json({ message: 'Complaint not found' });
        }

        complaint.comments.push({
            user: req.user.id,
            text
        });

        await complaint.save();
        
        const updatedComplaint = await Complaint.findById(req.params.id)
            .populate('comments.user', 'username');

        res.json(updatedComplaint);
    } catch (error) {
        res.status(500).json({ 
            message: 'Error adding comment',
            error: error.message 
        });
    }
};

export const deleteComplaint = async (req, res) => {
    try {
        const complaint = await Complaint.findById(req.params.id);

        if (!complaint) {
            return res.status(404).json({ message: 'Complaint not found' });
        }

        // Only admin or complaint creator can delete
        if (!req.user.isAdmin && complaint.userId.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Access denied' });
        }

        await complaint.deleteOne();
        res.json({ message: 'Complaint deleted successfully' });
    } catch (error) {
        res.status(500).json({ 
            message: 'Error deleting complaint',
            error: error.message 
        });
    }
};
