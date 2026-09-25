# Versioning the contracts

## Today: `v0`, unstable

`v0` may break at any time, without a migration path. This is deliberate. Designing an
addon API, a manifest schema and a package format to completion *before* a working player
exists is designing by guesswork; `v0` is built to be extensible, not final.

Practical consequence: do not ship a product on `v0`. Prototype on it, and tell us what
breaks.

## From `v1`: semver, enforced

- **patch** - wording clarified, example added, a validation that was wrong relaxed.
- **minor** - a new *optional* field, a new enum member. Every previously valid document
  stays valid.
- **major** - anything that makes a previously valid document invalid.

Each schema carries its own version in its filename and `$id`
(`addon-manifest.v0.schema.json`). Schemas version independently: the package format
should not get a major bump because the addon API did.

## How a document declares what it targets

Remote addons: `eon.minApi` / `eon.maxApi`.
Modules: the required `api` object, with `min` and optional `max`.

A client that does not implement a document's major version **refuses to load it and says
why** (madde 5). Failing obscurely is worse than failing clearly.

A client *newer* than a document's `max` still loads it, and may warn. Otherwise every
client release would silently orphan working addons.

## Reserved-now, used-later fields

`price`, `signature`, `mirrors` and the `eon` key itself exist in `v0` while nothing
implements them. Widening a format after publication makes every existing document second
class; reserving a key costs nothing.

## Deprecation

A field is marked deprecated in the schema `description` and in `CHANGELOG.md`, keeps
working for at least one major version, and is only then removed. Silent removal is
treated as a bug.

## Changing a contract

1. Issue in `eon-docs` if a plan decision changes; otherwise an issue here.
2. PR touching the schema, an example that exercises the change, and `CHANGELOG.md`.
3. Breaking changes state who breaks and what they must do.
