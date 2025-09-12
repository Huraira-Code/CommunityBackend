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
} = require("../controllers/controller");

const authenticationMiddleware = require("../middleware/authentication");

// Public route
router.post("/login", login);

// Protected + Role-based routes
router.post(
  "/createCommunity",
  authenticationMiddleware("admin"),
  createCommunity
);

router.post(
  "/createPresident",
  authenticationMiddleware("supervisor"),
  createPresident
);

router.post(
  "/createTeamLead",
  authenticationMiddleware("president"),
  createTeamLead
);

router.post(
  "/createMember",
  authenticationMiddleware("teamLead"),
  createMember
);

router.post(
  "/createTenure",
  authenticationMiddleware("supervisor"),
  createTenure
);

// Anyone authenticated can view communities
router.get(
  "/getAllCommunities",
  authenticationMiddleware("admin"),
  getAllCommunities
);

// Get user data (any authenticated role)
router.post(
  "/getUserData",

  getUserData
);

// Tenures by community (any authenticated role)
router.get(
  "/communities/:communityId/tenures",
  authenticationMiddleware("supervisor"),
  getTenuresByCommunity
);

module.exports = router;
