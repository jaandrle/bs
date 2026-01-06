#!/usr/bin/env bash
# Just use:
# dir_script="$(dirname -- "${BASH_SOURCE[0]}")/"
# . "$dir_script"/.hook-prerun.sh # head could be located in the bs root directory
# …in your bs bash script for commont things:
# - setup common variables: dir_root, dir_bs, …
# - setup bash behaviour
# - auto-handle `--help` using bs/README.md
set -eou pipefail # this can be harmful, see https://www.youtube.com/watch?v=4Jo3Ml53kvc
[[ -z "$dir_script" ]] && dir_script="$(dirname -- "${BASH_SOURCE[0]}")/"
dir_root="$dir_script"
while [[ ! -d "$dir_root"/bs && "$dir_root" != "/" ]]; do # contains bs folder
	dir_root="${dir_root%/*}"
done
dir_bs="$dir_root"/bs

grep_section_by_heading() {
	local markdown_file=$1
	local heading=$2
	local section=""
	local in_section=false

	while IFS= read -r line; do
		if [[ $line =~ ^#*\ (.*) ]]; then
			if [ "$in_section" = true ]; then
				break
			fi
			if [[ "${BASH_REMATCH[1]}" == $heading* ]]; then
				in_section=true
				section+="$line\n"
			fi
		elif [ "$in_section" = true ]; then
			section+="$line\n"
		fi
	done < "$markdown_file"
	echo -e "$section"
}
cmd="${1:-}"
if [[ "${cmd}" == "--help" ]]; then
	grep_section_by_heading "$dir_bs"/README.md "$0"
	echo "…for more help, see $dir_bs/README.md"
	exit 0
fi
