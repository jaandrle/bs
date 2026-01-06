#!/usr/bin/env -S npx nodejsscript
/* global echo, $, pipe, s, fetch */
const [ , cmd ]= $;
s.cd($.pathFromURL(import.meta.url)`../`);
if(cmd.startsWith("api/")) $.exit(1);
try{
	const { completions, completions_all }= s.$("-FS").run`./${cmd} __ALL__`.xargs(JSON.parse);
	pipe(
		Object.entries,
		completions=> completions.length > 1 ? completions : [ [ "default", [] ] ],
		es=> es.map(([ command, flags ])=> ({ command, flags: flags.concat(completions_all).map(name=> ({ name })) })),
		subcommands=> JSON.stringify({ subcommands }),
		echo
	)(completions);
	$.exit(0);
} catch(err){
	$.exit(1);
}
