# NGO Event Delete Functionality - Implementation Steps

## Plan Summary
- Add backend DELETE /api/ngo/events/:eventId route
- Add frontend service deleteNGOEvent(eventId)  
- Add delete button in NGOEventsListScreen.js EventCard
- Test end-to-end flow

## TODO Steps
- [x] Step 1: Edit backend/routes/ngoRoutes.js - Add DELETE route

- [x] Step 1: Edit backend/routes/ngoRoutes.js - Add DELETE route
- [x] Step 2: Edit src/services/ngoService.js - Add deleteNGOEvent function  
- [x] Step 3: Edit src/screens/ngo/NGOEventsListScreen.js - Add delete UI + logic
- [ ] Step 4: Test implementation
- [ ] Step 5: Complete task

Current: Step 4 - Testing (Manual: NGO login → create event → NGOEventsListScreen → delete button → confirm → verify gone + API/backend logs)
