const router = require('express').Router();
const prisma = require('../utils/prisma');
const mailer = require('../utils/mailer');

// POST /api/newsletter — "Join the House" / "Sign Up" footer form
router.post('/', async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
      return res.status(400).json({ error: 'A valid email is required' });
    }

    const alreadyExists = await prisma.newsletterSubscriber.findUnique({ where: { email } });

    const subscriber = await prisma.newsletterSubscriber.upsert({
      where: { email },
      update: {},
      create: { email },
    });

    // Send welcome email only on first subscription
    if (!alreadyExists) {
      mailer.sendNewsletterWelcome(email).catch(err =>
        console.error('Newsletter welcome email error:', err)
      );
    }

    res.status(201).json({ message: 'Subscribed', subscriber });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
