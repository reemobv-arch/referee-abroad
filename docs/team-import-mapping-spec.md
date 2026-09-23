# Team & fixture import — mapping spec and recommended template

Status: specification for the production build. A working demo lives in the
clickable prototype (Tournament → Teams tab → Import teams & fixtures).

## Why a flexible importer, not a fixed format

The people who deliver data are the **tournament organisers**, not individual
clubs, and they export from their own systems (Profixio / Cupmanager, US league
platforms, in-house sheets). We reviewed four real examples and they differ in
almost every way:

| File | Language | Structure | Age / gender encoding | Appointments included |
|------|----------|-----------|-----------------------|-----------------------|
| Appointments Boston | English | one Matches sheet | `TEAM_TYPE` = "U13 Boys" | yes: Referee / AR1 / AR2 / Stand-By |
| Appointmentslist (Gothia) | Swedish | one sheet per day | `Grupp` = "G18", "B16" | yes: Huvuddomare / Assisterande 1-2 / Fjärdedomare |
| referee-calendar (Cascais) | English/PT | one sheet | `Category` "Cat BI11 - 2013" + team suffix "U-13-11" | columns Referee 1-4 |
| 2026 (internal master) | Italian/English | many sheets, headers on row 9 | per-tab | n/a (our roster) |

Forcing every organiser onto one template would just push the reformatting work
back onto us. Fully automatic parsing with no confirmation is unsafe: "G18" could
be Girls-18 or Group-18, "BI11 - 2013" is opaque, and a wrong guess puts the
wrong referee on the wrong match.

**Decision: a flexible importer with auto-mapping and a one-time confirmation,
plus saved per-source profiles — and a recommended template as the easy path for
organisers without an export system.**

## Import flow

1. **Upload / paste** any CSV, TSV or Excel export.
2. **Detect the header row** automatically (it is not always row 1; some exports
   start with summary blocks).
3. **Auto-map columns** to our fields using a multilingual synonym dictionary.
4. **Normalise age and gender** from the team names or a category column.
5. **Confirmation step**: show the detected mapping and a preview; the user
   corrects anything wrong.
6. **Save the mapping as a profile** keyed to the organiser/source, so the next
   file from the same source maps automatically.

The importer produces two things:
- **Teams**: unique `club + ageGroup + gender`.
- **Fixtures** (when home/away columns exist): `time, field, home, away` plus any
  appointment columns detected. Referee names in the file map to the referee pool
  in the production build; in the prototype fixtures import unassigned.

## Target fields and synonyms

Matching is case-insensitive and substring-based; first unused column wins, in
this order.

| Field | Meaning | Header synonyms (any language) |
|-------|---------|--------------------------------|
| `home` | home team | home, hemmalag, team a, thuis, local |
| `away` | away team | away, bortalag, team b, uit, visitor, gäst |
| `team` | single team (when no home/away) | team, lag, equipo, club |
| `category` | age / gender source | category, team_type, grupp, group, klass, division, cat, age |
| `date` | match date | date, dag, day, datum, fecha, data |
| `time` | kick-off | time, tid, hour, kickoff, hora, uur |
| `field` | pitch / venue | field, venue, spelplan, pitch, plan, court, ground, campo |
| `main` | main referee | huvuddomare, referee 1, referee, main, scheidsrechter, centre, árbitro |
| `ar1` | assistant 1 | assisterande 1, ar1, referee 2, assistant 1, lineman 1 |
| `ar2` | assistant 2 | assisterande 2, ar2, referee 3, assistant 2, lineman 2 |
| `fourth` | 4th official | fjärdedomare, 4th, fourth, referee 4 |

Extend the dictionary as new organiser formats appear; new synonyms are additive
and never break existing profiles.

## Age and gender normalisation

Read from the category column first, then the team name. Rules, in order:

| Pattern | Example | Result |
|---------|---------|--------|
| Gender word | "u14girls", "U13 Boys", "flickor", "meisjes" | Girls / Boys |
| Leading letter + number | "G18", "B16" | G → Girls, B → Boys |
| Mixed / co-ed | "U12 Mixed" | Mixed |
| `U`/`O` + number | "U13", "U-13-11", "O19" | age = U13 |
| Leading letter + 2 digits | "G18", "B16" | age = U18 / U16 |
| Birth year 20xx | "Cat BI11 - 2013" | age = current season year − 2013 |
| Bare 2-digit | "14girls" | age = U14 |

When gender cannot be inferred it defaults to **Mixed** and is flagged in the
confirmation step for the user to set. The season year used for birth-year
conversion is a per-tournament setting (default: the tournament's year).

## Data model

A team is `{ club, ageGroup, gender }`. `club` is the team name with the
age/gender tokens stripped (e.g. "Team Colombia U-13-11" → "Team Colombia").
Gender is `Boys | Girls | Mixed`. Appointing stays locked until at least the
teams are imported, because there is no schedule to appoint against otherwise.

## Recommended template (for organisers without an export)

Teams only — one row per team; a club in several age groups gets one row each:

```
club,age_group,gender
Ajax,U13,Boys
Ajax,U15,Girls
Benfica,U13,Boys
Benfica,U15,Girls
```

Fixtures (optional, unlocks appointing directly):

```
date,time,field,home,away,category
2026-07-13,09:00,Pitch A,Ajax,Benfica,U13 Boys
2026-07-13,10:00,Pitch A,Sporting,Porto,U15 Girls
```

Comma or semicolon both work; a header row is recommended but optional.
