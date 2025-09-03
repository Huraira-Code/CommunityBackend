const User = require('../models/User');
const jwt = require('jsonwebtoken');
const Community = require('../models/Community');

// POST /api/auth/login
const login = async (req, res) => {
  try {
    const { email, password, role } = req.body;

    if (!email || !password || !role) {
      return res.status(400).json({ message: 'Email, password, and role are required' });
    }

    // Find user with email, password, and role
    const user = await User.findOne({ email, password, role });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Create JWT token
    const token = jwt.sign(
      { userId: user._id, role: user.role, communityId: user.communityId, tenureId: user.tenureId },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(200).json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        communityId: user.communityId,
        tenureId: user.tenureId,
        teamLeadId: user.teamLeadId || null
      }
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

const createCommunity = async (req, res) => {
  try {
    const { communityName, supervisorName, supervisorEmail, supervisorPassword } = req.body;

    if (!communityName || !supervisorEmail || !supervisorPassword) {
      return res.status(400).json({ message: 'Required fields missing' });
    }

    // Create Supervisor user
    const supervisor = new User({
      name: supervisorName,
      email: supervisorEmail,
      password: supervisorPassword,
      role: 'supervisor',
    });
    await supervisor.save();

    // Create Community with supervisor
    const community = new Community({
      name: communityName,
      supervisor: supervisor._id
    });
    await community.save();

    res.status(201).json({ message: 'Community and Supervisor created', community, supervisor });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};



const createTenure = async (req, res) => {
  try {
    const { tenureName, communityId } = req.body;

    if (!tenureName || !communityId) {
      return res.status(400).json({ message: 'Required fields missing' });
    }

    const tenure = new Tenure({
      name: tenureName,
      community: communityId
    });
    await tenure.save();

    res.status(201).json({ message: 'Tenure created', tenure });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

const createPresident = async (req, res) => {
  try {
    const { name, email, password, tenureId } = req.body;

    // Validate required fields
    if (!name || !email || !password || !tenureId) {
      return res.status(400).json({ message: 'Required fields missing' });
    }

    // Check if Tenure exists
    const tenure = await Tenure.findById(tenureId);
    if (!tenure) {
      return res.status(404).json({ message: 'Tenure not found' });
    }

    // Create President user
    const president = new User({
      name,
      email,
      password, // since you're not using bcrypt
      role: 'president',
      tenureId
    });

    await president.save();

    res.status(201).json({ message: 'President created', president });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};


const createTeamLead = async (req, res) => {
  try {
    const { name, email, password, tenureId } = req.body;

    if (!name || !email || !password || !tenureId) {
      return res.status(400).json({ message: 'Required fields missing' });
    }

    const teamLead = new User({
      name,
      email,
      password,
      role: 'teamLead',
      tenureId
    });
    await teamLead.save();

    res.status(201).json({ message: 'Team Lead created', teamLead });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};


const getAllCommunities = async (req, res) => {
  try {
    const communities = await Community.find().populate('supervisor', 'name email role');
    res.status(200).json({ communities });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// GET /api/communities/:communityId/tenures
const getTenuresByCommunity = async (req, res) => {
  try {
    const { communityId } = req.params;

    if (!communityId) {
      return res.status(400).json({ message: 'Community ID is required' });
    }

    const tenures = await Tenure.find({ community: communityId }).populate('community', 'name');

    if (!tenures || tenures.length === 0) {
      return res.status(404).json({ message: 'No tenures found for this community' });
    }

    res.status(200).json({ tenures });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};



const createMember = async (req, res) => {
  try {
    const { name, email, password, teamLeadId, tenureId } = req.body;

    if (!name || !email || !password || !teamLeadId || !tenureId) {
      return res.status(400).json({ message: 'Required fields missing' });
    }

    const member = new User({
      name,
      email,
      password,
      role: 'member',
      teamLeadId,
      tenureId
    });
    await member.save();

    res.status(201).json({ message: 'Member created', member });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};




module.exports = { login ,createCommunity,createTeamLead,createMember , createPresident , createTenure , getAllCommunities,getTenuresByCommunity };
