---
summary: 'ClawdHub Discord webhook events/payloads for skill publish + highlight.'
read_when:
  - Working on ClawdHub webhooks/integrations
---

# ClawdHub Webhooks (Discord)

ClawdHub can post Discord embeds when skills are published or highlighted on `hub.solanaclawd.com`.

## Setup

Set the webhook URL in the ClawdHub Convex environment:

- `DISCORD_WEBHOOK_URL` (required): Discord webhook URL.
- `DISCORD_WEBHOOK_HIGHLIGHTED_ONLY` (optional): `true` to only send for ClawdHub-highlighted skills.
- `SITE_URL` (optional): Base ClawdHub site URL for links (default `https://hub.solanaclawd.com`).

## Events

- `skill.publish`: fires on every ClawdHub publish (new or updated version).
- `skill.highlighted`: fires when a ClawdHub skill is newly highlighted.

### Highlight-only filter

When `DISCORD_WEBHOOK_HIGHLIGHTED_ONLY=true`:

- `skill.publish` only sends if the ClawdHub skill is highlighted.
- `skill.highlighted` always sends.

## Payload (Discord)

Discord receives a JSON payload with a single embed:

```json
{
  "embeds": [
    {
      "title": "Demo Skill",
      "description": "Nice skill",
      "url": "https://hub.solanaclawd.com/owner/demo-skill",
      "fields": [
        { "name": "Version", "value": "v1.2.3", "inline": true },
        { "name": "Owner", "value": "@owner", "inline": true },
        { "name": "Tags", "value": "latest, discord", "inline": false }
      ],
      "footer": { "text": "ClawdHub" }
    }
  ]
}
```
