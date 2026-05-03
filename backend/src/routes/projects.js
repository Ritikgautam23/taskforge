import express from "express";
import { body, validationResult } from "express-validator";
import Project from "../models/Project.js";
import User from "../models/User.js";
import { authMiddleware } from "../middleware/auth.js";

const router = express.Router();

// GET /api/projects - List all projects for current user
router.get("/", authMiddleware, async (req, res, next) => {
  try {
    const projects = await Project.find({
      "members.user": req.user._id,
    })
    .populate("ownerId", "profile")
    .populate("members.user", "profile")
    .sort({ updatedAt: -1 });

    res.json(projects);
  } catch (error) {
    next(error);
  }
});

// GET /api/projects/:id - Get single project
router.get("/:id", authMiddleware, async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate("ownerId", "profile")
      .populate("members.user", "profile");

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    // Check if user is a member
    const isMember = project.members.some(
      (m) => m.user._id.toString() === req.user._id.toString()
    );

    if (!isMember) {
      return res.status(403).json({ message: "Not authorized" });
    }

    res.json(project);
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(404).json({ message: "Project not found" });
    }
    next(error);
  }
});

// POST /api/projects - Create new project
router.post(
  "/",
  authMiddleware,
  [
    body("name").trim().isLength({ min: 1, max: 200 }),
    body("description").optional().trim().isLength({ max: 1000 }),
  ],
  async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: "Validation error", errors: errors.array() });
    }

    try {
      const { name, description } = req.body;

      const project = new Project({
        name,
        description: description || "",
        ownerId: req.user._id,
        members: [
          {
            user: req.user._id,
            role: "admin",
          },
        ],
      });

      await project.save();
      await project.populate("ownerId", "profile");
      await project.populate("members.user", "profile");

      res.status(201).json(project);
    } catch (error) {
      next(error);
    }
  }
);

// PATCH /api/projects/:id - Update project
router.patch("/:id", authMiddleware, async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    // Check ownership
    if (project.ownerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Only owner can update project" });
    }

    const { name, description } = req.body;
    if (name !== undefined) project.name = name;
    if (description !== undefined) project.description = description;

    await project.save();
    await project.populate("ownerId", "profile");
    await project.populate("members.user", "profile");

    res.json(project);
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(404).json({ message: "Project not found" });
    }
    next(error);
  }
});

// DELETE /api/projects/:id - Delete project
router.delete("/:id", authMiddleware, async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    // Check ownership
    if (project.ownerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Only owner can delete project" });
    }

    await Project.findByIdAndDelete(req.params.id);
    res.status(204).send();
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(404).json({ message: "Project not found" });
    }
    next(error);
  }
});

// POST /api/projects/:id/members - Add member to project
router.post("/:id/members", authMiddleware, async (req, res, next) => {
  try {
    const { userId, role } = req.body;

    if (!userId || !role) {
      return res.status(400).json({ message: "userId and role are required" });
    }

    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    // Check if user is admin
    const userMembership = project.members.find(
      (m) => m.user.toString() === req.user._id.toString()
    );

    if (!userMembership || userMembership.role !== "admin") {
      return res.status(403).json({ message: "Only admins can add members" });
    }

    // Check if user exists
    const userToAdd = await User.findById(userId);
    if (!userToAdd) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if already a member
    const alreadyMember = project.members.some(
      (m) => m.user.toString() === userId
    );

    if (alreadyMember) {
      return res.status(400).json({ message: "User is already a member" });
    }

    project.members.push({
      user: userId,
      role: role === "admin" ? "admin" : "member",
    });

    await project.save();
    await project.populate("members.user", "profile");

    res.json(project);
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(404).json({ message: "Project not found" });
    }
    next(error);
  }
});

// DELETE /api/projects/:id/members/:userId - Remove member from project
router.delete("/:id/members/:userId", authMiddleware, async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    // Check if user is admin or removing themselves
    const userMembership = project.members.find(
      (m) => m.user.toString() === req.user._id.toString()
    );

    if (!userMembership) {
      return res.status(403).json({ message: "Not a member of this project" });
    }

    const isRemovingSelf = req.params.userId === req.user._id.toString();
    const isAdmin = userMembership.role === "admin";

    if (!isAdmin && !isRemovingSelf) {
      return res.status(403).json({ message: "Only admins can remove members" });
    }

    project.members = project.members.filter(
      (m) => m.user.toString() !== req.params.userId
    );

    await project.save();
    await project.populate("members.user", "profile");

    res.json(project);
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(404).json({ message: "Project not found" });
    }
    next(error);
  }
});

export default router;