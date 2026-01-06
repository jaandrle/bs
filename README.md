# bs: Build system based on executables
This is just an extension (backwards compatible) of
[labaneilers/bs: The simplest possible build system using bash](https://github.com/labaneilers/bs).

In most cases, simple bash scripts are still sufficient.
However, for some situations it can be useful to use scripts in different
language.

This leads to, in root of your project create `bs` directory and
put there any executable (`chmod u+x`/`chmod +x` + shellbang):
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
From [labaneilers/bs#why](https://github.com/labaneilers/bs#why):

> Pretty much all build systems are terrible in their own special way:
> 
> - Many build systems are designed for large, complicated projects, while many modern projects are small and granular, and don't need the complexity.
> - On the other hand, some alternatives to build systems (i.e. npm scripts) are so simple that they require shell scripts to do anything non-trivial, but this makes it hard to be cross-platform.
> - Pretty much any "real" build system requires installing dependencies (i.e. Ruby for rake, node.js for grunt/gulp, Java for Maven, etc). You can't depend on any given build system's dependencies being installed on any given developer or build machine.
> - Many build systems are plugin-oriented, which adds a lot of complexity when trying to add even simple functionality, especially when all you need is a one-liner to shell out to another program.
> - Many build systems are built in languages that aren't well suited to simple build tasks (i.e. they require a lot of boilerplate to shell out to an executable, or are designed for asynchronicity by default).
> - In a world where every language has its own idiomatic build system (or multiple ones), polyglot programmers are left to learn the intricacies of a lot of different systems. Pretty much every developer hates every other developer's choice of build system.
> 
> Just using bash scripts is an improvement in a few ways:
> 
> - **Bash is ubiquitous**. Between Linux, OSX, and Windows (between Mingw/Cygwin/Git Bash/WSL), its extremely likely that bash is already installed on any environment you use. Because of Git for Windows, practically every Windows developer already has bash installed.
> - **Bash is good enough**. Its simple and well suited to build scripts. Its simple for simple things, and especially good at running executables, chaining inputs to outputs, copying files around, processing text, etc. If a bash script gets too complex, just use it to call a script in node, python, or whatever language your project is in.
> - **You probably already know Bash**. No one is going to argue its the best language available, but it is something that pretty much every developer needs to learn at some point, regardless of what languages you specialize in.

The benefit of using other languages than bash can be for example to use
dependency management tools, plugins and so on already used in your projects.
Also you use known editor (tools) as you already use it on project(s).  In
addition, scripts written in languages such as Node.js or Python can be
structured as modules, allowing selected functions or utilities to be exported
and reused across multiple build scripts.

Therefore, `bs` deliberately avoids introducing its own build language,
implicit rules, or a global task graph. The goal is not maximum automation, but
**clarity, transparency, and control**, while remaining language-agnostic and
easy to integrate with tools already used in the project.[^design]

[^design]: See [Design principles and non-goals](./docs/Design-non-goals.md).

You can use `bs` as execution orchestrator for another build tools, e.g. Vite.
And vice versa use `bs` scripts in your build tools, so `bs` play as scripts
organizer. _The most direct competitor are npm scripts_ or can be used
[instead of e.g. Makefile](./docs/Makefile.md).

## Usage
Your working directory should contain `bs` directory with build
scrips/executables. You can use [`bs`](#bs) utility with auto-find
feature.

### Organizing scripts
There are no strict rules — it is entirely up to you. But definitely
we can put together some _suggestions_ to work with bs more
**happily**.

1. prefer **short names** without unnecessary special characters (spaces, brackets, …)
1. _provide_ `--help` options for your scripts
1. _use subdirectories_ for subtasks
1. _use dots_ in names for non-scripts (like `.config.js`, `.common.js`, `.utils.js`, …)
1. provide `README.md` to comment your build scripts

```
bs/
├───build.js # or build/all.js ↓
├───build/
│   ├───all.js # or build.js ↑
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

### Executing scripts
Now you can run and list your build options, for example:
- raw:
	- run task: `bs/build.js some-argument`
	- lists task: `ls bs`, `find bs/** -executable`, `find bs -type f -executable`, …
    - see structure: `tree bs`
	- create folder: `mkdir bs`, `mkdir -p bs`, `touch README.md`, …
	- (optional, [see below](#using-readmemd)) list tasks with documentation: `grep [filter] bs/README.md -A3`, `cat bs/README.md`, `bat bs/README.md`, …
- using `bs`:
	- run task: `bs build some-argument`, `bs .run build some-argument`
	- lists tasks: `bs`, `bs .ls`, `bs .ls filter`
    - see structure: `tree bs`
	- create folder: `bs .mkdir`
	- grep/cat README: `bs .grep`, `bs .grep filter`, `bs .cat`

### Build system features
You can adapt `bs` scripts to your needs. As (bash) scripts, you can easily
[**adds neccesary features (incremental builds, parallel execution, etc.)**](./docs/Features.md)
only where you need them. Also it is easy to adjust scripts with parameters and
environment variables.

## Using README.md
Use `bs/README.md` for comment your build scripts.
See example for current project [`bs/README.md`](./bs/README.md).

This document should start with:
```markdown
# bs: Build system based on executables
This project uses [jaandrle/bs: The simplest possible build system using executable/bash scripts](https://github.com/jaandrle/bs).

## Available executables

### bs/build
```
…you can use `bs` helper (`bs .mkdir`/`bs .readme`).

You can then use `cat bs/README.md`/`grep [filter/name: e.g. bs/build] bs/README.md -A3` to get quick overview of available tasks.

## `bs`
This is just a helper providing nice outputs and make some operations easier.

### Installation
You can find binaries on [Release](https://github.com/jaandrle/bs/releases/latest) page.

Or use:
```terminal
npm install @jaandrle/bs --location=global
```
…(`npm install https://github.com/jaandrle/bs --location=global`)

### Overview
This script allows you to use build scripts in a more user-friendly way.
So, this script is not neccessary, but it provides some helpers:

1. You can call executables without extensions (for example `bs/test.py` ⇔ `bs test`),
1. You can use completion, see `.completion` command.
1. This utility can find current or any parent folder containing `bs` directory.

Important notes:
1. To prevent colision all `bs` commands starts with `.` (e.g. `.ls`).
1. It is a good practice to distinc non-tasks from tasks (eg. with preposition `.`, `_`, …) also for your build scripts (see above).

#### `.run [script]`
Run the given build executable (default when `bs [script]`).

#### `.ls [filter]`
Lists all available executables (default when only `bs`).

#### `.mkdir [root]`
This initializes the projects bs directory. With `root` folder defaults to `.`.

#### `.readme`
This is primarly used for update current bs/README.md content.

#### `.grep [filter]` (with `.cat` as an alias)
This prints bs/README.md content with limited syntax highlight.

#### `.completion <shell>` — `bs` completions (for now only bash)
Register a completions for the given shell. This provides completions for `bs`
itself and available executables and arguments for executables, if specified in
the corresponding config file.

To allow completions:
Just add `eval "$(bs .completion bash)"` to your `.bashrc`

## Extensions (WIP)
You can use and create shared scripts and use them across your projects. There are some examples in [extensions](./extensions/).

## Ideas
You can use [Git - Submodules](https://git-scm.com/book/en/v2/Git-Tools-Submodules) to share your build scrips across your projects.

### Coexistence with `npm`
In `package.json` you can use `bs` to run your scripts. For example:
```json
{
	"scripts": {
		"build": "bs/build.sh",
		"test": "bs/test.mjs",
		"lint": "bs/lint.sh",
		"start": "bs/start.sh",
		"…": "…"
	}
}
```
This allows you to provide npm scripts that may be expected by other tools or developers.
You may want to add warning about the presence of `bs` in `package.json`:

```json
{
	"scripts": {
		"build": "echo '\\033[33mUse `bs` (see `bs/README.md`) instead of `npm run build`\\033[0m' && bs/build.sh",
```

You can organise [npm hooks](https://docs.npmjs.com/cli/v11/using-npm/scripts#life-cycle-scripts) using following pattern:

```
bs
├─hooks-npm
	├─hook-name
…
```
```json
{
	"scripts": {
		"hook-name": "bs/npm-hooks/hook-name"
	}
}
```

### Provide git/… hooks
You can create e. g. `bs/hooks-git` folder and [register hooks](https://git-scm.com/docs/githooks) using registration script[^wget-git]:

[^wget-git]: you can also use [templates](./extensions/): `bs/templates.sh hooks/register-git >> bs/hooks-npm/prepare`

```bash
#!/usr/bin/env bash
path_gh="bs/hooks-git"
path_current=$(git config --get core.hooksPath 2>/dev/null)
if [ $? -ne 0 ]; then # ≡No hooks path set yet
	git config core.hooksPath "$path_gh"
	echo "Git hooks path set to '$path_gh'."
	exit 0
fi

red() { echo -e "\033[91m$*\033[0m"; }
green() { echo -e "\033[32m$*\033[0m"; }
# Prevent overwriting user hooks, just print info
if [ "$path_current" != "$path_gh" ]; then
	green   "You can use git hooks from '$path_gh'!"
	echo    "…but you have already set hooks path to '$path_current'."
	echo    "You can:"
	echo -e "- call: \`git config core.hooksPath '$path_gh'\` to $(red 'override it') or"
	echo    "- make a link(s): \`ln -s '$path_gh/script_name' '$path_current'\`"
fi
exit 0
```
…this can be registered with `chmod u+x`/`chmod +x` as npm hook (see
[Coexistence with `npm`](#coexistence-with-npm), probably `prepare` hook).

You can follow npm/git hooks patterns for other package managers/version control/….

## Acknowledgments
- [labaneilers/bs: The simplest possible build system using bash](https://github.com/labaneilers/bs)
- [github-action-publish-binaries · Actions · GitHub Marketplace](https://github.com/marketplace/actions/github-action-publish-binaries)
- [rgrannell1/rs: A simple build-system](https://github.com/rgrannell1/rs)
- [jaandrle/nodejsscript: A tool for writing better scripts](https://github.com/jaandrle/nodejsscript)
