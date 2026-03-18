import ApiResponse from "../utils/api-response.js";
import ApiError from "../utils/api-error.js";
import asyncHandler from "../utils/async-handler.js";
import { Project } from "../models/project.models.js";
import { Tasks } from "../models/task.models.js";
import { SubTask } from "../models/subtask.models.js";
import { ProjectMember } from "../models/projectmember.models.js";
import mongoose, { Query } from "mongoose";
import crypto from "crypto";
import { AvailableUserRole, UserRolesEnum } from "../utils/constants.js";
import User from "../models/user.models.js";

const createTask = asyncHandler(async (req, res) => {
  const { title, description, assignedTo, status } = req.body;
  const { projectId } = req.params;

  const project = await Project.findById(projectId);
  if (!project)
    throw new ApiError(404, "Required Project not found to attach a Task");

  const files = req.files || [];

  const attachments = files.map((file) => {
    return {
      url: `${process.env.SERVER_URL}/images/${file.originalname}`,
      mimetype: file.mimetype,
      size: file.size,
    };
  });

  const user = await User.findOne({ email: assignedTo });
  if (!user) throw new ApiError(404, "User not found");

  const task = await Tasks.create({
    title,
    description,
    assignedTo: new mongoose.Types.ObjectId(user._id),
    attachments,
    assignedBy: new mongoose.Types.ObjectId(req.user._id),
  });

  return res
    .status(200)
    .json(new ApiResponse(200, task, "Task Created Successfully"));
});

const getTask = asyncHandler(async (req, res) => {
  const { projectId } = req.params;
  const project = await Project.findById(projectId);
  if (!project) throw new ApiError(404, "Project Not Found");

  const task = await Tasks.find({
    project: new mongoose.Types.ObjectId(projectId),
  }).populate("assignedTo", "name username email");

  return res
    .status(200)
    .json(new ApiResponse(200, task, "Task Fetched for a particular Project"));
});

const getTaskById = asyncHandler(async (req, res) => {
  const { taskId } = req.params;

  const task = await Tasks.aggregate([
    {
      $match: {
        _id: new mongoose.Types.ObjectId(taskId),
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "assignedTo",
        foreignField: "_id",
        as: "assignedTo",
        pipeline: [
          {
            $project: {
              _id: 1,
              username: 1,
              fullName: 1,
              avatar: 1,
            },
          },
        ],
      },
    },
    {
      $lookup: {
        from: "subtasks",
        localField: "_id",
        foreignField: "task",
        as: "subtasks",
        pipeline: [
          {
            $lookup: {
              from: "users",
              localField: "createdBy",
              foreignField: "_id",
              as: "createdBy",
              pipeline: [
                {
                  $project: {
                    _id: 1,
                    username: 1,
                    fullName: 1,
                    avatar: 1,
                  },
                },
              ],
            },
          },
          {
            $addFields: {
              createdBy: {
                $arrayElemAt: ["$createdBy", 0],
              },
            },
          },
        ],
      },
    },
    {
      $addFields: {
        assignedTo: {
          $arrayElemAt: ["$assignedTo", 0],
        },
      },
    },
  ]);

  if (!task || task.length === 0) {
    throw new ApiError(404, "Task not found");
  }
  return res
    .status(200)
    .json(new ApiResponse(200, task[0], "Task fetched successfully"));
});

const updateTask = asyncHandler(async (req, res) => {
  const { title, description, assignedTo } = req.body;
  const { taskId } = req.params;

  const task = Tasks.findById(taskId);
  if (!task) throw new ApiError(404, "Task Not Found");

  if (assignedTo) {
    const user = await User.findOne({ email: assignedTo });
    if (!user)
      throw new ApiError(
        404,
        "User not found to whom you have to assigned the Task",
      );
    task.assignedTo = user._id;
  }
  if (title) task.title = title;
  if (description) task.description = description;

  await task.save();

  return res
    .status(200)
    .json(new ApiResponse(200, task, "Task Updated Successfully"));
});

const deleteTask = asyncHandler(async (req, res) => {
  const { taskId } = req.params;

  //Delete the Task
  const taskDeleted = await Tasks.findByIdAndDelete(taskId);
  if (!taskDeleted) throw new ApiError(404, "Task Not Found");

  //Delete all the subtask associated with the above task
  const subTaskDeleted = await SubTask.deleteMany({
    task: new mongoose.Types.ObjectId(taskId),
  });
  if (!subTaskDeleted.acknowledged)
    throw new ApiError(
      404,
      "Error in deleting the subtask associated with the Tsk",
    );

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        {},
        "Task and Subtask associated with the Task Deleted Successfully",
      ),
    );
});

const createSubTask = asyncHandler(async (req, res) => {});
const updateSubTask = asyncHandler(async (req, res) => {});
const deleteSubTask = asyncHandler(async (req, res) => {});

export {
  getTask,
  createTask,
  getTaskById,
  updateTask,
  deleteTask,
  createSubTask,
  updateSubTask,
  deleteSubTask,
};
