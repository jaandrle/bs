## Design principles

`bs` is intentionally minimal. Its design is guided by the following principles:

### 1. Executables are the source of truth
Every build step is a real executable file.  
There is no intermediate representation, DSL, or generated task graph.

What you run is exactly what gets executed.

### 2. No hidden behavior
`bs` avoids implicit rules, automatic dependency inference, or magic defaults.

If something happens during a build, it is explicitly written in a script and can be inspected, modified, or debugged using standard tools.

### 3. Conventions over frameworks
`bs` provides lightweight conventions (directory layout, naming, helpers), not a framework.

You are free to organize scripts as needed, as long as they remain executable and understandable.

### 4. Shell-first, but language-agnostic
Shell scripts are a natural fit, but `bs` does not privilege any language.

Any language that can produce an executable (bash, Python, Node.js, etc.) can be used where it makes sense.

### 5. Composition instead of abstraction
Build flows are composed by calling scripts from other scripts.

Instead of defining abstract dependency graphs, `bs` favors explicit sequencing, parallelization, and reuse through normal process execution.

### 6. Debuggability over optimization
A build should be easy to understand and debug before it is fast or clever.

When optimization is needed (parallelism, incremental builds), it is introduced explicitly and locally.

---

## Non-goals

`bs` deliberately does **not** aim to provide the following features:

### 1. Automatic dependency resolution
`bs` does not infer dependencies between tasks or files.

If a task depends on another task, that dependency must be expressed explicitly by invoking it.

### 2. A global task graph (DAG)
There is no centralized build graph or scheduler.

Each script defines its own flow, which keeps execution simple and predictable.

### 3. A dedicated build DSL
`bs` does not introduce a new configuration language.

Scripts are written in existing languages, using their native syntax, tooling, and editors.

### 4. Integrated dependency management
`bs` does not manage external libraries or packages.

Dependency management is delegated to the tools and ecosystems already used by the project (e.g. system packages, npm, pip, etc.).

### 5. Hermetic or fully reproducible builds
`bs` does not attempt to sandbox builds or guarantee hermeticity.

Environment control, containerization, and strict reproducibility are considered out of scope.

### 6. Competing with full-featured build systems
`bs` is not intended to replace tools like Make, Gradle, Bazel, or similar systems in their primary domains.

It is designed for cases where simplicity, transparency, and flexibility are more valuable than automation and global optimization.

---

## When `bs` is a good fit

- Projects with custom or non-standard build logic  
- Teams comfortable with shell scripting and CLI tools  
- Situations where build steps must remain transparent and hackable  
- Small to medium-sized projects, or infrastructure/CI glue code  

---

## When `bs` may not be a good fit

- Very large monorepos with complex dependency graphs  
- Projects requiring hermetic or remotely cached builds  
- Environments where strict reproducibility is mandatory  
- Teams expecting extensive IDE integration out of the box  
