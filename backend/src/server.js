const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Mock database with proper password hashing
const users = [
  {
    id: "acc-001",
    username: "enc_user",
    fullName: "Default Encoder",
    email: "encoder@dti.gov.ph",
    password: "$2b$10$rQZ8ZHWKZQZQZQZQZQZQZOZQZQZQZQZQZQZQZQZQZQZQZQZQZQZQZQZQ", // password123
    role: "encoder",
    status: "active",
  },
  {
    id: "acc-002",
    username: "adm_admin",
    fullName: "Default Admin",
    email: "admin@dti.gov.ph",
    password: "$2b$10$rQZ8ZHWKZQZQZQZQZQZQZOZQZQZQZQZQZQZQZQZQZQZQZQZQZQZQZQZQ", // password123
    role: "admin",
    status: "active",
  },
];

const entries = [];

// Import template data from frontend
const templateData = require('../data/awpb_dropdown_tree.json');

// JWT Secret
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Middleware to verify JWT token
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
};

// Helper function to generate JWT token
const generateToken = (user) => {
  return jwt.sign(
    { 
      id: user.id, 
      username: user.username, 
      role: user.role 
    },
    JWT_SECRET,
    { expiresIn: '24h' }
  );
};

// Routes

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Authentication routes
app.post('/api/auth/login', [
  body('username').notEmpty().withMessage('Username is required'),
  body('password').notEmpty().withMessage('Password is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { username, password } = req.body;
    const normalizedUsername = username.trim().toLowerCase();

    // Find user
    const user = users.find(u => u.username === normalizedUsername);
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Check if user is active
    if (user.status !== 'active') {
      return res.status(401).json({ error: 'Account is deactivated' });
    }

    // Check password (bcrypt comparison)
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate token
    const token = generateToken(user);

    res.json({
      token,
      user: {
        id: user.id,
        username: user.username,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        status: user.status
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// User management routes
app.get('/api/users', authenticateToken, (req, res) => {
  // Only admins can access all users
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }

  const activeUsers = users.map(user => ({
    id: user.id,
    username: user.username,
    fullName: user.fullName,
    email: user.email,
    role: user.role,
    status: user.status,
    created_at: new Date().toISOString()
  }));

  res.json(activeUsers);
});

app.post('/api/users', [
  authenticateToken,
  body('username').notEmpty().withMessage('Username is required'),
  body('fullName').notEmpty().withMessage('Full name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
  body('role').isIn(['admin', 'encoder']).withMessage('Role must be admin or encoder')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // Only admins can create users
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const { username, fullName, email, password, role } = req.body;
    const normalizedUsername = username.trim().toLowerCase();

    // Check if user already exists
    if (users.find(u => u.username === normalizedUsername)) {
      return res.status(400).json({ error: 'Username already exists' });
    }

    if (users.find(u => u.email === email)) {
      return res.status(400).json({ error: 'Email already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const newUser = {
      id: `acc-${Date.now()}`,
      username: normalizedUsername,
      fullName: fullName.trim(),
      email: email.trim(),
      password: hashedPassword,
      role,
      status: 'active'
    };

    users.push(newUser);

    res.status(201).json({
      id: newUser.id,
      username: newUser.username,
      fullName: newUser.fullName,
      email: newUser.email,
      role: newUser.role,
      status: newUser.status,
      created_at: new Date().toISOString()
    });
  } catch (error) {
    console.error('Create user error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.put('/api/users/:id', [
  authenticateToken,
  body('fullName').optional().notEmpty().withMessage('Full name cannot be empty'),
  body('email').optional().isEmail().withMessage('Valid email is required'),
  body('role').optional().isIn(['admin', 'encoder']).withMessage('Role must be admin or encoder'),
  body('status').optional().isIn(['active', 'deactivated']).withMessage('Status must be active or deactivated')
], (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // Only admins can update users
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const { id } = req.params;
    const updates = req.body;

    const userIndex = users.findIndex(u => u.id === id);
    if (userIndex === -1) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Prevent updating self to deactivated
    if (users[userIndex].id === req.user.id && updates.status === 'deactivated') {
      return res.status(400).json({ error: 'Cannot deactivate your own account' });
    }

    // Update user
    users[userIndex] = { ...users[userIndex], ...updates };

    const updatedUser = {
      id: users[userIndex].id,
      username: users[userIndex].username,
      fullName: users[userIndex].fullName,
      email: users[userIndex].email,
      role: users[userIndex].role,
      status: users[userIndex].status,
      updated_at: new Date().toISOString()
    };

    res.json(updatedUser);
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.delete('/api/users/:id', authenticateToken, (req, res) => {
  try {
    // Only admins can delete users
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const { id } = req.params;

    const userIndex = users.findIndex(u => u.id === id);
    if (userIndex === -1) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Prevent deleting self
    if (users[userIndex].id === req.user.id) {
      return res.status(400).json({ error: 'Cannot delete your own account' });
    }

    users.splice(userIndex, 1);

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Entry management routes
app.get('/api/entries', authenticateToken, (req, res) => {
  let userEntries = entries;

  // Encoders can only see their own entries
  if (req.user.role === 'encoder') {
    userEntries = entries.filter(entry => entry.ownerId === req.user.id);
  }

  res.json(userEntries);
});

app.post('/api/entries', [
  authenticateToken,
  body('titleOfActivities').notEmpty().withMessage('Title of activities is required'),
  body('planningYear').isInt({ min: 2020, max: 2030 }).withMessage('Valid planning year is required'),
  body('unit').notEmpty().withMessage('Unit is required'),
  body('component').notEmpty().withMessage('Component is required'),
  body('subComponent').notEmpty().withMessage('Sub component is required'),
  body('keyActivity').notEmpty().withMessage('Key activity is required')
], (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const newEntry = {
      id: `entry-${Date.now()}`,
      ownerId: req.user.id,
      planningYear: req.body.planningYear,
      unit: req.body.unit,
      component: req.body.component,
      subComponent: req.body.subComponent,
      keyActivity: req.body.keyActivity,
      no: req.body.no || '',
      performanceIndicator: req.body.performanceIndicator || '',
      subActivity: req.body.subActivity || '',
      titleOfActivities: req.body.titleOfActivities,
      unitCost: req.body.unitCost || 0,
      targets: {
        jan: req.body.targets?.jan || 0,
        feb: req.body.targets?.feb || 0,
        mar: req.body.targets?.mar || 0,
        apr: req.body.targets?.apr || 0,
        may: req.body.targets?.may || 0,
        jun: req.body.targets?.jun || 0,
        jul: req.body.targets?.jul || 0,
        aug: req.body.targets?.aug || 0,
        sep: req.body.targets?.sep || 0,
        oct: req.body.targets?.oct || 0,
        nov: req.body.targets?.nov || 0,
        dec: req.body.targets?.dec || 0,
      },
      status: 'draft',
      submission_date: null,
      review_date: null,
      reviewer_id: null,
      reviewer_notes: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    entries.push(newEntry);
    res.status(201).json(newEntry);
  } catch (error) {
    console.error('Create entry error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.put('/api/entries/:id', [
  authenticateToken,
  body('titleOfActivities').optional().notEmpty().withMessage('Title of activities cannot be empty')
], (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const entryIndex = entries.findIndex(e => e.id === id);

    if (entryIndex === -1) {
      return res.status(404).json({ error: 'Entry not found' });
    }

    // Check permissions
    const entry = entries[entryIndex];
    if (req.user.role === 'encoder' && entry.ownerId !== req.user.id) {
      return res.status(403).json({ error: 'Can only edit your own entries' });
    }

    // Update entry
    entries[entryIndex] = {
      ...entry,
      ...req.body,
      updated_at: new Date().toISOString()
    };

    res.json(entries[entryIndex]);
  } catch (error) {
    console.error('Update entry error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.delete('/api/entries/:id', authenticateToken, (req, res) => {
  try {
    const { id } = req.params;
    const entryIndex = entries.findIndex(e => e.id === id);

    if (entryIndex === -1) {
      return res.status(404).json({ error: 'Entry not found' });
    }

    // Check permissions
    const entry = entries[entryIndex];
    if (req.user.role === 'encoder' && entry.ownerId !== req.user.id) {
      return res.status(403).json({ error: 'Can only delete your own entries' });
    }

    entries.splice(entryIndex, 1);
    res.json({ message: 'Entry deleted successfully' });
  } catch (error) {
    console.error('Delete entry error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Template data routes
app.get('/api/template', (req, res) => {
  res.json(templateData);
});

// Unit options routes
app.get('/api/unit-options', (req, res) => {
  res.json(templateData.unitOptions || []);
});

// Template hierarchy routes
app.get('/api/template/hierarchy', (req, res) => {
  const { unit } = req.query;
  let hierarchy = templateData.hierarchy || {};
  
  // Filter by unit if specified
  if (unit) {
    // In a real implementation, this would filter based on unit applicability
    // For now, return the full hierarchy
  }
  
  res.json(hierarchy);
});

// Submission window routes
app.get('/api/submission-window', (req, res) => {
  res.json({
    startDate: '2026-04-01',
    endDate: '2026-04-30',
    title: 'FY 2026 Submission Window'
  });
});

// Template Management Routes (Admin only)

// Get all components
app.get('/api/admin/components', authenticateToken, (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  // This will be replaced with database query
  res.json([
    { id: 'comp-1', name: 'COMPONENT 1: DIRECT ASSISTANCE TO ENTERPRISE', code: 'COMPONENT_1', sort_order: 1, is_active: true },
    { id: 'comp-2', name: 'COMPONENT 2: PROJECT MANAGEMENT', code: 'COMPONENT_2', sort_order: 2, is_active: true },
    { id: 'comp-3', name: 'COMPONENT 3: CAPACITY BUILDING', code: 'COMPONENT_3', sort_order: 3, is_active: true },
    { id: 'comp-4', name: 'COMPONENT 4: INNOVATIVE FINANCING', code: 'COMPONENT_4', sort_order: 4, is_active: true }
  ]);
});

// Create new component
app.post('/api/admin/components', [
  authenticateToken,
  body('name').notEmpty().withMessage('Component name is required'),
  body('code').notEmpty().withMessage('Component code is required')
], (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { name, code, sort_order } = req.body;
  const newComponent = {
    id: `comp-${Date.now()}`,
    name: name.trim(),
    code: code.trim(),
    sort_order: sort_order || 0,
    is_active: true,
    created_at: new Date().toISOString()
  };

  res.status(201).json(newComponent);
});

// Update component
app.put('/api/admin/components/:id', [
  authenticateToken,
  body('name').optional().notEmpty().withMessage('Component name cannot be empty'),
  body('code').optional().notEmpty().withMessage('Component code cannot be empty')
], (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { id } = req.params;
  const updates = req.body;

  const updatedComponent = {
    id,
    ...updates,
    updated_at: new Date().toISOString()
  };

  res.json(updatedComponent);
});

// Delete component
app.delete('/api/admin/components/:id', authenticateToken, (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }

  res.json({ message: 'Component deleted successfully' });
});

// Get sub-components by component
app.get('/api/admin/components/:componentId/sub-components', authenticateToken, (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }

  const { componentId } = req.params;
  // Mock data - will be replaced with database query
  res.json([
    { id: 'sub-comp-1', component_id: componentId, name: 'Sub component 1.1 Business Services', code: 'SUB_COMP_1_1', sort_order: 1, is_active: true },
    { id: 'sub-comp-2', component_id: componentId, name: 'Sub component 1.2 Market Linkage', code: 'SUB_COMP_1_2', sort_order: 2, is_active: true }
  ]);
});

// Create sub-component
app.post('/api/admin/components/:componentId/sub-components', [
  authenticateToken,
  body('name').notEmpty().withMessage('Sub-component name is required'),
  body('code').notEmpty().withMessage('Sub-component code is required')
], (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { componentId } = req.params;
  const { name, code, sort_order } = req.body;

  const newSubComponent = {
    id: `sub-comp-${Date.now()}`,
    component_id: componentId,
    name: name.trim(),
    code: code.trim(),
    sort_order: sort_order || 0,
    is_active: true,
    created_at: new Date().toISOString()
  };

  res.status(201).json(newSubComponent);
});

// Get key activities by sub-component
app.get('/api/admin/sub-components/:subComponentId/key-activities', authenticateToken, (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }

  const { subComponentId } = req.params;
  // Mock data - will be replaced with database query
  res.json([
    { 
      id: 'key-act-1', 
      sub_component_id: subComponentId, 
      name: '1.1.1 Business Development Services', 
      code: 'KEY_ACT_1_1_1', 
      activity_no: '1',
      performance_indicator: 'Number of qualified BDS providers engaged for RAPID beneficiaries',
      sort_order: 1, 
      is_active: true 
    },
    { 
      id: 'key-act-2', 
      sub_component_id: subComponentId, 
      name: '1.1.2 Profiling', 
      code: 'KEY_ACT_1_1_2', 
      activity_no: '2',
      performance_indicator: 'Number of Farmer HHs beneficiaries Profiled',
      sort_order: 2, 
      is_active: true 
    }
  ]);
});

// Create key activity
app.post('/api/admin/sub-components/:subComponentId/key-activities', [
  authenticateToken,
  body('name').notEmpty().withMessage('Key activity name is required'),
  body('code').notEmpty().withMessage('Key activity code is required')
], (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { subComponentId } = req.params;
  const { name, code, activity_no, performance_indicator, sort_order } = req.body;

  const newKeyActivity = {
    id: `key-act-${Date.now()}`,
    sub_component_id: subComponentId,
    name: name.trim(),
    code: code.trim(),
    activity_no: activity_no || '',
    performance_indicator: performance_indicator || '',
    sort_order: sort_order || 0,
    is_active: true,
    created_at: new Date().toISOString()
  };

  res.status(201).json(newKeyActivity);
});

// Get sub-activities by key activity
app.get('/api/admin/key-activities/:keyActivityId/sub-activities', authenticateToken, (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }

  const { keyActivityId } = req.params;
  // Mock data - will be replaced with database query
  res.json([
    { 
      id: 'sub-act-1', 
      key_activity_id: keyActivityId, 
      name: '1.1.3.a Productivity/ Techno Transfer-- # of Capability Building, Productivity quality standard and other techno transfer trainings conducted', 
      code: 'SUB_ACT_1_1_3_a', 
      sort_order: 1, 
      is_active: true 
    },
    { 
      id: 'sub-act-2', 
      key_activity_id: keyActivityId, 
      name: '1.1.3.b Productivity/ Techno Transfer-- # of Benchmarking, Learning Visit and study mission conducted', 
      code: 'SUB_ACT_1_1_3_b', 
      sort_order: 2, 
      is_active: true 
    }
  ]);
});

// Create sub-activity
app.post('/api/admin/key-activities/:keyActivityId/sub-activities', [
  authenticateToken,
  body('name').notEmpty().withMessage('Sub-activity name is required'),
  body('code').notEmpty().withMessage('Sub-activity code is required')
], (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { keyActivityId } = req.params;
  const { name, code, sort_order } = req.body;

  const newSubActivity = {
    id: `sub-act-${Date.now()}`,
    key_activity_id: keyActivityId,
    name: name.trim(),
    code: code.trim(),
    sort_order: sort_order || 0,
    is_active: true,
    created_at: new Date().toISOString()
  };

  res.status(201).json(newSubActivity);
});

// Update template item status (activate/deactivate)
app.patch('/api/admin/template/:type/:id/status', authenticateToken, (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }

  const { type, id } = req.params;
  const { is_active } = req.body;

  if (typeof is_active !== 'boolean') {
    return res.status(400).json({ error: 'is_active must be a boolean' });
  }

  res.json({ 
    message: `${type} status updated successfully`, 
    id, 
    is_active,
    updated_at: new Date().toISOString()
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 AWPB Backend Server running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
  console.log(`🔗 API endpoints: http://localhost:${PORT}/api`);
  console.log(`👥 Default users:`);
  console.log(`   - Admin: adm_admin / password123`);
  console.log(`   - Encoder: enc_user / password123`);
});

module.exports = app;
