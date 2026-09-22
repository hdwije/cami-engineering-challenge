# Decisions

Use this file to record assumptions, trade-offs, prioritisation, and anything you cut.

## Prioritisation

What did you tackle first, what did you defer, and why?

I read the all five tasks first before changing anything. Started with Task 3 because a failing pipeline means I can't trust anything else I verify later. Get that green first, then everything after it has a real signal.

For Task 3 I went through ci.yml step by step and executed each command locally. All
of them passed, which was the confusing part. Then I noticed the postgres service creates one database called cami, but the Migrate step overrides DATABASE_URL to cami_app. Nothing in the workflow creates that database. So locally it works because my shell points at cami, and on GitHub it breaks because the step override the DATABASE_URL to cami_app. Removed the override so the step uses the job level env DATABASE_URL.

Next I moved to Task 1. There issue was retrived each requests notes nestedly. But we can retrive notes from one query using joins. That fix the nested issue. But there was an issue still remaining which was to take the latest note it loads all the notes to the memory. To prevent this I used aggregated query that uses sub query to retrieve latest note of the each request. I didn't change the response shape. So no change it the web app.

But still there is an issue that if the request count is getting higher we have to use pagination or load more feature for this.

Then I moved to Task 2 which is the cached issue. Once we change the status or click the classify button it doesn't update the table. Because we just changed the date in the server database only. We don't refetch the updated details. So what I have done is invalidate the request query onSuccess and then it retrieve the updated data.

Then I moved to Task 4. There I have to bring the business logic to service layer. So I have to create the test cases for what currently controller validate and the return object. For request validation I install class-validator and class-transformer libraries and created a DTO class for classify request. So request body validated by the Validation Pipe and "Soften confidence for very short messages" and "Prefer "unknown" when confidence is weak." keeps in the same function body. Since I changed the controller I created a test cases for this in the "requests.controller.classify.test.ts" file and test it after done the changes.

## Assumptions

- Taks 1: Returning the full list without pagination is the current intended behaviour, not a bug to fix as part of this task.

- Task 4: The old endpoint returned a 201 with an error field when input was bad, since it returned a plain object instead of throwing. It now returns a 400 from the ValidationPipe. I checked the web app and nothing reads that error field.

## Trade-offs

- Task 1: because of the aggregated query it give less load on the Node process but high weight on the database server because each request it has to run a sub query. It doesn't care about the notes, but the requests.

- Task 4: Two libraries added. Bundle got bigger. Runtime cost is getting higher because every request is now transform into a class instance and validated. It is small cost. But it is not free.

## Classification history scope

What you implemented for history / provider seam, and what you left out.

## Stretch (if any)

## What you would do with more time
