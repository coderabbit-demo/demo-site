# Coding Agent — Do / Say / See

Companion to the complete Version 3 recording. Times are minutes:seconds.milliseconds.

## Introduction / OPENING: Introduce the flow

00:00.000–00:23.620

### Do

- Show the section’s flow slide. Keep the full slide visible and highlight each pillar as it comes up in the introduction.
- At the end of the introduction, switch to the first demo screen.

[Slide deck](https://docs.google.com/presentation/d/1zk6UD0ZoAxtGRqDTQL-MVulAWu5MH4nYmd-9xJBpU5Y/edit)

### Say

I'll give the coding agent a focused task. Fix the invoice search vulnerability while preserving normal search behavior. We'll choose the repository and branch, select plan mode and review the approach before implementation. As the agent works, I'll follow its progress and add a test case. Then we'll inspect the patch and validation and open a pull request so the team can review the result.

### See

Frame at 00:09 in 07-coding-agent.mp4.

## Start a Task / STEP 1 OF 3: Choose the repository and branch

00:25.600–00:40.120

### Do

- Open New coding task, then choose coderabbit-demo/demo-site-pr-recordings and codex/bulk-checkout-flagship.
- Keep the original SQL finding available for context. For rehearsal, use the completed task.

[Recorded Coding Agent task](https://app.coderabbit.ai/code/tasks/19bb8d53-3b68-4a6a-ba65-29125b8e134b) · [Recording repository](https://github.com/coderabbit-demo/demo-site-pr-recordings) · [PR #4: SQL finding](https://github.com/coderabbit-demo/demo-site-pr-examples/pull/4#discussion_r3991696811)

### Say

I open a coding task and select the repository and branch containing our invoice search feature. The problem is that search text is inserted directly into a database command. A crafted search could change that command and retrieve another customer's invoices.

### See

Frame at 00:29 in 07-coding-agent.mp4.

## Start a Task / STEP 2 OF 3: Enter the focused request

00:40.860–01:07.480

### Do

- Click the task description and enter the Recorded coding-task request from the appendix.
- Scroll within the field to verify tenant isolation, normal searches, order, limit, tests and excluded issues.

### Say

My request describes the result we need. Keep search results within the customer's account and treat search text as data. I also describe the behavior to preserve. Customers should still be able to search using part of a product name and results should keep their existing order and limit. I ask for regression tests that demonstrate the fix. This task covers invoice search and its tests with the discount and invoice export issues left for separate work.

### See

Frame at 01:00 in 07-coding-agent.mp4.

## Start a Task / STEP 3 OF 3: Keep the task ready for planning

01:08.140–01:10.520

### Do

- Leave the composer unsubmitted while explaining that the approach will be reviewed first.

### Say

Before implementation, I want to review the approach.

### See

Frame at 01:10 in 07-coding-agent.mp4.

## Pick the Mode / STEP 1 OF 4: Select Plan and send

01:10.900–01:21.640

### Do

- Click Add files and more beside the description, then Plan mode.
- Confirm the Plan chip and click Start task. Wait for workspace setup.

### Say

I open the mode menu beside the task description and select plan. The label confirms that choice before I send the request. The agent reads the repository and proposes an approach.

### See

Frame at 01:14 in 07-coding-agent.mp4.

## Pick the Mode / STEP 2 OF 4: Read the proposed plan

01:21.900–01:42.380

### Do

- Open the Plan card and scroll through Implementation, Tests, and Validation and Delivery.
- Check parameter binding, normal searches and tenant isolation against the original request.

[Recorded Coding Agent task](https://app.coderabbit.ai/code/tasks/19bb8d53-3b68-4a6a-ba65-29125b8e134b)

### Say

I open the plan to check what it intends to change and how it will test the result. It proposes separating the search values from the SQL command, then checking both ordinary searches and attempts to cross the customer boundary. I compare that with my request. The plan needs to preserve useful search behavior as well as address the vulnerability.

### See

Frame at 01:33 in 07-coding-agent.mp4.

## Pick the Mode / STEP 3 OF 4: Inspect the approval gate

01:42.880–01:48.760

### Do

- Scroll to Implement this plan? and show both implementation and revision choices.
- Pause on the choice before continuing.

### Say

At the end, the agent asks whether to implement the plan. I can request changes here if the scope or approach needs work.

### See

Frame at 01:47 in 07-coding-agent.mp4.

## Pick the Mode / STEP 4 OF 4: Approve the recorded approach

01:49.280–01:58.960

### Do

- For a training run, click Yes, implement this plan once. For rehearsal, inspect the saved approval.
- Show the activity entry and task branch as implementation begins.

### Say

For this task, I select yes, implement this plan. That starts the implementation in the task workspace. We'll inspect the finished patch before publishing it.

### See

Frame at 01:57 in 07-coding-agent.mp4.

## Watch It Work / STEP 1 OF 4: Follow activity

01:59.640–02:12.580

### Do

- Open task activity and expand file/command entries.
- Scroll to invoice-search.ts and the regression-test work.

[Recorded Coding Agent task](https://app.coderabbit.ai/code/tasks/19bb8d53-3b68-4a6a-ba65-29125b8e134b)

### Say

I open the task activity to follow the agent as it reads files, edits the code, and runs commands. The workspace keeps the implementation available for inspection while the agent works. These edits haven't yet been published to GitHub.

### See

Frame at 02:09 in 07-coding-agent.mp4.

## Watch It Work / STEP 2 OF 4: Add the specific test request

02:13.300–02:29.840

### Do

- Click the follow-up input and enter the Mid-task test request from the appendix.
- Click Send for a training run; for rehearsal, scroll to the recorded request.

### Say

I add a specific test request. Check a product name containing an apostrophe and check that another customer's matching invoice stays out of the result. Those are useful cases because the fix needs to preserve ordinary text searches while maintaining the customer boundary.

### See

Frame at 02:25 in 07-coding-agent.mp4.

## Watch It Work / STEP 3 OF 4: Read the two-case response

02:30.640–02:35.380

### Do

- Scroll to the reply confirming the apostrophe search and other-customer exclusion.
- Keep both results visible.

### Say

When the task finishes, I read the response. The agent confirms that both cases passed.

### See

Frame at 02:33 in 07-coding-agent.mp4.

## Watch It Work / STEP 4 OF 4: Check validation and its limit

02:35.380–02:47.320

### Do

- Scroll to the final task summary and dependency audit.
- Read the note that optional CodeRabbit review was disabled before opening Changes.

### Say

It also reports the overall test results and dependency audit. The optional CodeRabbit review was disabled for this task, so it didn't run. I'll keep that in mind as I open the patch and inspect the validation myself.

### See

Frame at 02:44 in 07-coding-agent.mp4.

## Review the Patch / STEP 1 OF 4: Inspect the SQL patch

02:48.680–03:01.100

### Do

- Click Changes or the Changed files summary. Select src/services/invoice-search.ts.
- Scroll to the query placeholders and separately supplied tenant/search values.

[Recorded Coding Agent task](https://app.coderabbit.ai/code/tasks/19bb8d53-3b68-4a6a-ba65-29125b8e134b)

### Say

I open the changed files and start with the invoice search query. The SQL command now uses placeholders. The customer account and search text are supplied separately, allowing the database to treat them as values.

### See

Frame at 02:59 in 07-coding-agent.mp4.

## Review the Patch / STEP 2 OF 4: Inspect the security regression

03:01.940–03:12.840

### Do

- Select tests/flagship.test.ts in the file list.
- Scroll to the former it.fails case and show the normal assertion for the crafted cross-tenant search.

### Say

Next, I open the regression tests. The test for the original security problem is now a normal assertion that must pass. It checks that a crafted search cannot retrieve another customer's invoices.

### See

Frame at 03:10 in 07-coding-agent.mp4.

## Review the Patch / STEP 3 OF 4: Inspect normal search cases

03:13.600–03:21.740

### Do

- Select the invoice-search test file.
- Scroll through partial names, apostrophe text, ordering and result-limit cases.

### Say

I also inspect the ordinary cases. Partial name searches, a product name with an apostrophe, the expected result order, and the result limit.

### See

Frame at 03:20 in 07-coding-agent.mp4.

## Review the Patch / STEP 4 OF 4: Review the evidence before delivery

03:23.480–03:44.240

### Do

- Return to the task summary. Read 76 passing tests, four expected failures and the dependency audit.
- Keep the disabled-review note separate. Show the follow-up input where a revision could be requested.

### Say

The recorded task reports 76 passed tests and 4 unrelated expected failures along with a clean dependency audit. The additional CodeRabbit review didn't run, as we saw in the task settings. If the patch missed the requirement, I could ask the agent to revise it here. For this example, the code and tests address the requested behavior, so I'll move to delivery.

### See

Frame at 03:32 in 07-coding-agent.mp4.

## Deliver / STEP 1 OF 4: Create the review PR

03:45.680–03:58.860

### Do

- Show Commit and push and Create PR. Choose Create PR for a training run and wait for publication.
- For rehearsal, inspect the existing delivery result and open PR #10.

[Recorded Coding Agent task](https://app.coderabbit.ai/code/tasks/19bb8d53-3b68-4a6a-ba65-29125b8e134b) · [Coding Agent result: PR #10](https://github.com/coderabbit-demo/demo-site-pr-recordings/pull/10)

### Say

The task offers commit and push or create PR. I choose create PR so the fix can have its own review. That action starts publishing the change. Once it finishes, I follow the link to GitHub and check the destination branch.

### See

Frame at 03:50 in 07-coding-agent.mp4.

## Deliver / STEP 2 OF 4: Verify the destination

03:59.520–04:05.720

### Do

- Read PR #10’s head/base line and confirm it targets the original feature branch.
- Keep the branch information visible.

[Coding Agent result: PR #10](https://github.com/coderabbit-demo/demo-site-pr-recordings/pull/10)

### Say

This fix targets our original feature branch, keeping the invoice search correction separate from the larger feature.

### See

Frame at 04:04 in 07-coding-agent.mp4.

## Deliver / STEP 3 OF 4: Inspect the published files

04:06.360–04:15.120

### Do

- Click Files changed. Open the invoice-search query and regression tests.
- Compare the delivered patch with the task’s Changes view.

[PR #10: files changed](https://github.com/coderabbit-demo/demo-site-pr-recordings/pull/10/files)

### Say

I check that the pull request contains the expected query change and tests. These are the changes we inspected in the task, now available to the team.

### See

Frame at 04:12 in 07-coding-agent.mp4.

## Deliver / STEP 4 OF 4: Read validation and review status

04:15.620–04:34.320

### Do

- Return to Conversation and read the delivery summary and skipped-review explanation.
- Use the task link for earlier test evidence; the delivery did not rerun validation.
- Leave the PR open and return to the flow slide.

[Recorded Coding Agent task](https://app.coderabbit.ai/code/tasks/19bb8d53-3b68-4a6a-ba65-29125b8e134b) · [Coding Agent result: PR #10](https://github.com/coderabbit-demo/demo-site-pr-recordings/pull/10)

### Say

The delivery step didn't rerun validation. The earlier results are recorded in the coding task. Automatic review was also skipped for this feature branch destination. We've scoped the work, reviewed a plan, followed the implementation and inspected the patch before delivery. The pull request remains open for the team's review.

### See

Frame at 04:31 in 07-coding-agent.mp4.
