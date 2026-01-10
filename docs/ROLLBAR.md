# Rollbar Error Tracking

## Environment Variables
- `ROLLBAR_ACCESS_TOKEN`: POST_CLIENT_ITEM token (mobile/web client)
- `ROLLBAR_POST_SERVER_ITEM_TOKEN`: POST_SERVER_ITEM token (source maps, server)
- `ROLLBAR_ENVIRONMENT`: development/staging/production

## Testing Locally
1. Ensure `.env` has valid tokens
2. Add test error: `throw new Error('Test')`
3. Check Rollbar dashboard (filter by environment)

## Source Maps
- Mobile: Run `npm run upload-sourcemaps:ios/android` after build
- Web: Automatic via webpack plugin on `next build`

## Person Tracking
- Automatically tracks authenticated users
- View affected users in Rollbar → People tab

## Best Practices
- Use `reportError()` for caught exceptions
- Use `reportInfo()` for important events
- Add context: `reportError(err, 'PaymentFlow', {orderId: 123})`
- Never log sensitive data (passwords, tokens, PII)
