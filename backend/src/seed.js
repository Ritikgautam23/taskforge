import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import User from "./models/User.js";
import Project from "./models/Project.js";
import Task from "./models/Task.js";
import { connectDB } from "./config/database.js";

const seedData = async () => {
  try {
    await connectDB();

    // Clear existing data
    await User.deleteMany();
    await Project.deleteMany();
    await Task.deleteMany();

    // Create users
    const users = await User.insertMany([
      {
        email: "alex@taskforge.dev",
        password: "password123",
        profile: { displayName: "Alex Rivera" },
      },
      {
        email: "sam@taskforge.dev",
        password: "password123",
        profile: { displayName: "Sam Chen" },
      },
      {
        email: "maya@taskforge.dev",
        password: "password123",
        profile: { displayName: "Maya Patel" },
      },
      {
        email: "jordan@taskforge.dev",
        password: "password123",
        profile: { displayName: "Jordan Kim" },
      },
    ]);

    const [alex, sam, maya, jordan] = users;

    // Create projects
    const projects = await Project.insertMany([
      {
        name: "Website Redesign",
        description: "Overhaul the marketing website with new branding",
        ownerId: alex._id,
        members: [
          { user: alex._id, role: "admin" },
          { user: sam._id, role: "member" },
          { user: maya._id, role: "member" },
        ],
      },
      {
        name: "Mobile App v2",
        description: "Build the next generation mobile experience",
        ownerId: sam._id,
        members: [
          { user: sam._id, role: "admin" },
          { user: jordan._id, role: "member" },
        ],
      },
    ]);

    const [websiteProj, mobileProj] = projects;

    // Create tasks
    await Task.insertMany([
      {
        projectId: websiteProj._id,
        title: "Design new homepage mockups",
        description: "Create 3 mockup variations",
        status: "done",
        assignee: sam._id,
        order: 0,
        createdBy: alex._id,
      },
      {
        projectId: websiteProj._id,
        title: "Implement responsive navigation",
        status: "in_progress",
        assignee: maya._id,
        order: 1,
        createdBy: alex._id,
      },
      {
        projectId: mobileProj._id,
        title: "Design offline-first architecture",
        status: "done",
        assignee: jordan._id,
        order: 0,
        createdBy: sam._id,
      },
    ]);

    console.log("✅ Database seeded successfully!");
    console.log("Demo users:");
    console.log("  - alex@taskforge.dev / password123");
    console.log("  - sam@taskforge.dev / password123");
    console.log("  - maya@taskforge.dev / password123");
    console.log("  - jordan@taskforge.dev / password123");

    process.exit(0);
  } catch (error) {
    console.error("❌ Seed failed:", error);
    process.exit(1);
  }
};

seedData();