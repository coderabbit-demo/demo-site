# Triage — Do / Say / See

Companion to the complete Version 3 recording. Times are minutes:seconds.milliseconds.

## Introduction / OPENING: Introduce the flow

00:00.800–00:23.100

### Do

- Show the section’s flow slide. Keep the full slide visible and highlight each pillar as it comes up in the introduction.
- At the end of the introduction, switch to the first demo screen.

[Slide deck](https://docs.google.com/presentation/d/1zk6UD0ZoAxtGRqDTQL-MVulAWu5MH4nYmd-9xJBpU5Y/edit)

### Say

When several pull requests are waiting, I need to decide where to start. I'll open Triage, narrow the queue to the work that needs my action, and read the reason behind a recommendation. Then I'll use the card to open a detailed review. We'll also look at the Slack digest, which brings the queue into the team's conversation and gives me a place to pick up the next review.

### See

Frame at 00:09 in 03-triage.mp4.

## Open Triage / STEP 1 OF 3: Open and search the queue

00:24.210–00:38.710

### Do

- Open Triage in Mike’s reviewer account. Select coderabbit-demo and click All PRs.
- Click search and enter demo-site-pr-examples.

[Triage queue](https://app.coderabbit.ai/triage)

### Say

I open Triage to see pull requests across the repositories available to this account. I'm looking for our checkout and invoice change. I check the repository, pull request number, and title before opening it, so I know I'm following the right example.

### See

Frame at 00:36 in 03-triage.mp4.

## Open Triage / STEP 2 OF 3: Identify the PR

00:39.270–00:51.170

### Do

- Locate PR #4. Read its repository, title, author, review state and checks before opening it.

[Flagship PR #4](https://github.com/coderabbit-demo/demo-site-pr-examples/pull/4)

### Say

This change introduces promotional pricing and invoice features. We already have two questions to investigate. Whether customers can see only their own invoices and whether the discount applies at the correct quantity.

### See

Frame at 00:48 in 03-triage.mp4.

## Open Triage / STEP 3 OF 3: Read what needs attention

00:52.170–00:58.610

### Do

- Keep the PR card centered. Scroll enough to see its next-action line.

### Say

The queue gives me a view of the work waiting for attention. I'll narrow it to my responsibilities before deciding where to begin.

### See

Frame at 00:57 in 03-triage.mp4.

## My Action / STEP 1 OF 4: Select your action queue

01:00.130–01:05.870

### Do

- Click Requires my action in the queue navigation.

[Triage queue](https://app.coderabbit.ai/triage)

### Say

I select Requires my action, which brings together pull requests involving me as an author or reviewer.

### See

Frame at 01:04 in 03-triage.mp4.

## My Action / STEP 2 OF 4: Find the reviewer example

01:06.650–01:15.010

### Do

- Keep demo-site-pr-examples in search and locate PR #4.
- Check the reviewer context; Mahesh is the author in this recorded example.

### Say

For this part of the demo, I'm using Mike's reviewer account. I search for the demonstration repository and find the checkout and invoice pull request.

### See

Frame at 01:12 in 03-triage.mp4.

## My Action / STEP 3 OF 4: Read your responsibility

01:15.770–01:26.550

### Do

- Scroll to Review this pull request in Change Stack on the card.
- Leave it unclicked while explaining the reviewer’s next step.

### Say

As the reviewer, my job is to examine the proposed behavior and the response to feedback. If the code needs to change, the author can prepare an update for another review.

### See

Frame at 01:24 in 03-triage.mp4.

## My Action / STEP 4 OF 4: Show the wider queue

01:28.050–01:34.210

### Do

- Click All PRs to show the broader queue. Return to Requires my action to continue the reviewer flow.

### Say

The search keeps this example in view. I can return to All PRs whenever I need to see the wider queue.

### See

Frame at 01:33 in 03-triage.mp4.

## Read the Why / STEP 1 OF 3: Open the priority reason

01:35.450–01:50.790

### Do

- Click the card’s three-dot menu, then View priority reason.
- Read the priority explanation and distinguish its priority label from High security risk.

### Say

I open View priority reason from the card to see why this pull request needs attention. This example is P2, Medium priority, and it also shows High security risk. Those labels describe different things.

### See

Frame at 01:48 in 03-triage.mp4.

## Read the Why / STEP 2 OF 3: Inspect the risk evidence

01:51.330–02:07.770

### Do

- Click outside the menu. Hover High security risk to show its explanation.
- Hold the tooltip and PR title in view while describing the customer-data boundary.

### Say

Queue priority helps me compare work while the security risk tells me about a concern within this change. The explanation points to security issues and problems with the data the change returns. I can use that reasoning to decide what to inspect first.

### See

Frame at 02:05 in 03-triage.mp4.

## Read the Why / STEP 3 OF 3: Choose the investigation order

02:08.710–02:23.810

### Do

- Dismiss the tooltip and keep the PR card visible.
- Explain the SQL finding and discount boundary without claiming the queue always ranks every security issue first.

### Say

Here I'd start with invoice search because it could expose another customer's data. The discount boundary also matters and we'll inspect that as we review the code. I now have a reason for choosing this pull request and a specific question to investigate.

### See

Frame at 02:16 in 03-triage.mp4.

## Act from Card / STEP 1 OF 3: Inspect available actions

02:24.690–02:32.730

### Do

- Open the three-dot menu and show View priority reason, Follow and Close PR.
- Click outside to dismiss it; leave the PR open.

### Say

I return to the card and open its action menu. The available actions sit alongside the recommendations so I can see how to move the work forward.

### See

Frame at 02:31 in 03-triage.mp4.

## Act from Card / STEP 2 OF 3: Inspect checks and requested changes

02:34.110–02:45.230

### Do

- Hover the passed-checks indicator to reveal its detail.
- Read passing checks alongside Changes requested, then dismiss the popover.

### Say

I also check its current status. This card shows passed checks and requests for changes. Passing checks are useful but the review still raises questions about the application's behavior.

### See

Frame at 02:42 in 03-triage.mp4.

## Act from Card / STEP 3 OF 3: Open the detailed review

02:46.470–02:58.150

### Do

- Click Review this pull request in Change Stack. Switch to the new tab.
- Confirm PR #4 and the Overview screen.

[PR #4: Change Stack](https://app.coderabbit.ai/change-stack/coderabbit-demo/demo-site-pr-examples/pull/4/overview)

### Say

In this example, I want to read the code and findings before requesting a repair. I follow the Change Stack link to open the detailed review. That takes me from choosing a pull request to investigating the change itself.

### See

Frame at 02:56 in 03-triage.mp4.

## Queue to You / STEP 1 OF 4: Open the digest example

02:59.110–03:06.950

### Do

- Switch to Slack in Mahesh’s connected account. Open the CodeRabbit app under Apps, then Messages.
- Show the supplied digest screenshot. Its original message permalink was not recorded.

### Say

The queue can also reach me in Slack. Here is a digest from the author's connected account with examples from other repositories.

### See

Frame at 03:05 in 03-triage.mp4.

## Queue to You / STEP 2 OF 4: Read Now and Next

03:07.910–03:17.530

### Do

- Scroll the digest to show Now, then Next. Read the repository and PR number on each card.

### Say

The message groups work into Now and Next. Each card identifies the repository and pull request, summarizes the change and shows its status.

### See

Frame at 03:15 in 03-triage.mp4.

## Queue to You / STEP 3 OF 4: Show the digest actions

03:18.190–03:31.550

### Do

- Show Merge and Find reviewer on security-harness #18, then Fix merge conflicts on #14.
- Keep these as previews; do not activate them.

### Say

I scroll through the available actions. One card offers Merge and Find reviewer, another offers Fix merge conflicts. Those give the team a starting point for the next step. We still check the review evidence before accepting a change.

### See

Frame at 03:28 in 03-triage.mp4.

## Queue to You / STEP 4 OF 4: Return to the reviewer card

03:32.090–03:40.250

### Do

- Switch back to Mike’s Triage tab and search demo-site-pr-examples.
- Locate PR #4 and its Change Stack action. Return to the flow slide for the closing hold.

[Triage queue](https://app.coderabbit.ai/triage) · [PR #4: Change Stack](https://app.coderabbit.ai/change-stack/coderabbit-demo/demo-site-pr-examples/pull/4/overview)

### Say

I return to Mike's reviewer account and our checkout and invoice pull request. From this card, we'll continue to Change Stack to examine the code.

### See

Frame at 03:38 in 03-triage.mp4.
