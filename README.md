# eon-stream-spec

**The contracts.** Addon API, manifest schemas, package format, signing and revocation —
everything that other people's work depends on.

[![Status](https://img.shields.io/badge/status-Faz%200%20·%20active-f59e0b)](https://github.com/EON-Extensible-Open-Network/eon-docs/blob/main/plan/eon-plan.md)
[![Contract version](https://img.shields.io/badge/contracts-v0%20·%20UNSTABLE-dc2626)](#stability)
[![License](https://img.shields.io/badge/license-Apache--2.0-3b82f6)](LICENSE)

---

## Why this is a separate repository

These are the parts that cannot be quietly changed later. An addon author reads the
manifest schema; a material package written today must open in a client built in three
years; a signature format decided badly outlives the code that wrote it.

So the contracts live apart from every implementation, are versioned on their own, and are
licensed **Apache-2.0** rather than under the project's copyleft — a specification that
cannot be freely implemented by anyone, including other clients, is not a specification.
That includes implementations we will never control.

Nothing in this repository executes. It is schemas, prose, and examples.

## Contents

| Path | What |
|---|---|
| `schemas/addon-manifest.v0.schema.json` | Remote addon manifest — Stremio-compatible plus EON Stream extensions |
| `schemas/module-manifest.v0.schema.json` | EON Stream module manifest: kind, dependencies, permissions, signature |
| `schemas/package.v0.schema.json` | Material package descriptor, incl. `mirrors` (web seed) |
| `schemas/revocation-list.v0.schema.json` | Signed list of revoked module versions and signing keys |
| `schemas/release-manifest.v0.schema.json` | Signed release description: version, tag, artefacts, hashes |
| `schemas/theme.v0.schema.json` | Declarative theme document — colour, type, spacing, and no code |
| `schemas/trust-set.v0.schema.json` | The signing keys a build trusts, and for how long |
| `docs/addon-protocol.md` | The HTTP endpoints, request and response shapes, error handling |
| `docs/module-abi.md` | The module boundary — also the boundary named in the GPL exception |
| `docs/package-format.md` | Container layout, hierarchy, distribution, offline guarantees |
| `docs/signing-and-revocation.md` | Key hierarchy, signature envelope, revocation list |
| `docs/versioning.md` | How these contracts are versioned and what breaking means |
| `docs/compatibility.md` | Which Stremio addons work, which cannot, and why |
| `examples/` | Valid and deliberately invalid documents, used as CI fixtures |

## Stability

**Contracts are at `v0`. `v0` is unstable and will break without a migration path.**

This is a deliberate decision (see the plan's scope note). The alternative — designing
the contracts to completion before a working player exists — is designing by guesswork.
`v0` is built to be *extensible*, not to be *final*.

Semver guarantees begin at `v1`:

- **patch** — clarified wording, added examples, relaxed a validation that was wrong.
- **minor** — new optional field, new enum member. Old documents stay valid.
- **major** — anything that invalidates a document that used to be valid.

Every manifest declares the API version it targets. A client refuses a major version it
does not implement and says why rather than failing obscurely.

## EON Stream extensions to the Stremio manifest

Compatibility runs both ways: a Stremio addon must work in EON Stream, and an addon built for
EON Stream should keep working in Stremio. So extensions live under a single reserved key and
are always optional — a Stremio client ignores an unknown key, and a EON Stream client treats a
missing one as "not provided".

```jsonc
{
  "id": "community.example.catalog",
  "version": "1.2.0",
  "name": "Example Catalog",
  "resources": ["catalog", "meta"],
  "types": ["movie", "series"],

  "eon": {
    "minApi": "0.1",          // oldest EON Stream addon API this addon works against
    "maxApi": "0",            // newest major it has been tested against
    "mirrors": [],            // additional HTTP sources (madde 15d) -- see package-format.md
    "license": "CC-BY-SA-4.0",// content licence, when the addon serves its own material
    "price": null,            // reserved; no payment flow exists (madde 10)
    "signature": null         // detached signature envelope -- see signing-and-revocation.md
  }
}
```

`price` and `signature` are reserved now and used later, on purpose. Widening a format
after publication makes every existing document second class; reserving the keys costs
nothing today.

## Validating a document

```bash
npm install
npm run validate                      # every file in examples/ against its schema
npm run validate -- path/to/manifest.json
```

CI validates all examples on every push, and asserts that files under
`examples/invalid/` **fail** — a schema that accepts everything passes a naive test suite.

## Contributing

Review is the most valuable contribution here, and it is worth more before a schema
hardens than after. If you have written a Stremio addon and something in
`docs/compatibility.md` is wrong, that is the highest-value issue you can open.

See the organisation-wide
[CONTRIBUTING.md](https://github.com/EON-Extensible-Open-Network/.github/blob/main/CONTRIBUTING.md). Changes to a
contract also require a `docs/versioning.md`-conformant entry in `CHANGELOG.md`.

## Related

[eon-stream-core](https://github.com/EON-Extensible-Open-Network/eon-stream-core) implements these ·
[eon-stream-sdk](https://github.com/EON-Extensible-Open-Network/eon-stream-sdk) wraps them for addon authors ·
[eon-docs](https://github.com/EON-Extensible-Open-Network/eon-docs) holds the project plan

## License

[Apache-2.0](LICENSE). Implement freely, in any client, under any license.

Not affiliated with, endorsed by, or connected to Stremio. Compatibility with the Stremio
addon protocol is described here as a matter of fact.
