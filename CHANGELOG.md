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

### Notes
- `price` and `signature` are reserved and unimplemented on purpose (madde 10, 34).
- Nothing here is released. There is no `v0.1.0` tag yet.

[Unreleased]: https://github.com/EON-Extensible-Open-Network/eon-stream-spec/compare/main...HEAD
