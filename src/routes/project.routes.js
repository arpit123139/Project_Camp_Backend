import { Router } from "express";
import {
  validateProjectPermission,
  verifyJwt,
} from "../middlewared/auth.middleware.js";
import {
  addMembersToProject,
  createProject,
  deleteMember,
  deleteProject,
  getProjectById,
  getProjectMembers,
  getProjects,
  updateMemberRole,
  updateProject,
} from "../controllers/project.controllers.js";
import { AvailableUserRole, UserRolesEnum } from "../utils/constants.js";

const router = Router();
router.use(verifyJwt);

router.route("/").get(getProjects).post(createProject);

router
  .route("/:projectId")
  .get(validateProjectPermission(AvailableUserRole), getProjectById)
  .put(validateProjectPermission([UserRolesEnum.ADMIN]), updateProject)
  .delete(validateProjectPermission([UserRolesEnum.ADMIN]), deleteProject);

router
  .route("/:projectId/members/")
  .get(getProjectMembers)
  .post(validateProjectPermission([UserRolesEnum.ADMIN]), addMembersToProject);

router
  .route("/:projectId/members/:userId")
  .put(validateProjectPermission([UserRolesEnum.ADMIN]), updateMemberRole)
  .delete(validateProjectPermission([UserRolesEnum.ADMIN]), deleteMember);

export default router;
