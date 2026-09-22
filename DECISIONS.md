# Decisions

Use this file to record assumptions, trade-offs, prioritisation, and anything you cut.

## Prioritisation

What did you tackle first, what did you defer, and why?

I read the all five tasks first before changing anything. Started with Task 3 because a failing pipeline means I can't trust anything else I verify later. Get that green first, then everything after it has a real signal.

For Task 3 I went through ci.yml step by step and executed each command locally. All
of them passed, which was the confusing part. Then I noticed the postgres service creates one database called cami, but the Migrate step overrides DATABASE_URL to cami_app. Nothing in the workflow creates that database. So locally it works because my shell points at cami, and on GitHub it breaks because the step override the DATABASE_URL to cami_app. Removed the override so the step uses the job level env DATABASE_URL.

Next I moved to Task 1. There issue was retrived each requests notes nestedly. But we can retrive notes from one query using joins. That fix the nested issue. But there was an issue still remaining which was to take the latest note it loads all the notes to the memory. To prevent this I used aggregated query that uses sub query to retrieve latest note of the each request. I didn't change the response shape. So no change it the web app.

But still there is an issue that if the request count is getting higher we have to use pagination or load more feature for this.

Then I moved to Task 2 which is the cached issue. Once we change the status or click the classify button it doesn't update the table. Because we just changed the data in the server database only. We don't refetch the updated details. So what I have done is invalidate the request query onSuccess and then it retrieve the updated data.

Then I moved to Task 4. There I have to bring the business logic to service layer. So I have to create the test cases for what currently controller validate and the return object. For request validation I install class-validator and class-transformer libraries and created a DTO class for classify request. So request body validated by the Validation Pipe and "Soften confidence for very short messages" and "Prefer "unknown" when confidence is weak." keeps in the same function body. Since I changed the controller I created a test cases for this in the "requests.controller.classify.test.ts" file and test it after done the changes.

Next moved to Task 5 and it tooks bit time to understand what is exact the requirement. To maintain the history of classifications I created a new entity call Classification and wire it with the classifications table. After create to to generate the migration file for "classifications create" I use claude code.

## Assumptions

- Taks 1: Returning the full list without pagination is the current intended behaviour, not a bug to fix as part of this task.

- Task 4: The old endpoint returned a 201 with an error field when input was bad, since it returned a plain object instead of throwing. It now returns a 400 from the ValidationPipe. I checked the web app and nothing reads that error field.

- Task 5:
  - A classification is append-only. Rows are never updated or deleted, so no updated_at column.
  - The classifications table records what the classifier produced. Status changes are a side effect of classifying, not a classification, so status is not stored here.
  - Deleting a request should delete its classification history, hence ON DELETE CASCADE. An audit system would keep them instead, but that is beyond this slice.
  - Stored the provider name on each row so history stays meaningful once a second classifier exists. Without it you cannot tell which implementation produced a given result.
  - Category is stored as text rather than a Postgres enum, so adding a category later does not need a migration.

## Trade-offs

- Task 1: because of the aggregated query it give less load on the Node process but high weight on the database server because each request it has to run a sub query. Cost now scales with the number of requests returned, not with the number of notes..

- Task 4: Two more libraries (class-validator and class-transformer) to keep updated over time. Every request also gets converted into a class instance and validated, which is a small cost on every call.

- Task 5:
  - Category as text, not a Postgres enum. Easy to add categories later, but the database no longer rejects a typo. The application type is the only guard.

## Classification history scope

What you implemented for history / provider seam, and what you left out.

- Created a new Entity called "Classification".
- The table grows without bound, one row per classification click, and there is no retention policy. Not a problem at this scale, but it is the thing that would need attention first.

## Stretch (if any)

## What you would do with more time
