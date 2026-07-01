---
name: verifier-manual-only
description: Use when asked to verify, test, or confirm a change works in this repository (wordle-helper) — before building any automated verification, browser automation, or test harness.
---

# Verifier: Manual Testing Only

This project is intentionally verified by hand. Do not build or run automated
verification for changes in this repository.

## Protocol

1. Do **not** launch browsers, drive the UI, write tests, or script any
   runtime checks.
2. A syntax check (`node --check script.js`) is the only automated step
   permitted.
3. Report the verdict as: **SKIP — manual verification by owner.**
4. If the change seems risky enough that manual testing might miss something,
   say so in one sentence and leave the decision to the owner.

## Why

Wordle Helper is a tiny static page (one HTML file, one script, one
stylesheet, no build). The owner opens `index.html` and clicks through it
faster than any harness can be set up. Automated verification here costs more
than it catches.
