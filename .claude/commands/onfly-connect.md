Authenticate with the Onfly API using the MCP OAuth skill.

## Instructions

1. First check if the MCP server dependencies are installed:
   ```bash
   ls .claude/onfly-oauth-skill/node_modules
   ```
   If not, run: `cd .claude/onfly-oauth-skill && npm install && cd ../..`

2. Use the MCP tool `onfly_auth_status` to check if already authenticated

3. If not authenticated, use `onfly_connect` to start the OAuth flow
   - This opens a browser window for the user to log in at app.onfly.com
   - Wait for the callback (up to 120s)

4. After connecting, confirm the auth status and show user info

5. Available Onfly MCP tools after connecting:
   - `onfly_list_travels` — list flight orders
   - `onfly_list_hotel_orders` — list hotel bookings
   - `onfly_list_bookings` — list all bookings (flights, hotels, buses, cars)
   - Flight search, hotel search, etc.

This authenticates Claude Code (not the app's end users).
