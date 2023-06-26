#!/usr/bin/env node
const // global functions/utils
	{ log, format }= require("css-in-console"),
	{ readFileSync, existsSync, statSync }= require("node:fs"),
	{ pipe,
	  linesToMaxLength, passBuildArgs,
	  listExecutables, isExecutable }= require("./src/utils.js");
const // global consts
	folder_root= "bs", // allow change?
	css= log.css`
		.error { color: lightred; }
		.code { color: blue; }
		.code::before, .code::after { content: "\`"; }
		.tab::before, .help::before { content: "	"; }
		.help { color: magenta; }
	`,
	{ version, name }= pipe( readFileSync, JSON.parse )(__dirname+"/package.json"),
	config= require("./src/config.js")(folder_root);

const fc= (code, ...rest)=> format("%c"+( !Array.isArray(code) ? code : String.raw(code, ...rest) ), css.code); //format as code
const api= require("sade")(name)
	.version(version)
	.describe([
		"This script allows you to create build scripts using simple executables¹:",
		"",
		`1. Create a ${format("%c./bs", css.code)} directory in your repository root`,
		"2. Implement commands just by adding shell scripts or any other executable (using shellbang¹)",
		"3. Now, you can run build scrip like:",
		...[ "bs/build", "./bs/build", "bs build", "bs .run build" ]
			/* fromat as code */.map(c=> format("%c"+c, css.code+css.tab))
			/* join with "or" */.reverse().map((s, i)=> i ? s+" or" : s).reverse(),
		"",
		"So, this script is not neccessary, but it provides some helpers:",
		`1. You can call executables without extensions (for example ${fc`bs/test.py`} ⇔ ${fc`bs test`})`,
		`2. You can define default executable`,
		`3. You can use completion, see ${fc`.completion`} command`,
		"",
		"To point out:",
		`1. To prevent colision all ${fc(name)} commands starts with ${fc`.`}c (e.g. ${fc`.ls`})`,
		`2. Similar logic is used for special files/folder (e.g. ${fc`.command.toml`}?)`,
		"",
		"Notes:",
		`[1] use ${fc`chmod +x`} and shebang² like ${fc`#!/usr/bin/env node`} (similarly for bash, …)`,
		"[2] https://en.wikipedia.org/wiki/Shebang_(Unix)"
	].map(linesToMaxLength(65)))
.command(".run [script]", "Run the given build executable", { default: true })
	.action(run)
.command(".ls", "Lists all available executables")
	.action(()=> ls().forEach(lsPrint))
.command(".completion <shell>", [ "Register a completions for the given shell",
	`This provides completions for ${fc`bs`} itself and available executables`,
	"and argumnets for executables if specify in corresponding config file.",
	"",
	"To allow completions:",
	`Just add ${fc`eval "$(${name} .completion bash)"`} to your ${fc`.bashrc`}` ])
	.action(completion);
api.parse(passBuildArgs());

function ls(){
	return listExecutables(folder_root, 0)
	 .map(pipe(
		f=> f.slice(folder_root.length+1),
		path=> path.replace(/\.[^/.]+$/, "")
	 ))
	.sort(function(a, b){
		const deep= [ a, b ].reduce((acc, curr, i)=>
			acc + (-1)**i * (curr.match(new RegExp("/", "g")) || []).length, 0);
		if(deep) return deep;
		return a.localeCompare(b);
	});
}
function lsPrint(file){
	const c= config.executables[file];
	let out= "> "+fc(file);
	if(c && c.help)
		out+= "\t"+format("%c"+c.help, css.help);
	log(out);
}
function run(script){
	const args= process.argv.slice(2);
	
	if(args[0]===".run") args.shift();
	if(!args.length){
		const is_default= Object.entries(config.executables).find(([_, c])=> c.default);
		if(!is_default)
			return ls().forEach(lsPrint);
		script= is_default[0];
	}
	else args.shift();
	const head= lsPrint.bind(null, script);
	script= folder_root+"/"+script;
	if(!existsSync(script) || !statSync(script).isFile()){
		const candidate= listExecutables(script.slice(0, script.lastIndexOf("/")), 0)
			.find(f=> f.startsWith(script) && f[script.length]===".");
		if(candidate)
			script= candidate;
	}
	if(!isExecutable(script)){
		log(`%c'${script}' doesn't exist or is not executable`, css.error);
		return process.exit(1);
	}
	
	head();
	const { spawn }= require("node:child_process");
	return spawn(script, args, { stdio: "inherit" })
		.on("exit", function onexit(exit_code, signal){
			if(typeof exit_code === 'number')
				return process.exit(exit_code);
			
			log("%cUnknown error", css.error);
			process.kill(process.pid, signal)
		});
}
function completion(shell){
	const { completionBash, completionRegisterBash }= require("./src/completion.js");
	if("bash"===shell)
		return completionRegisterBash(name);
	if("bash--complete"===shell)
		return completionBash({ api, ls, config }, process.argv.slice(4));
	log("Unknown shell: "+shell);
	process.exit(1);
}
