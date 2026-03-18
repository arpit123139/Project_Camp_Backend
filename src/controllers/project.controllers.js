import ApiResponse from "../utils/api-response.js";
import ApiError from "../utils/api-error.js";
import asyncHandler from "../utils/async-handler.js";
import { Project } from "../models/project.models.js";
import User from "../models/user.models.js";
import { ProjectMember } from "../models/projectmember.models.js";
import mongoose, { Query } from "mongoose";
import crypto from "crypto";
import { AvailableUserRole, UserRolesEnum } from "../utils/constants.js";
import { pipeline } from "stream";

const createProject = asyncHandler(async (req, res) => {
  const { name, description } = req.body;

  const project = await Project.create({
    name,
    description,
    createdBy: new mongoose.Types.ObjectId(req.user._id),
  });

  await ProjectMember.create({
    user: new mongoose.Types.ObjectId(req.user._id),
    project: new mongoose.Types.ObjectId(project._id),
    role: UserRolesEnum.ADMIN,
  });

  return res
    .status(201)
    .json(new ApiResponse(201, project, "Project Created Successfully"));
});

// Only the user who have created the project can update it
const updateProject = asyncHandler(async (req, res) => {
  const { name, description } = req.body;
  const { projectId } = req.params;

  const project = await Project.findById(projectId);

  if (!project) throw new ApiError(404, "Project not found");

  project.name = name;
  project.description = description;

  await project.save();

  return res
    .status(200)
    .json(new ApiResponse(200, project, " Project Updated Successfully"));
});

// Only the user who have created the project can delete it
const deleteProject = asyncHandler(async (req, res) => {
  const { projectId } = req.params;

  const project = await Project.findById(projectId);

  if (!project) return new ApiError(404, "Project not found");

  await Project.findByIdAndDelete(projectId);

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Project Deleted Successfully "));
});

//pipeline:[How it works internally]
/* MongoDB finds matching documents from projects

 Before putting them into the Projects array, it runs the pipeline on those matched project documents

 That pipeline adds "ProjectMembers" to each project

 Finally, the enriched project documents are returned inside the Projects array
*/

const getProjects = asyncHandler(async (req, res) => {
  const result = await ProjectMember.aggregate([
    {
      $match: {
        user: new mongoose.Types.ObjectId(req.user._id),
      },
    },

    {
      $lookup: {
        from: "projects",
        localField: "project",
        foreignField: "_id",
        as: "Projects",
        pipeline: [
          {
            $lookup: {
              from: "projectmembers",
              localField: "_id",
              foreignField: "project",
              as: "ProjectMembers",
            },
          },
          {
            $addFields: {
              members: {
                $size: "$ProjectMembers",
              },
            },
          },
        ],
      },
    },

    {
      $unwind: "$Projects",
    },

    {
      $project: {
        Projects: {
          _id: 1,
          name: 1,
          description: 1,
          members: 1,
          createdBy: 1,
          ProjectMembers: 1,
        },
        role: 1,
        _id: 0,
      },
    },
  ]);

  return res
    .status(200)
    .json(new ApiResponse(200, result, "Projects Fetched Successfully"));
});

const getProjectById = asyncHandler(async (req, res) => {
  const { projectId } = req.params;
  const project = await Project.findById(projectId);

  if (!project) throw new ApiError(404, "Project Not Found");

  return res
    .status(200)
    .json(new ApiResponse(200, project, "Project Fetched Successfully"));
});

const addMembersToProject = asyncHandler(async (req, res) => {
  const { email, role } = req.body;
  const { projectId } = req.params;

  const user = await User.findOne({ email: email });

  if (!user) throw new ApiError(404, "User Does not exsist");

  //This Particular way with the upsert option is choosen to prevent Duplicate entry
  /*Case1: Suppose the user is already added as a member in the project and the role is only changing so intead of creating a new Document same Document will be updated
  Case2: It will try to find if the entry exsist if it does not it will create the new Document and insert 
  Case3: Suppose the user is already added as a member in the project and again we are trying to add it with all the same details then it will not create the new Document
  Case4: with the new flag as true it will return the updated Document
  */
  await ProjectMember.findOneAndUpdate(
    {
      user: new mongoose.Types.ObjectId(user._id),
      project: new mongoose.Types.ObjectId(projectId),
    },
    {
      user: new mongoose.Types.ObjectId(user._id),
      project: new mongoose.Types.ObjectId(projectId),
      role: role,
    },
    {
      new: true,
      upsert: true,
    },
  );

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Project Member Added Successfully"));
});
const getProjectMembers = asyncHandler(async (req, res) => {
  const { projectId } = req.params;

  const project = await Project.findById(projectId);
  if (!project) throw new ApiError(404, "Project Not found");

  const result = await ProjectMember.aggregate([
    {
      $match: {
        project: new mongoose.Types.ObjectId(projectId),
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "user",
        foreignField: "_id",
        as: "ProjectMembers",
      },
    },
    {
      $unwind: "$ProjectMembers",
    },
    {
      $project: {
        ProjectMembers: {
          username: 1,
          email: 1,
        },
        role: 1,
      },
    },
  ]);

  return res
    .status(200)
    .json(new ApiResponse(200, result, "Project Members Fetched"));
});
const updateMemberRole = asyncHandler(async (req, res) => {
  const { projectId, userId } = req.params;
  const { newRole } = req.body;

  if (!AvailableUserRole.includes(newRole))
    throw new ApiError(400, "Invalid Role");

  let projectMember = await ProjectMember.findOne({
    project: new mongoose.Types.ObjectId(projectId),
    user: new mongoose.Types.ObjectId(userId),
  });

  if (!projectMember) throw new ApiError(404, "Project Member not found");

  projectMember.role = newRole;

  await projectMember.save();

  return res
    .status(200)
    .json(200, projectMember, "Project Member role Updated Successfully");
});
const deleteMember = asyncHandler(async (req, res) => {
  const { projectId, userId } = req.params;

  let projectMember = await ProjectMember.findOne({
    project: new mongoose.Types.ObjectId(projectId),
    user: new mongoose.Types.ObjectId(userId),
  });

  if (!projectMember) throw new ApiError(404, "Project Member not found");

  await ProjectMember.findByIdAndDelete(projectMember._id);

  return res
    .status(200)
    .json(200, projectMember, "Project Member Deleted  Updated Successfully");
});

export {
  getProjects,
  getProjectById,
  createProject,
  updateProject,
  addMembersToProject,
  getProjectMembers,
  updateMemberRole,
  deleteMember,
  deleteProject,
};
