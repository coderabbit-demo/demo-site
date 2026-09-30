# Engineering Security — Do / Say / See

Companion to the complete Version 3 recording. Times are minutes:seconds.milliseconds.

## Review PR Findings / STEP 1 OF 4: Open the PR security finding

00:01.440–00:33.860

### Do

- Open CodeRabbit Security, then PR security reviews. Filter to coderabbit-demo/demo-site-pr-examples.
- Open Unaddressed findings and expand PR #4. Follow its PR/finding link to GitHub and open the invoice-search SQL review comment.

[Deep Scan finding: CWE-89](https://app.coderabbit.ai/security/code?owner=coderabbit-demo&repo=demo-site-pr-examples&findingId=5bbe54d1-f97b-48ba-9a95-9cc1300c4cdf) · [Flagship PR #4](https://github.com/coderabbit-demo/demo-site-pr-examples/pull/4) · [PR #4: SQL finding](https://github.com/coderabbit-demo/demo-site-pr-examples/pull/4#discussion_r3991696811)

### Say

Let's look at security from the engineer side, reviewing a pull request, understanding the impact of a finding, and getting a fix ready for review. We'll start with the security finding in the PR, follow the change through Change Stack and security blast radius, then use fix with AI to prepare a patch. Here in PR security reviews, I'll open pull request 4. This change adds bulk checkout, promotional pricing, and invoice exports. We'll focus on the SQL injection finding in invoice search.

### See

Frame at 00:22 in 5a-security-engineering.mp4.

## Review PR Findings / STEP 2 OF 4: Inspect the interpolated query

00:34.580–00:48.360

### Do

- Scroll the finding to the cited invoice-search code.
- Show search text and tenant ID inserted into the SQL command. Keep the cross-customer explanation visible.

### Say

The finding points to a query that inserts search text directly into a SQL command. It also inserts the tenant ID into that command. A crafted search could change the query and return invoices belonging to another customer.

### See

Frame at 00:43 in 5a-security-engineering.mp4.

## Review PR Findings / STEP 3 OF 4: Read severity and reachability

00:48.360–00:56.700

### Do

- Scroll to the finding summary and read severity, reachability and exploitability.
- Keep the affected file and supporting code available.

### Say

I can see the severity, reachability, and exploitability assessment along with the code behind the finding.

### See

Frame at 00:54 in 5a-security-engineering.mp4.

## Review PR Findings / STEP 4 OF 4: Read the parameter-binding recommendation

00:57.600–01:03.560

### Do

- Scroll to Recommendation. Expand the suggested code if collapsed.
- Show placeholders with tenant and search values supplied separately.

### Say

The recommended fix is to bind both values as parameters so the database treats them as data.

### See

Frame at 01:01 in 5a-security-engineering.mp4.

## Open Change Stack / STEP 1 OF 2: Follow the PR to Change Stack

01:04.480–01:11.200

### Do

- Click the PR #4 link and switch to GitHub. Open the SQL review comment.
- Scroll to CodeRabbit’s walkthrough and click Review in Change Stack. Switch to the new tab.

[Flagship PR #4](https://github.com/coderabbit-demo/demo-site-pr-examples/pull/4) · [PR #4: SQL finding](https://github.com/coderabbit-demo/demo-site-pr-examples/pull/4#discussion_r3991696811) · [PR #4: Change Stack](https://app.coderabbit.ai/change-stack/coderabbit-demo/demo-site-pr-examples/pull/4/overview)

### Say

Let's open the pull request and look at the review comment in context. From here, I'll choose review in Change Stack.

### See

Frame at 01:08 in 5a-security-engineering.mp4.

## Open Change Stack / STEP 2 OF 2: Read the related layers

01:11.960–01:20.720

### Do

- In Change Stack, read the left layer rail and select the invoice-search/export layer.
- Inspect the grouped changes before opening the impact view.

[PR #4: Change Stack](https://app.coderabbit.ai/change-stack/coderabbit-demo/demo-site-pr-examples/pull/4/overview)

### Say

Change Stack organizes the PR into related layers. That lets me review the invoice changes together and see how they fit into the rest of the pull request.

### See

Frame at 01:17 in 5a-security-engineering.mp4.

## Explore Blast Radius / STEP 1 OF 4: Open the security graph

01:21.780–01:30.060

### Do

- Click Security Blast Radius in the left rail. Select the SQL injection concern.
- Keep the graph legend and changed components visible.

[PR #4: Security Blast Radius](https://app.coderabbit.ai/change-stack/coderabbit-demo/demo-site-pr-examples/pull/4/blast-radius)

### Say

Now I'll open security blast radius and select the SQL injection concern. The graph shows the changed components and their relationships.

### See

Frame at 01:27 in 5a-security-engineering.mp4.

## Explore Blast Radius / STEP 2 OF 4: Inspect dependency and consumer relationships

01:30.900–01:39.300

### Do

- Select the shared data model relationship for invoice search/export.
- Read its evidence, then select the web-client consumer relationship and inspect its request/result context.

### Say

For invoice search and export, I can inspect the shared data model. This code depends on and the web client that sends searches and receives results.

### See

Frame at 01:37 in 5a-security-engineering.mp4.

## Explore Blast Radius / STEP 3 OF 4: Read supporting evidence

01:40.960–01:52.060

### Do

- Open the relationship’s supporting code evidence.
- Scroll inside the evidence panel and distinguish connected components from confirmed vulnerabilities.

### Say

Those connections help me decide where else to look. They don't mean every connected component is vulnerable. I can open the supporting evidence and check what each relationship actually involves.

### See

Frame at 01:48 in 5a-security-engineering.mp4.

## Explore Blast Radius / STEP 4 OF 4: Check the tenant boundary

01:53.060–02:05.140

### Do

- Keep the relevant query path visible.
- Trace customer-controlled search text to the SQL command and the tenant boundary before starting the fix.

### Say

In this case, the important question is whether customer controlled search text can alter the database query and cross boundary between tenants. That gives me a specific behavior to check when I review the fix.

### See

Frame at 02:01 in 5a-security-engineering.mp4.

## Fix with AI / STEP 1 OF 4: Select the finding beside its code

02:06.100–02:19.040

### Do

- Click the affected graph component, then Open in layer.
- Open the context panel and select Comments. Scroll to the SQL finding.
- Click Fix with AI for that finding.

[PR #4: Security Blast Radius](https://app.coderabbit.ai/change-stack/coderabbit-demo/demo-site-pr-examples/pull/4/blast-radius)

### Say

Let's address the finding. I'll open the affected component, choose open in layer and return to the review comments beside the code. In the comments panel, I'll select fix with AI for the SQL injection finding.

### See

Frame at 02:14 in 5a-security-engineering.mp4.

## Fix with AI / STEP 2 OF 4: Choose delivery and open the completed run

02:19.660–02:38.180

### Do

- Review the selected comment and click the next/delivery control.
- Select Create a new PR with the fixes. The recorded setup previews this choice.
- Switch to the completed task in the recording repository to inspect the result.

[Completed Engineering Security task](https://app.coderabbit.ai/code/tasks/e6754368-4d77-4394-8161-8270bdab18af)

### Say

Then I'll review the selected comment and choose how the agent should deliver the change. I'm choosing a separate pull request so I can inspect the proposed patch before it reaches the original branch. To show the result, let's switch to a complete run of this same fix in our recording repository.

### See

Frame at 02:32 in 5a-security-engineering.mp4.

## Fix with AI / STEP 3 OF 4: Inspect the SQL patch and regressions

02:39.960–02:57.160

### Do

- Follow the completed task’s delivered PR #11 link. On GitHub, click Files changed and select invoice-search.ts.
- Scroll to bound tenant/search parameters and literal wildcard handling.
- Open the regression test files and inspect injection and tenant-isolation cases.

[Completed Engineering Security task](https://app.coderabbit.ai/code/tasks/e6754368-4d77-4394-8161-8270bdab18af) · [PR #11: files changed](https://github.com/coderabbit-demo/demo-site-pr-recordings/pull/11/files)

### Say

The patch replaces the interpolated SQL with bound parameters for the tenant ID and search pattern. It also escapes wildcard characters, so a search for those characters matches them literally. The agent added regression tests for injection attempts and tenant isolation.

### See

Frame at 02:50 in 5a-security-engineering.mp4.

## Fix with AI / STEP 4 OF 4: Read validation and the delivered PR

02:57.160–03:12.720

### Do

- Return to the task summary and read the 71-test result and four expected failures.
- Open PR #11. Click Files changed to inspect code/tests, then return to Conversation.
- Leave the proposed fix open and unmerged.

[Completed Engineering Security task](https://app.coderabbit.ai/code/tasks/e6754368-4d77-4394-8161-8270bdab18af) · [Engineering Security fix: PR #11](https://github.com/coderabbit-demo/demo-site-pr-recordings/pull/11) · [PR #11: files changed](https://github.com/coderabbit-demo/demo-site-pr-recordings/pull/11/files)

### Say

The task reports 71 passing tests with four unrelated and expected failures. Here's the resulting pull request. I can inspect the code and the tests before deciding whether to merge. For this demo, we are leaving it open.

### See

Frame at 03:07 in 5a-security-engineering.mp4.

## Review Merge Readiness / STEP 1 OF 3: Return to the original PR

03:13.520–03:21.060

### Do

- Open flagship PR #4 and scroll to the Conversation merge panel.
- Show Changes requested alongside passed application checks.

[Flagship PR #4](https://github.com/coderabbit-demo/demo-site-pr-examples/pull/4)

### Say

Back on the original pull request, CodeRabbit has requested changes. The application checks passed, but the security concerns still needs to be addressed.

### See

Frame at 03:18 in 5a-security-engineering.mp4.

## Review Merge Readiness / STEP 2 OF 3: Read the enforcement state

03:21.060–03:33.980

### Do

- Keep the merge panel visible. Read the absence of branch protection for this demo branch.
- Show the available merge control without clicking it; no branch settings are changed.

### Say

This demo branch doesn't have protection enabled, so the request for changes isn't an enforcement block. With branch rules, a team can require the checks and approvals it needs before accepting a change.

### See

Frame at 03:29 in 5a-security-engineering.mp4.

## Review Merge Readiness / STEP 3 OF 3: Finish on the review decision

03:35.040–03:43.520

### Do

- Keep the original PR and proposed fix available while finishing the narration.
- Show the closing flow slide. Leave both PRs open.

[Flagship PR #4](https://github.com/coderabbit-demo/demo-site-pr-examples/pull/4) · [Engineering Security fix: PR #11](https://github.com/coderabbit-demo/demo-site-pr-recordings/pull/11)

### Say

We followed a security finding from the PR to its wider impact, prepared a proposed fix and identified what needs review before merging.

### See

Frame at 03:43 in 5a-security-engineering.mp4.
