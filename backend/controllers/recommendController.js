import Event from "../models/Event.js";
import User from "../models/User.js";


// Simple scoring function: +weight for category match, skill overlap, availability, and locality
const scoreEventForUser = (user, event) => {
let score = 0;


// interests/category
if (user.preferences?.interests && event.category) {
if (user.preferences.interests.includes(event.category)) score += 40;
}


// skills
if (user.preferences?.skills && event.skillsRequired) {
const overlap = event.skillsRequired.filter(s => user.preferences.skills.includes(s)).length;
score += overlap * 15; // each matching skill adds score
}


// availability (very naive: match day-of-week strings if provided)
if (user.preferences?.availableDays && event.date) {
try {
const eventDay = new Date(event.date).toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
if (user.preferences.availableDays.map(d => d.toLowerCase()).includes(eventDay)) score += 20;
} catch (e) {}
}


// tags match
if (user.preferences?.tags && event.tags) {
const tagOverlap = event.tags.filter(t => user.preferences.tags.includes(t)).length;
score += tagOverlap * 5;
}


// proximity: if user has city and event has city
if (user.preferences?.city && event.city && user.preferences.city.toLowerCase() === event.city.toLowerCase()) score += 10;


return score;
};


export const recommendForUser = async (req, res) => {
try {
const { userId, limit = 5 } = req.body;


// fetch user preferences; if absent fallback to default
const user = await User.findById(userId).lean();
if (!user) return res.status(404).json({ message: 'User not found' });


const events = await Event.find({}).lean();


// compute scores
const scored = events.map(e => ({ event: e, score: scoreEventForUser(user, e) }));


// sort by score desc
scored.sort((a, b) => b.score - a.score);


// take top N
const top = scored.slice(0, limit).map(s => ({ event: s.event, score: s.score }));


// For nicer explanation, optionally use OpenAI to generate a short reason per event (if API key provided)
// But we will return the score and short reasons generated locally


const recommendations = top.map(item => ({
event: item.event,
reason: `Score ${item.score}: Matches interests/skills/availability.`
}));


res.json({ recommendations });
} catch (err) {
console.error(err);
res.status(500).json({ message: 'Recommendation error' });
}
};