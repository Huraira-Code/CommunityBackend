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
router.get("/tenures/:tenureId/events", getEventsByTenure);

// Teams
router.post("/createTeam", createTeam);
router.get("/tenures/:tenureId/teams", getTeamsByTenure);
router.get("/tenures/:tenureId/teamLeads", getLeadsByTenure);

module.exports = router;
