# Changes (Bugfix + New Feature)

## 1. Fix: `getVersionAsync()` always threw "URL is required."

**Root cause:** `getVersionAsync()` calls `execAsync('', { printVersion: true })` (the URL is intentionally
left empty since `--version` doesn't need one). But the internal builder (`Exec` -> `BaseBuilder.buildBaseArgs()`)
had a hard-coded check:
```ts
if (!this.videoUrl) throw new Error('URL is required.');
```
So it always failed, no matter what the caller passed in, because `getVersionAsync()` itself doesn't even
accept a URL parameter.

The same bug also silently broke `updateYtDlpAsync()` on its *built-in update* path (it always failed and
silently fell back to re-downloading the yt-dlp binary).

**Fix:**
- `src/builder/base-builder.ts`: `buildBaseArgs()` now accepts a second `requireUrl` parameter (defaults to
  `true`). The `Download` and `Stream` builders still require a URL as before (no behavior change there).
- `src/builder/exec-builder.ts`: `Exec.buildArgs()` now calls `buildBaseArgs(..., false)` since `Exec` is a
  general-purpose runner also used for URL-less operations (`--version`, `--update`, etc.).
- `src/index.ts`: `getVersionAsync()` and the built-in path of `updateYtDlpAsync()` now use the new
  `execYtdlpCmd()` function below, which is designed to never require a URL.

## 2. New feature: `execYtdlpCmd(command, options?)`

A new method on the `YtDlp` class for running the `yt-dlp` binary directly with raw command-line arguments,
bypassing the fluent builder entirely (no URL required, no format/progress args injected automatically).

Accepts either an array or a raw string — both are valid:

```ts
const ytdlp = new YtDlp();

// Array form
const { stdout } = await ytdlp.execYtdlpCmd(['--version']);
console.log(stdout.trim());

// String form (produces the exact same result)
await ytdlp.execYtdlpCmd('-U');
await ytdlp.execYtdlpCmd('"https://youtu.be/xyz?a=1&b=2" --formats -q');

// List all supported extractors
const result = await ytdlp.execYtdlpCmd(['--list-extractors']);

// Any custom command
await ytdlp.execYtdlpCmd(['--update-to', 'nightly']);

// With extra options
await ytdlp.execYtdlpCmd('--version', { cwd: '/tmp', timeoutMs: 10000 });
```

When given a string, it's first tokenized (shell-style parsing: `"..."` / `'...'` quoting keeps a URL with
spaces/`&` as a single argument), then still executed via `spawn(..., { shell: false })` — so it is **not**
routed through an actual OS shell, and is safe from shell-injection even if the string contains characters
like `&`, `;`, `|`, etc. (those are treated as literal text, not interpreted by a shell).

Return value: `{ stdout, stderr, exitCode, command }`.

## 3. Fix: package now works when installed via `github:` / git URL

**Root cause:** `package.json` points `"main"` to `./dist/index.js`, but `dist/` is listed in `.gitignore`
(it's built locally and only ends up in the published npm tarball, never in the git history). When you
install a package via `"ytdlp-nodejs": "github:user/repo"`, npm builds it right after cloning by running the
package's `prepare` script — but this repo's `prepare` script was just `"husky"` (git-hooks setup for local
dev), not a build step. So `dist/` never got created for git installs, and `require('ytdlp-nodejs')` /
`import ... from 'ytdlp-nodejs'` would fail with `Cannot find module './dist/index.js'`.

**Fix:** `package.json`:
```diff
- "prepare": "husky",
+ "prepare": "npm run build && (husky || true)",
```
Now `npm install github:CodePilotBot/ytdlp-nodejs-fc` (or any git URL) runs the real build (`tsup`) before
the package is usable, so `dist/` gets generated automatically as part of the install. Husky still runs
afterwards for local development clones as before, wrapped in `(... || true)` so it can never fail/block an
install for consumers who install via git and don't have a `.git` context (husky exits non-zero in that
case on some setups; here it's just ignored).

No files were added to git — the repository stays source-only as before; the build now simply happens
automatically at install time instead of needing to be committed.

## 4. Alternative install method: raw GitHub tarball URL (for hosts that block `git:`/`github:` installs)

Some managed Node hosting panels (e.g. Pterodactyl-based bot/app hosts) disable npm's `git`-type installs
entirely at the npm-config level, causing errors like:
```
npm error code EALLOWGIT
npm error Fetching packages of type "git" have been disabled
npm error Refusing to fetch "ytdlp-nodejs@github:owner/repo"
```
When this happens, the **entire** `npm install` aborts before anything is linked into `node_modules/` — so
unrelated packages (like `express`) appear "missing" too, even though they were never the problem.

npm classifies `"github:owner/repo"` / `"git+https://..."` as install type **`git`** (blocked by the host),
but a plain HTTPS URL ending in `.tar.gz` is classified as type **`remote`** (a tarball), which is a
different code path and is not affected by that restriction. You can point directly at a GitHub tarball
instead:
```json
"ytdlp-nodejs": "https://codeload.github.com/CodePilotBot/ytdlp-nodejs-fc/tar.gz/refs/heads/main"
```
or equivalently:
```json
"ytdlp-nodejs": "https://github.com/CodePilotBot/ytdlp-nodejs-fc/archive/refs/heads/main.tar.gz"
```

**Important trade-off:** unlike a `git`-type install, a `remote` tarball install does **not** run the
`prepare` script (no auto-build happens). This means `dist/` must already exist and be committed to the
repository — it can no longer be gitignored/built-on-install for this specific use case. This is why a
pre-built `dist/` folder is included in this delivery (see "How to commit it" below).

### How to commit the pre-built `dist/`

`.gitignore` still lists `dist`, so a normal `git add` will skip it. Force-add it explicitly:
```bash
git add -f dist
git commit -m "chore: include prebuilt dist for tarball-URL installs"
git push
```
(You can leave `dist` in `.gitignore` — `git add -f` overrides the ignore rule for files you explicitly add.
Just remember to rebuild + re-commit `dist/` whenever you change files under `src/`.)

The included `dist/` contains both the CommonJS build (`dist/index.js`, used by `require(...)`) and an ESM
entry point (`dist/index.mjs`) that re-exports the same API, so it works whether your consuming project uses
`require()` or `import` (`"type": "module"`), matching the `exports` map already defined in `package.json`.

## Verification

Tested end-to-end against a fake `yt-dlp` binary (a shell script) via `tsx`:
- `getVersionAsync()` no longer throws "URL is required." and returns the correct version.
- `execYtdlpCmd(['--version'])` works and returns the correct stdout/stderr/exitCode/command.
- `execYtdlpCmd` works with arbitrary custom arguments, both array and string form (including quoted URLs
  with `&`/spaces, and single-quoted arguments).
- `Download` and `Stream` builders were confirmed to **still** throw `"URL is required."` when the URL is
  empty (no regression).

FIXED BY CODEPILOTBOT.
