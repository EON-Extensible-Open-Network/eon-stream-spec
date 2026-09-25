# Remote addon protocol

**Status: DRAFT, `v0`, unstable.** Tracks the Stremio addon protocol; see
[`compatibility.md`](compatibility.md) for the boundary.

A remote addon is an independent HTTP service returning JSON. It **never runs code on the
user's device**, which is why it is the low-risk extension point and the only one enabled
in v1 (madde 4).

## Endpoints

Base URL is whatever the user added. `{...}` are path segments, URL-encoded.

| Method | Path | Returns |
|---|---|---|
| GET | `/manifest.json` | the manifest (`schemas/addon-manifest.v0.schema.json`) |
| GET | `/catalog/{type}/{id}.json` | `{ "metas": [...] }` |
| GET | `/catalog/{type}/{id}/{extra}.json` | filtered catalogue; `extra` is `key=value` pairs joined by `&` |
| GET | `/meta/{type}/{id}.json` | `{ "meta": {...} }` |
| GET | `/stream/{type}/{id}.json` | `{ "streams": [...] }` |
| GET | `/subtitles/{type}/{id}.json` | `{ "subtitles": [...] }` |

A resource not declared in the manifest is never requested. An addon that declares
`idPrefixes` is only asked about ids carrying one of them.

## Client obligations

The host, not the module, talks to addons. Rules the client follows:

- **HTTPS strongly preferred.** Plain HTTP is accepted only for loopback, and the user is
  told once, clearly.
- **Timeouts and caps.** Per-request timeout and a maximum response size. A slow or
  enormous addon degrades itself, never the application.
- **No addon URL leaves the device.** Addon URLs can embed credentials in their
  configuration path; they are never sent anywhere, never logged, and not exposed to
  modules (`addons.read` returns ids and names only).
- **Failures are per-addon.** One failing addon does not empty a merged catalogue; the user
  sees which addon failed.
- **No implicit retries** beyond one, and never on a non-idempotent path.
- **Responses are untrusted input.** Validated before use; a hostile addon is an explicit
  threat in the model (madde 37, `SECURITY.md`).

## Errors

An addon signals failure with an HTTP status. `{ "err": "..." }` with 200 is accepted for
compatibility but discouraged. Clients surface the addon's name and a human-readable
reason - never a bare stack trace.

## Stream objects

A stream points at playable media: a direct URL, an `infoHash` (+ optional `fileIdx`) for
BitTorrent, or an external URL the client opens in a browser rather than playing.

EON Stream hands URLs and info hashes to `eon-stream-engine`, which serves them over a local HTTP
endpoint that mpv reads. **No transcoding happens** at any point (madde 1).

## To be written

- Exact `extra` encoding and reserved keys.
- `meta` object field reference (currently: as Stremio defines it).
- Caching and revalidation guidance - what a client may cache, for how long.
- Configuration page conventions (`behaviorHints.configurable`).
