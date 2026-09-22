# Decisions

Use this file to record assumptions, trade-offs, prioritisation, and anything you cut.

## Prioritisation

I read the all five tasks first before changing anything. Started with Task 3 because a failing pipeline means I can't trust anything else I verify later. Get that green first, then everything after it has a real signal.

For Task 3 I went through ci.yml step by step and executed each command locally. All
of them passed, which was the confusing part. Then I noticed the postgres service creates one database called cami, but the Migrate step overrides DATABASE_URL to cami_app. Nothing in the workflow creates that database. So locally it works because my shell points at cami, and on GitHub it breaks because the step override the DATABASE_URL to cami_app. Removed the override so the step uses the job level env DATABASE_URL.

Next I moved to Task 1. There issue was retrived each requests notes nestedly. But we can retrive notes from one query using joins. That fix the nested issue. But there was an issue still remaining which was to take the latest note it loads all the notes to the memory. To prevent this I used aggregated query that uses sub query to retrieve latest note of the each request. I didn't change the response shape. So no change it the web app.

But still there is an issue that if the request count is getting higher we have to use pagination or load more feature for this.

Then I moved to Task 2 which is the cached issue. Once we change the status or click the classify button it doesn't update the table. Because we just changed the data in the server database only. We don't refetch the updated details. So what I have done is invalidate the request query onSuccess and then it retrieve the updated data.

Then I moved to Task 4. There I have to bring the business logic to service layer. So I have to create the test cases for what currently controller validate and the return object. For request validation I install class-validator and class-transformer libraries and created a DTO class for classify request. So request body validated by the Validation Pipe and "Soften confidence for very short messages" and "Prefer "unknown" when confidence is weak." keeps in the same function body. Since I changed the controller I created a test cases for this in the "requests.controller.classify.test.ts" file and test it after done the changes.

Next moved to Task 5:

- it tooks bit time to understand what is exact the requirement. To maintain the history of classifications I created a new entity call Classification and wire it with the classifications table. After create to to generate the migration file for "classifications create" I use claude code.
- To insert a record to classification I had to update the classify function. But since it already has a insert query for update the custore_request table I used database transactions to run multiple queries. Within the transaction I added the insert and update functions. For this I had change the constructor of the requests.service. Since I changed the classify function I executed the test cases again and 2 cases were failed because I changed the constructor of the requests.service. I fixed the issues in test cases and executes it (I just change the object initializations of the test cases).
- Retrieve classifications with 100 records cap. Newest first. That bound the oldest records unreachable. Since the signature doesn't have any paging params I made cape 100. Since I updated the constructor with the Classification repository, re-ran the test cases and got failed. Updated the test cases with the correct constructor.

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
- The table grows without bound, one row per classification click, and there is no retention policy. Not a problem at this scale, but it is the thing that would need attention first
- Returns the 100 newest rows.The table grows by one row per classification and is never pruned, so an uncapped query would keep growing. The cost is that older entries are unreachable until pagination exists, which is the first thing I would add.
- /requests/history does not validate the category value. The filter in the UI is free text, so an unrecognised value returning an empty list is the right behaviour. I didn't return 400 since it is not match with the UI. The column is also text rather than an enum, so new categories need no migration.
- No unit test for getClassifications function in the requests.service. It is a thin repository query, so a test would mostly assert that TypeORM works. I put the test effort into the classification rules instead, since that is where the logic lives.

## Stretch (if any)

## What you would do with more time
