# Copilot Usage Insights

Track GitHub Copilot premium requests from the VS Code status bar, inspect your remaining quota in a hover tooltip, and open a full dashboard for pacing, settings, and optional billing insight.

**Current status bar widget and hover tooltip:**

![Status bar preview](assets/statusbar-preview.png)

**Current dashboard with quota, billing, and request breakdown:**

![Dashboard preview](assets/dashboard-preview.png)

## Why Install It

- See premium request usage without leaving the editor.
- Catch pacing problems early with remaining-request and requests-per-day context.
- Open one dashboard for Chat, Completions, Premium, billing, and inline display settings.
- Keep startup quiet: the extension only uses an existing GitHub session silently and waits for explicit sign-in when needed.

## How It Works

On sign-in the extension calls the GitHub Copilot internal API (`copilot_internal/user`) — the same endpoint used by other community Copilot usage tools — to read your actual premium request quota and consumption. No local estimation, no org-level data, no guessing.

If you enable billing features, the extension also calls GitHub's premium request billing usage endpoint with the additional `user` scope so it can show gross value, billed overage, and per-model request counts.

On startup the extension only attempts a silent session lookup. If no GitHub session is already available, it stays idle and waits for you to click **Sign In** or open a feature that explicitly requests access.

- **Plan detection** — your plan (Free, Pro, Pro+, Business, Enterprise) is read from the API response, not inferred from org membership.
- **Quota & usage** — exact `used / quota` numbers from GitHub, refreshed on a configurable interval.
- **Overage tracking** — if you're on a plan with paid overage, the status bar will exceed 100%.
- **Billing insight** — optional gross / net billing totals plus request-by-model data come from GitHub's billing API, not local calculations.
- **Offline recovery** — if the network is unavailable the last known values are shown; the extension retries automatically every 10 seconds.

## Status Bar & Dashboard

The status bar item sits right next to the GitHub Copilot icon and updates on every refresh. Hover over it for a quick summary popup showing usage, pacing, Chat/Completions quotas, and action links.

Click the item or run **Copilot Usage Insights: Open Details** to open the full dashboard. It includes:

- **Usage gauge** — animated SVG ring showing premium request consumption with color thresholds (green / warning / critical).
- **Key stats** — days until reset, remaining requests, pacing (requests/day to stay within quota), and reset date or active overage at a glance.
- **Quota breakdown** — Chat, Completions, and Premium Interactions cards with live usage bars and remaining counts.
- **Account info** — plan type, Chat/MCP enabled status, and membership date.
- **Billing details** — optional gross cost, billed overage, price per request, and an overage banner when paid usage is active.
- **Requests by model** — optional collapsible table showing model-level request counts, gross value, and billed amount.
- **Inline settings** — configure all status bar display options, refresh interval, bar width, thresholds, and billing toggles without leaving the dashboard.
- **Pacing indicator** — shows how many requests per day you can use to stay within your monthly quota; highlights in warning color when pace is low.

The dashboard uses VS Code CSS variables throughout, so it automatically adapts to any light, dark, or high-contrast theme.

## Status Bar Display

The status bar item is positioned immediately to the left of the GitHub Copilot icon. Two independent settings control what is shown:

### Text (`statusBarTextMode`)

| Value | Example |
|---|---|
| `percent` *(default)* | `50%` |
| `count` | `150/300` |
| `countPercent` | `150/300 (50%)` |
| `remaining` | `150 left` |
| `billedOnly` | `+$0.00` |
| `none` | *(no text — graphic only)* |

### Graphic (`statusBarGraphicMode`)

| Value | Example |
|---|---|
| `none` *(default)* | *(no graphic — text only)* |
| `segmented` | `[■■■■□□□□]` |
| `blocks` | `████░░░░` |
| `thinBlocks` | `▰▰▰▰▱▱▱▱` |
| `dots` | `••••····` |
| `circles` | `●●●●○○○○` |
| `braille` | `⣿⣿⣿⣿⣀⣀⣀⣀` |
| `rectangles` | `▮▮▮▮▯▯▯▯` |

You can combine any text mode with any graphic mode. The **Text Position** toggle (`left` / `right`) controls which side of the graphic the text appears on.

**Examples:**

| Text | Graphic | Position | Result |
|---|---|---|---|
| `percent` | `blocks` | `left` | `50% ████░░░░` |
| `percent` | `blocks` | `right` | `████░░░░ 50%` |
| `countPercent` | `segmented` | `left` | `150/300 (50%) [■■■■□□□□]` |
| `countPercent` | `circles` | `right` | `●●●●○○ 206/300 (68.5%)` |
| `remaining` | `none` | — | `94 left` |
| `none` | `circles` | — | `●●●●○○○○` |
| `billedOnly` | `none` | — | `+$0.00` |

> Both `statusBarTextMode` and `statusBarGraphicMode` cannot be `none` simultaneously — the extension falls back to `percent` text.

When billing details are enabled and available, `showCostInStatusBar` appends the billed amount to non-`billedOnly` text modes, for example `●●●●○○ 206/300 (68.5%) · $0.00`.

## Hover Tooltip

Hovering over the status bar item shows a rich popup with:
- Plan name and usage (`used / quota`, remaining)
- Chat and Completions quota status
- Optional billing summary (`Value $8.17 · billed +$0.00`) when billing details are enabled
- **Pacing line** — daily budget to last until reset (e.g. `~12 req/day to last until May 1`)
- Last updated timestamp with Refresh and Open Dashboard action links

## Commands

| Command | Description |
|---|---|
| `Copilot Usage Insights: Sign In` | Sign in with GitHub |
| `Copilot Usage Insights: Refresh` | Refresh usage data now |
| `Copilot Usage Insights: Open Details` | Open the dashboard |
| `Copilot Usage Insights: Disconnect Account` | Disconnect and clear the session |
| `Copilot Usage Insights: Open Settings` | Open extension settings |

## Settings

| Setting | Default | Description |
|---|---|---|
| `refreshIntervalMinutes` | `5` | How often to refresh (1–60 min) |
| `threshold.enabled` | `true` | Enable color-coded threshold warnings |
| `threshold.warning` | `75` | Warning color threshold (%) |
| `threshold.critical` | `90` | Critical/error color threshold (%) |
| `statusBarTextMode` | `percent` | Text portion of the status bar: `none`, `count`, `percent`, `countPercent`, `remaining`, `billedOnly` |
| `statusBarGraphicMode` | `none` | Graphic portion of the status bar: `none`, `segmented`, `blocks`, `thinBlocks`, `dots`, `circles`, `braille`, `rectangles` |
| `statusBarTextPosition` | `left` | Whether text appears `left` or `right` of the graphic |
| `segmentedBarWidth` | `8` | Number of segments in bar-style graphic modes (4–16) |
| `showBillingDetails` | `false` | Enable billing summary and overage details in the dashboard; requests the additional GitHub `user` scope when needed |
| `showBillingRequestBreakdown` | `true` | Show the Requests by Model table from the billing endpoint for models with recorded requests, even when billed overage is still `$0.00` |
| `showCostInStatusBar` | `false` | Append the billed/net amount (for example `· $1.20`) to the status bar text when billing data is available |

All settings except `threshold.*` can also be changed directly from the dashboard without opening VS Code settings.

## Privacy

The extension stores your GitHub login name plus two local preference flags in VS Code global state: whether you explicitly disconnected the extension, and whether the optional billing scope has already been granted or declined.

GitHub access tokens are managed by VS Code's built-in authentication provider and are not stored by this extension. No prompt text, response text, or editor contents are ever read or stored. All usage data is fetched from GitHub — nothing is inferred locally.

If you enable billing details, the extension requests the additional GitHub `user` scope so it can call the billing usage endpoint.

## Development

```bash
npm install
npm run build   # bundle with esbuild
npm test        # vitest unit tests
npm run check   # TypeScript type-check
```

Launch in an Extension Development Host from VS Code after building.

## Package

```bash
npm run package:vsix
```

Produces a `.vsix` in the repository root. Install via **Extensions: Install from VSIX…**.


