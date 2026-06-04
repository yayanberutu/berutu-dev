# GitHub Standard Workflow for berutu-dev

This skill defines the standard operating procedure for implementing new features or fixes in the `berutu-dev` project.

When instructed to follow this workflow, you must execute the following steps in order:

## 1. Prepare Workspace
Ensure you are starting from a clean and up-to-date state.
```bash
git checkout main
git pull origin main
```

## 2. Branching
Create a new branch for the implementation.
```bash
git checkout -b feature/<descriptive-name>
# OR
git checkout -b fix/<descriptive-name>
```

## 3. Issue Creation
Create a GitHub issue documenting what is going to be built or fixed. Use the `gh` CLI.
```bash
# Remember to bypass GITHUB_TOKEN if keychain auth is preferred
env -u GITHUB_TOKEN gh issue create --title "<Issue Title>" --body "<Detailed description of the task>"
```

## 4. Implementation
Perform the required code changes, following the project's standard guidelines. Once complete, stage and commit the changes.
```bash
git add .
git commit -m "feat: <description> (#<issue-number>)"
```

## 5. Push & Pull Request
Push the branch to the remote repository and create a Pull Request that automatically closes the issue upon merge.
```bash
git push -u origin <branch-name>
env -u GITHUB_TOKEN gh pr create --title "<PR Title>" --body "Resolves #<issue-number>. <Description of changes>"
```
