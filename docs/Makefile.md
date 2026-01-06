# Side-by-Side Example: `bs` vs Makefile

This example illustrates how a simple project with compilation and test steps can be structured using `bs` scripts and a traditional Makefile.

| Feature / Step        | `bs` Implementation                                   | Makefile Implementation                               |
|----------------------|-------------------------------------------------------|-------------------------------------------------------|
| Build source files    | `bs/build.sh`                                        | `Makefile` target `build:`                            |
| Run tests            | `bs/test.sh`                                         | `Makefile` target `test:`                             |
| Clean build artifacts | `bs/clean.sh`                                        | `Makefile` target `clean:`                            |
| Dependency handling   | `.build.deps` executable lists dependent tasks       | Implicit dependencies via target prerequisites       |
| Inkremental build     | Timestamp or checksum checks inside scripts          | Automatic based on file modification times           |
| Parallel execution    | `bs` can run tasks in background with `&` and `wait`| `make -j`                                           |

## Example Makefile
```Makefile
.PHONY: all build test clean

all: build test

build: src/main.c
	gcc -o build/app src/main.c

test: build
	./build/app --run-tests

clean:
	rm -f build/app
```

## Example `bs` scripts
```terminal
bs/
├── .all.deps
├── all.sh
├── build.sh
└── test.sh
├── clean.sh
```

```bash
# bs/.all.deps
bs/test.sh

# bs/all.sh
#!/usr/bin/env bash
set -euo pipefail
bash bs/.build.deps
bs/build.sh

# bs/build.sh
#!/usr/bin/env bash
src='src/main.c'
out='build/app'
if [[ -f "$out" && "$out" -nt "$src" ]]; then
    exit 0
fi
gcc -o build/app src/main.c

# bs/test.sh
#!/usr/bin/env bash
./build/app --run-tests

# bs/clean.sh
#!/usr/bin/env bash
rm -f build/app
```

## Example `bs` scripts (simplified)
For small projects, the `bs` scripts can be written more like npm scripts as
performance tradeoffs are less important.

```bash
# bs/all.sh
#!/usr/bin/env bash
set -euo pipefail
bs/test.sh

bs/build.sh

# bs/build.sh
#!/usr/bin/env bash
gcc -o build/app src/main.c

# bs/test.sh
#!/usr/bin/env bash
./build/app --run-tests

# bs/clean.sh
#!/usr/bin/env bash
rm -f build/app
```
