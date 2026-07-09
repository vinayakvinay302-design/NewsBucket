# Getting this onto GitHub — copy/paste, one shot

## macOS / Linux

Open a terminal inside the `newsbucket-repo/` folder and paste:

```bash
bash upload_to_github.sh
```

## Windows (PowerShell)

Open PowerShell inside the `newsbucket-repo\` folder and paste:

```powershell
.\upload_to_github.ps1
```

## What happens

- If you have the [GitHub CLI](https://cli.github.com) installed and logged
  in (`gh auth login`), the script creates the GitHub repo **and pushes
  automatically** — nothing else to do.
- If you don't have `gh`, the script still does `git init` + commit for you
  locally, then prints the exact two commands to run after you click
  "Create repository" on github.com. No code editing, no manual file
  copying.

## Custom repo name or public visibility

```bash
bash upload_to_github.sh my-repo-name public
```
```powershell
.\upload_to_github.ps1 -RepoName my-repo-name -Visibility public
```

Default is repo name `newsbucket`, visibility `private`.

## Safe to re-run

Run it again any time after making changes — it detects what's already
done (git initialized, remote already set) and just commits + pushes
what's new instead of erroring.
