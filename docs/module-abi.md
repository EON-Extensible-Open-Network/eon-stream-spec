# EON Module ABI

**Status: DRAFT, `v0`, unstable.**

> This file is **legally load-bearing.** The GPL section 7 additional permission in
> `eon-stream-core/LICENSE-EXCEPTION.md` names this document as the boundary that separates an
> Independent Module from a derivative work. Changing what counts as "the ABI" changes the
> scope of that permission, so changes here go through the plan process (madde 33) and are
> never folded into an unrelated pull request.

## What the boundary is

A module and the host communicate **only** through:

1. **The manifest** - `schemas/module-manifest.v0.schema.json`. Declares identity, kind,
   runtime, requested permissions, dependencies.
2. **Host functions** - a fixed, versioned set the host exposes. A module calls them; it
   cannot reach anything it was not handed.
3. **Events** - a fixed set the host emits, which a module may subscribe to.
4. **Its own manifest-declared surfaces** - where in the interface a module may render.

Anything else is outside the boundary: linking against host symbols, reading host memory,
including host source, patching the build. Such a module is a derivative work and the
exception does not cover it.

## Capabilities, not trust levels

There is no "trusted module". A module gets exactly the host functions its manifest
requested and the user approved, and nothing is granted implicitly - no ambient filesystem
access, no ambient network access.

First-party modules use this same ABI and this same permission model (madde 3). CI fails if
a first-party module reaches a privilege the published ABI does not offer. Without that
check the rule is a good intention that erodes in the first hurry.

| Permission | Host function it unlocks | Notes |
|---|---|---|
| `net.fetch` | `host.fetch(request)` | HTTPS only; no arbitrary sockets; host enforces timeouts and size caps |
| `storage.local` | `host.storage.{get,set,delete}` | Namespaced per module id; quota enforced; never leaves the device |
| `fs.read.userSelected` | `host.pickFiles()` | Returns handles for files the *user* chose in a host dialog. A module never names a path |
| `fs.write.downloads` | `host.saveAs(bytes, suggestedName)` | Host dialog; module cannot choose the destination |
| `player.control` | `host.player.{load,play,pause,seek,setTrack}` | No raw process or IPC access to mpv |
| `catalog.read` | `host.catalog.query(...)` | Read-only; resolved through the host, so addon URLs stay hidden from the module |
| `addons.read` | `host.addons.list()` | Ids and names only - never URLs, which can carry credentials |
| `ui.surface` | render into a declared surface | Surfaces are enumerated by the host, not chosen by the module |
| `notifications.post` | `host.notify(...)` | Rate limited |
| `clipboard.write` | `host.clipboard.write(text)` | Write only; reading the clipboard is not offered |

Two absences are deliberate: **no clipboard read** and **no raw filesystem paths**. Both
are routine sources of quiet data exfiltration, and neither is needed by the module kinds
this project intends to support.

## Runtimes

| Runtime | Status | Isolation |
|---|---|---|
| `declarative` | **v1** | No code. JSON validated against a schema; the host renders it. The only third-party runtime in v1 (madde 4) |
| `wasm` | planned | WebAssembly sandbox (wasmtime intended). Host functions are the only imports. No syscalls, no ambient capabilities |
| `native` | first-party only | Compiled into the client. Same ABI, enforced by CI rather than by a sandbox |

A `theme` is always `declarative` with zero permissions, and the manifest schema enforces
it - the rule lives in the contract, not only in prose.

## Versioning

The ABI versions with the contracts (`docs/versioning.md`). Adding a host function is a
**minor** change; removing one, renaming one, or narrowing what one returns is **major**.
A module declares the range it supports; the host refuses what it cannot satisfy and says
why.

## Open questions

Not yet decided, and listed rather than hidden:

- Exact wasm interface flavour - raw host imports, WIT/component model, or a narrow
  hand-rolled ABI. Affects tooling more than semantics.
- Whether `ui.surface` modules get a DOM-like tree or a constrained widget set. The
  constrained set is safer and is the current leaning.
- Per-module resource limits (memory, CPU time, storage quota) - numbers, not mechanism.
- How permission changes are re-consented on module update. A silent widening of
  permissions on auto-update would be a security bug.
