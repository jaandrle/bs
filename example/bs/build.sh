#!/usr/bin/env bash
set -eou pipefail
echo "Build with arguments: $*"
bs/sleep 0.5
bs/sleep 0.2
echo "Serial tasts end"
(
	trap 'kill 0' SIGINT ;
	bs/sleep 4 &
	bs/sleep 2 &
	wait
)
echo "Parallel tasts end"
