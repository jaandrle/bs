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

## Usage
- raw:
	- Run command: `bs/build.js some-argument`
	- Lists commands: `find bs -type f -executable` (list help texts `grep -H help bs/.*.toml bs/*/.*.toml`, see below)
- using `bs`:
	- Run command: `bs build some-argument`
	- Lists commands: `bs .ls`

## Why?
See [labaneilers/bs#why](https://github.com/labaneilers/bs#why).

## WIP
- [ ] provide `bs` binary
- [ ] some missing? commands in `bs` (maybe `.init`)
- [ ] docs for `.command.toml` (`bs` completion)
- [ ] docs for git submodules to share build scripts
- [ ] docs for coexistence with others (such as `npm run`)
- [ ] examples how to use bash for parallel/serial execution

## Acknowledgments
- [labaneilers/bs: The simplest possible build system using bash](https://github.com/labaneilers/bs)
- [github-action-publish-binaries · Actions · GitHub Marketplace](https://github.com/marketplace/actions/github-action-publish-binaries)
- [rgrannell1/rs: A simple build-system](https://github.com/rgrannell1/rs)
- [jaandrle/nodejsscript: A tool for writing better scripts](https://github.com/jaandrle/nodejsscript)
