import express from 'express';
import User from '../models/User.js';
import Event from '../models/Event.js';
import { requireAuth } from '../middleware/authMiddleware.js';

const router = express.Router();

// Helper function to check if should reset daily quests
const shouldResetDaily = (lastReset) => {
  const lastResetDate = new Date(lastReset).setHours(0, 0, 0, 0);
  const today = new Date().setHours(0, 0, 0, 0);
  return lastResetDate < today;
};

// GET /api/dailyquests/status - Get user's daily quest status
router.get('/status', requireAuth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Initialize daily quests if not present
    if (!user.dailyQuests) {
      user.dailyQuests = {
        lastReset: new Date().setHours(0, 0, 0, 0),
        quests: {
          DAILY_LOGIN: {
            lastClaimedAt: null,
            claimedToday: false,
            claimCount: 0
          },
          JOIN_2_EVENTS: {
            lastClaimedAt: null,
            claimedToday: false,
            eventRegistrationCount: 0,
            claimCount: 0
          }
        }
      };
      await user.save();
    }

    // Check if daily reset is needed
    if (shouldResetDaily(user.dailyQuests.lastReset)) {
      user.dailyQuests.quests.DAILY_LOGIN.claimedToday = false;
      user.dailyQuests.quests.JOIN_2_EVENTS.claimedToday = false;
      user.dailyQuests.quests.JOIN_2_EVENTS.eventRegistrationCount = 0;
      user.dailyQuests.lastReset = new Date().setHours(0, 0, 0, 0);
      await user.save();
    }

    res.json(user.dailyQuests);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/registrations/user - Get user's event registrations
router.get('/registrations/user', requireAuth, async (req, res) => {
  try {
    // Find all events where this user is registered
    const userId = req.user.id;
    const events = await Event.find({
      'registrations.userId': userId
    }).select('_id title date location');

    // Count how many events the user has registered for
    const registrationCount = events.length;

    res.json({
      count: registrationCount,
      registrations: events.map(event => ({
        eventId: event._id,
        title: event.title,
        date: event.date,
        location: event.location
      }))
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/dailyquests/claim - Claim a daily quest
router.post('/claim', requireAuth, async (req, res) => {
  try {
    const { questId } = req.body;
    if (!questId) {
      return res.status(400).json({ message: 'Quest ID required' });
    }

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Initialize daily quests if not present
    if (!user.dailyQuests) {
      user.dailyQuests = {
        lastReset: new Date().setHours(0, 0, 0, 0),
        quests: {
          DAILY_LOGIN: {
            lastClaimedAt: null,
            claimedToday: false,
            claimCount: 0
          },
          JOIN_2_EVENTS: {
            lastClaimedAt: null,
            claimedToday: false,
            eventRegistrationCount: 0,
            claimCount: 0
          }
        }
      };
    }

    // Check if daily reset is needed
    if (shouldResetDaily(user.dailyQuests.lastReset)) {
      user.dailyQuests.quests.DAILY_LOGIN.claimedToday = false;
      user.dailyQuests.quests.JOIN_2_EVENTS.claimedToday = false;
      user.dailyQuests.quests.JOIN_2_EVENTS.eventRegistrationCount = 0;
      user.dailyQuests.lastReset = new Date().setHours(0, 0, 0, 0);
    }

    const quest = user.dailyQuests.quests[questId];
    if (!quest) {
      return res.status(400).json({ message: 'Invalid quest ID' });
    }

    // Check if already claimed today
    if (quest.claimedToday) {
      return res.status(400).json({ message: 'Quest already claimed today' });
    }

    // For JOIN_2_EVENTS quest, verify the requirement is met
    if (questId === 'JOIN_2_EVENTS') {
      // Count user's event registrations
      const eventCount = await Event.countDocuments({
        'registrations.userId': req.user.id
      });

      if (eventCount < 2) {
        return res.status(400).json({
          message: `You need to register for 2 events. Current registrations: ${eventCount}`
        });
      }

      user.dailyQuests.quests.JOIN_2_EVENTS.eventRegistrationCount = eventCount;
    }

    // Mark quest as claimed
    quest.claimedToday = true;
    quest.lastClaimedAt = new Date();
    quest.claimCount += 1;

    // Award XP and coins
    const questRewards = {
      DAILY_LOGIN: { xp: 10, coins: 2 },
      JOIN_2_EVENTS: { xp: 50, coins: 10 }
    };

    const rewards = questRewards[questId];
    if (rewards) {
      user.xp = (user.xp || 0) + rewards.xp;
      user.coins = (user.coins || 0) + rewards.coins;
    }

    await user.save();

    res.status(200).json({
      message: `Quest claimed successfully! +${rewards.xp} XP, +${rewards.coins} Coins`,
      rewards,
      questStatus: quest
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/dailyquests/sync - Sync daily quest state from frontend
router.put('/sync', requireAuth, async (req, res) => {
  try {
    const { dailyQuests } = req.body;
    if (!dailyQuests) {
      return res.status(400).json({ message: 'Daily quests data required' });
    }

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Check if reset is needed
    if (shouldResetDaily(dailyQuests.lastReset)) {
      dailyQuests.quests.DAILY_LOGIN.claimedToday = false;
      dailyQuests.quests.JOIN_2_EVENTS.claimedToday = false;
      dailyQuests.quests.JOIN_2_EVENTS.eventRegistrationCount = 0;
      dailyQuests.lastReset = new Date().setHours(0, 0, 0, 0);
    }

    user.dailyQuests = dailyQuests;
    await user.save();

    res.json({ message: 'Daily quests synced', dailyQuests: user.dailyQuests });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
