# AI Usage

## Tools used

List the AI tools you used (Cursor, GitHub Copilot, Claude Code, ChatGPT, etc.).

## How I used AI

Briefly explain how you used AI during the challenge (exploring the codebase, drafting
fixes, tests, docs, review, …).

Mostly for understanding unfamiliar parts of the stack and for reviewing my fixes before committing. I wrote the changes myself and used AI as a second pair of eyes rather than a code generator.

Task 1: used Claude to review my query rewrite. The first version I wrote used getRawMany with manual aliases, which silently dropped the id field because TypeORM prefixes raw columns (request_id, not id). Caught it when the frontend broke. Switched to getRawAndEntities so the entity supplies the typed columns and raw only carries the two computed ones.

## What I changed or rejected

Describe anything the AI suggested that you changed, corrected, or rejected.

## Trade-offs

Any AI-related trade-offs under the timebox.

Using AI for explanation was faster than reading TypeORM docs under a timebox, but it meant verifying each suggestion against the actual schema rather than trusting it. The getRawMany issue is the example of why.

## Team workflow (optional stretch)

If relevant: how you would set standards for AI-assisted development on a team.
