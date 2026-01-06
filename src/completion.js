const log= console.log.bind(console);

function resolveCompletions(completions, now) {
	let out= completions.filter(item => item.toLowerCase().indexOf(now.toLowerCase()) !== -1).sort();
	if(!now) out= out.map(f => f.includes("/") ? f.slice(0, f.indexOf("/") + 1) : f);
	if(out.length) log(out.sort((a, b)=> b.split("/").length - a.split("/").length).join(" "));
	process.exit(0);
}

function completionBash({ api, completionScript, ls }, [ level, now= "", prev, first, second, third ]){ 
	level-= 2;
	const options_global= api.tree.__all__.options.map(r=> r[0]).concat("--help", "--version");
	if(!level){
		if(now.startsWith("."))
			return resolveCompletions(Object.keys(api.tree).filter(c=> !c.startsWith("__")), now);
		if(now.startsWith("-"))
			return resolveCompletions(options_global, now);
		else
			return resolveCompletions(ls(), now);
	}
	if(first===".run"){
		if(level===1)
			return resolveCompletions(ls().concat(...options_global), now);
		first= second;
		second= third;
		level-= 1;
	}
	if(first===".cat" || first===".ls")
		return resolveCompletions(ls().concat(...options_global), now);

	if(first.startsWith("."))
		return resolveCompletions(options_global, now);
	if(!ls().includes(first))
		return process.exit(0);

	level-= 1; // indexing from 0
	try {
		const { subcommands }= completionScript(first); // TODO: https://github.com/fvictorio/completely
		if(!subcommands || !subcommands.length) return process.exit(0);
		if(!level && subcommands.length > 1)
			return resolveCompletions(subcommands.flatMap(r=> r.command), now);

		const subcommand= subcommands.length === 1 ? subcommands[0] : subcommands.find(r=> r.command===second);
		if(!subcommand || !subcommand.flags) return process.exit(0);
		return resolveCompletions(subcommand.flags.map(r=> r.name), now);
	} catch (_){
		log(".bsrc has probably invalid json scheme");
		return process.exit(1);
	}
}
function completionRegisterBash(name){
	log([
		`__${name}_opts(){`,
		" local current=${COMP_WORDS[COMP_CWORD]}",
		` COMPREPLY=( $(${name} .completion bash--complete "\${#COMP_WORDS[@]}" "\$current" "\${COMP_WORDS[COMP_CWORD-1]}" "\${COMP_WORDS[1]}" "\${COMP_WORDS[2]}" "\${COMP_WORDS[3]}") )`,
		// current word starts with ~/, ./ or ..
		' [[ \'..\' == "$current" ]] && current=../',
		' if [[ "$current" == ~\\/* ]] || [[ "$current" == \\.\\/* ]] || [[ "$current" == \\.\\.\\/* ]]; then',
		'  COMPREPLY+=( $(compgen -A file -- "$current") )',
		" fi",
		" return 0",
		"}",
		`complete -o nospace -F __${name}_opts ${name}`,
	].join("\n"));
	process.exit(0);
}
module.exports= { completionBash, completionRegisterBash };
