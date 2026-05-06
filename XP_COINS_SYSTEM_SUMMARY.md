# XP & Coins System Summary

## 1. XP & Coins Update/Modification Files

### Redux Store (Frontend)
- **[gameSlice.js](src/store/gameSlice.js)** - Core XP/coins state management
  - `gainXP(amount)` - Add XP and check for level ups
  - `gainCoins(amount)` - Add coins
  - `spendCoins(amount)` - Deduct coins
  - Level up formula: `xpForNextLevel = level * 100`
  - When leveling up: +50 coins awarded per level

- **[dailyQuestSlice.js](src/store/dailyQuestSlice.js)** - Daily quest claim logic
  - `claimDailyQuest(questId)` - Mark quest as claimed
  - Tracks two quests: `DAILY_LOGIN` (+10 XP, +2 coins) and `JOIN_2_EVENTS` (+50 XP, +10 coins)

- **[achievementSlice.js](src/store/achievementSlice.js)** - Achievement unlocking
  - `unlockAchievement(achievement)` - Unlock badge and award XP/coins
  - Example: `FIRST_LOGIN` awards 50 XP + 100 coins

### Backend Database (Node.js)
- **[User.js](backend/models/User.js)** - User model stores XP/coins
  - Fields: `xp: Number` (default: 0), `coins: Number` (default: 0)
  - Also tracks achievements and daily quests per user

- **[Event.js](backend/models/Event.js)** - Event model with gamification
  - Fields: `xpReward: Number` (default: 50), `coinsReward: Number` (default: 10)
  - Registrations track attendance and certificate status

### Backend Routes
- **[dailyQuestRoutes.js](backend/routes/dailyQuestRoutes.js#L141-L165)** - Quest claiming
  - `POST /api/dailyquests/claim` - Claims quest and awards XP/coins
  - Updates: `user.xp`, `user.coins`, marks `quest.claimedToday`
  - Rewards: DAILY_LOGIN (+10 XP, +2 coins), JOIN_2_EVENTS (+50 XP, +10 coins)

- **[eventRoutes.js](backend/routes/eventRoutes.js#L15-L130)** - Event registration
  - `POST /api/events/:eventId/register` - Register student for event
  - Updates daily quest count when registering
  - Decrements `spotsAvailable`

---

## 2. Event Registration Logic

### Registration Flow
**File**: [eventRoutes.js](backend/routes/eventRoutes.js#L20)

```javascript
// Steps:
1. Check user type is "student" (line 24)
2. Validate event exists and has available spots (line 34-37)
3. Check not already registered (line 39-42)
4. Check monthly registration limit (2 events/month) (line 44-60)
5. Add registration to event.registrations array (line 65-73)
6. Decrement spotsAvailable (line 75)
7. Update user's daily quest JOIN_2_EVENTS count (line 77-100)
8. Save both event and user
```

### Frontend Registration
**Files**:
- **[EventRegistrationScreen.js](src/screens/events/EventRegistrationScreen.js#L36-L62)** - Registration form
  - Collects: name, email, phone, college
  - Pre-fills from Redux user state
  - Calls: `POST /api/events/{eventId}/register`
  - Monthly limit enforced: "You can only register for 2 events per month"

- **[EventDetailsScreen.js](src/screens/events/EventDetailsScreen.js#L6-L28)** - Details view
  - Shows registration status
  - Checks if user already registered by matching `userId` or `studentEmail`

- **[EventsScreen.js](src/screens/main/EventsScreen.js#L21-L39)** - Event listing
  - `isUserRegistered()` helper checks if student is in registrations array
  - Shows "✓ Registered" button when registered

### Database Registration Schema
**File**: [Event.js](backend/models/Event.js#L33-L52)

```javascript
registrations: [{
  userId: ObjectId,           // Link to User
  studentName: String,
  studentEmail: String,
  studentPhone: String,
  studentCollege: String,
  registeredAt: Date,         // Timestamp
  attended: Boolean,          // Set by NGO
  attendedAt: Date,
  status: 'registered|attended|completed|cancelled',
  certificateIssued: Boolean,
  certificateIssuedAt: Date,
  certificateId: ObjectId
}]
```

---

## 3. Event Details & Registration Status Display

### Frontend Screens

**[EventDetailsScreen.js](src/screens/events/EventDetailsScreen.js)**
- Shows: title, date, time, location, description
- Registration status check:
  ```javascript
  // Matches userId or studentEmail
  const isAlreadyRegistered = event.registrations.some(reg => {
    const regUserId = reg.userId?.toString();
    return regUserId === userId || 
           reg.studentEmail?.toLowerCase() === user.email?.toLowerCase();
  });
  ```
- Displays "✓ Registered" or "Register for Event" button

**[MyCompletedEventsScreen.js](src/screens/main/MyCompletedEventsScreen.js#L58-L84)**
- Filters events by:
  - Past events where `attended: true`
  - Future events where user is registered but not attended
- Shows registration status and completion status

**[EventsScreen.js](src/screens/main/EventsScreen.js#L121-L139)**
- Card view with basic event info
- Shows "✓ Registered" when user is in registrations

**[HomeScreen.js](src/screens/main/HomeScreen.js#L235-L260)**
- Event cards showing XP reward
- `+{event.xpReward} XP` displayed on registration button
- Tracks user registrations for daily quest progress

### NGO Side - Student Management
**[ManageStudentsScreen.js](src/screens/ngo/ManageStudentsScreen.js)**
- Fetches: `GET /ngo/events/{eventId}/registrations`
- Shows all registered students
- Tracks attendance status
- Can send certificates to marked attendees

---

## 4. Redux Slices for XP/Coins Management

### [gameSlice.js](src/store/gameSlice.js)
```javascript
Initial State:
{
  xp: 0,
  level: 1,
  coins: 0,
  streak: 0,
  lastLevelUp: null
}

Actions:
- gainXP(amount) 
  - Adds XP
  - Checks if xp >= xpForNextLevel(level)
  - If yes: levels up, resets XP, adds 50 coins
  - Sets lastLevelUp timestamp for UI celebration

- gainCoins(amount) 
  - Directly adds coins

- spendCoins(amount)
  - Deducts coins if balance sufficient

- setGameState(payload)
  - Load from backend: {xp, level, coins, streak, lastLevelUp}

- resetProgress()
  - Resets to initial state
```

### [dailyQuestSlice.js](src/store/dailyQuestSlice.js#L1-L140)
```javascript
Initial State - Two Daily Quests:

DAILY_LOGIN:
  - xp: 10
  - coins: 2
  - Resets at 12 AM
  - Track: claimedToday, lastClaimedAt, claimCount

JOIN_2_EVENTS:
  - xp: 50
  - coins: 10
  - Requires: eventRegistrationCount >= 2
  - Track: claimedToday, eventRegistrationCount, lastClaimedAt, claimCount

Actions:
- claimDailyQuest(questId)
  - Sets claimedToday: true
  - Increments claimCount

- setEventRegistrationCount(count)
  - Updates JOIN_2_EVENTS.eventRegistrationCount from backend

- checkAndResetDaily()
  - Checks if date changed since lastReset
  - If yes, resets all claimFlags and eventCount

- loadDailyQuestState(payload)
  - Syncs state from backend
```

### [achievementSlice.js](src/store/achievementSlice.js#L10-L50)
```javascript
Achievement rewards include:
- FIRST_LOGIN: 50 XP + 100 coins
- FIRST_COMPLETION: 0 XP + 25 coins
- LEVEL_5: 0 XP + 50 coins
- LEVEL_10: 0 XP + 150 coins
- FIRST_CERTIFICATE: 0 XP + 30 coins

Action:
- unlockAchievement(achievement)
  - Awards rewardXP + rewardCoins
  - Stores unlockedAt timestamp
  - Prevents duplicate unlocks
```

---

## 5. XP & Coins Calculation & Award Flow

### When Quest is Claimed
**Backend**: [dailyQuestRoutes.js](backend/routes/dailyQuestRoutes.js#L141-L165)
```
POST /api/dailyquests/claim { questId }
 ↓
Check user hasn't claimed today
Check event registration count (for JOIN_2_EVENTS)
 ↓
Award to user.xp and user.coins:
  DAILY_LOGIN: +10 XP, +2 coins
  JOIN_2_EVENTS: +50 XP, +10 coins
 ↓
Save user to database
Return rewards to frontend
```

**Frontend**: [HomeScreen.js](src/screens/main/HomeScreen.js#L129-L170)
```
handleClaimQuest(questId)
 ↓
Call: POST /api/dailyquests/claim
 ↓
On success:
  - dispatch(claimDailyQuest(questId))
  - dispatch(gainXP(quest.xp))
  - dispatch(gainCoins(quest.coins))
 ↓
Alert user: "+{xp} XP, +{coins} Coins"
```

### When Leveling Up
**Frontend**: [gameSlice.js](src/store/gameSlice.js#L7-L24)
```
gainXP(amount)
 ↓
state.xp += amount
while (state.xp >= xpForNextLevel(state.level)) {
  state.xp -= xpForNextLevel(state.level)  // Reset XP counter
  state.level += 1                          // Increment level
  state.coins += 50                         // Bonus coins for level up
  leveledUp = true
}
if (leveledUp) state.lastLevelUp = Date.now()
```

**Visual Indicator**: [HomeScreen.js](src/screens/main/HomeScreen.js#L60-L74)
```
useEffect(() => {
  if (lastLevelUp && lastLevelUp !== seenLevelUpAt) {
    // Show level up modal celebration
    setShowLevelUp(true)
  }
})
```

### When Achievement Unlocked
**Frontend**: [HomeScreen.js](src/screens/main/HomeScreen.js#L75-L91)
```
if (user && !user.hasReceivedFirstLoginAchievement) {
  const firstLoginAchievement = achievements['FIRST_LOGIN']
  dispatch(unlockAchievement(firstLoginAchievement))
  
  if (firstLoginAchievement.rewardXP)
    dispatch(gainXP(firstLoginAchievement.rewardXP))  // +50 XP
  if (firstLoginAchievement.rewardCoins)
    dispatch(gainCoins(firstLoginAchievement.rewardCoins))  // +100 coins
}
```

### Level Up Calculation
**Formula**: `xpForNextLevel = level * 100`

Examples:
- Level 1→2: Need 100 XP
- Level 2→3: Need 200 XP
- Level 3→4: Need 300 XP
- Level 10→11: Need 1000 XP

---

## 6. Backend XP/Coins Persistence

### User Profile Model
**File**: [User.js](backend/models/User.js#L29-L31)
```javascript
xp: { type: Number, default: 0 },
coins: { type: Number, default: 0 },
```

### Data Flow
```
Frontend Redux State (gameSlice)
        ↓↓↓ (synced on load)
Backend MongoDB User Document
     ↓
user.xp (numeric)
user.coins (numeric)
     ↓
Calculations happen on:
1. Daily quest claim - updated in DB
2. Achievement unlock - frontend only (synced via profile load)
3. Event completion - (future feature)
```

### Level Calculation Backend
**File**: [authRoutes.js](backend/routes/authRoutes.js#L20-L28)
```javascript
const calculateLevelFromXP = (totalXp) => {
  let level = 1;
  let remainingXp = totalXp || 0;
  while (remainingXp >= level * 100) {
    remainingXp -= level * 100;
    level++;
  }
  return level;
};
```

---

## 7. Event Registration System Structure

### Architecture
```
Student User
    ↓
Events Screen (View Events)
    ↓
EventDetailsScreen (View Details)
    ↓
EventRegistrationScreen (Fill Form)
    ↓
POST /api/events/{eventId}/register
    ↓
Backend:
  - Validate student + event
  - Check spots available
  - Check monthly limit (2/month)
  - Add to registrations[]
  - Update daily quest count
  ↓
Database:
  - Event.registrations[] updated
  - User.dailyQuests.JOIN_2_EVENTS.eventRegistrationCount updated
  ✓ Registration Complete
    ↓
Frontend:
  - Show "✓ Registered" status
  - Display in "My Events"
  - Track for "Join 2 Events" quest
```

### Key Validations
1. **Type Check**: Only students can register (line 24 in eventRoutes.js)
2. **Availability**: `spotsAvailable > 0`
3. **Duplicate Check**: Not already registered (email or userId match)
4. **Monthly Limit**: Max 2 registrations per month
5. **Daily Quest**: Tracks registrations for JOIN_2_EVENTS quest

### Data Stored per Registration
- Student name, email, phone, college
- Registration timestamp
- Attendance status (pending → attended)
- Certificate status
- Ultimate status (registered → attended → completed)

---

## Summary Table

| Feature | XP Gained | Coins Gained | Where |
|---------|-----------|--------------|-------|
| Daily Login (quest) | 10 | 2 | [dailyQuestRoutes.js](backend/routes/dailyQuestRoutes.js#L154) |
| Join 2 Events (quest) | 50 | 10 | [dailyQuestRoutes.js](backend/routes/dailyQuestRoutes.js#L154) |
| Level Up | — | 50 | [gameSlice.js](src/store/gameSlice.js#L18) |
| First Login Achievement | 50 | 100 | [HomeScreen.js](src/screens/main/HomeScreen.js#L80-L84) |
| Event Register | — | — | No direct reward (tracks for quest) |
| Event Complete | 50 | 10 | Event model defaults |
| Certificate | 100 | — | Future feature |

