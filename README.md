# SafeSpaceApp

## Booking Flow
The booking flow has been enhanced to a 3-step wizard designed to provide a seamless scheduling experience.

### Overview
1. **Step 1: Select Date**
   - Users browse a calendar to select a preferred date.
   - Available time slots are previewed.
   
2. **Step 2: Choose Time**
   - Users can filter slots by time of day (Morning, Afternoon, Evening).
   - Precise time selection with duration details.
   
3. **Step 3: Confirm Appointment**
   - Review booking details including mentor info, date, time, and format.
   - Add optional notes.
   - Confirming submission creates a pending appointment in Supabase.

### API Endpoints Used
- `appointments` table:
  - `select`: To check for existing bookings (availability).
  - `insert`: To create a new appointment.

### State Management
Navigation parameters (`SelectDate`, `ChooseTime`, `ConfirmAppointment` routes) are used to persist booking data across the workflow, ensuring a stateless and robust experience even if the app is backgrounded.
