import Event from "../models/Event.js";
import User from "../models/User.js";



const scoreEventForUser = (user, event) => {
let score = 0;



if (user.preferences?.interests && event.category) {
if (user.preferences.interests.includes(event.category)) score += 40;
}



if (user.preferences?.skills && event.skillsRequired) {
const overlap = event.skillsRequired.filter(s => user.preferences.skills.includes(s)).length;
score += overlap * 15; // each matching skill adds score
}



if (user.preferences?.availableDays && event.date) {
try {
const eventDay = new Date(event.date).toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
if (user.preferences.availableDays.map(d => d.toLowerCase()).includes(eventDay)) score += 20;
} catch (e) {}
}



if (user.preferences?.tags && event.tags) {
const tagOverlap = event.tags.filter(t => user.preferences.tags.includes(t)).length;
score += tagOverlap * 5;
}



if (user.preferences?.city && event.city && user.preferences.city.toLowerCase() === event.city.toLowerCase()) score += 10;


return score;
};


export const recommendForUser = async (req, res) => {
try {
const { userId, limit = 5 } = req.body;



const user = await User.findById(userId).lean();
if (!user) return res.status(404).json({ message: 'User not found' });


const events = await Event.find({}).lean();



const scored = events.map(e => ({ event: e, score: scoreEventForUser(user, e) }));



scored.sort((a, b) => b.score - a.score);



const top = scored.slice(0, limit).map(s => ({ event: s.event, score: s.score }));






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