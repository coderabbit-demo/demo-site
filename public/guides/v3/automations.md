# Automations — Do / Say / See

Companion to the complete Version 3 recording. Times are minutes:seconds.milliseconds.

## Introduction / OPENING: Introduce the flow

00:00.000–00:20.960

### Do

- Show the section’s flow slide. Keep the full slide visible and highlight each pillar as it comes up in the introduction.
- At the end of the introduction, switch to the first demo screen.

[Slide deck](https://docs.google.com/presentation/d/1zk6UD0ZoAxtGRqDTQL-MVulAWu5MH4nYmd-9xJBpU5Y/edit)

### Say

Here we'll use a reported discount bug to walk through an automation. I'll start with the GitHub issue trigger, define the task and its destination, then follow a run from the incoming issue to its result. We'll inspect the proposed fix and regression tests in the pull request. Finally, I'll return to the run history and show where to refine the instructions or pause the workflow.

### See

Frame at 00:09 in 06-codeRabbit-automations.mp4.

## Pick a Trigger / STEP 1 OF 3: Choose the issue template

00:23.500–00:35.660

### Do

- Open Automations Home and click Create PR from GitHub issue.
- Keep the dedicated demo-site-automations repository in view while introducing the discount bug.

[Automations Home](https://app.coderabbit.ai/automations) · [Automations repository](https://github.com/coderabbit-demo/demo-site-automations)

### Say

I open automations and choose create PR from GitHub issue. Our example is a discount boundary bug. An order reaches the minimum quantity but the discount doesn't apply until the customer adds another item.

### See

Frame at 00:26 in 06-codeRabbit-automations.mp4.

## Pick a Trigger / STEP 2 OF 3: Configure the trigger

00:36.140–00:43.960

### Do

- Name the automation Demo - Discount issue to PR.
- Under When a GitHub event arrives, select GitHub, the demo repository and Issue opened.

[Demo automation](https://app.coderabbit.ai/automations/ui-bdb1428f-4e1e-4a2b-b222-3b8d3bac5520)

### Say

I select the demo repository and the issue opened event. That defines which GitHub event starts the work.

### See

Frame at 00:42 in 06-codeRabbit-automations.mp4.

## Pick a Trigger / STEP 3 OF 3: Check the connection and move to instructions

00:44.480–00:59.440

### Do

- Read the GitHub connection, repository installation and event-sync indicators.
- Scroll down to Tell CodeRabbit what to do.

### Say

The connection status confirms that the GitHub app is connected, the repository is installed and the event is synced. GitHub can now send a matching event to CodeRabbit. The trigger tells the automation when to start. Next, I'll define the task it should carry out.

### See

Frame at 00:51 in 06-codeRabbit-automations.mp4.

## Define the Task / STEP 1 OF 4: Enter the scoped task

00:59.980–01:17.580

### Do

- Click Tell CodeRabbit what to do and enter Agent instructions from the appendix.
- Scroll inside the field to the existing-fix check and below/at/above-minimum tests.

### Say

In the instructions, I describe the work in plain language, investigate the reported problem, make a focused fix and test the result. I ask the agent to check whether the bug is already fixed before editing anything. If a change is needed, the test should cover an order below the minimum, exactly at it and above it.

### See

Frame at 01:12 in 06-codeRabbit-automations.mp4.

## Define the Task / STEP 2 OF 4: Check preserved behavior

01:18.260–01:23.120

### Do

- Keep the instruction field visible and read the discount amount, expiration and checkout preservation requirements.

### Say

I also specify the behavior to preserve, including the discount amount and expiration rule.

### See

Frame at 01:21 in 06-codeRabbit-automations.mp4.

## Define the Task / STEP 3 OF 4: Set the GitHub destination

01:23.700–01:36.520

### Do

- Scroll to Post results back to GitHub and select demo-site-automations.
- Enter the GitHub target instructions from the appendix, including one PR, test evidence, issue link and no merge.

### Say

For the destination, I select the GitHub repository and request one pull request with an explanation, test results and a link to the issue. The pull request should remain unmerged for review.

### See

Frame at 01:32 in 06-codeRabbit-automations.mp4.

## Define the Task / STEP 4 OF 4: Review and save the configuration

01:37.780–01:44.180

### Do

- Read the completed task and destination instructions.
- Click Save automation when reproducing the setup. For rehearsal, open the saved configuration.

[Demo automation](https://app.coderabbit.ai/automations/ui-bdb1428f-4e1e-4a2b-b222-3b8d3bac5520)

### Say

Those instructions will be reused for matching events so it's worth being clear about the scope and the evidence we want back.

### See

Frame at 01:42 in 06-codeRabbit-automations.mp4.

## Run Always-On / STEP 1 OF 4: Check the active workflow

01:44.900–01:50.100

### Do

- Open the automation Overview and show the recorded Active state.
- The saved demo is now paused; use the existing run for rehearsal.

[Demo automation](https://app.coderabbit.ai/automations/ui-bdb1428f-4e1e-4a2b-b222-3b8d3bac5520)

### Say

With the trigger, instructions and destination saved, I check that the automation is active.

### See

Frame at 01:49 in 06-codeRabbit-automations.mp4.

## Run Always-On / STEP 2 OF 4: Inspect the triggering issue

01:50.900–02:10.240

### Do

- Open the dedicated repository, click Issues, then the recorded issue #1.
- For a training run, click New issue and enter the title/body from the appendix, then Submit new issue once.
- Read the reproduction steps, boundary expectations and preserved behavior.

[Triggering GitHub issue #1](https://github.com/coderabbit-demo/demo-site-automations/issues/1) · [Automations repository](https://github.com/coderabbit-demo/demo-site-automations)

### Say

Here's the issue used for this run. Its title identifies the missing discount at the exact minimum quantity. The description explains how to reproduce it and gives the expected behavior below, at and above the boundary. The issue also asks the fix to preserve the existing discount and checkout behavior.

### See

Frame at 02:01 in 06-codeRabbit-automations.mp4.

## Run Always-On / STEP 3 OF 4: Follow the run in Activity

02:10.820–02:21.760

### Do

- Return to Automations and click Activity.
- Open the issue #1 run and scroll its activity/result details.

[Automations Activity](https://app.coderabbit.ai/automations/activity)

### Say

I return to automations and open activity. This run was started by that GitHub issue using the instructions we saved. I can follow the agent's investigation and read the results here.

### See

Frame at 02:16 in 06-codeRabbit-automations.mp4.

## Run Always-On / STEP 4 OF 4: Read the result and follow the PR

02:22.320–02:31.500

### Do

- Open the completed run’s result and locate the threshold fix and regression-test summary.
- Click its PR #2 link and switch to GitHub.

[Automation result: PR #2](https://github.com/coderabbit-demo/demo-site-automations/pull/2)

### Say

The completed run reports that it opened a pull request containing the threshold fix and regression tests. I follow the result link to inspect what it produced.

### See

Frame at 02:26 in 06-codeRabbit-automations.mp4.

## Review Output / STEP 1 OF 4: Check the PR and comparison

02:32.900–02:43.660

### Do

- Read PR #2’s destination and issue link. Click Files changed.
- Select src/services/promotions.ts and show > changing to >=.

[Automation result: PR #2](https://github.com/coderabbit-demo/demo-site-automations/pull/2) · [PR #2: files changed](https://github.com/coderabbit-demo/demo-site-automations/pull/2/files)

### Say

On GitHub, I check the pull request destination branch, changed files and link back to the issue. The code change includes the minimum quantity in the discount comparison.

### See

Frame at 02:42 in 06-codeRabbit-automations.mp4.

## Review Output / STEP 2 OF 4: Inspect boundary and expiration tests

02:44.320–02:57.100

### Do

- Select the promotion test file in Files changed.
- Scroll through quantities below, at and above both thresholds, then the expired-promotion case.

### Say

I open the test to see how the boundary is covered. There are cases below, at and above the threshold, using two different minimum quantities. The tests also check that an expired promotion doesn't give a discount.

### See

Frame at 02:51 in 06-codeRabbit-automations.mp4.

## Review Output / STEP 3 OF 4: Read validation evidence

02:57.960–03:07.760

### Do

- Return to the recorded run result and read 70 passed tests and five expected failures.
- Return to PR #2, open Checks and inspect the GitHub validation result.

[Automations Activity](https://app.coderabbit.ai/automations/activity) · [Automation result: PR #2](https://github.com/coderabbit-demo/demo-site-automations/pull/2)

### Say

The recorded run reports 70 passed tests and 5 existing expected failures for unrelated problems. GitHub's automated checks also passed.

### See

Frame at 03:03 in 06-codeRabbit-automations.mp4.

## Review Output / STEP 4 OF 4: Read the review limitation

03:08.620–03:28.880

### Do

- Click Conversation and scroll to CodeRabbit’s Review skipped response.
- Read the author/reviewer-account explanation. Leave the PR open and unmerged.

[Automation result: PR #2](https://github.com/coderabbit-demo/demo-site-automations/pull/2)

### Say

There is a separate review limitation here. CodeRabbit skipped its pull request review because the author is also the configured reviewer account. The passing tests don't stand in for that review. I leave the pull request open for the team to inspect. The automation has prepared a proposed fix and its evidence. The team still decides whether to accept it.

### See

Frame at 03:16 in 06-codeRabbit-automations.mp4.

## Tune & Track / STEP 1 OF 4: Inspect history and one run

03:29.200–03:47.400

### Do

- Return to the automation Overview, then click Activity.
- Locate the recorded issue-triggered run. Read its time, trigger and agent minutes, then open the result details.

[Demo automation](https://app.coderabbit.ai/automations/ui-bdb1428f-4e1e-4a2b-b222-3b8d3bac5520) · [Automations Activity](https://app.coderabbit.ai/automations/activity)

### Say

I return to the automation's overview and open activity. The history shows when it ran, what triggered the work and the agent minutes used. Opening a run lets me read its result in context. That's where I'd look if a task reported a blocker or delivered something different from what I expected.

### See

Frame at 03:45 in 06-codeRabbit-automations.mp4.

## Tune & Track / STEP 2 OF 4: Preview the configuration

03:48.100–03:53.400

### Do

- Return to the automation and click Edit.
- Scroll through instructions and GitHub destination. Cancel or go Back without changing the saved configuration.

### Say

I can return to the configuration to refine the instructions or destination for future runs.

### See

Frame at 03:52 in 06-codeRabbit-automations.mp4.

## Tune & Track / STEP 3 OF 4: Show how to pause

03:53.940–03:57.560

### Do

- On Overview, show the Active/Pause control and the recorded Paused result.
- For rehearsal, retain the existing paused state.

### Say

If I want to stop processing new events, I can pause the automation.

### See

Frame at 03:57 in 06-codeRabbit-automations.mp4.

## Tune & Track / STEP 4 OF 4: Close on the workflow result

03:58.600–04:08.120

### Do

- Keep the run history visible while finishing the narration.
- Return to the flow slide for the silent ending.

[Demo automation](https://app.coderabbit.ai/automations/ui-bdb1428f-4e1e-4a2b-b222-3b8d3bac5520) · [Automation result: PR #2](https://github.com/coderabbit-demo/demo-site-automations/pull/2)

### Say

We've defined the task once and followed an incoming issue through to a proposed fix. The run history and configuration give us a way to improve that workflow as we see the results.

### See

Frame at 04:05 in 06-codeRabbit-automations.mp4.
