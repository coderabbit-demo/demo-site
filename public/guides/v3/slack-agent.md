# CodeRabbit Agent for Slack — Do / Say / See

Companion to the complete Version 3 recording. Times are minutes:seconds.milliseconds.

## Introduction / OPENING: Introduce the flow

00:00.000–00:23.080

### Do

- Show the section’s flow slide. Keep the full slide visible and highlight each pillar as it comes up in the introduction.
- At the end of the introduction, switch to the first demo screen.

[Slide deck](https://docs.google.com/presentation/d/1zk6UD0ZoAxtGRqDTQL-MVulAWu5MH4nYmd-9xJBpU5Y/edit)

### Say

We'll start in Slack where the team is discussing a customer's missing discount. I'll give CodeRabbit the Jira report and repository, then follow the evidence from the ticket into the code. We'll agree on a focused plan and inspect the resulting fix, tests and pull request. Finally, I'll ask CodeRabbit to remember the business rule and check whether it can recall that decision in a new conversation.

### See

Frame at 00:09 in 08-coderabbit-agent-for-slack.mp4.

## Ask in Channel / STEP 1 OF 3: Open the team conversation

00:24.800–00:32.500

### Do

- Open #demo-site in Slack and the recorded investigation conversation.
- Keep the missing-discount question visible.

[#demo-site in Slack](https://coderabbitdemo.slack.com/archives/C0C1XHM10H2) · [Slack investigation thread](https://coderabbitdemo.slack.com/archives/C0C1XHM10H2/p1790456735329639)

### Say

In Slack, I open the conversation about a customer's missing discount. The order has reached the minimum quantity but the promotion hasn't applied.

### See

Frame at 00:30 in 08-coderabbit-agent-for-slack.mp4.

## Ask in Channel / STEP 2 OF 3: Include the ticket and repository

00:33.200–00:48.000

### Do

- In the composer, mention @CodeRabbit and enter the Investigation request from the appendix, including CDB-4 and demo-site-slack main.
- Click Send for a training run. For rehearsal, use the recorded message.

[Jira CDB-4](https://coderabbit-demo.atlassian.net/browse/CDB-4) · [Slack demo repository](https://github.com/coderabbit-demo/demo-site-slack)

### Say

I ask CodeRabbit to investigate linking the Jira report and naming the repository. The ticket contains the reported problem, expected behavior and acceptance criteria. For this first request, I want an explanation with links to the evidence. I'll review that before asking for a code change.

### See

Frame at 00:44 in 08-coderabbit-agent-for-slack.mp4.

## Ask in Channel / STEP 3 OF 3: Open the response thread

00:48.560–00:53.720

### Do

- Click the message’s reply count to open its thread.
- Scroll to the answer and its ticket/code references.

[Slack source-access evidence](https://coderabbitdemo.slack.com/archives/C0C1XHM10H2/p1790458495085939)

### Say

When the response arrives, I open the thread and follow its references to the ticket and implementation.

### See

Frame at 00:52 in 08-coderabbit-agent-for-slack.mp4.

## Connect the Evidence / STEP 1 OF 4: Read the expected boundary

00:54.400–01:03.940

### Do

- Scroll the response to the Jira evidence and the 9/10/11 item table.
- The ticket link opens the original requirements.

[Jira CDB-4](https://coderabbit-demo.atlassian.net/browse/CDB-4) · [Slack source-access evidence](https://coderabbitdemo.slack.com/archives/C0C1XHM10H2/p1790458495085939)

### Say

The ticket describes an unexpired promotion with a minimum of 10 items and 10% discount. 9 items should not qualify, 10 and 11 should.

### See

Frame at 01:02 in 08-coderabbit-agent-for-slack.mp4.

## Connect the Evidence / STEP 2 OF 4: Follow the source link

01:05.520–01:16.940

### Do

- Scroll to the promotions.ts comparison, then click its code citation.
- Switch to GitHub and inspect the original > condition at lines 20-23.

[Original discount code, lines 20-23](https://github.com/coderabbit-demo/demo-site-slack/blob/75b415d25e6238047dfdd051beac634b27be7a3b/src/services/promotions.ts#L20-L23)

### Say

CodeRabbit points to a comparison that requires the quantity to be greater than the minimum. Greater than 10 excludes 10 itself which explains the missing discount. I follow the code link and check that condition.

### See

Frame at 01:16 in 08-coderabbit-agent-for-slack.mp4.

## Connect the Evidence / STEP 3 OF 4: Inspect the known failing test

01:17.400–01:32.340

### Do

- Return to the response and click the flagship.test.ts citation.
- On GitHub, scroll to the exact-minimum it.fails case. Keep it visible while explaining that inspection is not a passing test run.

[Original expected-failure test](https://github.com/coderabbit-demo/demo-site-slack/blob/75b415d25e6238047dfdd051beac634b27be7a3b/tests/flagship.test.ts#L164-L168)

### Say

The response also identifies a test for that exact minimum that's marked as an expected failure. The test records the known problem. At this stage, CodeRabbit has inspected the code and test. We haven't established a passing result for a fix.

### See

Frame at 01:25 in 08-coderabbit-agent-for-slack.mp4.

## Connect the Evidence / STEP 4 OF 4: Return to the conclusion

01:33.660–01:38.020

### Do

- Switch back to Slack and scroll to the evidence summary.
- Keep the ticket and code citations available before planning.

[Slack source-access evidence](https://coderabbitdemo.slack.com/archives/C0C1XHM10H2/p1790458495085939)

### Say

The ticket and implementation now give us a specific boundary to correct.

### See

Frame at 01:37 in 08-coderabbit-agent-for-slack.mp4.

## Plan the Fix / STEP 1 OF 3: Request the inclusive-boundary plan

01:38.580–01:55.160

### Do

- In the conversation, mention @CodeRabbit and enter the Plan request from the appendix.
- Click Send for a training run; for rehearsal, open the saved plan.

[Slack planning conversation](https://coderabbitdemo.slack.com/archives/C0C1XHM10H2/p1790458861537939)

### Say

Back in the thread, I ask for a plan. The minimum must be inclusive so an order of exactly 10 items qualifies. I want a small change with tests below, at and above the boundary. The existing expected failure test should become a normal passing test.

### See

Frame at 01:50 in 08-coderabbit-agent-for-slack.mp4.

## Plan the Fix / STEP 2 OF 3: Read preservation requirements

01:56.360–02:04.560

### Do

- Scroll through the proposed plan to the expected-failure conversion, discount percentage and expiration cases.
- Hold the exact-expiration rule on screen.

### Say

I also ask the plan to preserve the discount percentage and expiration behavior. At the exact expiration time, the promotion should remain expired.

### See

Frame at 02:02 in 08-coderabbit-agent-for-slack.mp4.

## Plan the Fix / STEP 3 OF 3: Check the proposed scope

02:05.840–02:17.040

### Do

- Read the plan’s validation and excluded work.
- Keep the conversation visible before requesting implementation.

### Say

I read the proposed approach and check it against those requirements. The plan gives us a defined scope and a way to judge the result. With that agreed, we are ready to request implementation.

### See

Frame at 02:13 in 08-coderabbit-agent-for-slack.mp4.

## Deliver the Fix / STEP 1 OF 4: Request implementation

02:17.040–02:24.880

### Do

- Mention @CodeRabbit and enter the Implementation request from the appendix.
- Click Send for a training run. For rehearsal, open the existing delivery conversation.

[Slack planning conversation](https://coderabbitdemo.slack.com/archives/C0C1XHM10H2/p1790458861537939)

### Say

I ask CodeRabbit to implement the plan in a demo repository, run the relevant checks and open a pull request on a new branch.

### See

Frame at 02:23 in 08-coderabbit-agent-for-slack.mp4.

## Deliver the Fix / STEP 2 OF 4: Follow the implementation channel and PR

02:25.840–02:34.540

### Do

- Click the linked #fix-cdb-4-promotion-boundary channel.
- Scroll through the implementation summary and click its PR #1 link. Switch to GitHub.

[Slack-delivered PR #1](https://github.com/coderabbit-demo/demo-site-slack/pull/1)

### Say

The response links to a dedicated code channel for the implementation. I follow it to inspect the changed files and validation, then open the pull request.

### See

Frame at 02:33 in 08-coderabbit-agent-for-slack.mp4.

## Deliver the Fix / STEP 3 OF 4: Inspect the patch and validation

02:34.980–02:52.340

### Do

- Click Files changed and inspect the inclusive comparison and quantity/expiration tests.
- Return to the recorded task summary for 65 passed tests and five expected failures.
- On GitHub, inspect Checks and the CodeRabbit review result.

[PR #1: files changed](https://github.com/coderabbit-demo/demo-site-slack/pull/1/files) · [Slack-delivered PR #1](https://github.com/coderabbit-demo/demo-site-slack/pull/1)

### Say

The patch includes the inclusive comparison and regression tests for the quantity and expiration boundaries. In this recorded run, CodeRabbit reports 65 passed tests and 5 unchanged expected failures. GitHub's validation checks passed and CodeRabbit approved the pull request.

### See

Frame at 02:39 in 08-coderabbit-agent-for-slack.mp4.

## Deliver the Fix / STEP 4 OF 4: Follow the Jira handoff

02:53.080–03:01.840

### Do

- Return to Slack’s delivery message and show its Jira link and validation summary.
- Use the direct comment link to inspect the handoff. Return to PR #1 and show that it remains open.

[Jira CDB-4: delivery comment](https://coderabbit-demo.atlassian.net/browse/CDB-4?focusedCommentId=10266) · [Slack-delivered PR #1](https://github.com/coderabbit-demo/demo-site-slack/pull/1)

### Say

The delivery message links the result back to Jira with the validation summary. The ticket and pull request remain open, ready for the team to review and decide what to accept.

### See

Frame at 03:01 in 08-coderabbit-agent-for-slack.mp4.

## Remember the Decision / STEP 1 OF 4: Ask to remember the rule

03:02.720–03:08.860

### Do

- Return to the original Slack conversation. Mention @CodeRabbit and enter the Remember request from the appendix.
- Click Send for a training run; for rehearsal, read the recorded request.

[Slack planning conversation](https://coderabbitdemo.slack.com/archives/C0C1XHM10H2/p1790458861537939)

### Say

I return to Slack and ask CodeRabbit to remember the promotion rule and the regression cases future changes should cover.

### See

Frame at 03:07 in 08-coderabbit-agent-for-slack.mp4.

## Remember the Decision / STEP 2 OF 4: Read the saved record and limitation

03:09.480–03:24.460

### Do

- Scroll to the saved knowledge-base acknowledgment.
- Keep the inclusive minimum, boundary tests, preservation requirements and unavailable live remote check visible.

### Say

The response identifies a saved knowledge-base record containing the inclusive minimum, boundary tests and the requirement to preserve discount and expiration behavior. Its live remote check was unavailable in this run, so I also ask recall in a new conversation.

### See

Frame at 03:16 in 08-coderabbit-agent-for-slack.mp4.

## Remember the Decision / STEP 3 OF 4: Ask in a new conversation

03:26.240–03:32.920

### Do

- Return to #demo-site’s main composer outside the existing thread.
- Mention @CodeRabbit and enter the Recall question without supplying the answer. Click Send for a training run.
- For rehearsal, open the saved fresh recall thread.

[#demo-site in Slack](https://coderabbitdemo.slack.com/archives/C0C1XHM10H2) · [Fresh Slack recall conversation](https://coderabbitdemo.slack.com/archives/C0C1XHM10H2/p1790461194095169)

### Say

I ask which promotion rule we agreed on and which tests a future change should include without repeating the answer.

### See

Frame at 03:31 in 08-coderabbit-agent-for-slack.mp4.

## Remember the Decision / STEP 4 OF 4: Read recall and finish

03:32.920–03:53.160

### Do

- Scroll to the new answer and its saved-record reference.
- Show the inclusive rule and 9/10/11 cases, then finish on the flow slide.

[Fresh Slack recall conversation](https://coderabbitdemo.slack.com/archives/C0C1XHM10H2/p1790461194095169)

### Say

CodeRabbit returns the inclusive rule, the 9, 10 and 11 item cases and a reference to the saved record. We followed a customer report from Slack into the evidence, agreed on a fix and inspected its delivery. The team also brings that business rule into its next conversation.

### See

Frame at 03:51 in 08-coderabbit-agent-for-slack.mp4.
