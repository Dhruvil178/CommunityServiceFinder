

import { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { achievements, unlockAchievement } from '../store/achievementSlice';
import { gainXP } from '../store/gameSlice';

export default function useAchievementEngine() {
  const dispatch = useDispatch();

  const { xp, level, coins }            = useSelector(state => state.game);
  const unlocked                         = useSelector(state => state.achievements.unlocked);
  const registeredEvents = useSelector(state => state.event?.registeredEvents ?? []);
  const completedEvents  = useSelector(state => state.event?.completedEvents  ?? []);
  const certificates     = useSelector(state => state.event?.certificates     ?? []);
  const chatbotMessages = useSelector(state => state.event?.chatbotCount) ?? 0;

  const hasInitializedRef = useRef(false);
  const prevXpRef = useRef(0);
  const prevCompletedRef = useRef(completedEvents.length);
  const prevCertRef      = useRef(certificates.length);
  const prevRegRef       = useRef(registeredEvents.length);


  const tryUnlock = (achievementKey) => {
    if (achievements[achievementKey] && !unlocked[achievementKey]) {
      dispatch(unlockAchievement(achievements[achievementKey]));
    }
  };

  // Mark initialization and track previous XP
  useEffect(() => {
    if (!hasInitializedRef.current) {
      hasInitializedRef.current = true;
      prevXpRef.current = xp;
    }
  }, []);

  // Only trigger achievements when XP genuinely increases (not on initial load)
  useEffect(() => {
    if (!hasInitializedRef.current) return;
    
    if (xp > prevXpRef.current) {
      // XP actually increased, check level achievements
      if (level >= 5)    tryUnlock('LEVEL_5');
      if (level >= 10)   tryUnlock('LEVEL_10');
      if (level >= 20)   tryUnlock('LEVEL_20');
    }
    prevXpRef.current = xp;
  }, [xp, level]);


  useEffect(() => {
    if (!hasInitializedRef.current) return;
    
    const count = registeredEvents.length;

    if (count >= 1)  tryUnlock('FIRST_REGISTRATION');
    if (count >= 5)  tryUnlock('REGISTERED_5');
    if (count >= 10) tryUnlock('REGISTERED_10');
    if (count >= 25) tryUnlock('REGISTERED_25');


    if (count > prevRegRef.current) {
      dispatch(gainXP(20));
    }
    prevRegRef.current = count;
  }, [registeredEvents.length]);


  useEffect(() => {
    if (!hasInitializedRef.current) return;
    
    const count = completedEvents.length;

    if (count >= 1)  tryUnlock('FIRST_COMPLETION');
    if (count >= 3)  tryUnlock('COMPLETED_3');
    if (count >= 10) tryUnlock('COMPLETED_10');
    if (count >= 25) tryUnlock('COMPLETED_25');
    if (count >= 50) tryUnlock('COMPLETED_50');


    if (count > prevCompletedRef.current) {
      dispatch(gainXP(50));
    }
    prevCompletedRef.current = count;
  }, [completedEvents.length]);


  useEffect(() => {
    if (!hasInitializedRef.current) return;
    
    const count = certificates.length;

    if (count >= 1)  tryUnlock('FIRST_CERTIFICATE');
    if (count >= 5)  tryUnlock('CERT_COLLECTOR');
    if (count >= 10) tryUnlock('CERT_MASTER');


    if (count > prevCertRef.current) {
      dispatch(gainXP(100));
    }
    prevCertRef.current = count;
  }, [certificates.length]);


  useEffect(() => {
    if (!hasInitializedRef.current) return;
    
    if (chatbotMessages >= 1) tryUnlock('CHATBOT_FIRST');
    if (chatbotMessages >= 10) tryUnlock('CHATBOT_PRO');
  }, [chatbotMessages]);
}


// ────────────────────────────────────────────────────────────────────────────
// ALSO UPDATE src/store/achievementSlice.js — expand the achievements object
// Replace the achievements export with this:
// ────────────────────────────────────────────────────────────────────────────
/*
export const achievements = {
  // XP & Level
  FIRST_XP: {
    id: 'FIRST_XP',
    title: 'First Steps',
    description: 'Earn your first XP point',
    icon: '🎯',
    rarity: 'common',
    rewardCoins: 10,
  },
  LEVEL_5: {
    id: 'LEVEL_5',
    title: 'Rising Star',
    description: 'Reach Level 5',
    icon: '⭐',
    rarity: 'rare',
    rewardCoins: 50,
  },
  LEVEL_10: {
    id: 'LEVEL_10',
    title: 'Veteran Volunteer',
    description: 'Reach Level 10',
    icon: '🛡️',
    rarity: 'epic',
    rewardCoins: 150,
  },
  LEVEL_20: {
    id: 'LEVEL_20',
    title: 'Legend',
    description: 'Reach Level 20 — true community champion',
    icon: '👑',
    rarity: 'legendary',
    rewardCoins: 500,
  },

  // Registrations
  FIRST_REGISTRATION: {
    id: 'FIRST_REGISTRATION',
    title: 'Ready to Serve',
    description: 'Register for your first event',
    icon: '📋',
    rarity: 'common',
    rewardCoins: 15,
  },
  REGISTERED_5: {
    id: 'REGISTERED_5',
    title: 'Active Citizen',
    description: 'Register for 5 events',
    icon: '🙋',
    rarity: 'common',
    rewardCoins: 30,
  },
  REGISTERED_10: {
    id: 'REGISTERED_10',
    title: 'Community Builder',
    description: 'Register for 10 events',
    icon: '🏘️',
    rarity: 'rare',
    rewardCoins: 75,
  },
  REGISTERED_25: {
    id: 'REGISTERED_25',
    title: 'Pillar of Society',
    description: 'Register for 25 events',
    icon: '🏛️',
    rarity: 'epic',
    rewardCoins: 200,
  },

  // Completions
  FIRST_COMPLETION: {
    id: 'FIRST_COMPLETION',
    title: 'Boots on the Ground',
    description: 'Complete your first event',
    icon: '✅',
    rarity: 'common',
    rewardCoins: 25,
  },
  COMPLETED_3: {
    id: 'COMPLETED_3',
    title: 'Team Player',
    description: 'Complete 3 events',
    icon: '👥',
    rarity: 'common',
    rewardCoins: 50,
  },
  COMPLETED_10: {
    id: 'COMPLETED_10',
    title: 'Marathon Volunteer',
    description: 'Complete 10 events',
    icon: '⚡',
    rarity: 'rare',
    rewardCoins: 150,
  },
  COMPLETED_25: {
    id: 'COMPLETED_25',
    title: 'Community Champion',
    description: 'Complete 25 events',
    icon: '🏆',
    rarity: 'epic',
    rewardCoins: 300,
  },
  COMPLETED_50: {
    id: 'COMPLETED_50',
    title: 'Service Legend',
    description: 'Complete 50 events — true hero',
    icon: '🌟',
    rarity: 'legendary',
    rewardCoins: 750,
  },

  // Certificates
  FIRST_CERTIFICATE: {
    id: 'FIRST_CERTIFICATE',
    title: 'Certified Volunteer',
    description: 'Receive your first certificate',
    icon: '🎓',
    rarity: 'common',
    rewardCoins: 30,
  },
  CERT_COLLECTOR: {
    id: 'CERT_COLLECTOR',
    title: 'Cert Collector',
    description: 'Earn 5 certificates',
    icon: '📜',
    rarity: 'rare',
    rewardCoins: 100,
  },
  CERT_MASTER: {
    id: 'CERT_MASTER',
    title: 'Certificate Master',
    description: 'Earn 10 certificates',
    icon: '🏅',
    rarity: 'epic',
    rewardCoins: 250,
  },

  // Chatbot
  CHATBOT_FIRST: {
    id: 'CHATBOT_FIRST',
    title: 'AI Explorer',
    description: 'Send your first message to the chatbot',
    icon: '🤖',
    rarity: 'common',
    rewardCoins: 10,
  },
  CHATBOT_PRO: {
    id: 'CHATBOT_PRO',
    title: 'AI Power User',
    description: 'Send 10 chatbot messages',
    icon: '💬',
    rarity: 'rare',
    rewardCoins: 40,
  },
};
*/