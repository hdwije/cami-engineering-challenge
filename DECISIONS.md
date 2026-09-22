# Decisions

Use this file to record assumptions, trade-offs, prioritisation, and anything you cut.

## Prioritisation

What did you tackle first, what did you defer, and why?

I read the all five tasks first before changing anything. Started with Task 3 because a failing pipeline means I can't trust anything else I verify later. Get that green first, then everything after it has a real signal.

For Task 3 I went through ci.yml step by step and executed each command locally. All
of them passed, which was the confusing part. Then I noticed the postgres service creates one database called cami, but the Migrate step overrides DATABASE_URL to cami_app. Nothing in the workflow creates that database. So locally it works because my shell points at cami, and on GitHub it breaks because the step override the DATABASE_URL to cami_app. Removed the override so the step uses the job level env DATABASE_URL.

## Assumptions

## Trade-offs

## Classification history scope

What you implemented for history / provider seam, and what you left out.

## Stretch (if any)

## What you would do with more time
