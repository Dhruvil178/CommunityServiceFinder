import React, { useState } from 'react';
import { Calendar, Search, User, Award, Home, MessageCircle, ChevronRight, MapPin, Clock, Users, TrendingUp, Star, Share2, Trophy, Zap, Target, Gift, Flame, Shield, Swords, Crown } from 'lucide-react';

const GamifiedDashboard = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showQuest, setShowQuest] = useState(false);

  // Gamification data
  const userData = {
    name: 'Dhruvil',
    level: 7,
    currentXP: 450,
    xpToNextLevel: 600,
    coins: 1240,
    streak: 12,
    totalQuests: 45,
    achievements: 18,
    rank: 'Bronze Hero'
  };

  const dailyQuests = [
    { id: 1, title: 'Share an hour on social media', xp: 25, coins: 5, progress: 0, total: 1, icon: '📱', completed: false },
    { id: 2, title: 'Join 2 volunteer events', xp: 50, coins: 10, progress: 1, total: 2, icon: '🎯', completed: false },
    { id: 3, title: 'Earn a new skill badge', xp: 40, coins: 8, progress: 0, total: 1, icon: '⭐', completed: false }
  ];

  const weeklyQuests = [
    { id: 4, title: 'Complete 5 volunteer hours', xp: 100, coins: 25, progress: 3.5, total: 5, icon: '⏰', completed: false },
    { id: 5, title: 'Recruit 3 new volunteers', xp: 150, coins: 30, progress: 1, total: 3, icon: '👥', completed: false }
  ];

  const trendingEvents = [
    {
      id: 1,
      title: 'Food Distribution Drive',
      date: '20D • 17.10.45',
      location: 'Ngo Praire',
      category: 'Community',
      xpReward: 100,
      volunteers: 45,
      volunteersNeeded: 60,
      urgency: 'high',
      badge: 'Volunteers Needed',
      image: 'https://images.unsplash.com/photo-1593113598332-cd288d649433?w=800&auto=format&fit=crop'
    },
    {
      id: 2,
      title: 'Beach Clean Drive',
      date: '20D • 10.29B',
      location: 'Sunset Beach',
      category: 'Environment',
      xpReward: 80,
      volunteers: 32,
      volunteersNeeded: 40,
      urgency: 'medium',
      badge: 'Ongoing Beta',
      image: 'https://images.unsplash.com/photo-1618477461853-cf6ed80faba5?w=800&auto=format&fit=crop'
    },
    {
      id: 3,
      title: 'Teaching Workshop',
      date: '20D • 15.45',
      location: 'City Library',
      category: 'Education',
      xpReward: 120,
      volunteers: 18,
      volunteersNeeded: 25,
      urgency: 'low',
      badge: 'Sign Up Open',
      image: 'https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?w=800&auto=format&fit=crop'
    }
  ];

  const achievements = [
    { id: 1, title: 'First Steps', desc: 'Complete your first quest', icon: '🎯', unlocked: true, rarity: 'common' },
    { id: 2, title: 'Team Player', desc: 'Join 10 events', icon: '👥', unlocked: true, rarity: 'common' },
    { id: 3, title: 'Marathon Runner', desc: '50 hours volunteered', icon: '⚡', unlocked: true, rarity: 'rare' },
    { id: 4, title: 'Rising Star', desc: 'Reach Level 5', icon: '⭐', unlocked: true, rarity: 'rare' },
    { id: 5, title: 'Community Champion', desc: '100 hours served', icon: '👑', unlocked: false, rarity: 'epic' },
    { id: 6, title: 'Legend', desc: 'Reach Level 20', icon: '🏆', unlocked: false, rarity: 'legendary' }
  ];

  const leaderboard = [
    { rank: 1, name: 'Alex Johnson', level: 15, xp: 8450, avatar: '👨' },
    { rank: 2, name: 'Sarah Chen', level: 14, xp: 7890, avatar: '👩' },
    { rank: 3, name: 'Dhruvil', level: 7, xp: 2450, avatar: '🧑', isCurrentUser: true },
    { rank: 4, name: 'Mike Ross', level: 6, xp: 2100, avatar: '👨' },
    { rank: 5, name: 'Emma Davis', level: 5, xp: 1850, avatar: '👩' }
  ];

  const GamifiedDashboard = () => (
    <div className="space-y-6 pb-24">
      {/* Player Card */}
      <div className="relative overflow-hidden bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 rounded-3xl p-6 shadow-2xl">
        <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -mr-20 -mt-20"></div>
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/10 rounded-full -ml-16 -mb-16"></div>
        
        <div className="relative flex items-start justify-between mb-4">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center text-2xl font-bold border-4 border-white shadow-lg">
                🧑
              </div>
              <div className="absolute -bottom-1 -right-1 bg-green-500 border-2 border-white rounded-full w-5 h-5 flex items-center justify-center">
                <Zap className="w-3 h-3 text-white" />
              </div>
            </div>
            <div>
              <h2 className="text-white text-xl font-bold">{userData.name}</h2>
              <div className="flex items-center gap-2 mt-1">
                <span className="bg-white/20 backdrop-blur-sm text-white text-xs font-bold px-2 py-0.5 rounded-full">
                  Lvl {userData.level}
                </span>
                <span className="text-yellow-300 text-xs font-semibold">{userData.rank}</span>
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="flex items-center gap-1 bg-yellow-500/20 backdrop-blur-sm px-3 py-1 rounded-full mb-2">
              <span className="text-2xl">🪙</span>
              <span className="text-white font-bold">{userData.coins}</span>
            </div>
            <div className="flex items-center gap-1 text-orange-300 text-sm">
              <Flame className="w-4 h-4" />
              <span className="font-bold">{userData.streak} days</span>
            </div>
          </div>
        </div>

        {/* XP Bar */}
        <div className="relative mt-4">
          <div className="flex justify-between text-xs text-white/80 mb-2">
            <span>Level {userData.level}</span>
            <span>{userData.currentXP}/{userData.xpToNextLevel} XP</span>
            <span>Level {userData.level + 1}</span>
          </div>
          <div className="w-full bg-white/20 rounded-full h-3 overflow-hidden">
            <div 
              className="bg-gradient-to-r from-green-400 to-cyan-400 h-3 rounded-full transition-all duration-500 shadow-lg"
              style={{ width: `${(userData.currentXP / userData.xpToNextLevel) * 100}%` }}
            >
              <div className="h-full bg-gradient-to-r from-white/30 to-transparent"></div>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-3 mt-4">
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 text-center">
            <div className="text-2xl mb-1">🎯</div>
            <div className="text-white font-bold text-lg">{userData.totalQuests}</div>
            <div className="text-white/70 text-xs">Quests</div>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 text-center">
            <div className="text-2xl mb-1">🏆</div>
            <div className="text-white font-bold text-lg">{userData.achievements}</div>
            <div className="text-white/70 text-xs">Achievements</div>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 text-center">
            <div className="text-2xl mb-1">👥</div>
            <div className="text-white font-bold text-lg">#3</div>
            <div className="text-white/70 text-xs">Rank</div>
          </div>
        </div>
      </div>

      {/* Daily Quests */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Target className="w-6 h-6 text-purple-400" />
            <h3 className="text-xl font-bold text-white">Daily Quests</h3>
          </div>
          <span className="text-purple-400 text-sm">Reset in 8h</span>
        </div>
        <div className="space-y-3">
          {dailyQuests.map(quest => (
            <div key={quest.id} className="bg-gradient-to-r from-slate-800 to-slate-900 rounded-2xl p-4 border-2 border-purple-500/30 hover:border-purple-500/60 transition-all">
              <div className="flex items-start gap-3">
                <div className="text-4xl">{quest.icon}</div>
                <div className="flex-1">
                  <h4 className="text-white font-semibold mb-2">{quest.title}</h4>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="flex items-center gap-1 text-cyan-400 text-sm">
                      <Zap className="w-4 h-4" />
                      <span className="font-bold">+{quest.xp} XP</span>
                    </div>
                    <div className="flex items-center gap-1 text-yellow-400 text-sm">
                      <span>🪙</span>
                      <span className="font-bold">+{quest.coins}</span>
                    </div>
                  </div>
                  {quest.progress > 0 && (
                    <div className="w-full bg-slate-700 rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all"
                        style={{ width: `${(quest.progress / quest.total) * 100}%` }}
                      ></div>
                    </div>
                  )}
                </div>
                <button className="bg-purple-600 hover:bg-purple-500 text-white font-bold px-4 py-2 rounded-xl transition-all">
                  Start
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Weekly Challenges */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Trophy className="w-6 h-6 text-yellow-400" />
            <h3 className="text-xl font-bold text-white">Weekly Challenges</h3>
          </div>
          <span className="text-yellow-400 text-sm">3 days left</span>
        </div>
        <div className="space-y-3">
          {weeklyQuests.map(quest => (
            <div key={quest.id} className="bg-gradient-to-r from-yellow-900/30 to-orange-900/30 rounded-2xl p-4 border-2 border-yellow-500/50">
              <div className="flex items-start gap-3">
                <div className="text-4xl">{quest.icon}</div>
                <div className="flex-1">
                  <h4 className="text-white font-semibold mb-2">{quest.title}</h4>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="flex items-center gap-1 text-cyan-400 text-sm">
                      <Zap className="w-4 h-4" />
                      <span className="font-bold">+{quest.xp} XP</span>
                    </div>
                    <div className="flex items-center gap-1 text-yellow-400 text-sm">
                      <span>🪙</span>
                      <span className="font-bold">+{quest.coins}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-slate-700 rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-yellow-500 to-orange-500 h-2 rounded-full transition-all"
                        style={{ width: `${(quest.progress / quest.total) * 100}%` }}
                      ></div>
                    </div>
                    <span className="text-slate-400 text-xs">{quest.progress}/{quest.total}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Trending Events */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-green-400" />
            <h3 className="text-xl font-bold text-white">Trending Events</h3>
          </div>
          <button onClick={() => setActiveTab('events')} className="text-green-400 text-sm font-semibold">View All</button>
        </div>
        <div className="space-y-4">
          {trendingEvents.slice(0, 2).map(event => (
            <div key={event.id} className="bg-slate-800 rounded-2xl overflow-hidden border border-slate-700 hover:border-purple-500/50 transition-all">
              <div className="h-32 relative overflow-hidden">
                <img src={event.image} alt={event.title} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                <div className="absolute top-2 right-2 bg-yellow-500 text-black text-xs font-bold px-2 py-1 rounded-lg">
                  {event.badge}
                </div>
                <div className="absolute top-2 left-2 bg-purple-600/90 backdrop-blur-sm text-white text-xs font-bold px-2 py-1 rounded-lg flex items-center gap-1">
                  <Zap className="w-3 h-3" />
                  +{event.xpReward} XP
                </div>
              </div>
              <div className="p-4">
                <h4 className="text-white font-bold mb-2">{event.title}</h4>
                <div className="flex items-center gap-3 text-xs text-slate-400 mb-3">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {event.date}
                  </span>
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    {event.location}
                  </span>
                </div>
                <div className="flex items-center gap-2 mb-3">
                  <div className="flex-1 bg-slate-700 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-green-500 to-cyan-500 h-2 rounded-full"
                      style={{ width: `${(event.volunteers / event.volunteersNeeded) * 100}%` }}
                    ></div>
                  </div>
                  <span className="text-xs text-slate-400">{event.volunteers}/{event.volunteersNeeded}</span>
                </div>
                <button className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold py-2.5 rounded-xl transition-all">
                  Join Quest
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const EventsView = () => (
    <div className="space-y-6 pb-24">
      {/* Search & Filter */}
      <div className="relative">
        <input 
          type="text" 
          placeholder="Search quests..." 
          className="w-full bg-slate-800 border-2 border-purple-500/30 text-white rounded-2xl pl-12 pr-4 py-3.5 focus:outline-none focus:border-purple-500"
        />
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2">
        {['All', 'Environment', 'Community', 'Education', 'Health'].map((filter, i) => (
          <button 
            key={filter}
            className={`px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition-all ${
              i === 0
                ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg' 
                : 'bg-slate-800 text-slate-300 border-2 border-slate-700 hover:border-purple-500/50'
            }`}
          >
            {filter}
          </button>
        ))}
      </div>

      {/* Event Quests */}
      <div className="space-y-4">
        {trendingEvents.map(event => (
          <div key={event.id} className="bg-slate-800 rounded-2xl overflow-hidden border-2 border-slate-700 hover:border-purple-500/50 transition-all">
            <div className="h-48 relative overflow-hidden">
              <img src={event.image} alt={event.title} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
              
              <div className="absolute top-3 right-3 bg-yellow-500 text-black text-xs font-bold px-3 py-1.5 rounded-full shadow-lg">
                {event.badge}
              </div>
              
              <div className="absolute top-3 left-3 flex flex-col gap-2">
                <div className="bg-purple-600/90 backdrop-blur-sm text-white text-sm font-bold px-3 py-1.5 rounded-full flex items-center gap-1">
                  <Zap className="w-4 h-4" />
                  +{event.xpReward} XP
                </div>
                <div className="bg-orange-600/90 backdrop-blur-sm text-white text-xs font-bold px-3 py-1.5 rounded-full">
                  {event.category}
                </div>
              </div>

              <div className="absolute bottom-3 left-3 right-3">
                <h3 className="text-white font-bold text-xl mb-2">{event.title}</h3>
                <div className="flex items-center gap-3 text-xs text-white/80">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {event.date}
                  </span>
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    {event.location}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-slate-400 text-sm">Volunteers</span>
                <span className="text-white font-bold">{event.volunteers}/{event.volunteersNeeded}</span>
              </div>
              <div className="w-full bg-slate-700 rounded-full h-2.5 mb-4">
                <div 
                  className="bg-gradient-to-r from-green-500 to-cyan-500 h-2.5 rounded-full transition-all"
                  style={{ width: `${(event.volunteers / event.volunteersNeeded) * 100}%` }}
                ></div>
              </div>
              <button className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold py-3 rounded-xl transition-all shadow-lg">
                Accept Quest
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const AchievementsView = () => (
    <div className="space-y-6 pb-24">
      <div className="bg-gradient-to-br from-yellow-600 via-orange-600 to-red-600 rounded-3xl p-6 text-white shadow-2xl">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold mb-1">Achievement Hunter</h2>
            <p className="text-white/80 text-sm">{userData.achievements} unlocked</p>
          </div>
          <Trophy className="w-12 h-12 text-yellow-300" />
        </div>
        <div className="bg-white/20 rounded-full h-3 overflow-hidden">
          <div 
            className="bg-white h-3 rounded-full transition-all"
            style={{ width: `${(userData.achievements / achievements.length) * 100}%` }}
          ></div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {achievements.map(achievement => (
          <div 
            key={achievement.id}
            className={`rounded-2xl p-4 border-2 transition-all ${
              achievement.unlocked 
                ? achievement.rarity === 'legendary' 
                  ? 'bg-gradient-to-br from-yellow-900/40 to-orange-900/40 border-yellow-500 shadow-lg shadow-yellow-500/20'
                  : achievement.rarity === 'epic'
                  ? 'bg-gradient-to-br from-purple-900/40 to-pink-900/40 border-purple-500 shadow-lg shadow-purple-500/20'
                  : achievement.rarity === 'rare'
                  ? 'bg-gradient-to-br from-blue-900/40 to-cyan-900/40 border-blue-500'
                  : 'bg-slate-800 border-slate-600'
                : 'bg-slate-900 border-slate-800 opacity-50'
            }`}
          >
            <div className="text-4xl mb-2 text-center">{achievement.icon}</div>
            <h4 className={`font-bold text-center mb-1 ${achievement.unlocked ? 'text-white' : 'text-slate-600'}`}>
              {achievement.title}
            </h4>
            <p className={`text-xs text-center ${achievement.unlocked ? 'text-slate-400' : 'text-slate-700'}`}>
              {achievement.desc}
            </p>
            {achievement.unlocked && (
              <div className="mt-2 text-center">
                <span className={`text-xs font-bold px-2 py-1 rounded-full ${
                  achievement.rarity === 'legendary' ? 'bg-yellow-500/20 text-yellow-400'
                  : achievement.rarity === 'epic' ? 'bg-purple-500/20 text-purple-400'
                  : achievement.rarity === 'rare' ? 'bg-blue-500/20 text-blue-400'
                  : 'bg-slate-700 text-slate-400'
                }`}>
                  {achievement.rarity.toUpperCase()}
                </span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );

  const LeaderboardView = () => (
    <div className="space-y-6 pb-24">
      {/* Top 3 Podium */}
      <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-3xl p-6 border-2 border-slate-700">
        <div className="flex items-end justify-center gap-4 mb-6">
          {/* 2nd Place */}
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 bg-gradient-to-br from-slate-400 to-slate-500 rounded-full flex items-center justify-center text-2xl mb-2 border-4 border-slate-600">
              {leaderboard[1].avatar}
            </div>
            <div className="text-white font-bold text-sm">{leaderboard[1].name.split(' ')[0]}</div>
            <div className="text-slate-400 text-xs">Lvl {leaderboard[1].level}</div>
            <div className="bg-slate-700 rounded-t-2xl px-6 py-3 mt-2">
              <div className="text-3xl text-center">🥈</div>
            </div>
          </div>

          {/* 1st Place */}
          <div className="flex flex-col items-center -mt-4">
            <Crown className="w-8 h-8 text-yellow-400 mb-2 animate-bounce" />
            <div className="w-20 h-20 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center text-3xl mb-2 border-4 border-yellow-500">
              {leaderboard[0].avatar}
            </div>
            <div className="text-white font-bold">{leaderboard[0].name.split(' ')[0]}</div>
            <div className="text-yellow-400 text-xs font-bold">Lvl {leaderboard[0].level}</div>
            <div className="bg-gradient-to-br from-yellow-600 to-orange-600 rounded-t-2xl px-8 py-4 mt-2">
              <div className="text-4xl text-center">🥇</div>
            </div>
          </div>

          {/* 3rd Place */}
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 bg-gradient-to-br from-orange-600 to-orange-700 rounded-full flex items-center justify-center text-2xl mb-2 border-4 border-orange-700">
              {leaderboard[2].avatar}
            </div>
            <div className="text-white font-bold text-sm">{leaderboard[2].name.split(' ')[0]}</div>
            <div className="text-slate-400 text-xs">Lvl {leaderboard[2].level}</div>
            <div className="bg-orange-900/50 rounded-t-2xl px-6 py-2 mt-2">
              <div className="text-3xl text-center">🥉</div>
            </div>
          </div>
        </div>
      </div>

      {/* Full Rankings */}
      <div className="space-y-3">
        {leaderboard.map(player => (
          <div 
            key={player.rank}
            className={`rounded-2xl p-4 flex items-center gap-4 transition-all ${
              player.isCurrentUser 
                ? 'bg-gradient-to-r from-purple-900/50 to-pink-900/50 border-2 border-purple-500 shadow-lg'
                : 'bg-slate-800 border border-slate-700'
            }`}
          >
            <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-xl ${
              player.rank === 1 ? 'bg-gradient-to-br from-yellow-400 to-orange-500 text-white'
              : player.rank === 2 ? 'bg-gradient-to-br from-slate-400 to-slate-500 text-white'
              : player.rank === 3 ? 'bg-gradient-to-br from-orange-600 to-orange-700 text-white'
              : 'bg-slate-700 text-slate-300'
            }`}>
              #{player.rank}
            </div>
            <div className="text-3xl">{player.avatar}</div>
            <div className="flex-1">
              <div className="text-white font-bold">{player.name}</div>
              <div className="flex items-center gap-2">
                <span className="bg-slate-700 text-slate-300 text-xs px-2 py-0.5 rounded-full">Lvl {player.level}</span>
                <span className="text-cyan-400 text-xs flex items-center gap-1">
                  <Zap className="w-3 h-3" />
                  {player.xp} XP
                </span>
              </div>
            </div>
            {player.isCurrentUser && (
              <span className="bg-purple-600 text-white text-xs font-bold px-3 py-1 rounded-full">YOU</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0f1117]">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-900 via-purple-900 to-pink-900 sticky top-0 z-10 shadow-2xl border-b-2 border-purple-500/30">
        <div className="max-w-md mx-auto px-6 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            {activeTab === 'dashboard' && (
              <>
                <Swords className="w-6 h-6 text-purple-400" />
                Gamified Dashboard
              </>
            )}
            {activeTab === 'events' && (
              <>
                <Target className="w-6 h-6 text-green-400" />
                Upcoming Quests
              </>
            )}
            {activeTab === 'achievements' && (
              <>
                <Trophy className="w-6 h-6 text-yellow-400" />
                Achievements
              </>
            )}
            {activeTab === 'leaderboard' && (
              <>
                <Crown className="w-6 h-6 text-yellow-400" />
                Leaderboard
              </>
            )}
            {activeTab === 'profile' && (
              <>
                <Shield className="w-6 h-6 text-blue-400" />
                Profile
              </>
            )}
          </h1>
          <button className="bg-gradient-to-r from-purple-600 to-pink-600 text-white p-2 rounded-full hover:scale-110 transition-all shadow-lg">
            <MessageCircle className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-md mx-auto px-6 py-6">
        {activeTab === 'dashboard' && <GamifiedDashboard />}
        {activeTab === 'events' && <EventsView />}
        {activeTab === 'achievements' && <AchievementsView />}
        {activeTab === 'leaderboard' && <LeaderboardView />}
        {activeTab === 'profile' && (
          <div className="pb-24">
            <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-3xl p-6 border-2 border-slate-700 text-center">
              <div className="w-24 h-24 bg-gradient-to-br from-purple-600 to-pink-600 rounded-full mx-auto flex items-center justify-center text-5xl mb-4 border-4 border-purple-400">
                🧑
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">{userData.name}</h2>
              <div className="flex items-center justify-center gap-2 mb-4">
                <span className="bg-purple-600 text-white px-3 py-1 rounded-full text-sm font-bold">
                  Level {userData.level}
                </span>
                <span className="text-yellow-400 font-bold">{userData.rank}</span>
              </div>
              
              <div className="grid grid-cols-2 gap-3 mt-6">
                <div className="bg-slate-800/50 rounded-xl p-3">
                  <div className="text-cyan-400 text-2xl font-bold">{userData.currentXP}</div>
                  <div className="text-slate-400 text-xs">Total XP</div>
                </div>
                <div className="bg-slate-800/50 rounded-xl p-3">
                  <div className="text-yellow-400 text-2xl font-bold">{userData.coins}</div>
                  <div className="text-slate-400 text-xs">Coins</div>
                </div>
                <div className="bg-slate-800/50 rounded-xl p-3">
                  <div className="text-orange-400 text-2xl font-bold">{userData.streak}</div>
                  <div className="text-slate-400 text-xs">Day Streak</div>
                </div>
                <div className="bg-slate-800/50 rounded-xl p-3">
                  <div className="text-green-400 text-2xl font-bold">{userData.totalQuests}</div>
                  <div className="text-slate-400 text-xs">Quests Done</div>
                </div>
              </div>
            </div>

            <div className="mt-6 space-y-3">
              <button className="w-full bg-purple-600 hover:bg-purple-500 text-white font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2">
                <User className="w-5 h-5" />
                Edit Profile
              </button>
              <button className="w-full bg-slate-800 hover:bg-slate-700 text-white font-bold py-3 rounded-xl transition-all border border-slate-700">
                Logout
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-slate-900/95 backdrop-blur-lg border-t-2 border-purple-500/30 z-20">
        <div className="max-w-md mx-auto px-6 py-2">
          <div className="flex justify-around items-center">
            {[
              { id: 'dashboard', icon: Home, label: 'Dashboard' },
              { id: 'events', icon: Calendar, label: 'Find Events' },
              { id: 'achievements', icon: Trophy, label: 'Achievements' },
              { id: 'leaderboard', icon: TrendingUp, label: 'Leaderboard' },
              { id: 'profile', icon: User, label: 'Profile' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex flex-col items-center py-2 px-2 rounded-xl transition-all ${
                  activeTab === tab.id 
                    ? 'text-purple-400 scale-110' 
                    : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                <tab.icon className={`w-6 h-6 mb-1 ${activeTab === tab.id ? 'drop-shadow-glow' : ''}`} />
                <span className="text-xs font-medium">{tab.label}</span>
                {activeTab === tab.id && (
                  <div className="w-1 h-1 bg-purple-400 rounded-full mt-1"></div>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        .animate-bounce {
          animation: bounce 2s infinite;
        }
        .drop-shadow-glow {
          filter: drop-shadow(0 0 8px currentColor);
        }
      `}</style>
    </div>
  );
};

export default GamifiedDashboard;