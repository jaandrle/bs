[**WIP**](#wip)
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
Are you looking for a way to quickly and easily run commands
and list available commands?
- raw:
	- Run command: `bs/build.js some-argument`
	- Lists commands: `find bs -type f -executable`
	(list help texts `grep -H help bs/.*.toml bs/*/.*.toml`, see below)
- using `bs`:
	- Run command: `bs build some-argument`
	- Lists commands: `bs .ls`

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

### Config/Info files
You can create `.command.toml` file to describe `command`
and add additional configuration. Example:
```
buld.sh
.build.toml
```
```toml
#.build.toml
help= "Description of command"
default= true

[completions]
__all= [ "--help", "--version" ]
cmd= []
```
…all is optional. But:
- `help`: this text is listed aside of command name (e.g. `bs .ls`)
- `default`: this changes behavior of plain `bs`. By default it runs `.ls`, now it runs marked command
- `completions`: provide options for completions `bs .run build …`/`bs build …`
	- `__all`: these options are listed for all sub-commands
	- `cmd`: registers sub-command and its possible arguments (`bs .run build cmd …`)

### `bs` synopsis
See [bs.js (line ≥24)](./bs.js#L24).

### `bs` completions
To allow completions just add `eval "$(bs .completion bash)"` to your `.bashrc`.

## Ideas
You can use [Git - Submodules](https://git-scm.com/book/en/v2/Git-Tools-Submodules) to share your build scrips across your projects.

## WIP
- [x] provide `bs` binary
- [ ] some missing? commands in `bs` (maybe `.init`)
- [x] docs for `.command.toml` (`bs` completion)
- [x] docs for git submodules to share build scripts
- [ ] docs for coexistence with others (such as `npm run`)
- [x] examples how to use bash for parallel/serial execution

## Acknowledgments
- [labaneilers/bs: The simplest possible build system using bash](https://github.com/labaneilers/bs)
- [github-action-publish-binaries · Actions · GitHub Marketplace](https://github.com/marketplace/actions/github-action-publish-binaries)
- [rgrannell1/rs: A simple build-system](https://github.com/rgrannell1/rs)
- [jaandrle/nodejsscript: A tool for writing better scripts](https://github.com/jaandrle/nodejsscript)
