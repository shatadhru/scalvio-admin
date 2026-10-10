---
name: scalvio-collection
description: Add or change a content type, field, or access rule.
---

Create/edit `scalvio/collections/<slug>.ts` with `defineCollection` and register it in the index. Do NOT create admin pages, handlers, or validation by hand. Need a new field type? Extend `schema.ts`, `field.tsx`, and the validator only.
