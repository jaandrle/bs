# Extensions
This folder contains helpful scripts to be used in your _bs_.

> [!WARNING]
> Executing scripts downloaded from the internet poses a security risk. Always review the code before executing it. Only run scripts from trusted sources.

You can “install” these by just downloading them, for example:

```bash
wget https://raw.githubusercontent.com/jaandrle/bs/extensions/NAME -O bs/NAME
```
…you can adjust your copy by just editing it.

## ./templates.sh
This script prints various patterns to be used in _bs_ scripts.

```terminal
wget https://raw.githubusercontent.com/jaandrle/bs/extensions/templates.sh -O bs/templates.sh
bs/templates.sh # prints all templates
bs/templates.sh skeleton/bash > bs/new-task # creates a new task from template
bs/templates.sh bash/parallel >> bs/existing-task # appends patern to existing task
```
…or you can “install” it globally:
```bash
wget https://raw.githubusercontent.com/jaandrle/bs/extensions/templates.sh -O ~/.local/bin/bs-templates.sh
chmod u+x ~/.local/bin/bs-templates.sh
```

## ./.hook-prerun.sh
This bash script can be used in your bash tasks, to force running tasks from project root (to ensure proper path resolution) and support `--help` by reading `bs/README.md` file.

```terminal
wget https://raw.githubusercontent.com/jaandrle/bs/extensions/.hook-prerun.sh -O bs/.hook-prerun.sh
```

```bash
# task file
dir_script="$(dirname -- "${BASH_SOURCE[0]}")/"
. "$dir_script"/.hook-prerun.sh # adjust (relative to current task)
# available variables: dir_script, dir_bs, dir_root

```

## ./hook-completion-nodejsscript.mjs
This nodejsscript can be used as completion hook for your nodejsscript tasks.

```terminal
wget https://raw.githubusercontent.com/jaandrle/bs/extensions/hook-completion-nodejsscript.mjs -O bs/.bsrc/hook-completion.mjs
```
