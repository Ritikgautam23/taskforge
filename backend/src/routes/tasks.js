import express from "express";
import { body, validationResult } from "express-validator";
import Task from "../models/Task.js";
import Project from "../models/Project.js";
import User from "../models/User.js";
import { authMiddleware } from "../middleware/auth.js";

const router = express.Router();

// GET /api/tasks - List all tasks (with filters)
router.get("/", authMiddleware, async (req, res, next) => {
  try {
    const { projectId, status, assigneeId, search } = req.query;

    const filter = {};

    // User can only see tasks from projects they're members of
    const userProjects = await Project.find({
      "members.user": req.user._id,
    }).select("_id");

    const projectIds = userProjects.map((p) => p._id);
    filter.projectId = { $in: projectIds };

    if (projectId) {
      filter.projectId = projectId;
    }

    if (status) {
      filter.status = status;
    }

    if (assigneeId) {
      filter.assignee = assigneeId;
    }

    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    const tasks = await Task.find(filter)
      .populate("assignee", "profile")
      .populate("createdBy", "profile")
      .sort({ projectId: 1, status: 1, order: 1 });

    res.json(tasks);
  } catch (error) {
    next(error);
  }
});

// GET /api/tasks/stats - Get task statistics
router.get("/stats", authMiddleware, async (req, res, next) => {
  try {
    const { projectId } = req.query;

    const filter = {};

    // Filter by accessible projects
    const userProjects = await Project.find({
      "members.user": req.user._id,
    }).select("_id");

    const projectIds = userProjects.map((p) => p._id);
    filter.projectId = { $in: projectIds };

    if (projectId) {
      filter.projectId = projectId;
    }

    const tasks = await Task.find(filter);

    const now = new Date();
    const overdue = tasks.filter(
      (t) => t.dueDate && new Date(t.dueDate) < now && t.status !== "done"
    ).length;

    res.json({
      total: tasks.length,
      todo: tasks.filter((t) => t.status === "todo").length,
      inProgress: tasks.filter((t) => t.status === "in_progress").length,
      done: tasks.filter((t) => t.status === "done").length,
      overdue,
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/tasks/:id - Get single task
router.get("/:id", authMiddleware, async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate("assignee", "profile")
      .populate("createdBy", "profile");

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    // Check if user has access to the project
    const project = await Project.findById(task.projectId);
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    const isMember = project.members.some(
      (m) => m.user.toString() === req.user._id.toString()
    );

    if (!isMember) {
      return res.status(403).json({ message: "Not authorized" });
    }

    res.json(task);
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(404).json({ message: "Task not found" });
    }
    next(error);
  }
});

// POST /api/tasks - Create new task
router.post(
  "/",
  authMiddleware,
  [
    body("projectId").isMongoId(),
    body("title").trim().isLength({ min: 1, max: 200 }),
    body("description").optional().trim().isLength({ max: 2000 }),
    body("status").optional().isIn(["todo", "in_progress", "done"]),
    body("dueDate").optional().isISO8601(),
    body("assigneeId").optional().isMongoId(),
  ],
  async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: "Validation error", errors: errors.array() });
    }

    try {
      const { projectId, title, description, status, dueDate, assigneeId } = req.body;

      // Verify project exists and user is a member
      const project = await Project.findById(projectId);
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }

      const isMember = project.members.some(
        (m) => m.user.toString() === req.user._id.toString()
      );

      if (!isMember) {
        return res.status(403).json({ message: "Not authorized to create tasks in this project" });
      }

      // Calculate order
      const maxOrder = await Task.findOne({
        projectId,
        status: status || "todo",
      })
      .sort({ order: -1 })
      .select("order");

      const newOrder = maxOrder ? maxOrder.order + 1 : 0;

      let assignee = null;
      if (assigneeId) {
        const assigneeUser = await User.findById(assigneeId);
        if (!assigneeUser) {
          return res.status(404).json({ message: "Assignee not found" });
        }
        assignee = assigneeUser._id;
      }

      const task = new Task({
        projectId,
        title,
        description: description || "",
        status: status || "todo",
        assignee,
        dueDate: dueDate || null,
        order: newOrder,
        createdBy: req.user._id,
      });

      await task.save();
      await task.populate("assignee", "profile");
      await task.populate("createdBy", "profile");

      res.status(201).json(task);
    } catch (error) {
      next(error);
    }
  }
);

// PATCH /api/tasks/:id - Update task
router.patch("/:id", authMiddleware, async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    // Verify project access
    const project = await Project.findById(task.projectId);
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    const isMember = project.members.some(
      (m) => m.user.toString() === req.user._id.toString()
    );

    if (!isMember) {
      return res.status(403).json({ message: "Not authorized" });
    }

    // Update fields
    const { title, description, status, dueDate, assigneeId } = req.body;

    if (title !== undefined) task.title = title;
    if (description !== undefined) task.description = description;
    if (status !== undefined) task.status = status;
    if (dueDate !== undefined) task.dueDate = dueDate;

    if (assigneeId !== undefined) {
      if (assigneeId) {
        const assignee = await User.findById(assigneeId);
        if (!assignee) {
          return res.status(404).json({ message: "Assignee not found" });
        }
        task.assignee = assignee._id;
      } else {
        task.assignee = null;
      }
    }

    // Handle reordering if status changed
    if (status && status !== task.status) {
      // Find max order for new status column
      const maxInTarget = await Task.findOne({
        projectId: task.projectId,
        status,
      }).sort({ order: -1 });

      task.order = maxInTarget ? maxInTarget.order + 1 : 0;
    }

    await task.save();
    await task.populate("assignee", "profile");
    await task.populate("createdBy", "profile");

    res.json(task);
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(404).json({ message: "Task not found" });
    }
    next(error);
  }
});

// DELETE /api/tasks/:id - Delete task
router.delete("/:id", authMiddleware, async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    // Verify project access
    const project = await Project.findById(task.projectId);
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    const isMember = project.members.some(
      (m) => m.user.toString() === req.user._id.toString()
    );

    if (!isMember) {
      return res.status(403).json({ message: "Not authorized" });
    }

    await Task.findByIdAndDelete(req.params.id);
    res.status(204).send();
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(404).json({ message: "Task not found" });
    }
    next(error);
  }
});

export default router;