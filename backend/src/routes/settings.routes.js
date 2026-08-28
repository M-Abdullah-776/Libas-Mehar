const router = require('express').Router();
const fs = require('fs');
const path = require('path');
const { authenticate, requireAdmin } = require('../middleware/auth');

const SETTINGS_FILE = path.join(__dirname, '..', '..', 'data', 'settings.json');

// Ensure data folder exists
try {
  fs.mkdirSync(path.dirname(SETTINGS_FILE), { recursive: true });
} catch (e) {}

const defaultSettings = {
  shippingCost: 200,
  freeShippingThreshold: 3000,
  contactPhone: '+92 329 4359224',
  whatsappNumber: '+923294359224',
  isShopOpen: true,
  coupons: [
    { code: 'WELCOME10', type: 'PERCENT', value: 10, isActive: true },
    { code: 'FLAT500', type: 'FIXED', value: 500, isActive: true },
  ],
};

function readSettings() {
  try {
    if (fs.existsSync(SETTINGS_FILE)) {
      const data = fs.readFileSync(SETTINGS_FILE, 'utf8');
      return { ...defaultSettings, ...JSON.parse(data) };
    }
  } catch (e) {
    console.error('Error reading settings:', e);
  }
  return defaultSettings;
}

function writeSettings(settings) {
  try {
    fs.writeFileSync(SETTINGS_FILE, JSON.stringify(settings, null, 2), 'utf8');
    return true;
  } catch (e) {
    console.error('Error writing settings:', e);
    return false;
  }
}

// GET /api/settings - Public
router.get('/', (req, res) => {
  res.json({ settings: readSettings() });
});

// PATCH /api/settings - Admin only
router.patch('/', authenticate, requireAdmin, (req, res) => {
  const current = readSettings();
  const updated = {
    ...current,
    shippingCost: req.body.shippingCost !== undefined ? Number(req.body.shippingCost) : current.shippingCost,
    freeShippingThreshold: req.body.freeShippingThreshold !== undefined ? Number(req.body.freeShippingThreshold) : current.freeShippingThreshold,
    contactPhone: req.body.contactPhone || current.contactPhone,
    whatsappNumber: req.body.whatsappNumber || current.whatsappNumber,
    isShopOpen: req.body.isShopOpen !== undefined ? Boolean(req.body.isShopOpen) : current.isShopOpen,
  };

  if (writeSettings(updated)) {
    res.json({ message: 'Settings updated successfully', settings: updated });
  } else {
    res.status(500).json({ error: 'Failed to save settings' });
  }
});

// POST /api/settings/validate-coupon - Public
router.post('/validate-coupon', (req, res) => {
  const { code } = req.body;
  if (!code) return res.status(400).json({ error: 'Coupon code is required' });

  const settings = readSettings();
  const coupon = (settings.coupons || []).find(
    (c) => c.code.toUpperCase() === code.toUpperCase().trim() && c.isActive
  );

  if (!coupon) {
    return res.status(404).json({ error: 'Invalid or expired coupon code' });
  }

  res.json({ valid: true, coupon });
});

// POST /api/settings/coupons - Admin only
router.post('/coupons', authenticate, requireAdmin, (req, res) => {
  const { code, type, value } = req.body;
  if (!code || !type || value === undefined) {
    return res.status(400).json({ error: 'Code, type, and value are required' });
  }
  if (!['PERCENT', 'FIXED'].includes(type)) {
    return res.status(400).json({ error: 'Type must be PERCENT or FIXED' });
  }

  const current = readSettings();
  const coupons = current.coupons || [];

  if (coupons.some((c) => c.code.toUpperCase() === code.toUpperCase().trim())) {
    return res.status(409).json({ error: 'Coupon code already exists' });
  }

  const newCoupon = {
    code: code.toUpperCase().trim(),
    type,
    value: Number(value),
    isActive: true,
  };

  current.coupons = [...coupons, newCoupon];

  if (writeSettings(current)) {
    res.status(201).json({ message: 'Coupon created successfully', coupon: newCoupon, settings: current });
  } else {
    res.status(500).json({ error: 'Failed to create coupon' });
  }
});

// DELETE /api/settings/coupons/:code - Admin only
router.delete('/coupons/:code', authenticate, requireAdmin, (req, res) => {
  const code = req.params.code.toUpperCase().trim();
  const current = readSettings();
  const coupons = current.coupons || [];

  if (!coupons.some((c) => c.code === code)) {
    return res.status(404).json({ error: 'Coupon not found' });
  }

  current.coupons = coupons.filter((c) => c.code !== code);

  if (writeSettings(current)) {
    res.json({ message: 'Coupon deleted successfully', settings: current });
  } else {
    res.status(500).json({ error: 'Failed to delete coupon' });
  }
});

module.exports = {
  router,
  readSettings,
};
