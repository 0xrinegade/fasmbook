# Contributing guide

## Type of contributing

There are two main types of contributions accepted in KolibriOS:

- Submitting issues about problems in the project
- Submitting code to the project via pull requests

Each of these types is described in detail below.

## Issues

You can help us by submitting issues about problems found in the system. Currently, there are two main ways of submitting an issue in the project: **Bug Reports** and **Feature Requests**:

- Bug Reports are suitable if you find a **bug** (crash, error, unexpected behavior) in some part of the system (kernel, drivers, apps, etc.) and want to report it
- Feature Request are used, when you want to propose some **improvement** to the system (missing features, improved  user experience, etc.)

## Pull requests

You can also help us by submitting code via pull requests. The process of submitting a pull request consists of the following steps:

1. Find what you want to implement or improve
2. Make a fork of kolibrios (or other needed) repository
3. Create a branch with a name that matches your changes
4. Implement and test the changes
5. Create commits according to the [accepted style](#commit-style)
6. Create and submit a pull request into `main` branch
7. Wait for CI/CD pipelines and code review to pass

When a pull request is submitted, at least two project participants must conduct a code review, after which the proposed changes can be corrected (if it's necessary) and merged into the project.

## Commit style

### Pattern

The commit message should look like this:

```test
Commit message header

Commit message body, if needed
```

- Commit message header and body should reflect changes made in commit
- Commit message header should start with a capital letter
- Commit message body should be separated from the header by one empty line

### Length

Maximum number of characters in a commit header is **72** (standard for **Git**). Also, **72** is the maximum length of a line in a commit body.

## Merge commits

> [!WARNING]
> Merge commits are **prohibited** in the project

## Conclusion

We hope this small instructions will help you to get familiar  with KolibriOS contribution rules and inspire you to participate in the work of this project.
