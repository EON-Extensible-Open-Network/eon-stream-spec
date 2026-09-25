# Stremio compatibility

EON Stream speaks the Stremio addon protocol so the existing ecosystem works. "Compatible
without exception" is a moving target, and pretending otherwise wastes an addon author's
afternoon. This file is the honest boundary.

Not affiliated with, endorsed by, or connected to Stremio.

## Works

- Manifest, `catalog`, `meta`, `stream`, `subtitles` over plain HTTP + JSON.
- `catalogs` with `extra` (`search`, `genre`, `skip`), `idPrefixes`, `behaviorHints`.
- Addons added by URL, configured through their own configuration page.
- Any addon that is a self-contained HTTP service. That is most of them.

## Known incompatible, by design

These are **not bugs** and issues asking us to fix them will be closed with a link here.

| Category | Why |
|---|---|
| Catalogues bound to a Stremio **account** | We have no Stremio account system and will not add one (madde 41). No login means no personalised catalogue. |
| Streams relying on Stremio's **streaming server** endpoints | That server is closed source. EON Stream uses its own engine (`eon-stream-engine`) and does not reimplement private endpoints, in particular HLS transcode paths. |
| Addons expecting **client-specific** behaviour | Anything depending on Stremio's UI internals or undocumented client quirks. |
| Addons shipping **executable client code** | EON Stream's local plugin model is declarative in v1 and sandboxed later (madde 4). |

EON Stream does not transcode: mpv plays formats a browser-based player would need converted.
That removes a whole server-side layer — and is precisely why mpv is worth its integration
cost (madde 1).

## The compatibility suite

A pinned set of popular addons runs in CI on every release (madde 1).

The rule that keeps it useful: **it never depends on third-party uptime.** Pinned addon
versions, recorded HTTP fixtures. A suite that goes red when someone else's server has a
bad afternoon stops being trusted, and an untrusted suite is worse than none.

A separate, optional job runs against live endpoints. It is allowed to fail and never
blocks a release; it exists to notice ecosystem drift early.

## Reporting a compatibility problem

Open an issue with the addon's manifest URL, its version, the failing request, and what
Stremio returns for the same request. If the addon is in a category above, say why you
think it should still work.

## Verified against real addons

The protocol client in `eon-stream-core` was exercised end to end against live
addons. Recorded here because "it should work" and "it works" are different
claims.

| Addon | Id | What was exercised |
|---|---|---|
| Cinemeta | `com.linvo.cinemeta` | manifest, 8 catalogues, catalogue paging, `search=` extra, movie `meta`, series `meta` with seasons and episodes |
| OpenSubtitles v3 | `org.stremio.opensubtitlesv3` | manifest, `subtitles` for a movie (38 tracks) |

Both are legal, first-party addons. No addon that provides infringing content is
used in development or in the suite, and none ever ships with the application
(madde 9, 29).

## Laxity a correct reader has to allow

Two things real addons do that a strict implementation would reject. Both are
compatibility requirements, not bugs in the addons.

**`null` where an array belongs.** Cinemeta sends `"videos": null`,
`"genres": null` and similar on some items. A JSON library's "use the default
when the field is missing" behaviour does **not** cover an explicit `null`, so a
strict reader refuses the single most widely used addon there is. Every
collection field must accept absent, `null`, or a value.

The line not to cross: a value of the **wrong type** is still an error. Being
forgiving about `null` is compatibility; guessing at malformed data would be
hiding bugs.

**Numbers and strings for the same field.** `imdbRating` and `releaseInfo` arrive
as either. Read them as text and do not parse unless the value is actually
needed as a number.

## Where the credentials are

An addon address can be `https://host/c/<token>/manifest.json` — the
configuration credential is **in the path**, not in a query string or a header.

The consequence is easy to get wrong: "do not log the URL" is not enough,
because logging the *path* leaks exactly the same secret. Error messages carry
neither. In `eon-stream-core` a test enforces this
(`errors_never_carry_the_addon_address`), and the fixture-based test client holds
the same line as the real one — it says only "no fixture recorded for this
request".
