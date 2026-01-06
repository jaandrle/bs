# Changelog
This file contains todos and already implemented features

## TODO
- [ ] finalize and “publish” `.bsrc` and scripts completion suggestions
- [ ] Better Cross-Platform Compatibility („We could explore using Node.js to execute scripts directly based
     on their file extension, which would make bs work more smoothly on Windows.”)
- [ ] upgrade `bs/build` (also see TODO in [v0.9.0](#v0.9.0))

## v0.9.0
- [x] :zap: (potentially BREAKING) fix provided relative paths when bs is run outside the root directory
    - `cd project && cd deep/path && bs build ./file` → “`bs build /home/…/project/deep/path/file`”
- [x] :abc: BS (non-)goals
    - [x] docs for coexistence with others (such as `npm run`)
    - [x] hooks
    - [x] Provide build features
        - [x] patterns suggestions in README.md
        - [x] templates extensions (see bellow)
- [x] :zap: Extensions
    - [x] provide easy way to share patterns
    - [x] future-proof
    - [x] just scripts
- [x] :zap: Improved User Experience (descriptive error messages, structured outputs, …)
- [x] :tv: :bug: build (TODO?: add cached nodes to git as pkg is archived)
- [x] refact project structure (**catchError**)
- [x] provide `bs` via npm

## v0.8.2
- [x] :zap: (BREAKING) removed Config/Info files: https://github.com/jaandrle/bs/blob/adfbe3dc419b3189a1f9661d308c293b1e3b0514/README.md#configinfo-files

## v0.8.1
- [x] main behavior (`.run`, `.ls`, `.readme`, `.cat`)
- [x] non-promoted `.bsrc` and scripts completion suggestions
