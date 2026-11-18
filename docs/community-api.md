<!--
SPDX-License-Identifier: Apache-2.0
SPDX-FileCopyrightText: 2026 EON contributors
-->

# Community API — v0 (draft)

**Status: draft, unstable.** EON Stream ships a client for this API that does nothing until
the viewer enters a server address. A reference server exists —
[`eon-stream-community`](https://github.com/EON-Extensible-Open-Network/eon-stream-community),
open source and runnable by anyone — but **no server run by the project exists, and none
may** until madde 30's Faz L1 gate is met (a legal entity among the five conditions),
because accounts and user-written text are where data-protection and hosting-provider
obligations begin (madde 7, 11–14, 30, 31). Whoever runs a server is its operator, with
those obligations.

What it covers is what a film database lives on: scores and reviews, the facts people add
about titles and the people who made them, lists, charts, awards, a parental guide,
polls, skip markers for intros and credits, friends — and the moderation all of that
needs.

## Principles

- **Optional.** The viewer is fully usable without an account (madde 7). Scores and
  reviews live on the device first (`eon-ratings.json`); signing in only adds sharing.
- **Minimal.** An account is a username, an e-mail address, a password hash and an
  optional line about oneself — nothing else is asked for (madde 31). What a user
  publishes is what they write and score. **No watch history, no device data, no
  telemetry**: nothing in this contract carries what someone watched, only what they
  chose to say about it.
- **The user's to take away.** Every account can export everything held about it and
  delete itself, in one request each (madde 31's self-service rights).
- **Moderated.** Anything a user writes that others read — a review, a fact, a list, a
  poll — can be reported; facts, person details, awards and polls go through a
  moderation queue before anyone else sees them (madde 12; 5651's notice procedure).
- **No addon addresses, no stream URLs, no files.** A title is named by the id its addon
  gave it (`tt0111161`; `tt0903747:1:1` is an episode — rated only for skip markers) and
  the details the client already had: `{name, year, poster, genres, cast, director}`. The
  server keeps that copy, poster *address* included, so pages draw without anyone asking
  an addon; it stores no images.
- **Ranked by people.** Charts, "more like this" and recommendations come from the scores
  users gave and the lists they made — nothing bought, nothing promoted.

## Transport

- HTTPS only. A client refuses `http://` except for a loopback address, which exists for
  testing.
- JSON bodies, UTF-8, `Content-Type: application/json`. Only `GET`, `POST`, `PUT` and
  `DELETE`.
- Authentication: `Authorization: Bearer <token>`, the token from `POST /v0/sessions`.
  "✓" below means a token is required; "◐" means it is optional and changes the answer
  (your own vote, your private lists).
- Errors: a non-2xx status with `{"error": "<code>", "message": "<sentence>"}`. Codes:
  `taken`, `invalid`, `unauthorised`, `forbidden`, `not_found`, `rate_limited`,
  `suspended`.
- Times are Unix seconds. Usernames are 3–24 characters of `[a-z0-9_]`, compared
  case-insensitively. Pages are `?page=N` from 0, twenty items each unless stated.
- A **title** in a body is `{name, year, poster, genres, cast, director}`; only `name` is
  required. A **person id** is the person's name folded to `[a-z0-9-]`
  (`"Bryan Cranston"` → `bryan-cranston`) — the same name is the same page, which is what
  addons' metadata allows.

## Accounts and sessions

| Method and path | Auth | Body | Answer |
|---|---|---|---|
| `POST /v0/accounts` | – | `{username, email, password}` | `201 {username}`; `409 taken` |
| `POST /v0/sessions` | – | `{login, password}` — `login` is a username or e-mail | `200 {token, username, role, expires_at}`; `401 unauthorised` |
| `DELETE /v0/sessions` | ✓ | – | `204` |
| `GET /v0/me` | ✓ | – | `{username, email, role, bio, created_at}` |
| `PUT /v0/me` | ✓ | `{bio}` — up to 300 characters, or null | `200` as `GET` |
| `PUT /v0/me/password` | ✓ | `{old, new}` | `204`; every other session ends |
| `GET /v0/me/export` | ✓ | – | everything held about the account, as one JSON document |
| `DELETE /v0/me` | ✓ | – | `204`; the account and everything it wrote are gone |
| `GET /v0/me/notifications` | ✓ | – | `{items, unread}` — `{id, kind, body, at, read}`, newest fifty |
| `POST /v0/me/notifications` | ✓ | `{read: [id…]}` or `{read: "all"}` | `204` |
| `GET /v0/me/recommendations` | ✓ | – | up to forty `{type, id, title, score}` (see "More like this") |

A password is at least 10 characters and is stored only as a salted, slow hash (Argon2id
in the reference server). A session lasts thirty days. Notification kinds: `friend`
(asked or accepted), `decision` (something you wrote or reported was decided, with the
note), `list_like`, `helpful`.

## Scores and reviews

A **rating** is `{type, id, score, review, spoiler, title, at}`: `score` is 1–10, `review`
is null or up to 5000 characters, `spoiler` marks a review that gives the story away.

| Method and path | Auth | Body | Answer |
|---|---|---|---|
| `PUT /v0/ratings/{type}/{id}` | ✓ | `{score, review, spoiler, title}` | `200` the rating |
| `DELETE /v0/ratings/{type}/{id}` | ✓ | – | `204` |
| `GET /v0/titles/{type}/{id}` | ◐ | – | `{title, average, count, histogram, reviews, mine}` |
| `GET /v0/titles/{type}/{id}/reviews?page=N&sort=helpful\|newest` | ◐ | – | `{reviews, more}` |
| `PUT /v0/reviews/{username}/{type}/{id}/helpful` | ✓ | `{helpful: true\|false}` | `200 {helpful, unhelpful}` |
| `DELETE /v0/reviews/{username}/{type}/{id}/helpful` | ✓ | – | `200 {helpful, unhelpful}` |

`histogram` is ten counts, for scores 1 to 10. A review is
`{username, score, review, spoiler, at, helpful, unhelpful, my_vote}`; only ratings with
text are reviews, and the default order is by helpfulness (the lower bound of the Wilson
interval, so three votes of three do not outrank ninety of a hundred). `average` is null
below three scores, so that one person's opinion is not presented as a community's. No
one votes on their own review.

## Facts — trivia, goofs, quotes and the rest

A **fact** is something a person adds to a title's or a person's page:
`{id, kind, text, spoiler, author, at, interesting, not_interesting, my_vote}`.

Kinds for a title: `trivia`, `goof`, `quote`, `crazy_credit`, `alternate_version`,
`soundtrack`, `connection`, `keyword`, `tagline`, `synopsis`, `plot`, `location`,
`release`, `technical`, `box_office`, `faq`. For a person: `trivia`, `quote`, `bio`
(a biography paragraph), `nickname`, `trademark`, `salary`.

| Method and path | Auth | Body | Answer |
|---|---|---|---|
| `GET /v0/titles/{type}/{id}/facts?kind=K&page=N` | ◐ | – | `{facts, more, counts}` — `counts` per kind |
| `POST /v0/titles/{type}/{id}/facts` | ✓ | `{kind, text, spoiler, title}` | `202 {id, state: "pending"}` |
| `GET /v0/people/{person}/facts?kind=K&page=N` | ◐ | – | as for a title |
| `POST /v0/people/{person}/facts` | ✓ | `{kind, text, spoiler, name}` | `202 {id, state: "pending"}` |
| `PUT /v0/facts/{fact}/vote` | ✓ | `{interesting: true\|false}` | `200 {interesting, not_interesting}` |
| `DELETE /v0/facts/{fact}/vote` | ✓ | – | `200 {interesting, not_interesting}` |
| `DELETE /v0/facts/{fact}` | ✓ | – | `204` — its author withdraws it |

Text is 10–2000 characters (`keyword` and `tagline` 2–200). A fact is shown to others only
once a moderator approves it; its author sees it as pending. Facts are ordered by votes.

## Parental guide

Five categories — `sex`, `violence`, `profanity`, `substances`, `frightening` — each voted
`none`, `mild`, `moderate` or `severe`.

| Method and path | Auth | Body | Answer |
|---|---|---|---|
| `GET /v0/titles/{type}/{id}/parental` | ◐ | – | `{categories: [{category, votes: {none, mild, moderate, severe}, verdict, mine}]}` |
| `PUT /v0/titles/{type}/{id}/parental/{category}` | ✓ | `{level, title}` | `200` as `GET` |

`verdict` is the level most votes chose, null below three votes. Detailed descriptions of
scenes are facts (`kind: "parental"` is not one — they are written as `trivia` with
`spoiler`), so they go through moderation like everything else people write.

## Skip markers

Where an episode's intro, recap, credits and preview begin and end, so a player can offer
"Skip intro". Ids here may be episode ids.

| Method and path | Auth | Body | Answer |
|---|---|---|---|
| `GET /v0/segments/{type}/{id}` | – | – | `{segments: [{id, kind, start, end, score}]}` — the best of each kind |
| `POST /v0/segments/{type}/{id}` | ✓ | `{kind, start, end, duration}` | `201 {id}` |
| `PUT /v0/segments/{segment}/vote` | ✓ | `{up: true\|false}` | `200 {score}` |

`kind` is `intro`, `recap`, `credits` or `preview`; times are seconds. A marker within two
seconds of an existing one of the same kind counts as a vote for it rather than a new
one. Markers are not moderated in advance — they carry no text — but one voted below -2
is not served.

## People

| Method and path | Auth | Body | Answer |
|---|---|---|---|
| `GET /v0/people?q=<text>` | – | – | up to twenty `{id, name, known_for}` |
| `GET /v0/people/{person}` | – | – | `{id, name, born, died, birthplace, bio, known_for, filmography, awards}` |
| `POST /v0/people/{person}/edits` | ✓ | `{field, value, name}` — `field` is `born`, `died`, `birthplace` or `bio` | `202 {id, state: "pending"}` |

A **filmography** is built from the titles the server has heard of: every title whose
`cast` or `director` named the person, as `{type, id, title, role}` (`role` is `cast` or
`director`), newest first. `known_for` is the four of those with the most scores.

## Lists and the watchlist

A **list** is `{id, owner, name, description, public, ranked, kind, likes, liked, count,
updated_at, items}`; an item is `{type, id, title, note, position, at}`. `kind` is
`custom` or `watchlist`; every account has one watchlist, private unless made public.

| Method and path | Auth | Body | Answer |
|---|---|---|---|
| `GET /v0/lists?owner=<username>&page=N` | ◐ | – | `{lists, more}` — public lists, and your own private ones |
| `GET /v0/lists?sort=popular&page=N` | ◐ | – | the most liked public lists |
| `POST /v0/lists` | ✓ | `{name, description, public, ranked}` | `201` the list |
| `GET /v0/lists/{list}?page=N` | ◐ | – | the list, items fifty per page |
| `PUT /v0/lists/{list}` | ✓ | `{name, description, public, ranked}` | `200` the list |
| `DELETE /v0/lists/{list}` | ✓ | – | `204` (not the watchlist) |
| `PUT /v0/lists/{list}/items/{type}/{id}` | ✓ | `{title, note, position}` | `200` the item |
| `DELETE /v0/lists/{list}/items/{type}/{id}` | ✓ | – | `204` |
| `PUT /v0/lists/{list}/like` | ✓ | – | `200 {likes}` |
| `DELETE /v0/lists/{list}/like` | ✓ | – | `200 {likes}` |
| `GET /v0/me/watchlist` | ✓ | – | the watchlist |
| `GET /v0/titles/{type}/{id}/lists?page=N` | ◐ | – | public lists the title is on |

A list name is 1–100 characters, a description up to 1000, a note up to 500; a list holds
up to 5000 items.

## Charts

| Method and path | Auth | Body | Answer |
|---|---|---|---|
| `GET /v0/top/{type}?page=N&genre=G` | – | – | titles ranked by score: `{type, id, title, average, count, rank}` |
| `GET /v0/bottom/{type}?page=N` | – | – | the lowest, the same way |
| `GET /v0/trending/{type}?page=N` | – | – | the most scored, reviewed and listed in the last seven days: `{type, id, title, count, rank, change}` |

`top` and `bottom` list only titles with at least five scores and rank them by a Bayesian
average (the mean pulled towards the site-wide mean by a weight of five scores), so that a
title two people loved does not outrank one two thousand people rated nearly as high. The
first 250 of `top` is the chart a client calls "Top 250". `change` in `trending` is the
title's place last week minus its place now (null if it was not there).

## More like this

| Method and path | Auth | Body | Answer |
|---|---|---|---|
| `GET /v0/titles/{type}/{id}/similar` | – | – | up to twenty `{type, id, title, score, count}` |

Item-to-item: of the people who scored this title 7 or more, which other titles they also
scored 7 or more, by cosine similarity, with at least two people in common.
`GET /v0/me/recommendations` adds these up over the titles you scored 8 or more, leaving
out what you scored. Both read only scores.

## Awards

An **event** is `{id, name}` (`oscars`, `cannes`, `golden-globes`, …). A **nomination** is
`{id, event, year, category, type, title_id, title, person, won}`.

| Method and path | Auth | Body | Answer |
|---|---|---|---|
| `GET /v0/awards` | – | – | `{events}` with the years each has |
| `GET /v0/awards/{event}/{year}` | – | – | `{event, year, categories: [{category, nominations}]}` |
| `POST /v0/awards/{event}/{year}` | ✓ | `{event_name, category, type, id, title, person, won}` | `202 {id, state: "pending"}` |
| `GET /v0/titles/{type}/{id}/awards` | – | – | `{wins, nominations, items}` |

Nominations, like facts, are shown once a moderator approves them.

## Polls

| Method and path | Auth | Body | Answer |
|---|---|---|---|
| `GET /v0/polls?page=N` | ◐ | – | `{polls, more}` — approved polls, newest first |
| `GET /v0/polls/{poll}` | ◐ | – | `{id, question, author, options: [{index, label, type, id, title, votes}], total, mine}` |
| `POST /v0/polls` | ✓ | `{question, options: [{label} or {type, id, title}]}` — 2 to 20 | `202 {id, state: "pending"}` |
| `PUT /v0/polls/{poll}/vote` | ✓ | `{option}` | `200` the poll |

## People you know

| Method and path | Auth | Body | Answer |
|---|---|---|---|
| `GET /v0/users?q=<text>` | – | – | up to twenty `{username, count}` whose username starts with the text |
| `GET /v0/users/{username}` | ◐ | – | `{username, bio, count, average, histogram, ratings, lists, friend}` — `ratings` are their newest forty; `friend` is your state with them |
| `GET /v0/friends` | ✓ | – | `{friends, incoming, outgoing}`, lists of usernames |
| `POST /v0/friends/{username}` | ✓ | – | asks, or accepts an incoming request: `200 {state}` with `state` `asked` or `friends` |
| `DELETE /v0/friends/{username}` | ✓ | – | withdraws, declines, or ends a friendship: `204` |
| `GET /v0/feed` | ✓ | – | friends' newest activity, up to fifty: `{username, kind, rating or list, at}` |
| `PUT /v0/blocks/{username}` | ✓ | – | `204` — they cannot ask you, and you no longer see what they write |
| `DELETE /v0/blocks/{username}` | ✓ | – | `204` |

## Reports, moderation and appeals

| Method and path | Auth | Body | Answer |
|---|---|---|---|
| `POST /v0/reports` | ◐ | `{kind, target, reason}` | `202 {id}` |
| `GET /v0/mod/queue?kind=K&page=N` | moderator | – | `{items, more}` — pending facts, edits, nominations, polls, and open reports |
| `POST /v0/mod/queue/{item}` | moderator | `{decision, note}` — `approve`, `reject`, `remove` (take down what a report named), `dismiss` (a report) | `200` the item |
| `PUT /v0/mod/users/{username}` | moderator | `{suspended_until, note}` | `200` |
| `PUT /v0/mod/roles/{username}` | admin | `{role}` — `user`, `moderator` or `admin` | `200` |
| `GET /v0/mod/log?page=N` | moderator | – | `{entries, more}` — every decision, by whom, with its note |
| `POST /v0/appeals` | ✓ | `{decision, text}` — a log entry about you | `202 {id}` |

A report's `kind` is `review`, `fact`, `list`, `poll` or `user`; `target` is `{username}`,
`{username, type, id}` for a review, or `{id}`. A report is a notice under madde 12: it is
answered by a person, within the period the procedure sets, and the reporter — when signed
in — is told the outcome as a `decision` notification. Every moderator decision is logged
with its note, and the person it concerns can appeal it once; an appeal is decided by a
different moderator. A suspended account can sign in, read and export, but not write.

## What a server must not do

- Ask for, or keep, anything not listed here.
- Show a user's e-mail address to anyone but that user.
- Accept an addon address, a stream URL, or a file from a client.
- Rank or recommend titles by anything but what users scored, wrote and listed.
- Keep what a deleted account wrote, other than the moderation log's record that a
  decision was made.
