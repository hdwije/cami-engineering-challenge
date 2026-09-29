# AI Usage

## Tools used

Claude (chat) for diagnosis, explanation and review.
Claude Code in VS Code, mostly in plan mode, for test generation.

## How I used AI

Mostly for understanding unfamiliar parts of the stack and for reviewing my fixes before committing. I wrote the changes myself and used AI as a second pair of eyes rather than a code generator.

Task 1: used Claude to review my query rewrite. The first version I wrote used getRawMany with manual aliases, which silently dropped the id field because TypeORM prefixes raw columns (request_id, not id). Caught it when the frontend broke. Switched to getRawAndEntities so the entity supplies the typed columns and raw only carries the two computed ones.

Task 4: Used Claude Code in plan mode to generate tests for the classify endpoint, covering the DTO validation rules and the returned category and confidence. I added what are the validations should be included to the test cases and since I am in the plan mode I direct it to generate test cases step by step.

Task 5:
- For the newly created classification entity I had to create migration file by hand. For this I used claude code to write the migration file for classifications table.
- After adding the ClassificationProvider interface, the app would not start. Nest said it could not resolve the dependency. Claude explained why: an interface only exists while TypeScript compiles, so at runtime there is nothing for Nest to look up. It needs a separate name to register the implementation under. I added a string constant for that name and wired it up in the module.

## What I changed or rejected

Task 4: The first plan it produced covered every request endpoint. That was more than the task asked for, so I rejected it and kept only the classify tests.

Task 5: Claude code created the classification migration file with request_id indexing. I was in the plan mode and I asked that indexing for request_id is not necessary since the filteration should be done by the category. So I prompted to set the indexing for the category.

## Trade-offs

Using AI for explanation was faster than reading TypeORM docs under a timebox, but it meant verifying each suggestion against the actual schema rather than trusting it. The getRawMany issue is the example of why.

## Team workflow (optional stretch)
