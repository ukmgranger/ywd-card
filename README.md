# YWD Card

A custom Home Assistant Lovelace card with template-driven text, colours, icons, badges, flexible tap actions, and a built-in visual editor.

This card was built primarily for my own setup and my own preferences. I am sharing it in case it is useful to someone else, but it is not intended to be a polished, fully supported public project.

There is no formal support, no promised roadmap, and no guarantee that it will work perfectly in every Home Assistant setup. I may update it when it suits my own needs, but that is about the extent of it.
<img width="524" height="256" alt="ywd-card" src="https://github.com/user-attachments/assets/314a5a1c-77e2-4406-bf65-2934ff4b6c56" />

## Features

- Template-driven name, state, and secondary text
- Template-driven icon override
- Template-driven icon colour and icon background colour
- Optional badge icon and badge colour
- Built-in visual editor
- Guided tap action editor
- Optional advanced YAML editor for tap actions
- Supports plain text, JavaScript template strings, and small JavaScript return statements
- Uses the selected entity as the main source of state and attributes

## Installation

Manual installation only.

1. Copy the card JavaScript file into your Home Assistant `www` folder.

   Example:
   ```text
   /config/www/ywd-card.js
   ```

2. Go to **Settings → Dashboards → Resources**

3. Add a new resource:

   - **URL:** `/local/ywd-card.js`
   - **Type:** `JavaScript Module`

4. Refresh Home Assistant.

## Basic Example

```yaml
type: custom:ywd-card
entity: light.lounge_lamp
name_template: Lounge
state_template: ${entity.state === 'on' ? 'On' : 'Off'}
tap_action:
  action: toggle
```

## Example With Templates

```yaml
type: custom:ywd-card
entity: binary_sensor.kitchen_motion_group
name_template: Kitchen Presence
icon_template: ${entity.state === 'on' ? 'mdi:motion-sensor' : 'mdi:motion-sensor-off'}
icon_color_template: ${entity.state === 'on' ? 'var(--primary-color)' : '#9ca3af'}
bg_color_template: ${entity.state === 'on' ? 'rgba(255,255,255,0.10)' : 'rgba(156,163,175,0.15)'}
state_template: ${entity.state === 'on' ? 'Motion Detected' : 'Clear'}
secondary_template: ${entity.last_changed ? 'Last changed: ' + new Date(entity.last_changed).toLocaleTimeString() : ''}
badge_icon_template: ${entity.state === 'on' ? 'mdi:run-fast' : ''}
badge_color_template: ${entity.state === 'on' ? '#f97316' : ''}
tap_action:
  action: more-info
```

## Configuration

### Main options

| Name | Type | Default | Description |
|---|---|---|---|
| `entity` | string | required | Main entity used by the card |
| `name_template` | string | `""` | Template or text for the small label |
| `icon_template` | string | `""` | Template or text for a custom icon |
| `icon_color_template` | string | `""` | Template or text for the icon colour |
| `bg_color_template` | string | `""` | Template or text for the icon background colour |
| `state_template` | string | `""` | Template or text for the main large state |
| `secondary_template` | string | `""` | Template or text for the smaller secondary line |
| `badge_icon_template` | string | `""` | Template or text for the optional badge icon |
| `badge_color_template` | string | `""` | Template or text for the optional badge background colour |
| `tap_action` | object | `{ action: "more-info" }` | Home Assistant tap action configuration |

## Template Support

The card supports three types of input in template fields.

### 1. Plain text

```text
Lounge
```

### 2. JavaScript template strings

```text
${entity.state}
```

Example:

```text
${entity.state === 'on' ? 'On' : 'Off'}
```

### 3. Small JavaScript return statements

```javascript
return entity.state === 'on' ? 'On' : 'Off';
```

## Available Objects

The following objects are available inside template evaluation:

- `entity` — the selected entity's state object
- `states` — all Home Assistant states
- `hass` — the Home Assistant object

## Tap Actions

The card supports standard Home Assistant tap actions through the built-in editor.

### Common examples

#### More info

```yaml
tap_action:
  action: more-info
```

#### Toggle

```yaml
tap_action:
  action: toggle
```

#### Navigate

```yaml
tap_action:
  action: navigate
  navigation_path: /dashboard-mobile/lounge
```

#### URL

```yaml
tap_action:
  action: url
  url_path: https://www.home-assistant.io/
```

#### Call service

```yaml
tap_action:
  action: call-service
  service: light.turn_on
  target:
    entity_id: light.lounge_lamp
  data:
    brightness_pct: 50
```

## Notes

- The `entity` option is required
- If no custom icon is supplied, the card uses the entity's normal icon
- If a template field is blank, the card falls back to sensible defaults where applicable
- Tap action defaults to `more-info`
- The editor includes a guided tap action section, plus an advanced YAML option
- Template errors currently return the text `Error`
- Template output is inserted as HTML for the text fields, so only use trusted content

## Example Dashboard Snippet

```yaml
type: grid
columns: 2
square: false
cards:
  - type: custom:ywd-card
    entity: climate.thermostat_1
    name_template: Heating
    icon_template: mdi:radiator
    icon_color_template: ${entity.state === 'heat' ? '#f59e0b' : '#9ca3af'}
    bg_color_template: ${entity.state === 'heat' ? 'rgba(245,158,11,0.18)' : 'rgba(156,163,175,0.15)'}
    state_template: ${entity.state === 'heat' ? 'Heating' : 'Idle'}
    secondary_template: ${entity.attributes.current_temperature ? entity.attributes.current_temperature + '°C' : ''}
    tap_action:
      action: more-info

  - type: custom:ywd-card
    entity: person.martin
    name_template: Martin
    state_template: ${entity.state}
    secondary_template: ${entity.attributes.friendly_name || ''}
    tap_action:
      action: more-info
```

## Disclaimer

This card was built for my own personal use, based on how I wanted my dashboard to look and behave.

You are welcome to use it and adapt it, but there is no real support provided. I may update it for my own needs, but I am not maintaining it as a fully supported public project.

## License

Use, modify, and share at your own discretion.
