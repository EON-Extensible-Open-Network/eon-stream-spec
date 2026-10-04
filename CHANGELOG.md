# Changelog

Format: [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).
Versioning: see [`docs/versioning.md`](docs/versioning.md). Contracts are at `v0` and
**unstable** - breaking changes are expected and are listed here rather than smoothed over.

## [Unreleased]

### Added
- `addon-manifest.v0.schema.json` - Stremio-compatible manifest plus the reserved `eon`
  extension key (`minApi`, `maxApi`, `mirrors`, `license`, `price`, `signature`,
  `accessibility`, `education`).
- `module-manifest.v0.schema.json` - module identity, `kind`, runtime, capability-based
  permissions, dependencies, build-profile targeting, signature envelope. Encodes the hard
  rule that a `theme` carries no code and requests no permissions (madde 4).
- `package.v0.schema.json` - material package descriptor: course/unit/topic hierarchy,
  content-typed items with SHA-256, `mirrors` for web-seed distribution (madde 15d),
  licence and attribution, accessibility fields. Rejects path traversal.
- `docs/versioning.md`, `docs/compatibility.md`.
- `examples/valid/` and `examples/invalid/`, with CI asserting that invalid documents are
  actually rejected.
- Validation tooling (`tools/validate.mjs`), REUSE and link checking in CI.

### Added - the contracts the client now implements
- `revocation-list.v0.schema.json` - revoked module versions and revoked signing keys,
  with enumerated reasons and `issuedAt` / `nextUpdate`. Revocation is version-scoped: a
  single bad release must not destroy a maintainer's project.
- `release-manifest.v0.schema.json` - what the updater reads. Carries `tag` separately
  from `version` because during the alpha they differ (`v0.12` is `0.12.0-alpha`), and
  `releasedAt`, because semver ordering is not build order in the alpha scheme:
  `0.19.0` compares as ahead of `0.2.0` while `v0.2` is in fact the later build.
- `theme.v0.schema.json` - madde 4's boundary as a schema. Every key known, every value a
  constrained type, so there is nowhere in a theme to put something a reader would skip.
- `trust-set.v0.schema.json` - the keys a build trusts and the window for each, with the
  Edu key separate from the EON Stream module key (madde 22).

### Decided
- **Canonical serialisation is JCS (RFC 8785).** This was open with JCS as the leading
  candidate; it is pinned now, before any key exists, because the warning attached to it
  was true - two implementations disagreeing on byte order produce signatures that verify
  in one client and fail in another. The subject is three string members, so the canonical
  form is a single line any implementation can produce by concatenation.

### Changed - rules that were prose are now enforced
- **A declarative module may request no permissions**, not only a theme. It carries no
  code, so there is nothing that could call a granted host function; a permission request
  on one is a mistake or a disguise. The theme rule remains as the stricter special case.
- **`runtime.entry` must stay inside the module root.** The prose said so; now the pattern
  does. The client creates that directory and joins the entry onto it.
- **A remote `icon` URL is refused by pattern**, not only by prose: fetching one would tell
  its host that this module is installed.
- Font families in a theme refuse the characters that would make one a stylesheet
  injection, matching `validate_font_family` in `eon-stream-core` character for character.
  A schema and an implementation that disagree produce a document that validates and is
  then refused.

### Notes
- `price` is reserved and unimplemented on purpose (madde 10). `signature` is now
  implemented and verified in `eon-stream-core`.
- **No key in the hierarchy exists yet** (madde 30), so every build ships with an empty
  trust set and installs nothing. That is designed behaviour, documented in
  `docs/signing-and-revocation.md` under "Current state: no keys exist".
- `docs/signing-and-revocation.md` gained **"Rules a schema cannot state"**: the cross-field
  comparisons JSON Schema cannot express and implementations must therefore enforce.
  `examples/invalid/` holds only documents the *schema* rejects, so a semantic rule has no
  example there — which is why it needed writing down.
- Nothing here is released. There is no `v0.1.0` tag yet.

[Unreleased]: https://github.com/EON-Extensible-Open-Network/eon-stream-spec/compare/main...HEAD
