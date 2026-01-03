import { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  achievements,
  unlockAchievement,
} from '../store/achievementSlice';
import { spendCoins } from '../store/gameSlice';

export default function useAchievementEngine() {
  const dispatch = useDispatch();

  const { xp, level } = useSelector(state => state.game);
  const unlocked = useSelector(state => state.achievements.unlocked);

  const totalXPRef = useRef(0);

  useEffect(() => {
    totalXPRef.current += xp;
  }, [xp]);

  useEffect(() => {
    if (!unlocked.FIRST_XP && xp > 0) {
      dispatch(unlockAchievement(achievements.FIRST_XP));
    }

    if (!unlocked.LEVEL_5 && level >= 5) {
      dispatch(unlockAchievement(achievements.LEVEL_5));
    }

    if (!unlocked.XP_500 && totalXPRef.current >= 500) {
      dispatch(unlockAchievement(achievements.XP_500));
    }
  }, [xp, level, unlocked, dispatch]);
}
