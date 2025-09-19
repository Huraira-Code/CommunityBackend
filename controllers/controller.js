const User = require("../models/User");
const jwt = require("jsonwebtoken");
const Community = require("../models/Community");
const Tenure = require("../models/Tenure");
const Event = require("../models/Event");
const Team = require("../models/Team");
// POST /api/auth/login
const login = async (req, res) => {
  try {
    const { email, password, role } = req.body;

    if (!email || !password || !role) {
      return res
        .status(400)
        .json({ message: "Email, password, and role are required" });
    }

    // Find user with email, password, and role
    const user = await User.findOne({ email, password, role });
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Create JWT token
    const token = jwt.sign(
      {
        userId: user._id,
        role: user.role,
        communityId: user.communityId,
        tenureId: user.tenureId,
      },
      process.env.JWT_SECRET, // ✅ secret must be provided
      { expiresIn: "7d" }
    );

    res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        communityId: user.communityId,
        tenureId: user.tenureId,
        teamLeadId: user.teamLeadId || null,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

const createCommunity = async (req, res) => {
  try {
    const {
      communityName,
      supervisorName,
      supervisorEmail,
      supervisorPassword,
    } = req.body;

    if (!communityName || !supervisorEmail || !supervisorPassword) {
      return res.status(400).json({ message: "Required fields missing" });
    }

    // Create Supervisor user
    const supervisor = new User({
      name: supervisorName,
      email: supervisorEmail,
      password: supervisorPassword,
      role: "supervisor",
    });
    await supervisor.save();

    // Create Community with supervisorId
    const community = new Community({
      name: communityName,
      supervisorId: supervisor._id,
    });
    await community.save();

    res.status(201).json({
      message: "Community and Supervisor created",
      community,
      supervisor,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

const createTenure = async (req, res) => {
  try {
    const { tenureName, communityId } = req.body;

    if (!tenureName || !communityId) {
      return res.status(400).json({ message: "Required fields missing" });
    }

    const tenure = new Tenure({
      name: tenureName,
      communityId: communityId,
    });
    await tenure.save();

    res.status(201).json({ message: "Tenure created", tenure });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};
const createPresident = async (req, res) => {
  try {
    const { name, email, password, tenureId, communityId } = req.body;

    // Validate required fields
    if (!name || !email || !password || !tenureId) {
      return res.status(400).json({ message: "Required fields missing" });
    }

    // Check if Tenure exists
    const tenure = await Tenure.findById(tenureId);
    if (!tenure) {
      return res.status(404).json({ message: "Tenure not found" });
    }

    // Create President user
    const president = new User({
      name,
      email,
      password, // ✅ no bcrypt used currently
      role: "president",
      tenureId,
      communityId,
    });

    await president.save();

    // Update Tenure with presidentId
    tenure.presidentId = president._id;
    await tenure.save();

    res.status(201).json({ message: "President created", president, tenure });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

const createTeamLead = async (req, res) => {
  try {
    const { name, email, password, tenureId, communityId } = req.body;

    if (!name || !email || !password || !tenureId) {
      return res.status(400).json({ message: "Required fields missing" });
    }

    const teamLead = new User({
      name,
      email,
      password,
      role: "teamLead",
      tenureId,
      communityId,
    });
    await teamLead.save();

    res.status(201).json({ message: "Team Lead created", teamLead });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

const getUserData = async (req, res) => {
  try {
    console.log("abc");

    // Get token from headers
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res
        .status(401)
        .json({ message: "Authorization token missing or invalid" });
    }

    const token = authHeader.split(" ")[1];
    console.log(token);

    // Verify token
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      return res.status(401).json({ message: "Invalid or expired token" });
    }

    console.log(decoded);

    // Find user by decoded ID
    const user = await User.findById(decoded.userId)
      .populate("tenureId")
      .populate("communityId");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    console.log(user);

    // Find community where this user is the supervisor
    const community = await Community.findOne({
      supervisorId: user._id,
    }).select("name _id");
    console.log(community);

    // Send user data
    res.status(200).json({
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      communityId: user.communityId,
      community: community || null, // null if no community found
      tenureId: user.tenureId,
      teamLeadId: user.teamLeadId || null,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

const getAllCommunities = async (req, res) => {
  try {
    const communities = await Community.find().populate(
      "supervisorId",
      "name email role password"
    );
    res.status(200).json({ communities });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// GET /api/communities/:communityId/tenures
const getTenuresByCommunity = async (req, res) => {
  try {
    const { communityId } = req.params;

    if (!communityId) {
      return res.status(400).json({ message: "Community ID is required" });
    }

    const tenures = await Tenure.find({ communityId: communityId }).populate(
      "name"
    );

    if (!tenures || tenures.length === 0) {
      return res
        .status(404)
        .json({ message: "No tenures found for this community" });
    }

    res.status(200).json({ tenures });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

const createMember = async (req, res) => {
  try {
    const { name, email, password, leadId, tenureId ,communityId} = req.body;

    // Validate required fields
    if (!name || !email || !password || !leadId || !tenureId , communityId) {
      return res.status(400).json({ message: "Required fields missing" });
    }

    // Find the team by leadId
    const team = await Team.findOne({ leadId, tenureId });
    if (!team) {
      return res.status(404).json({ message: "Team with this lead not found" });
    }

    // Create member and assign to team
    const member = new User({
      name,
      email,
      password,
      leadId,
      role: "member",
      teamId: team._id,
      tenureId,
      communityId
    });

    await member.save();

    // Add member to team's members array
    team.members.push(member._id);
    await team.save();

    res.status(201).json({ message: "Member created", member });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

const editCommunity = async (req, res) => {
  try {
    const { communityId } = req.params;
    const {
      communityName,
      supervisorName,
      supervisorEmail,
      supervisorPassword,
    } = req.body;

    if (!communityId) {
      return res.status(400).json({ message: "Community ID is required" });
    }

    // Find the community
    const community = await Community.findById(communityId);
    if (!community) {
      return res.status(404).json({ message: "Community not found" });
    }

    // Update community name if provided
    if (communityName) {
      community.name = communityName;
    }

    // If supervisor details are being updated
    if (supervisorName || supervisorEmail || supervisorPassword) {
      if (!community.supervisorId) {
        return res
          .status(400)
          .json({ message: "This community has no supervisor assigned" });
      }

      const supervisor = await User.findById(community.supervisorId);
      if (!supervisor) {
        return res.status(404).json({ message: "Supervisor not found" });
      }

      if (supervisorName) supervisor.name = supervisorName;
      if (supervisorEmail) supervisor.email = supervisorEmail;
      if (supervisorPassword) supervisor.password = supervisorPassword; // 🔑 no bcrypt yet

      await supervisor.save();
    }

    await community.save();

    res.status(200).json({
      message: "Community updated successfully",
      community,
    });
  } catch (err) {
    console.error("Error editing community:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

const getMembersByLead = async (req, res) => {
  try {
    const { leadId } = req.params;

    if (!leadId) {
      return res.status(400).json({ message: "leadId is required" });
    }

    // Fetch all members where leadId matches
    const members = await User.find({ leadId, role: "member" }).select(
      "name email teamId"
    );

    if (!members.length) {
      return res
        .status(404)
        .json({ message: "No members found for this lead" });
    }

    res.status(200).json({ members });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

const getTenureByID = async (req, res) => {
  try {
    const { tenureId } = req.params;

    if (!tenureId) {
      return res.status(400).json({ message: "Tenure ID is required" });
    }

    const tenure = await Tenure.findById(tenureId);

    if (!tenure) {
      return res.status(404).json({ message: "Tenure not found" });
    }

    res.status(200).json({ tenure });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

const deleteCommunity = async (req, res) => {
  try {
    const { communityId } = req.params;

    if (!communityId) {
      return res.status(400).json({ message: "Community ID is required" });
    }

    // Check if community exists
    const community = await Community.findById(communityId);
    if (!community) {
      return res.status(404).json({ message: "Community not found" });
    }

    // (Optional) Delete related tenures
    await Tenure.deleteMany({ communityId });

    // (Optional) Delete related teams
    await Team.deleteMany({ communityId });

    // (Optional) Delete supervisor user
    if (community.supervisorId) {
      await User.findByIdAndDelete(community.supervisorId);
    }

    // Finally, delete community itself
    await Community.findByIdAndDelete(communityId);

    res
      .status(200)
      .json({ message: "Community and related data deleted successfully" });
  } catch (error) {
    console.error("Error deleting community:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
// Create a new event
const createEvent = async (req, res) => {
  try {
    const { tenureId, name, description, date, createdBy } = req.body;

    if (!tenureId || !name || !date) {
      return res
        .status(400)
        .json({ error: "tenureId, name, and date are required." });
    }

    const event = new Event({
      tenureId,
      name,
      description,
      date,
      createdBy,
    });

    await event.save();

    res.status(201).json({ message: "Event created successfully.", event });
  } catch (err) {
    console.error("Error creating event:", err);
    res.status(500).json({ error: "Internal server error." });
  }
};

// controllers/teamController.js
const getLeadsByTenure = async (req, res) => {
  try {
    const { tenureId } = req.params;

    if (!tenureId) {
      return res.status(400).json({ message: "tenureId is required" });
    }

    // Find users with role = teamLead and matching tenureId
    const leads = await User.find({ role: "teamLead", tenureId }).select(
      "name email communityId tenureId"
    );

    if (!leads || leads.length === 0) {
      return res
        .status(404)
        .json({ message: "No team leads found for this tenure" });
    }

    res.status(200).json({ message: "Team leads fetched successfully", leads });
  } catch (error) {
    console.error("Error fetching team leads by tenure:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get all events for a given tenureId
const getEventsByTenure = async (req, res) => {
  try {
    const { tenureId } = req.params;

    const events = await Event.find({ tenureId }).sort({ date: 1 }); // Sort by event date ascending

    res.status(200).json({ events });
  } catch (err) {
    console.error("Error fetching events:", err);
    res.status(500).json({ error: "Internal server error." });
  }
};

const createTeam = async (req, res) => {
  try {
    const { name, leadId, communityId, tenureId } = req.body;

    // Basic validation
    if (!name || !leadId || !communityId || !tenureId) {
      return res.status(400).json({
        message: "name, leadId, communityId, and tenureId are required",
      });
    }

    // Create the team
    const team = new Team({
      name,
      leadId,
      communityId,
      tenureId,
    });

    const savedTeam = await team.save();

    // Update the lead user to include this teamId
    await User.findByIdAndUpdate(
      leadId,
      { $set: { teamId: savedTeam._id } }, // Assuming you add a teamId field in User schema
      { new: true }
    );

    res.status(201).json({
      message: "Team created successfully and lead updated",
      team: savedTeam,
    });
  } catch (error) {
    console.error("Error creating team:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get teams by tenureId
const getTeamsByTenure = async (req, res) => {
  try {
    const { tenureId } = req.params;

    if (!tenureId) {
      return res.status(400).json({ message: "tenureId is required" });
    }

    const teams = await Team.find({ tenureId })
      .populate("leadId", "name email") // populate lead
      .populate("members", "name email") // populate members
      .populate("communityId", "name") // populate community
      .populate("tenureId", "name "); // populate tenure

    if (!teams || teams.length === 0) {
      res.status(200).json({ message: "No Team Found ", teams: [] });
    }

    res.status(200).json({ message: "Teams fetched successfully", teams });
  } catch (error) {
    console.error("Error fetching teams by tenure:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// 1️⃣ Create Task
const createTask = async (req, res) => {
  try {
    const { tenureId, eventId, title, description } = req.body;

    // Basic validation
    if (!eventId || !title) {
      return res.status(400).json({
        message: "teamId, tenureId, eventId, and title are required",
      });
    }

    const task = new Task({
      tenureId,
      eventId,
      title,
      description,
    });

    const savedTask = await task.save();
    res
      .status(201)
      .json({ message: "Task created successfully", task: savedTask });
  } catch (error) {
    console.error("Error creating task:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const getTasksByEventAndTeam = async (req, res) => {
  try {
    const { eventId } = req.params;
    const { teamId } = req.query; // optional query parameter

    if (!eventId) {
      return res.status(400).json({ message: "eventId is required" });
    }

    // Build query
    const query = { eventId };
    if (teamId) query.teamId = teamId;

    const tasks = await Task.find(query)
      .populate("teamId", "name")
      .populate("assignedToTeamLead", "name email")
      .populate("assignedToMember", "name email");

    if (!tasks || tasks.length === 0) {
      return res.status(404).json({ message: "No tasks found for this event" });
    }

    res.status(200).json({ message: "Tasks fetched successfully", tasks });
  } catch (error) {
    console.error("Error fetching tasks by event:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = {
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
  getMembersByLead,
  deleteCommunity,
  editCommunity,
};
