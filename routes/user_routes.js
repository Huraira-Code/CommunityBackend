const express = require("express");
const router = express.Router();
const {
  login,
  createCommunity,
  createTeamLead,
  createMember,
  createPresident,
  createTenure,
  getAllCommunities,
  getTenuresByCommunity,
  getUserData,
  getTenureByID,
  createEvent,
  getEventsByTenure,
  createTask,
  createTeam,
  getTeamsByTenure,
  getLeadsByTenure,
  getTasksByEventAndTeam,
  getMembersByLead,
  deleteCommunity,
  editCommunity,
  getTasks,
  assignTaskToLead,
  assignTaskToMember,
  deleteTask,
} = require("../controllers/controller");

const authenticationMiddleware = require("../middleware/authentication");

// Public route
router.post("/login", login);

// Protected + Role-based routes
router.post("/createCommunity", createCommunity);
router.post("/createPresident", createPresident);
router.post("/createTeamLead", createTeamLead);
router.post("/createMember", createMember);
router.post("/createTenure", createTenure);

// Anyone authenticated can view communities
router.get("/getAllCommunities", getAllCommunities);

// Get user data (any authenticated role)
router.post("/getUserData", getUserData);

// Tasks
router.post("/createTask", createTask);
router.get("/events/:eventId/tasks", getTasksByEventAndTeam);

// Tenures by community (any authenticated role)
router.get("/communities/:communityId/tenures", getTenuresByCommunity);
router.get("/communities/:tenureId/tenuresById", getTenureByID);

// Events
router.post("/createEvent", createEvent);
router.get("/members/lead/:leadId", getMembersByLead);

// Teams
router.post("/createTeam", createTeam);
router.get("/tenures/:tenureId/teams", getTeamsByTenure);
router.get("/tenures/:tenureId/teamLeads", getLeadsByTenure);
router.get("/tenures/:tenureId/events", getEventsByTenure);
router.delete("/communities/:communityId", deleteCommunity);
router.put("/communities/:communityId", editCommunity);
router.post("/tasks", createTask);  // Supervisor creates a task
router.post("/gettasks", getTasks);     // Role-based task fetching
router.delete("/tasks/:taskId", deleteTask);

// Assignments
router.post("/tasks/:taskId/assign/lead/:leadId", assignTaskToLead);       // President → Team Lead
router.post("/tasks/:taskId/assign/member/:memberId", assignTaskToMember); // Team Lead → Member


module.exports = router;
