import Event from "../models/Event.js";
import Registration from "../models/Registration.js";

export const getEvents = async (req, res) => {
  try {
    const events = await Event.find();
    res.json(events);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const registerEvent = async (req, res) => {
  try {
    const { eventId, name, email, phone } = req.body;
    const userId = req.user?.id || null; // if auth provided

    const registration = new Registration({
      eventId,
      name,
      email,
      phone,
      userId
    });

    await registration.save();

    // Optionally decrement spotsAvailable
    const event = await Event.findById(eventId);
    if (event && typeof event.spotsAvailable === "number") {
      event.spotsAvailable = Math.max(0, event.spotsAvailable - 1);
      await event.save();
    }

    res.json({ message: "Registered successfully!" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
