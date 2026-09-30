# Change Stack — Do / Say / See

Companion to the complete Version 3 recording. Times are minutes:seconds.milliseconds.

## Introduction / OPENING: Introduce the flow

00:00.000–00:20.200

### Do

- Show the section’s flow slide. Keep the full slide visible and highlight each pillar as it comes up in the introduction.
- At the end of the introduction, switch to the first demo screen.

[Slide deck](https://docs.google.com/presentation/d/1zk6UD0ZoAxtGRqDTQL-MVulAWu5MH4nYmd-9xJBpU5Y/edit)

### Say

Once I've chosen a pull request, I want to understand how its changes fit together. I'll open Change Stack, walk through the layers and connect the invoice search and discount behavior to the code and tests. Then I'll filter the findings and ask a question about the relevant code. We'll finish with the review options and the conditions that need to be met before a merge.

### See

Frame at 00:09 in 04-change-stack.mp4.

## Open the Stack / STEP 1 OF 3: Enter from Triage

00:21.170–00:29.050

### Do

- Open PR #4’s Triage card and click Review this pull request in Change Stack.
- Switch to the new tab and confirm the PR identity.

[Triage queue](https://app.coderabbit.ai/triage) · [PR #4: Change Stack](https://app.coderabbit.ai/change-stack/coderabbit-demo/demo-site-pr-examples/pull/4/overview)

### Say

From the pull request card in Triage, I open Change Stack. This is our checkout and invoice change and overview is the starting point.

### See

Frame at 00:27 in 04-change-stack.mp4.

## Open the Stack / STEP 2 OF 3: Read Overview and attention items

00:29.790–00:42.050

### Do

- Click Overview in the left rail. Scroll through the summary and changed behavior.
- Continue to What changed and remaining concerns; expand details where needed.

### Say

I read the summary to understand what the feature is trying to do and then look at the areas that need attention. For this application, I'm checking two promises. Customers should see their own invoices and qualifying orders should receive a discount.

### See

Frame at 00:40 in 04-change-stack.mp4.

## Open the Stack / STEP 3 OF 3: Check the review snapshot

00:42.750–00:54.410

### Do

- Open Review history at the lower left and inspect the recorded review version.
- Select the historical snapshot if needed to find the retained discount discussion. Do not regenerate a review.

### Say

I also check which review version I'm reading. The findings belong to that version of the code. If the author pushes an update, I need to inspect the newer review before deciding whether the issue is addressed.

### See

Frame at 00:51 in 04-change-stack.mp4.

## Walk the Layers / STEP 1 OF 4: Open pricing and checkout

00:55.010–01:06.450

### Do

- Click the promotional-pricing layer in the left rail. Select src/services/promotions.ts in its file list.
- Read the summary and adjacent code. Then click the bulk-checkout layer and inspect its related changes.

### Say

I open the layers to work through related changes in smaller groups. The promotion pricing layer shows how discount eligibility is calculated. Bulk discount shows where that behavior is used.

### See

Frame at 01:02 in 04-change-stack.mp4.

## Walk the Layers / STEP 2 OF 4: Trace invoice search

01:07.150–01:24.610

### Do

- Click the invoice-search/export layer and choose src/services/invoice-search.ts.
- Scroll to the query and the customer/search inputs. Keep the inline finding visible.

[PR #4: SQL finding](https://github.com/coderabbit-demo/demo-site-pr-examples/pull/4#discussion_r3991696811)

### Say

Invoice search and export cover another part of the feature with tests and documentation in their own layer. I select the invoice layer and scroll to the search query. The customer supplies search text and the application uses it to retrieve invoices. I check how the text and the customer's identity enter the query.

### See

Frame at 01:21 in 04-change-stack.mp4.

## Walk the Layers / STEP 3 OF 4: Read the historical discount discussion

01:25.120–01:42.880

### Do

- Return to the pricing layer and promotions.ts.
- Scroll to the strict > comparison. Expand the historical discount thread; enable Resolved if it is hidden.

[PR #4: historical discount thread](https://github.com/coderabbit-demo/demo-site-pr-examples/pull/4#discussion_r3991696822)

### Say

Next, I look at the discount comparison. The requirement includes an order of exactly 10 items while the strict, greater than condition excludes it. That discount discussion is retained in this demo's review history. I use it to examine the behavior without presenting it as a newly open finding.

### See

Frame at 01:31 in 04-change-stack.mp4.

## Walk the Layers / STEP 4 OF 4: Connect the behavior to tests

01:43.700–01:51.840

### Do

- Open the tests/validation layer and select the relevant promotion test file.
- Scroll to ordinary and exact-minimum cases. Keep code and findings beside the tests.

### Say

Finally, I look at the related tests. I want to see whether they check the behavior we expect at the boundary as well as an ordinary successful case.

### See

Frame at 01:50 in 04-change-stack.mp4.

## Filter Findings / STEP 1 OF 4: Set the minimum severity

01:52.540–01:58.060

### Do

- Open Comments in the review pane and click its filter controls.
- Select the minimum severity for the security investigation.

### Say

I open the findings controls and set a minimum severity to focus on the more serious concerns.

### See

Frame at 01:57 in 04-change-stack.mp4.

## Filter Findings / STEP 2 OF 4: Read the SQL finding beside the query

01:59.340–02:20.640

### Do

- Select the SQL injection finding in the filtered list.
- Scroll within its explanation to the tenant-boundary concern and compare it with the adjacent query.

[PR #4: SQL finding](https://github.com/coderabbit-demo/demo-site-pr-examples/pull/4#discussion_r3991696811)

### Say

Then, I open the security finding beside the affected query. The explanation describes how search text can become part of a database command. I read it alongside the code and check what that means for the customer's data. A useful correction needs to keep the search within the customer's account, including when the input contains characters with special meaning in SQL.

### See

Frame at 02:08 in 04-change-stack.mp4.

## Filter Findings / STEP 3 OF 4: Inspect resolved and outdated visibility

02:21.340–02:33.160

### Do

- Open the comment filters again. Show Resolved and Outdated controls.
- Enable Resolved to find the historical discount thread without treating it as a new unresolved finding.

[PR #4: historical discount thread](https://github.com/coderabbit-demo/demo-site-pr-examples/pull/4#discussion_r3991696822)

### Say

I can also include resolved and outdated threads to revisit earlier discussions, such as the discount example. Their status matters when I am deciding what still needs work.

### See

Frame at 02:30 in 04-change-stack.mp4.

## Filter Findings / STEP 4 OF 4: Check the filters before moving on

02:34.980–02:39.420

### Do

- Return to the filters and check which findings are hidden.
- Close the menu and keep the selected code visible.

### Say

Before finishing the review, I check the filters again so I don't overlook another finding I need to read.

### See

Frame at 02:38 in 04-change-stack.mp4.

## Ask in Context / STEP 1 OF 4: Open the inline conversation

02:39.880–02:55.660

### Do

- On promotions.ts, expand the discount item and select Continue.
- Click the conversation input. Ask what happens with ten items at a minimum of ten, including tests and expiration. Click Send for a training run.

[PR #4: historical discount thread](https://github.com/coderabbit-demo/demo-site-pr-examples/pull/4#discussion_r3991696822)

### Say

On the discount's inline item, I select Continue to open a conversation about that code. I see what happens when an order contains 10 items and the minimum is 10. I also ask about tests and expirations because a quantity fix should leave an expired promotion ineligible.

### See

Frame at 02:53 in 04-change-stack.mp4.

## Ask in Context / STEP 2 OF 4: Read the clarified rule

02:56.360–03:07.020

### Do

- Scroll to the answer beside the selected code.
- Keep the inclusive minimum and before-expiration explanation visible.

### Say

The first answer needs clarification. I restate the rule at least 10 items and only before the expiration time. Then, I compare the follow-up with the condition in the code.

### See

Frame at 03:04 in 04-change-stack.mp4.

## Ask in Context / STEP 3 OF 4: Request a compact boundary summary

03:07.960–03:23.080

### Do

- Scroll through the answer, then use the input to ask for the 9, 10 and 11 item cases and the expiration boundary.
- Click Send for a training run; for rehearsal, inspect the existing answer. Keep the relevant code selected.

### Say

The checks we need are straightforward, below the minimum, exactly at it and above it. At the expiration time, the promotion should no longer apply. I ask for a short summary of those expectations. That gives me concrete behavior to verify in a proposed fix.

### See

Frame at 03:14 in 04-change-stack.mp4.

## Ask in Context / STEP 4 OF 4: Keep the conversation tied to its review

03:23.580–03:30.600

### Do

- Read the response with the selected review version visible.
- Use the same review for this conversation; open a new conversation if inspecting a later revision.

### Say

This conversation belongs to the review where it started. If the code changes, I'll open a new conversation on the updated review.

### See

Frame at 03:29 in 04-change-stack.mp4.

## Approve & Merge / STEP 1 OF 4: Preview the review choices

03:31.920–03:47.560

### Do

- Open Submit review in Mike’s reviewer account.
- Show Comment, Approve and Request changes. Close the dialog without submitting.

### Say

I open the review options. From this reviewer account, I can choose comment, approve or request changes. The invoice search concern still needs investigation. For this demo, I will leave the pull request open and preview the choices without submitting a review.

### See

Frame at 03:45 in 04-change-stack.mp4.

## Approve & Merge / STEP 2 OF 4: Return to the unresolved concerns

03:48.420–03:55.960

### Do

- Click Overview and scroll to remaining concerns.
- Keep the SQL finding and historical discount context visible; leave the fixture open.

[PR #4: Change Stack](https://app.coderabbit.ai/change-stack/coderabbit-demo/demo-site-pr-examples/pull/4/overview)

### Say

In a working review, I request changes needed to address the concern, then inspect the updated code and tests before approving.

### See

Frame at 03:54 in 04-change-stack.mp4.

## Approve & Merge / STEP 3 OF 4: Inspect provider merge requirements

03:56.480–04:14.320

### Do

- Open GitHub PR #4 and scroll to the merge area in Conversation.
- Expand the review and check details. Read available merge controls without activating them.

[Flagship PR #4](https://github.com/coderabbit-demo/demo-site-pr-examples/pull/4)

### Say

I also check the repository's merge requirements. CodeRabbit's assessment informs the decision while the provider's branch rules determine which checks and approvals are enforced. A request for changes on its own doesn't prove that a merge is blocked. I need to confirm the rules that apply to this branch.

### See

Frame at 04:09 in 04-change-stack.mp4.

## Approve & Merge / STEP 4 OF 4: Finish on the review decision

04:14.320–04:24.940

### Do

- Return to Change Stack Overview and keep the remaining concerns visible.
- Finish the narration, then show the flow slide during the silent ending.

[PR #4: Change Stack](https://app.coderabbit.ai/change-stack/coderabbit-demo/demo-site-pr-examples/pull/4/overview)

### Say

We follow the change through its layers, check the findings and clarify the expected behavior. We can now explain what needs to happen before the team accepts it.

### See

Frame at 04:22 in 04-change-stack.mp4.
