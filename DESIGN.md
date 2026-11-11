# Rave Strangers – Design-System "NACHTSCHICHT"

The look is inspired by the scene's own visual language: label sites, flyers and timetables.
It takes no logos, wordmarks or brand elements from anyone.

## Ideas behind it
- **Timetable instead of cards.** Events appear as rows in a running order, separated by hairlines, like a club's line-up board.
- **Red is a signal.** `--accent` is used only for live/blinking, the main action, the active tab, the section number and map markers with events. It is never used for decoration.
- **Machine and human.** Everything that is data (date, time, place, labels, buttons) is set in uppercase monospace. Body text is a calm grotesk. Headlines are wide and heavy.
- **Square edges.** No border radius, 1px lines and inverted hover states (bone background, black text).
- **Grain.** A very light noise overlay over everything (`body::after`) so it doesn't look like a sterile app.

## Tokens
| Token | Value | Use |
|---|---|---|
| `--bg` | `#050505` | Ink, background |
| `--surface` / `--surface-2` | `#0c0c0d` / `#141416` | Panels, hover |
| `--line` / `--line-2` | `#222225` / `#38383d` | Hairlines, input borders |
| `--text` | `#efece6` | Bone white |
| `--muted` / `--dim` | `#8b8881` / `#5c5a55` | Secondary text |
| `--accent` | `#ff2b1c` | Signal red |

## Typography (Google Fonts, OFL)
- **Unbounded** 700/800: headlines (h1, h2) and big date numbers, always uppercase.
- **JetBrains Mono** 500–700: labels, metadata, buttons, chips, tags. Uppercase with letter spacing.
- **Inter Tight** 400–700: body text, event titles.

## Building blocks
- `.sec > h2`: automatic numbering `01`, `02`… in red mono, with a hairline above.
- `.tag`: `[ HARD TECHNO ]` in brackets. `.tag.hot` is red.
- `.ev`: date column (weekday in red, big number, month), title, meta line in mono. On hover a red bar runs down the left edge.
- `.marquee`: red ticker band with headlines on Home. Pauses on hover.
- `.btn.primary`: red with black text. `.btn.on` is an outline in red.

## Motion
Short `rise` animation when a view loads, the blinking beta square, and the marquee.
Everything is switched off under `prefers-reduced-motion`.

## Planned for the Flutter app
Use the same tokens as a `ThemeData`. Haptic feedback on "I'm going", the ticket as a wallet card, and later "rave mode" in the same style.
