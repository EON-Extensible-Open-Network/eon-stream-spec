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
