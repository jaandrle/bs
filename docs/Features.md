# Build system features using Bash
Following text provides suggestions for using bash to implement build system features.

## Build flows
Now focus on creating building flows. For parallel tasts, you can use the
following pattern[^wget-parallel]:

[^wget-parallel]: you can also use [templates](../extensions/): `bs/templates.sh bash/parallel >> script.sh`
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
For serial tasks[^wget-sequence]:
[^wget-sequence]: you can also use [templates](../extensions/): `bs/templates.sh bash/sequence >> script.sh`
```bash
#!/usr/bin/env bash
set -eou pipefail
bs/taskA &&
bs/taskB &&
bs/taskC
```
For serial tasks with limited concurrency[^wget-concurrency]:
[^wget-concurrency]: you can also use [templates](../extensions/): `bs/templates.sh bash/concurrency >> script.sh`
```bash
max=4
running=0

for t in bs/taskA bs/taskB bs/taskC bs/taskD; do
	"$t" &
	running=$((running+1))
	if [ "$running" -ge "$max" ]; then
		wait -n
		running=$((running-1))
	fi
done
wait
```
…pipe tasks:
```bash
#!/usr/bin/env bash
set -eou pipefail
cat src/*.js | manipulate > index.js
```

## Build dependencies
You can use a dedicated file to explicitly define dependencies between tasks,
see for example:

```
bs/
├───.build.deps
├───build.sh
├───test.sh
├───lint.sh
…
```
…where `.build.deps` looks like:
```bash
bs/test.sh
bs/lint.sh
```
…and `build.sh` looks like:
```bash
#!/usr/bin/env bash
set -eou pipefail
bash bs/.build.deps
# build logic
```

## Incremental builds
You can use timestamps[^timestamps] or hashes[^hashes] to determine whether a build is needed:

[^timestamps]: You can use function `needs_rebuild` from template `bs/templates.sh bash/needs_rebuild_timestamp > bs/.libs/needs_rebuild.sh`
[^hashes]: You can use function `needs_rebuild` from template `bs/templates.sh bash/needs_rebuild_timestamp > bs/.libs/needs_rebuild.sh`

```bash
#!/usr/bin/env bash
set -eou pipefail
src='src/index.js'
out='build/app.js'
if [[ -f "$out" && "$out" -nt "$src" ]]; then
    exit 0
fi
# build logic
```
…or
```bash
#!/usr/bin/env bash
set -eou pipefail
src='src/index.js'
out='build/app.js'
hash_file='bs/.cache/build.hash'
src_hash=$(md5sum 'src/*' | md5sum)
if [[ -f "$hash_file" && $(cat "$hash_file") == "$src_hash" ]]; then
    exit 0
fi
# build logic
```
