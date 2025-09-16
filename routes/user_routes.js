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
  createTeam,
  getTeamsByTenure,
  getLeadsByTenure,
  createTask,
  getTasksByEventAndTeam,
} = require("../controllers/controller");

const authenticationMiddleware = require("../middleware/authentication");

/**
 * 🔑 Auth
 */
router.post("/auth/login", login);

/**
 * 🏢 Communities
 */
router.post("/communities",  createCommunity);
router.get("/communities",  getAllCommunities);

// Tenures by community
router.get("/communities/:communityId/tenures",  getTenuresByCommunity);

/**
 * 👥 Users / Roles
 */
router.get("/me",  getUserData);

router.post("/presidents",  createPresident);
router.post("/teamLeads",  createTeamLead);
router.post("/members",  createMember);

/**
 * ⏳ Tenures
 */
router.post("/tenures",  createTenure);
router.get("/tenures/:tenureId",  getTenureByID);

/**
 * 📅 Events
 */
router.post("/tenures/:tenureId/events",  createEvent);
router.get("/tenures/:tenureId/events",  getEventsByTenure);

/**
 * 🛠️ Teams
 */
router.post("/teams",  createTeam);
router.get("/tenures/:tenureId/teams",  getTeamsByTenure);
router.get("/tenures/:tenureId/teamLeads",  getLeadsByTenure);

/**
 * ✅ Tasks
 */
router.post("/tasks",  createTask);
router.get("/events/:eventId/tasks",  getTasksByEventAndTeam);

module.exports = router;
