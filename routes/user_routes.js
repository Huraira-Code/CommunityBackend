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
router.post(
  "/getUserData",

  getUserData
);

// Tenures by community (any authenticated role)
router.get("/communities/:communityId/tenures", getTenuresByCommunity);
router.get("/communities/:tenureId/tenuresById", getTenureByID);

module.exports = router;
