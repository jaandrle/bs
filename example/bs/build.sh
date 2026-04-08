#!/usr/bin/env bash
set -eo pipefail
. bs/.common || {
	echo 'Please run this script from the project root directory' >&2;
	exit 1;
}

help(){
	if ! isHelp "${@}"; then return 0; fi
	echoReadmeInfo
	echo
	exit 0
}
main(){
	help "${@}"
	echo "Build with arguments: $*"
	
	# Serial tasks
	echo "Running serial tasks..."
	bs/sleep 0.5 &&
	bs/sleep 0.2 &&
	echo "Serial tasks end"
	
	# Parallel tasks with proper signal handling
	echo "Running parallel tasks..."
	(
		trap 'kill 0' SIGINT ;
		bs/sleep 4 &
		bs/sleep 2 &
		wait
	)
	echo "Parallel tasks end"
}

main "${@}"
