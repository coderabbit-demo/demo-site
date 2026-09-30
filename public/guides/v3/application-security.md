# Application Security — Do / Say / See

Companion to the complete Version 3 recording. Times are minutes:seconds.milliseconds.

These timestamps include the 21.14-second introduction in the final Version 3 video. The accompanying illustrated PDF uses the same corrected timeline.

## Introduction / OPENING: Introduce the AppSec flow

00:00.000–00:21.140

### Do

- Show the Application Security flow slide, then switch to the existing repository scan.

### Say

Let's look at security from the AppSec team's perspective. We'll start with the deep scan of the repository, explore the attack surface, and investigate a finding by following the evidence back to the code. Then we'll look at how Fix with AI turns that finding into a proposed patch. With test results, the team can inspect before deciding what to merge.

### See

Application Security flow: Deep Scan, Explore Attack Surface, Investigate a Finding, Fix with AI.

## Deep Scan / STEP 1 OF 2: Open the repository scan setup

00:21.140–00:38.440

### Do

- Open CodeRabbit Security and select coderabbit-demo/demo-site-pr-examples.
- Click Run AI Deep Scan and inspect the selected repository and setup options.

[Deep Scan finding: CWE-89](https://app.coderabbit.ai/security/code?owner=coderabbit-demo&repo=demo-site-pr-examples&findingId=5bbe54d1-f97b-48ba-9a95-9cc1300c4cdf) · [Example repository](https://github.com/coderabbit-demo/demo-site-pr-examples)

### Say

We'll start with an application security review of this repository. The question is where customer data could be exposed and what evidence we have to investigate that risk. An AI deep scan examines committed code across the repository. Here we can choose the repository and review the scan setup.

### See

Frame at 00:32.710 in the consolidated video.

## Deep Scan / STEP 2 OF 2: Use the existing analysis

00:39.120–00:43.740

### Do

- Click Cancel or close the setup dialog.
- Keep the existing scan results visible; this demonstration does not start a new scan.

### Say

This demo already has scan results so I'll close the setup and use the existing analysis.

### See

Frame at 00:42.385 in the consolidated video.

## Explore Attack Surface / STEP 1 OF 3: Open the application map

00:44.640–00:58.980

### Do

- Click Attack Surface in the Security navigation.
- Scroll or fit the map to show entry points, controls and sensitive operations.

### Say

Let's open attack surface. This gives us a view of the application's security relevant components and how they connect. We can use it to explore where requests enter, which controls apply and where sensitive operations happen.

### See

Frame at 00:54.185 in the consolidated video.

## Explore Attack Surface / STEP 2 OF 3: Trace invoice search and tenant isolation

00:59.720–01:23.140

### Do

- Select the invoice-search component in the map.
- Open its supporting evidence and scroll to authentication, search input and the database query.
- Keep the customer boundary in view.

### Say

For this example, we'll focus on invoice search. A customer signs in, sends a search request and receives matching invoices. The important question is whether those results stay within that customer's tenant. Authentication is one part of that path. The database query also needs to enforce the boundary between the customers. I'll use the map and its supporting evidence to examine how the request reaches that query.

### See

Frame at 01:15.790 in the consolidated video.

## Explore Attack Surface / STEP 3 OF 3: Check the analyzed scope

01:24.840–01:33.880

### Do

- Close the component detail panel and read the map’s coverage/analysis context.
- Keep the existing scan’s code scope distinct from later repository changes.

### Say

The scan results describe the code that was analyzed. As we investigate, we need to keep that scope in mind, especially if the repository has changed since the scan.

### See

Frame at 01:30.910 in the consolidated video.

## Investigate a Finding / STEP 1 OF 4: Open the SQL finding and priority evidence

01:34.820–01:51.920

### Do

- Click Findings in the Security sidebar. Select the same repository and the SQL injection finding.
- Read High severity, Open, reachability and exploitability.

[Deep Scan finding: CWE-89](https://app.coderabbit.ai/security/code?owner=coderabbit-demo&repo=demo-site-pr-examples&findingId=5bbe54d1-f97b-48ba-9a95-9cc1300c4cdf)

### Say

Now let's open findings for this repository and select the SQL injection finding. It's marked high severity and open. The affected code is an invoice search. The finding also shows reachability and exploitability, which helps us prioritize the investigation.

### See

Frame at 01:46.235 in the consolidated video.

## Investigate a Finding / STEP 2 OF 4: Trace input into the SQL command

01:52.820–02:19.000

### Do

- Scroll the detail panel to the evidence/call path.
- Expand the cited request route and search function. Show search text and session user reaching the interpolated query.

### Say

Here's the evidence. Search text comes from authenticated invoice search request. The application passes that text and the session user into the search function. The function then inserts both values directly into a SQL command. A crafted search can change the command and bypass the tenant condition. In this demo, that could expose an invoice belonging to another customer, which even though the request came from a signed-in user.

### See

Frame at 02:10.450 in the consolidated video.

## Investigate a Finding / STEP 3 OF 4: Inspect cited code and reproduction

02:20.300–02:32.580

### Do

- Open the cited lines and inspect invoice-search.ts.
- Scroll the finding to the seeded-invoice reproduction and parameter-binding recommendation.

### Say

I can open the cited lines and inspect the query. The finding includes steps to reproduce the issue using the demo’s seeded invoices, along with the recommendation to bind the tenant ID and search text as parameters.

### See

Frame at 02:28.750 in the consolidated video.

## Investigate a Finding / STEP 4 OF 4: Read the proposed correction

02:33.660–02:39.460

### Do

- Keep Recommendation expanded.
- Show the SQL placeholders and separately supplied tenant/search values.

### Say

That means passing the values separately from the SQL command, so the database treats them as data.

### See

Frame at 02:37.665 in the consolidated video.

## Fix with AI / STEP 1 OF 4: Open the existing result

02:40.320–02:55.420

### Do

- Scroll to the finding’s action bar. In this completed run the action is View PR.
- Click View PR to open the proposed fix; use the existing task link for the original context.

[Deep Scan finding: CWE-89](https://app.coderabbit.ai/security/code?owner=coderabbit-demo&repo=demo-site-pr-examples&findingId=5bbe54d1-f97b-48ba-9a95-9cc1300c4cdf) · [Recorded security-fix task](https://app.coderabbit.ai/code/tasks/c4b2dfa1-bb4c-4d5d-b959-f1f6ea606cfb) · [Security-fix PR #7](https://github.com/coderabbit-demo/demo-site-pr-examples/pull/7)

### Say

Next is Fix with AI. This can turn the finding and its supporting context into a coding task for a proposed fix. We've already completed the task for this finding, so the action now says view PR. Let's open the proposed change and look at the result.

### See

Frame at 02:50.470 in the consolidated video.

## Fix with AI / STEP 2 OF 4: Inspect query and test changes

02:56.280–03:05.820

### Do

- On PR #7, click Files changed. Select src/services/invoice-search.ts.
- Show bound parameters, then open the customer-isolation test and its normal assertion replacing it.fails.

[PR #7: files changed](https://github.com/coderabbit-demo/demo-site-pr-examples/pull/7/files)

### Say

The patch replaces the interpolated values with query parameters. The customer isolation test also changes from an expected failure to a normal regression test.

### See

Frame at 03:02.900 in the consolidated video.

## Fix with AI / STEP 3 OF 4: Read the reported test result

03:06.800–03:19.200

### Do

- Open the completed coding task and scroll to its final summary.
- Read the injection/normal-search result and 57 passing tests with five expected failures.

[Recorded security-fix task](https://app.coderabbit.ai/code/tasks/c4b2dfa1-bb4c-4d5d-b959-f1f6ea606cfb)

### Say

The coding task reports that the injection attempt no longer returns another customer's invoices, while a normal search still works. It reports 57 passing tests with 5 unrelated expected failures.

### See

Frame at 03:15.965 in the consolidated video.

## Fix with AI / STEP 4 OF 4: Keep the fix reviewable and finish

03:21.260–03:43.000

### Do

- Return to PR #7 and inspect the patch/checks. Leave it open and unmerged.
- Finish the narration and show the closing application-security flow slide.

[Security-fix PR #7](https://github.com/coderabbit-demo/demo-site-pr-examples/pull/7) · [PR #7: files changed](https://github.com/coderabbit-demo/demo-site-pr-examples/pull/7/files)

### Say

Those results give us something concrete to review. We still need to inspect the patch and the checks before accepting the change. For this demo, we'll leave the proposed fix unmerged. We've gone from a repository scan to the application's attack surface, followed a finding back to its code, and reviewed a proposed fix. That's the AppSec workflow we are showing here.

### See

Frame at 03:37.582 in the consolidated video.
