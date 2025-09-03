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
  getTenuresByCommunity
} = require("../controllers/controller");

router.post("/login", login);
router.post("/createCommunity", createCommunity);
router.post("/createTeamLead", createTeamLead);
router.post("/createMember", createMember);
router.post("/createPresident", createPresident);
router.post("/createTenure", createTenure);
router.get("/getAllCommunities", getAllCommunities);
router.post("/createTenure", createTenure);
router.get("/communities/:communityId/tenures", getTenuresByCommunity);


module.exports = router;
