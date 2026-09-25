# Material package format

**Status: DRAFT, `v0`, unstable.** Descriptor schema: `schemas/package.v0.schema.json`.

> The user-facing name is **material package** everywhere - interface, documentation,
> anything a teacher reads. "Fullpack" is an internal term only (madde 16). A teacher
> should not have to learn our jargon to share a lesson.

One format serves both builds. A package made in EON Edu opens in EON Stream and the reverse,
subject to licence (madde 28) - that shared format is the concrete payoff of the shared
core: material downloaded at school opens at home.

## Container

```
package.eonpkg                 (zip, stored or deflate)
  package.json               descriptor -- package.v0.schema.json
  content/                   files referenced by items[].path
  signature.json             detached signature envelope (optional in a source tree)
```

Rules:

- `items[].path` is relative, never absolute, and may not contain `..`. The schema rejects
  traversal before any extraction code runs; the extractor re-checks anyway. Two layers,
  because this is the classic archive vulnerability.
- Every item carries `mediaType`, `sizeBytes` and `sha256`. A mismatch fails the item, not
  silently the whole package.
- **Type comes from content**, via MIME sniffing and magic bytes - never from the
  extension (madde 15b). A `.pdf` that is really a video is rejected by a creator that
  accepts only documents.

## Hierarchy and modes

`course -> unit -> topic`, the way teaching material is actually organised (madde 16a).
A topic references items by id, so a file can appear in more than one topic without being
stored twice.

Two viewing modes, chosen by the creator (madde 16b): `sequence` walks items in order,
`free` lets the reader open anything. A unit may override the package-level mode, so a
package can be mostly free with one ordered lab sequence.

**Progress is stored on the device only.** No account, no server (madde 16b, 31). There is
deliberately no descriptor field for progress, identity, or institution data (madde 28b):
absent fields cannot leak.

## Distribution

1. **BitTorrent** generated from the publisher's own files. Nothing is stored on project
   servers.
2. **`mirrors`** - HTTPS sources used as web seeds (BEP 19), in `v0` from the start.

The second exists because of a real flaw: a torrent-only package stops being available the
moment the publisher closes the application, which makes public distribution unreliable
(madde 15d). A teacher adds a cloud link, or an institution its own server (madde 16g), and
the package survives.

In EON Edu the institution server is the **primary** source over plain HTTPS; peer
distribution is an optional, off-by-default accelerator (madde 25).

## Offline

Once downloaded, a package works with **no network at all** (madde 16h). Not a side effect
of caching - a requirement. School connectivity is assumed to be bad, and the format is
designed for that rather than apologising for it.

Consequences: no remote references for anything needed to read the package; icons and
fonts are embedded or system-provided; a missing viewer module degrades to a **partial
open** showing what can be shown (madde 16c), never a blank error.

## Licence and republication

`license` is an SPDX identifier; the recommended default for material is `CC-BY-SA-4.0`
(madde 16e). `sources[]` carries attribution for third-party material.

Institutional packages are marked (`origin.kind = "institution"`). EON Stream's creator and
marketplace refuse to republish them publicly unless the licence allows it - enforced in
the client, not merely stated in a policy (madde 28a). Class material must not leak into
the open marketplace by accident.

## To be written

- Whether to allow zip64 / >4 GB packages, and a practical size ceiling.
- Delta updates for a package that gains one lesson.
- Canonical serialisation for signing (see `signing-and-revocation.md`).
