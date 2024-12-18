# bs: Build system based on executables
This is just an extension (backwards compatible) of [labaneilers/bs: The simplest possible build system using bash](https://github.com/labaneilers/bs).

Still just simple bash scripts are probably good enough in most cases.
However, for some situations it can be useful to use scripts in different
language.

This leads to, in root of your project create `bs` directory and
put there any executable (`chmod +x` + shellbang):
```
bs
├───build.js
├───install.sh
├───run
└───test.py
```
Some shellbangs for example:
```
#!/usr/bin/env node
#!/usr/bin/env nodejsscript
#!/usr/bin/env -S npx nodejsscript
#!/usr/bin/env python3
#!/usr/bin/env bash
```

## Why?
See [labaneilers/bs#why](https://github.com/labaneilers/bs#why).

## Usage
Your working directory should contain `bs` directory with building
scrips/executables. You can use [`bs`](#bs) utility with auto-find
feature.

### Executing scripts
Now you can run and lists your build options like:
- raw:
	- run command: `bs/build.js some-argument`
	- lists commands: `ls bs`, `find bs/** -executable`, `find bs -type f -executable`, …
    - see structure: `tree bs`
	- create folder: `mkdir bs`, `mkdir -p bs`, `touch README.md`, …
	- (optional, [see below](#configinfo-files-using-readmemd)) list commands with commnets: `cat bs/README.md`, `bat bs/README.md`, …
- using `bs`:
	- run command: `bs build some-argument`, `bs .run build some-argument`
	- lists commands: `bs`, `bs .ls`, `bs .ls filter`
    - see structure: `tree bs`
	- create folder: `bs .mkdir`
	- cat README: `bs .cat`, `bs .cat filter`

### Organizing scripts
There are no rules, *it is all up to you*. But definitely
we can put together some *suggestions* to work with bs more
**happily**.

1. prefers **short names** without unnecessary special characters (spaces, brackets, …)
1. *provide* `--help` options for your scripts
1. *use subdirectories* for subtasks
1. *use dots* in names for non-scripts (like `.config.js`, `.common.js`, `.utils.js`, …)
1. provide `README.md` to comment your build scripts

```
bs/
├───build.js
├───build/
│   ├───html.js
│   └───sass.js
├───run.js
├───publish.js
├───.config.js
└───README.md
```

PS: You can create alias for task with:
```bash
ln -rfs bs/target bs/alias
```

### Build flows
Now focus on creating building flows. For parallel tasts, you can
use this pattern:
```bash
#!/usr/bin/env bash
set -eou pipefail
(
	trap 'kill 0' SIGINT ;
	bs/taskA &
	bs/taskB &
	bs/taskC &
	wait
)
```
For serial tasks:
```bash
#!/usr/bin/env bash
set -eou pipefail
bs/taskA &&
bs/taskB &&
bs/taskC
```
…pipe tasks:
```bash
#!/usr/bin/env bash
set -eou pipefail
cat src/*.js | manipulate > index.js
```

## `bs`
This is just a simple helper providing nice outputs
and make some operations easier.

### Installation
*For now for early adapaters.*

You can find binaries on [Release](https://github.com/jaandrle/bs/releases/latest) page.

Or use: `npm install https://github.com/jaandrle/bs --location=global`

### ~Config/Info files~ Using README.md
[This feature](https://github.com/jaandrle/bs/blob/adfbe3dc419b3189a1f9661d308c293b1e3b0514/README.md#configinfo-files) has been removed in version 0.8.
It seems to be better to use `bs/README.md` for comment your build scripts.
See example for current project [`bs/README.md`](./bs/README.md).

You can than use `cat bs/README.md` to get quick overview of available commands.

### `bs` synopsis
See [bs.js (line ≥41)](./bs.js#L41).

### `bs` completions
To allow completions just add `eval "$(bs .completion bash)"` to your `.bashrc`.

## Ideas
You can use [Git - Submodules](https://git-scm.com/book/en/v2/Git-Tools-Submodules) to share your build scrips across your projects.

## WIP
- [ ] provide `bs` via npm
- [ ] docs for coexistence with others (such as `npm run`)

## Acknowledgments
- [labaneilers/bs: The simplest possible build system using bash](https://github.com/labaneilers/bs)
- [github-action-publish-binaries · Actions · GitHub Marketplace](https://github.com/marketplace/actions/github-action-publish-binaries)
- [rgrannell1/rs: A simple build-system](https://github.com/rgrannell1/rs)
- [jaandrle/nodejsscript: A tool for writing better scripts](https://github.com/jaandrle/nodejsscript)
