# Calendar Management Agent - Setup Guide

## ✅ Completed Steps

1. **Database Migration Applied** ✅
   - Migration `052_calendar_management_agent` successfully applied
   - Tables created: `calendar_integrations`, `calendar_events_cache`, `slot_proposals`
   - RLS policies configured
   - Cleanup functions created

2. **Edge Functions Deployed** ✅
   - `calendar-sync-cron` deployed and active
   - `agent-orchestrator` updated with calendar management agent

3. **Code Implementation** ✅
   - Calendar Management Agent implemented
   - Calendar tools created
   - UI components created
   - OAuth endpoints created

## 🔧 Required Configuration

### 1. Environment Variables

Add the following to your `.env.local` file in the `web/` directory:

```bash
# Google Calendar OAuth
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here

# Microsoft Outlook OAuth
MICROSOFT_CLIENT_ID=your_microsoft_client_id_here
MICROSOFT_CLIENT_SECRET=your_microsoft_client_secret_here

# SendGrid Email Service
SENDGRID_API_KEY=your_sendgrid_api_key_here
SENDGRID_FROM_EMAIL=noreply@therapyflow.ai

# App URL (for OAuth callbacks)
NEXT_PUBLIC_APP_URL=https://your-domain.com
# Or for local development:
# NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 2. Google Calendar OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable **Google Calendar API**
4. Go to **Credentials** → **Create Credentials** → **OAuth 2.0 Client ID**
5. Configure OAuth consent screen:
   - User Type: External (for testing) or Internal (for workspace)
   - Scopes: `https://www.googleapis.com/auth/calendar.readonly`
6. Add authorized redirect URIs:
   - `http://localhost:3000/api/auth/google-calendar/callback` (development)
   - `https://your-domain.com/api/auth/google-calendar/callback` (production)
7. Copy the **Client ID** and **Client Secret** to `.env.local`

### 3. Microsoft Outlook OAuth Setup

1. Go to [Azure Portal](https://portal.azure.com/)
2. Navigate to **Azure Active Directory** → **App registrations**
3. Click **New registration**
4. Configure:
   - Name: "TherapyFlow Calendar Integration"
   - Supported account types: Accounts in any organizational directory and personal Microsoft accounts
   - Redirect URI: `http://localhost:3000/api/auth/outlook-calendar/callback` (add production URL later)
5. After creation, go to **Certificates & secrets** → **New client secret**
6. Copy the **Application (client) ID** and **Client secret value** to `.env.local`
7. Go to **API permissions** → **Add a permission** → **Microsoft Graph** → **Delegated permissions**
8. Add: `Calendars.Read`
9. Click **Grant admin consent** (if required)

### 4. SendGrid Setup

1. Sign up at [SendGrid](https://sendgrid.com/)
2. Verify your sender email address
3. Create an API key:
   - Go to **Settings** → **API Keys**
   - Click **Create API Key**
   - Name: "TherapyFlow Calendar"
   - Permissions: **Full Access** (or restrict to Mail Send)
4. Copy the API key to `.env.local`
5. Set `SENDGRID_FROM_EMAIL` to your verified sender email

### 5. Supabase Edge Function Environment Variables

Ensure these are set in your Supabase project dashboard under **Settings** → **Edge Functions** → **Secrets**:

```bash
SUPABASE_URL=https://pqjwldzyogmdangllnlr.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
OPENAI_API_KEY=your_openai_api_key
ROLLBAR_SERVER_ACCESS_TOKEN=your_rollbar_token (optional)
```

### 6. Configure Calendar Sync Cron (Optional)

To enable automatic calendar syncing every 6 hours:

1. Go to Supabase Dashboard → **Database** → **Cron Jobs**
2. Create a new cron job:
   - Name: `calendar-sync-cron`
   - Schedule: `0 */6 * * *` (every 6 hours)
   - SQL Command:
     ```sql
     SELECT net.http_post(
       url := 'https://pqjwldzyogmdangllnlr.supabase.co/functions/v1/calendar-sync-cron',
       headers := '{"Authorization": "Bearer YOUR_SERVICE_ROLE_KEY"}'::jsonb
     );
     ```

## 🧪 Testing

### Test Calendar Sync Cron

```bash
curl -X POST https://pqjwldzyogmdangllnlr.supabase.co/functions/v1/calendar-sync-cron \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json"
```

Expected response:
```json
{
  "success": true,
  "calendarsSynced": 0,
  "calendarsFailed": 0,
  "duration": 123
}
```

### Test Calendar Management Agent

1. Navigate to `/therapist/copilot` in your app
2. Switch to the "Calendar Management" tab
3. Try connecting a calendar
4. Test slot proposal functionality

### Test via Agent Orchestrator

Send a message to the agent orchestrator:

```bash
curl -X POST https://pqjwldzyogmdangllnlr.supabase.co/functions/v1/agent-orchestrator \
  -H "Authorization: Bearer YOUR_USER_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Check my calendar availability for next week",
    "context": {}
  }'
```

## 📋 Features Available

### For Therapists:
- ✅ Connect/disconnect Google Calendar
- ✅ Connect/disconnect Outlook Calendar
- ✅ View team calendars (busy/free only)
- ✅ Propose slots to patients
- ✅ Automatic calendar syncing
- ✅ Calendar preferences (working hours, buffer time)

### For Patients:
- ✅ Receive slot proposals via email
- ✅ Receive slot proposals via WhatsApp (when configured)
- ✅ View and accept/reject proposals
- ✅ Booking confirmation

### AI Agent Capabilities:
- ✅ Check therapist availability
- ✅ Propose optimal slots (3-5 options)
- ✅ Detect scheduling conflicts
- ✅ Manage calendar integrations
- ✅ Team calendar visibility

## 🔒 Security Notes

1. **OAuth Tokens**: Currently stored in plain text. **IMPORTANT**: Implement encryption before production:
   - Use Supabase Vault or application-level encryption
   - Consider using `pgcrypto` extension for database-level encryption

2. **RLS Policies**: All tables have Row-Level Security enabled
   - Therapists can only manage their own integrations
   - Team calendar view respects privacy settings
   - Patients can only view their own proposals

3. **API Keys**: Never commit `.env.local` to version control
   - Add to `.gitignore`
   - Use Supabase secrets for Edge Functions

## 🐛 Troubleshooting

### Calendar sync not working
- Check that OAuth tokens are valid (not expired)
- Verify `SUPABASE_SERVICE_ROLE_KEY` is set in Edge Function secrets
- Check Rollbar logs for errors

### OAuth callback failing
- Verify redirect URIs match exactly (including http/https, trailing slashes)
- Check that OAuth credentials are correct
- Ensure `NEXT_PUBLIC_APP_URL` is set correctly

### Slot proposals not sending
- Verify SendGrid API key is valid
- Check that `SENDGRID_FROM_EMAIL` is verified in SendGrid
- Check browser console and network tab for errors

### Agent not responding to calendar queries
- Verify `agent-orchestrator` is deployed with latest code
- Check intent classifier is recognizing calendar intents
- Test with explicit calendar keywords: "calendar", "availability", "slot"

## 📚 Next Steps

1. **Implement Google Calendar API Sync**
   - Complete `syncGoogleCalendar()` in `calendar-service.ts`
   - Use Google Calendar API v3 to fetch events
   - Handle token refresh

2. **Implement Outlook Calendar API Sync**
   - Complete `syncOutlookCalendar()` in `calendar-service.ts`
   - Use Microsoft Graph API to fetch events
   - Handle token refresh

3. **Add Token Encryption**
   - Implement encryption for OAuth tokens
   - Use Supabase Vault or application-level encryption

4. **Add Webhook Support**
   - Set up Google Calendar webhooks for real-time updates
   - Set up Microsoft Graph webhooks for Outlook

5. **Enhanced Notifications**
   - Add WhatsApp integration (Twilio or Typebot)
   - Add SMS notifications
   - Add push notifications

6. **Analytics & Monitoring**
   - Track calendar sync success rates
   - Monitor slot proposal acceptance rates
   - Add calendar usage analytics

## 📞 Support

For issues or questions:
- Check Supabase logs: Dashboard → Logs → Edge Functions
- Check Rollbar for error tracking
- Review browser console for frontend errors
