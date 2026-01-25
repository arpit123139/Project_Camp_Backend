import ApiResponse from "../utils/api-response.js";
import ApiError from "../utils/api-error.js";
import asyncHandler from "../utils/async-handler.js";
import { Project } from "../models/project.models.js";
import ProjectMember from "../models/projectmember.models.js";
import { Query } from "mongoose";
import crypto from "crypto";

const getProjects = asyncHandler(async (req, res) => {
  //tese
});

const getProjectById = asyncHandler(async (req, res) => {
  //tese
});

const createProject = asyncHandler(async (req, res) => {
  //tese
});

const updateProject = asyncHandler(async (req, res) => {
  //tese
});
const addMembersToProject = asyncHandler(async (req, res) => {
  //tese
});
const getProjectMembers = asyncHandler(async (req, res) => {
  //tese
});
const updateMemberRole = asyncHandler(async (req, res) => {
  //tese
});
const deleteMember = asyncHandler(async (req, res) => {
  //tese
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
};
