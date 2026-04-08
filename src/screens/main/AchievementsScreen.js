// src/screens/main/AchievementsScreen.js
// Full gamified redesign — React Native (no Tailwind/web)
import React, { useState, useRef, useEffect } from 'react';
import {
  View, StyleSheet, ScrollView, FlatList, TouchableOpacity,
  Animated, Dimensions,
} from 'react-native';
import { Surface, Title, Paragraph } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSelector } from 'react-redux';
import { LinearGradient } from 'expo-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { achievements as allAchievements } from '../../store/achievementSlice';

const { width } = Dimensions.get('window');
const CARD_W = (width - 48) / 2;

// ─── Tab bar ─────────────────────────────────────────────────────────────────
const TABS = [
  { key: 'overview',      label: 'Overview',      icon: 'dashboard' },
  { key: 'achievements',  label: 'Achievements',  icon: 'emoji-events' },
  { key: 'leaderboard',   label: 'Leaderboard',   icon: 'leaderboard' },
];

// ─── XP needed per level ─────────────────────────────────────────────────────
const xpForLevel = level => level * 100;

// ─── Rank label from level ───────────────────────────────────────────────────
const getRank = level => {
  if (level >= 20) return { label: 'Legend',        color: '#f59e0b', icon: '👑' };
  if (level >= 15) return { label: 'Elite Hero',    color: '#a78bfa', icon: '⚡' };
  if (level >= 10) return { label: 'Silver Hero',   color: '#94a3b8', icon: '🛡️' };
  if (level >= 5)  return { label: 'Bronze Hero',   color: '#d97706', icon: '🏅' };
  return           { label: 'Recruit',              color: '#6b7280', icon: '🎯' };
};

// ─── Rarity colours ──────────────────────────────────────────────────────────
const RARITY = {
  legendary: { border: '#f59e0b', bg: '#f59e0b12', label: '#f59e0b', text: 'LEGENDARY' },
  epic:      { border: '#a78bfa', bg: '#a78bfa12', label: '#a78bfa', text: 'EPIC' },
  rare:      { border: '#38bdf8', bg: '#38bdf812', label: '#38bdf8', text: 'RARE' },
  common:    { border: '#374151', bg: '#1a1d2e',   label: '#6b7280', text: 'COMMON' },
};

// ─── Animated XP bar ─────────────────────────────────────────────────────────
const XPBar = ({ xp, level }) => {
  const needed = xpForLevel(level);
  const pct = Math.min((xp / needed) * 100, 100);
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(anim, { toValue: pct, duration: 900, useNativeDriver: false }).start();
  }, [pct]);

  const barWidth = anim.interpolate({ inputRange: [0, 100], outputRange: ['0%', '100%'] });

  return (
    <View>
      <View style={styles.xpBarRow}>
        <Paragraph style={styles.xpLabel}>Lvl {level}</Paragraph>
        <Paragraph style={styles.xpCount}>{xp} / {needed} XP</Paragraph>
        <Paragraph style={styles.xpLabel}>Lvl {level + 1}</Paragraph>
      </View>
      <View style={styles.xpTrack}>
        <Animated.View style={[styles.xpFill, { width: barWidth }]} />
      </View>
    </View>
  );
};

// ─── Player card ─────────────────────────────────────────────────────────────
const PlayerCard = ({ user, xp, level, coins, streak, totalUnlocked }) => {
  const rank = getRank(level);
  return (
    <LinearGradient
      colors={['#4f46e5', '#7c3aed', '#db2777']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.playerCard}
    >
      {/* Top row */}
      <View style={styles.playerRow}>
        <View style={styles.playerLeft}>
          <LinearGradient
            colors={['#f59e0b', '#ef4444']}
            style={styles.avatarRing}
          >
            <View style={styles.avatarInner}>
              <Paragraph style={styles.avatarEmoji}>🧑</Paragraph>
            </View>
          </LinearGradient>
          <View style={styles.playerMeta}>
            <Title style={styles.playerName}>{user?.name || 'Student'}</Title>
            <View style={styles.playerBadgeRow}>
              <View style={styles.levelBadge}>
                <Paragraph style={styles.levelText}>Lvl {level}</Paragraph>
              </View>
              <Paragraph style={styles.rankText}>{rank.icon} {rank.label}</Paragraph>
            </View>
          </View>
        </View>

        <View style={styles.playerRight}>
          <View style={styles.coinBadge}>
            <Paragraph style={styles.coinEmoji}>🪙</Paragraph>
            <Paragraph style={styles.coinValue}>{coins}</Paragraph>
          </View>
          <View style={styles.streakRow}>
            <Icon name="local-fire-department" size={16} color="#fb923c" />
            <Paragraph style={styles.streakValue}>{streak} days</Paragraph>
          </View>
        </View>
      </View>

      {/* XP bar */}
      <View style={styles.xpSection}>
        <XPBar xp={xp} level={level} />
      </View>

      {/* Quick stats */}
      <View style={styles.quickStats}>
        {[
          { emoji: '🎯', value: totalUnlocked,  label: 'Achieved' },
          { emoji: '🏆', value: totalUnlocked,  label: 'Badges' },
          { emoji: '📍', value: '#3',           label: 'Rank' },
        ].map(s => (
          <View key={s.label} style={styles.quickStat}>
            <Paragraph style={styles.qsEmoji}>{s.emoji}</Paragraph>
            <Paragraph style={styles.qsValue}>{s.value}</Paragraph>
            <Paragraph style={styles.qsLabel}>{s.label}</Paragraph>
          </View>
        ))}
      </View>
    </LinearGradient>
  );
};

// ─── Achievement tile ─────────────────────────────────────────────────────────
const AchievementTile = ({ achievement, isUnlocked, unlockedAt }) => {
  const rarity = achievement.rarity || 'common';
  const r = RARITY[rarity] || RARITY.common;

  return (
    <View
      style={[
        styles.achieveTile,
        { borderColor: isUnlocked ? r.border : '#1f2937', backgroundColor: isUnlocked ? r.bg : '#111827' },
        !isUnlocked && { opacity: 0.45 },
      ]}
    >
      <Paragraph style={styles.achieveIcon}>{isUnlocked ? achievement.icon || '🏆' : '🔒'}</Paragraph>
      <Paragraph style={[styles.achieveTitle, { color: isUnlocked ? '#fff' : '#374151' }]}>
        {achievement.title}
      </Paragraph>
      <Paragraph style={[styles.achieveDesc, { color: isUnlocked ? '#9ca3af' : '#1f2937' }]}>
        {achievement.description}
      </Paragraph>
      {isUnlocked && (
        <View style={[styles.rarityBadge, { backgroundColor: r.label + '22' }]}>
          <Paragraph style={[styles.rarityText, { color: r.label }]}>{r.text}</Paragraph>
        </View>
      )}
      {isUnlocked && unlockedAt && (
        <Paragraph style={styles.unlockedDate}>
          {new Date(unlockedAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}
        </Paragraph>
      )}
    </View>
  );
};

// ─── Leaderboard row ─────────────────────────────────────────────────────────
const MOCK_BOARD = [
  { rank: 1, name: 'Arjun Mehta',  level: 15, xp: 8450, isMe: false },
  { rank: 2, name: 'Priya Nair',   level: 14, xp: 7890, isMe: false },
  { rank: 3, name: 'You',          level: 7,  xp: 2450, isMe: true  },
  { rank: 4, name: 'Rahul Singh',  level: 6,  xp: 2100, isMe: false },
  { rank: 5, name: 'Sneha Patil',  level: 5,  xp: 1850, isMe: false },
];

const rankColors = ['#f59e0b', '#94a3b8', '#d97706'];

const LeaderboardRow = ({ player }) => (
  <LinearGradient
    colors={player.isMe ? ['#4f1d96', '#831843'] : ['#1a1d2e', '#1a1d2e']}
    start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
    style={[styles.boardRow, player.isMe && styles.boardRowMe]}
  >
    <View style={[
      styles.rankBubble,
      { backgroundColor: (rankColors[player.rank - 1] || '#374151') + '33' },
    ]}>
      <Paragraph style={[styles.rankNum, { color: rankColors[player.rank - 1] || '#9ca3af' }]}>
        #{player.rank}
      </Paragraph>
    </View>
    <Paragraph style={styles.boardEmoji}>
      {player.rank === 1 ? '🥇' : player.rank === 2 ? '🥈' : player.rank === 3 ? '🥉' : '🎖️'}
    </Paragraph>
    <View style={styles.boardInfo}>
      <Paragraph style={styles.boardName}>{player.name}</Paragraph>
      <View style={styles.boardMeta}>
        <View style={styles.boardLvl}>
          <Paragraph style={styles.boardLvlText}>Lvl {player.level}</Paragraph>
        </View>
        <Icon name="bolt" size={13} color="#38bdf8" />
        <Paragraph style={styles.boardXP}>{player.xp.toLocaleString()} XP</Paragraph>
      </View>
    </View>
    {player.isMe && (
      <View style={styles.youBadge}>
        <Paragraph style={styles.youText}>YOU</Paragraph>
      </View>
    )}
  </LinearGradient>
);

// ─── Main screen ──────────────────────────────────────────────────────────────
export default function AchievementsScreen() {
  const [tab, setTab] = useState('overview');

  const { user }     = useSelector(state => state.auth);
  const { xp, level, coins } = useSelector(state => state.game);
  const unlocked     = useSelector(state => state.achievements.unlocked);

  // Streak: count from local state (replace with real backend value when available)
  const streak = useSelector(state => state.game?.streak || 0);

  const achieveList  = Object.values(allAchievements);
  const totalUnlocked = Object.keys(unlocked).length;

  return (
    <SafeAreaView style={styles.container}>
      {/* ── Tab bar ───────────────────────────────────────── */}
      <View style={styles.tabBar}>
        {TABS.map(t => (
          <TouchableOpacity
            key={t.key}
            style={[styles.tabBtn, tab === t.key && styles.tabBtnActive]}
            onPress={() => setTab(t.key)}
          >
            <Icon name={t.icon} size={18} color={tab === t.key ? '#a78bfa' : '#4b5563'} />
            <Paragraph style={[styles.tabLabel, tab === t.key && styles.tabLabelActive]}>
              {t.label}
            </Paragraph>
            {tab === t.key && <View style={styles.tabDot} />}
          </TouchableOpacity>
        ))}
      </View>

      {/* ── Overview tab ─────────────────────────────────── */}
      {tab === 'overview' && (
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <PlayerCard
            user={user}
            xp={xp}
            level={level}
            coins={coins}
            streak={streak}
            totalUnlocked={totalUnlocked}
          />

          {/* Progress to next unlock */}
          <Surface style={styles.nextCard}>
            <View style={styles.nextRow}>
              <Icon name="emoji-events" size={22} color="#f59e0b" />
              <View style={styles.nextInfo}>
                <Paragraph style={styles.nextTitle}>Next achievement</Paragraph>
                <Paragraph style={styles.nextDesc}>
                  {totalUnlocked < achieveList.length
                    ? achieveList.find(a => !unlocked[a.id])?.title || 'Keep going!'
                    : '🎉 All unlocked!'}
                </Paragraph>
              </View>
              <Paragraph style={styles.nextCount}>
                {totalUnlocked}/{achieveList.length}
              </Paragraph>
            </View>
            <View style={styles.nextTrack}>
              <View
                style={[
                  styles.nextFill,
                  { width: `${(totalUnlocked / Math.max(achieveList.length, 1)) * 100}%` },
                ]}
              />
            </View>
          </Surface>

          {/* Recent unlocks */}
          {totalUnlocked > 0 && (
            <View style={styles.recentSection}>
              <Title style={styles.subTitle}>Recent Unlocks</Title>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {achieveList
                  .filter(a => unlocked[a.id])
                  .slice(-4)
                  .reverse()
                  .map(a => (
                    <View key={a.id} style={styles.recentChip}>
                      <Paragraph style={styles.recentEmoji}>{a.icon || '🏆'}</Paragraph>
                      <Paragraph style={styles.recentName}>{a.title}</Paragraph>
                    </View>
                  ))}
              </ScrollView>
            </View>
          )}
        </ScrollView>
      )}

      {/* ── Achievements tab ──────────────────────────────── */}
      {tab === 'achievements' && (
        <FlatList
          data={achieveList}
          numColumns={2}
          keyExtractor={a => a.id}
          contentContainerStyle={styles.gridContent}
          columnWrapperStyle={{ gap: 12 }}
          renderItem={({ item }) => (
            <AchievementTile
              achievement={item}
              isUnlocked={!!unlocked[item.id]}
              unlockedAt={unlocked[item.id]?.unlockedAt}
            />
          )}
        />
      )}

      {/* ── Leaderboard tab ───────────────────────────────── */}
      {tab === 'leaderboard' && (
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* Podium */}
          <LinearGradient
            colors={['#1e1b4b', '#1a1d2e']}
            style={styles.podiumCard}
          >
            <View style={styles.podium}>
              {/* 2nd */}
              <View style={[styles.podiumCol, { marginBottom: 0 }]}>
                <Paragraph style={styles.podiumEmoji}>🥈</Paragraph>
                <Paragraph style={styles.podiumName}>
                  {MOCK_BOARD[1].name.split(' ')[0]}
                </Paragraph>
                <Paragraph style={styles.podiumLvl}>Lvl {MOCK_BOARD[1].level}</Paragraph>
                <View style={[styles.podiumBase, { height: 60, backgroundColor: '#475569' }]} />
              </View>
              {/* 1st */}
              <View style={[styles.podiumCol, { marginBottom: 0 }]}>
                <Icon name="workspace-premium" size={28} color="#f59e0b" style={{ marginBottom: 4 }} />
                <Paragraph style={[styles.podiumEmoji, { fontSize: 34 }]}>🥇</Paragraph>
                <Paragraph style={[styles.podiumName, { color: '#fbbf24' }]}>
                  {MOCK_BOARD[0].name.split(' ')[0]}
                </Paragraph>
                <Paragraph style={styles.podiumLvl}>Lvl {MOCK_BOARD[0].level}</Paragraph>
                <View style={[styles.podiumBase, { height: 80, backgroundColor: '#92400e' }]} />
              </View>
              {/* 3rd */}
              <View style={[styles.podiumCol, { marginBottom: 0 }]}>
                <Paragraph style={styles.podiumEmoji}>🥉</Paragraph>
                <Paragraph style={styles.podiumName}>
                  {MOCK_BOARD[2].name.split(' ')[0]}
                </Paragraph>
                <Paragraph style={styles.podiumLvl}>Lvl {MOCK_BOARD[2].level}</Paragraph>
                <View style={[styles.podiumBase, { height: 44, backgroundColor: '#7c2d12' }]} />
              </View>
            </View>
          </LinearGradient>

          {/* Full list */}
          <View style={styles.boardList}>
            {MOCK_BOARD.map(p => <LeaderboardRow key={p.rank} player={p} />)}
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f1117' },

  // Tab bar
  tabBar: {
    flexDirection: 'row', borderBottomWidth: 1,
    borderBottomColor: '#1f2937', paddingHorizontal: 8,
  },
  tabBtn: {
    flex: 1, alignItems: 'center', paddingVertical: 10, gap: 2,
  },
  tabBtnActive: {},
  tabLabel: { color: '#4b5563', fontSize: 11 },
  tabLabelActive: { color: '#a78bfa', fontWeight: '600' },
  tabDot: { width: 4, height: 4, borderRadius: 2, backgroundColor: '#a78bfa' },

  scrollContent: { padding: 16, paddingBottom: 32 },
  gridContent: { padding: 16, paddingBottom: 32 },

  // Player card
  playerCard: { borderRadius: 24, padding: 20, marginBottom: 14 },
  playerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  playerLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  avatarRing: { width: 64, height: 64, borderRadius: 32, padding: 3, justifyContent: 'center', alignItems: 'center' },
  avatarInner: {
    width: 58, height: 58, borderRadius: 29,
    backgroundColor: '#1e1b4b', justifyContent: 'center', alignItems: 'center',
  },
  avatarEmoji: { fontSize: 28 },
  playerMeta: { gap: 4 },
  playerName: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  playerBadgeRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  levelBadge: {
    backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 8,
    paddingVertical: 2, borderRadius: 10,
  },
  levelText: { color: '#fff', fontSize: 11, fontWeight: 'bold' },
  rankText: { color: '#fde68a', fontSize: 12, fontWeight: '600' },
  playerRight: { alignItems: 'flex-end', gap: 6 },
  coinBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: 'rgba(255,255,255,0.15)', paddingHorizontal: 10,
    paddingVertical: 4, borderRadius: 12,
  },
  coinEmoji: { fontSize: 16 },
  coinValue: { color: '#fff', fontWeight: 'bold', fontSize: 15 },
  streakRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  streakValue: { color: '#fb923c', fontSize: 13, fontWeight: 'bold' },
  xpSection: { marginTop: 16 },
  xpBarRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  xpLabel: { color: 'rgba(255,255,255,0.6)', fontSize: 11 },
  xpCount: { color: '#fff', fontSize: 11, fontWeight: '600' },
  xpTrack: { height: 10, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 5, overflow: 'hidden' },
  xpFill: {
    height: '100%', borderRadius: 5,
    backgroundColor: '#34d399',
  },
  quickStats: { flexDirection: 'row', marginTop: 16, gap: 0 },
  quickStat: {
    flex: 1, alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)', padding: 10,
    borderRadius: 12, marginHorizontal: 3,
  },
  qsEmoji: { fontSize: 20 },
  qsValue: { color: '#fff', fontWeight: 'bold', fontSize: 16, marginTop: 2 },
  qsLabel: { color: 'rgba(255,255,255,0.6)', fontSize: 10 },

  // Next card
  nextCard: { backgroundColor: '#1a1d2e', borderRadius: 16, padding: 16, marginBottom: 14 },
  nextRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 10 },
  nextInfo: { flex: 1 },
  nextTitle: { color: '#9ca3af', fontSize: 12, marginBottom: 2 },
  nextDesc: { color: '#fff', fontSize: 14, fontWeight: '600' },
  nextCount: { color: '#f59e0b', fontWeight: 'bold', fontSize: 16 },
  nextTrack: { height: 6, backgroundColor: '#374151', borderRadius: 3, overflow: 'hidden' },
  nextFill: { height: '100%', backgroundColor: '#f59e0b', borderRadius: 3 },

  // Recent unlocks
  recentSection: { marginBottom: 8 },
  subTitle: { color: '#fff', fontSize: 16, marginBottom: 10 },
  recentChip: {
    backgroundColor: '#1a1d2e', borderRadius: 12, padding: 10,
    alignItems: 'center', marginRight: 10, minWidth: 80,
  },
  recentEmoji: { fontSize: 24 },
  recentName: { color: '#9ca3af', fontSize: 11, marginTop: 4, textAlign: 'center' },

  // Achievement tile
  achieveTile: {
    width: CARD_W, borderRadius: 16, borderWidth: 1.5,
    padding: 14, alignItems: 'center', marginBottom: 12,
  },
  achieveIcon: { fontSize: 36, marginBottom: 6 },
  achieveTitle: { fontWeight: 'bold', fontSize: 13, textAlign: 'center', marginBottom: 4 },
  achieveDesc: { fontSize: 11, textAlign: 'center', marginBottom: 8 },
  rarityBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6, marginTop: 2 },
  rarityText: { fontSize: 10, fontWeight: 'bold' },
  unlockedDate: { color: '#4b5563', fontSize: 10, marginTop: 4 },

  // Leaderboard
  podiumCard: { borderRadius: 20, padding: 20, marginBottom: 16 },
  podium: { flexDirection: 'row', justifyContent: 'center', alignItems: 'flex-end', gap: 12 },
  podiumCol: { alignItems: 'center', width: 90 },
  podiumEmoji: { fontSize: 28, marginBottom: 4 },
  podiumName: { color: '#fff', fontWeight: 'bold', fontSize: 12, textAlign: 'center' },
  podiumLvl: { color: '#6b7280', fontSize: 11, marginBottom: 6 },
  podiumBase: { width: 70, borderRadius: 8 },
  boardList: { gap: 8 },
  boardRow: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    borderRadius: 14, padding: 14, borderWidth: 1, borderColor: '#1f2937',
  },
  boardRowMe: { borderColor: '#7c3aed' },
  rankBubble: {
    width: 36, height: 36, borderRadius: 18,
    justifyContent: 'center', alignItems: 'center',
  },
  rankNum: { fontWeight: 'bold', fontSize: 12 },
  boardEmoji: { fontSize: 20 },
  boardInfo: { flex: 1 },
  boardName: { color: '#fff', fontWeight: '600', fontSize: 14, marginBottom: 3 },
  boardMeta: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  boardLvl: { backgroundColor: '#374151', paddingHorizontal: 6, paddingVertical: 1, borderRadius: 6 },
  boardLvlText: { color: '#9ca3af', fontSize: 11 },
  boardXP: { color: '#38bdf8', fontSize: 12, fontWeight: '600' },
  youBadge: { backgroundColor: '#7c3aed', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  youText: { color: '#fff', fontSize: 11, fontWeight: 'bold' },
});