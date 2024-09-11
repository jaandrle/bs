const log= console.log.bind(console);
function completionBash({ api, ls }, [ level, now= "", prev, first, second, third ]){
	level-= 2;
	const matches= arr=> {
		let out= arr.filter(item=> item.indexOf(now)===0);
		if(!now.includes("/"))
			out= out.map(f=> f.includes("/") ? f.slice(0, f.indexOf("/")) : f);
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
	if(first.startsWith("."))
		return resolve(options_global);
	process.exit(0);
}
function completionRegisterBash(name){
	log([
		`__${name}_opts()`,
		"{",
		` COMPREPLY=( $(${name} .completion bash--complete "\${#COMP_WORDS[@]}" "\${COMP_WORDS[COMP_CWORD]}" "\${COMP_WORDS[COMP_CWORD-1]}" "\${COMP_WORDS[1]}" "\${COMP_WORDS[2]}" "\${COMP_WORDS[3]}") )`,
		' local l="2"',
		' if [[ "${COMP_WORDS[1]}" == \\.* ]]; then',
		'  local l="3"',
		" fi",
		' if [[ "${#COMP_WORDS[@]}" -gt "$l" ]]; then',
		'  COMPREPLY+=( $(compgen -A file -- "${COMP_WORDS[COMP_CWORD]}") )',
		" fi",
		" return 0",
		"}",
		`complete -F __${name}_opts ${name}`,
	].join("\n"));
	process.exit(0);
}
module.exports= { completionBash, completionRegisterBash };
