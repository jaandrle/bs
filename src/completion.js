const log= console.log.bind(console);
function completionBash({ api, completionScript, ls }, [ level, now= "", prev, first, second, third ]){
	level-= 2;
	const matches= arr=> {
		let out= arr.filter(item=> item.toLowerCase().indexOf(now.toLowerCase())!==-1).sort();
		// if(!now.includes("/"))
		if(!now)
			out= out.map(f=> f.includes("/") ? f.slice(0, f.indexOf("/")+1) : f);
		if(out.length) return out.join(" ");
		return "";
	}
	const resolve= arr=> { log(matches(arr)); return process.exit(0); };
	const options_global= api.tree.__all__.options.map(r=> r[0]).concat("--help", "--version");
	if(!level){
		if(now.startsWith("."))
			return resolve(Object.keys(api.tree).filter(c=> !c.startsWith("__")));
		if(now.startsWith("-"))
			return resolve(options_global);
		else
			return resolve(ls());
	}
	if(first===".run"){
		if(level===1)
			return resolve(ls().concat(...options_global));
		first= second;
		second= third;
		level-= 1;
	}
	if(first===".cat" || first===".ls")
		return resolve(ls().concat(...options_global));
	if(first.startsWith("."))
		return resolve(options_global);
	if(!ls().includes(first))
		return process.exit(0);
	
	// TODO: https://github.com/fvictorio/completely
	level-= 1; // indexing from 0
	const { subcommands }= completionScript(first);
	try{
		if(!subcommands.length) return process.exit(0);
		if(!level && subcommands.length > 1)
			return resolve(subcommands.flatMap(r=> r.command));
		
		const subcommand= subcommands.length === 1 ? subcommands[0] : subcommands.find(r=> r.command===second);
		return resolve(subcommand.flags.map(r=> r.name));
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
		// current word starts with ./ or ../
		' if [[ "$current" == \\.\\/* ]] || [[ "$current" == \\.\\.\\/* ]]; then',
		'  COMPREPLY+=( $(compgen -A file -- "$current") )',
		" fi",
		" return 0",
		"}",
		`complete -o nospace -F __${name}_opts ${name}`,
	].join("\n"));
	process.exit(0);
}
module.exports= { completionBash, completionRegisterBash };
