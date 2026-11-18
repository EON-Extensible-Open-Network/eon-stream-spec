<!--
SPDX-License-Identifier: Apache-2.0
SPDX-FileCopyrightText: 2026 EON contributors
-->

# Community API — v0 (draft)

**Status: draft, unstable, and implemented by no server.** EON Stream ships a client for
this API that does nothing until the viewer enters a server address. No server run by the
project exists, and none may until madde 30's Faz L1 gate is met — a legal entity among
the five conditions — because accounts and user-written reviews are where data-protection
and hosting-provider obligations begin (madde 7, 11–14, 30, 31). This document exists so
that a server, when there may be one, has a contract to meet, and so that the client can
be written and tested against it now.

## Principles

- **Optional.** The viewer is fully usable without an account (madde 7). Scores and
  reviews live on the device first (`eon-ratings.json`); signing in only adds sharing.
- **Minimal.** An account is a username, an e-mail address and a password hash — nothing
  else is asked for (madde 31). What a user publishes is their scores, their reviews and
  who they are friends with. No watch history, no device data, no telemetry.
- **The user's to take away.** Every account can export everything held about it and
  delete itself, in one request each (madde 31's self-service rights).
- **Reportable.** Any review or user can be reported (madde 12; 5651's notice procedure).
- **No addon addresses, no stream URLs.** A title is named by the id its addon gave it
  (`tt0111161`, `tt0903747:1:1` is an episode and is not rated — only titles are) and the
  name, year and poster address the client already had. The server keeps that copy of the
  poster *address* so profiles draw without anyone asking an addon; it stores no images.

## Transport

- HTTPS only. A client refuses `http://` except for a loopback address, which exists for
  testing.
- JSON bodies, UTF-8, `Content-Type: application/json`.
- Authentication: `Authorization: Bearer <token>`, the token from `POST /v0/sessions`.
- Errors: a non-2xx status with `{"error": "<code>", "message": "<sentence>"}`. Codes used
  below: `taken`, `invalid`, `unauthorised`, `not_found`, `rate_limited`.
- Times are Unix seconds. Usernames are 3–24 characters of `[a-z0-9_]`, compared
  case-insensitively.

## Accounts and sessions

| Method and path | Auth | Body | Answer |
|---|---|---|---|
| `POST /v0/accounts` | – | `{username, email, password}` | `201 {username}`; `409 taken` |
| `POST /v0/sessions` | – | `{login, password}` — `login` is a username or e-mail | `200 {token, username, expires_at}`; `401 unauthorised` |
| `DELETE /v0/sessions` | ✓ | – | `204` |
| `GET /v0/me` | ✓ | – | `{username, email, created_at}` |
| `GET /v0/me/export` | ✓ | – | everything held about the account, as one JSON document |
| `DELETE /v0/me` | ✓ | – | `204`, and the account, its scores, reviews and friendships are gone |

A password is at least 10 characters and is stored only as a salted, slow hash.

## Scores and reviews

A **rating** is `{type, id, score, review, title, at}`: `score` is 1–10, `review` is null or
up to 5000 characters, and `title` is `{name, year, poster}` as the client had it.

| Method and path | Auth | Body | Answer |
|---|---|---|---|
| `PUT /v0/ratings/{type}/{id}` | ✓ | `{score, review, title}` | `200` the rating |
| `DELETE /v0/ratings/{type}/{id}` | ✓ | – | `204` |
| `GET /v0/titles/{type}/{id}` | – | – | `{average, count, histogram, reviews}` |
| `GET /v0/titles/{type}/{id}?page=N` | – | – | the next page of `reviews` |
| `GET /v0/top/{type}?page=N` | – | – | titles ranked by score: `{type, id, title, average, count}`, twenty per page |

`top` lists only titles with at least five scores and ranks them by a Bayesian average
(the mean pulled towards the site-wide mean by a weight of five scores), so that a title
two people loved does not outrank one two thousand people rated nearly as high.

`histogram` is ten counts, for scores 1 to 10. `reviews` are `{username, score, review, at}`,
newest first, twenty per page, only those with text. `average` is null below three scores,
so that one person's opinion is not presented as a community's.

## People

| Method and path | Auth | Body | Answer |
|---|---|---|---|
| `GET /v0/users?q=<text>` | – | – | up to twenty `{username, count}` whose username starts with the text |
| `GET /v0/users/{username}` | – | – | `{username, count, average, histogram, ratings}` — `ratings` are their newest forty |
| `GET /v0/friends` | ✓ | – | `{friends, incoming, outgoing}`, lists of usernames |
| `POST /v0/friends/{username}` | ✓ | – | asks, or accepts an incoming request: `200 {state}` with `state` `asked` or `friends` |
| `DELETE /v0/friends/{username}` | ✓ | – | withdraws, declines, or ends a friendship: `204` |
| `GET /v0/feed` | ✓ | – | friends' newest ratings, `{username, rating}` each, up to fifty |

## Reports

| Method and path | Auth | Body | Answer |
|---|---|---|---|
| `POST /v0/reports` | – | `{kind, target, reason}` — `kind` is `review` or `user`; `target` is `{username}` or `{username, type, id}` | `202` |

A report is a notice under madde 12: it is answered by a person, within the period the
procedure sets, and the reporter is told the outcome.

## What a server must not do

- Ask for, or keep, anything not listed here.
- Show a user's e-mail address to anyone but that user.
- Accept an addon address, a stream URL, or a file from a client.
- Rank or recommend titles by anything but the scores users gave them.
