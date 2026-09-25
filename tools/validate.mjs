// SPDX-License-Identifier: Apache-2.0
// SPDX-FileCopyrightText: 2026 EON contributors
//
// Validates every file under examples/ against the schema its name implies.
// Files in examples/invalid/ MUST fail: a schema that accepts everything would
// otherwise pass a naive test suite.

import { readFileSync, readdirSync } from "node:fs";
import { join, basename } from "node:path";
import Ajv from "ajv/dist/2020.js";
import addFormats from "ajv-formats";

const ajv = new Ajv({ allErrors: true, strict: false });
addFormats(ajv);

const schemas = {
  addon: "schemas/addon-manifest.v0.schema.json",
  module: "schemas/module-manifest.v0.schema.json",
  package: "schemas/package.v0.schema.json",
};

const validators = Object.fromEntries(
  Object.entries(schemas).map(([k, p]) => [
    k,
    ajv.compile(JSON.parse(readFileSync(p, "utf8"))),
  ])
);

// examples/valid/addon-minimal.json -> "addon"
function kindOf(file) {
  const prefix = basename(file).split("-")[0];
  if (!(prefix in validators)) {
    throw new Error(
      `${file}: cannot tell which schema applies. Name it <addon|module|package>-*.json`
    );
  }
  return prefix;
}

let failures = 0;
const check = (dir, mustPass) => {
  for (const file of readdirSync(dir).filter((f) => f.endsWith(".json"))) {
    const path = join(dir, file);
    const validate = validators[kindOf(path)];
    const passed = validate(JSON.parse(readFileSync(path, "utf8")));

    if (passed === mustPass) {
      console.log(`  ok    ${path}${mustPass ? "" : "  (rejected, as intended)"}`);
    } else {
      failures++;
      console.error(
        mustPass
          ? `  FAIL  ${path}\n${ajv.errorsText(validate.errors, { separator: "\n        " })}`
          : `  FAIL  ${path}: accepted, but this document must be rejected`
      );
    }
  }
};

console.log("valid examples:");
check("examples/valid", true);
console.log("invalid examples (must be rejected):");
check("examples/invalid", false);

if (failures) {
  console.error(`\n${failures} problem(s).`);
  process.exit(1);
}
console.log("\nAll examples behave as specified.");
