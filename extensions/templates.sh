#!/usr/bin/env bash
template="$1"
shift
if [[ '--version' == "$template" ]]; then
	echo '2025-12-05'
	exit 0
fi
if [[ -z "$template" ]]; then
	cat <<-TERMINAL
		Usage: $0 <template>
		       $0 [--help]
		       $0 <template> > new-script
		       $0 <template> >> existing-script
			
		Available templates:
	TERMINAL
fi

name='skeleton/bash'
if [[ -z "$template" ]]; then
	echo "$name: Prints basic "Hello world!" in bash."
elif [[ "$name" == "$template" ]]; then
	cat <<-'BASH'
		#!/usr/bin/env bash
		set -euo pipefail # this can be harmful, see https://www.youtube.com/watch?v=4Jo3Ml53kvc

		echo "Hello world!"
	BASH
	exit 0
fi
name='skeleton/python'
if [[ -z "$template" ]]; then
	echo "$name: Prints basic "Hello world!" in python."
elif [[ "$name" == "$template" ]]; then
	cat <<-'PYTHON'
		#!/usr/bin/env python
		print("Hello world!")
	PYTHON
	exit 0
fi
name='skeleton/node'
if [[ -z "$template" ]]; then
	echo "$name: Prints basic "Hello world!" in javascript (NodeJS)."
elif [[  "$name" == "$template" ]]; then
	cat <<-'JAVASCRIPT'
		#!/usr/bin/env node
		console.log("Hello world!")
	JAVASCRIPT
	exit 0
fi
name='skeleton/zx'
if [[ -z "$template" ]]; then
	echo "$name: Prints basic "Hello world!" in javascript (zx)."
elif [[  "$name" == "$template" ]]; then
	cat <<-'JAVASCRIPT'
		#!/usr/bin/env zx
		console.log("Hello world!")
	JAVASCRIPT
	exit 0
fi
name='skeleton/nodejsscript'
if [[ -z "$template" ]]; then
	echo "$name: Prints basic "Hello world!" in javascript (nodejsscript)."
elif [[  "$name" == "$template" || "skeleton/njs" == "$template" ]]; then
	cat <<-'JAVASCRIPT'
		#!/usr/bin/env -S npx nodejsscript
		#/* global echo, $, pipe, s, fetch */

		echo("Hello world!");
	JAVASCRIPT
	exit 0
fi

name='hooks/register-git'
if [[ -z "$template" ]]; then
	echo "$name: Bash script to register git hooks, use for example as \`bs/hooks-npm/prepare\`."
elif [[ "$name" == "$template" ]]; then
	cat <<-'BASH'
		#!/usr/bin/env bash
		# for examples as `bs/hooks-npm/prepare`
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
	BASH
	exit 0
fi

name='bash/parallel'
if [[ -z "$template" ]]; then
	echo "$name: Bash script pattern to run tasks in parallel."
elif [[ "$name" == "$template" ]]; then
	cat <<-'BASH'
		(
			trap 'kill 0' SIGINT ;
			bs/taskA &
			bs/taskB &
			bs/taskC &
			wait
		)
	BASH
	exit 0
fi
name='bash/sequence'
if [[ -z "$template" ]]; then
	echo "$name: Bash script pattern to run tasks in sequence."
elif [[ "$name" == "$template" ]]; then
	cat <<-'BASH'
		bs/taskA &&
		bs/taskB &&
		bs/taskC
	BASH
	exit 0
fi
name='bash/concurrency'
if [[ -z "$template" ]]; then
	echo "$name: Bash script pattern to run tasks in concurrency."
elif [[ "$name" == "$template" ]]; then
	cat <<-'BASH'
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
	BASH
	exit 0
fi

name='bash/needs_rebuild_timestamp'
if [[ -z "$template" ]]; then
	echo "$name: Bash script pattern to compare files timestamps."
elif [[ "$name" == "$template" ]]; then
	cat <<-'BASH'
		# Check if output is newer than all inputs
		# Usage:
		#	if ! needs_rebuild 'dist/app.js' src/*.js; then
		#		exit 0
		#	fi
		needs_rebuild() {
			local output="$1"
			shift
			local inputs=("$@")
			
			[[ ! -f "$output" ]] && return 0
			
			for input in "${inputs[@]}"; do
				if [[ -f "$input" && "$input" -nt "$output" ]]; then
					return 0
				fi
			done
			
			return 1
		}
	BASH
	exit 0
fi
name='bash/needs_rebuild_hash'
if [[ -z "$template" ]]; then
	echo "$name: Bash script pattern to compare files hashes."
elif [[ "$name" == "$template" ]]; then
	cat <<-'BASH'
		# Check if output is newer than all inputs
		# Usage:
		#	if ! needs_rebuild 'sass' src/*.scss; then
		#		exit 0
		#	fi
		needs_rebuild() {
			local key="$1"
			shift
			local inputs=("$@")
			
			local cache_dir="bs/.cache/needs_rebuild"
			mkdir -p "$cache_dir"
			local cache_file="$cache_dir/$key.md5"
			local hash_current=$(md5sum "${inputs[@]}" | md5sum)
			local hash_cache=$(cat "$cache_file")

			if [[ -f "$cache_file" && "$hash_current" == "$hash_cache" ]]; then
				return 1
			else
				echo "$hash_current" > "$cache_file"
				return 0
			fi
		}
	BASH
	exit 0
fi

name='bash/lock'
if [[ -z "$template" ]]; then
	echo "$name: Bash script pattern to create locks."
elif [[ "$name" == "$template" ]]; then
	cat <<-'BASH'
		# Usage:
		# if bs_lock "$0" 'foo'; then
		#	do_something
		#	bs_unlock "$0" 'foo'
		# else
		# 	echo "Already locked"
		# fi
		
		BSLOCKS_DIR="$(mktemp -t --directory bslocks.XXX)"
		bs_lock() {
			local namespace="$(basename "$1" | md5sum | cut -d' ' -f1)"
			local key="${2:--}"

			mkdir -p "$BSLOCKS_DIR/$namespace-$key"
		}
		bs_unlock() {
			local namespace="$(basename "$1" | md5sum | cut -d' ' -f1)"
			local key="${2:--}"

			rm -rf "$BSLOCKS_DIR/$namespace-$key"
		}
	BASH
	exit 0
fi
