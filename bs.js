#!/usr/bin/env node
"use strict";
const // global functions/utils
	{ log, format }= require("css-in-console"),
	{ readFileSync, existsSync, mkdirSync, writeFileSync, statSync, fstatSync }= require("node:fs"),
	{ join }= require("node:path"),
	{ stdout, argv }= require("node:process"),
	{ pipe,
	  linesToMaxLength, passBuildArgs,
	  listExecutables, isExecutable }= require("./src/utils.js"),
	{ cwd: pwd }= require("node:process");
const stdoutIsFIFO= (()=> {
	try { return fstatSync(stdout.fd).isFIFO(); }
	catch(_){ return false; }
})();
/** @type {()=> void} */
let error;
const // global consts
	headline= "bs: Build system based on executables",
	css= log.css`
		.error { color: lightred; }
		.code { color: blue; }
		.code::before, .code::after { content: "\`"; }
		.tab::before { content: "	"; }
		.info {}
		.headline { color: magenta; }
		.highlight { color: lightyellow; }
		.script::before { content: "λ "; }
		.cwd::before { content: "⌂ "; }
	`,
	{ version, name, homepage, description }= pipe( readFileSync, JSON.parse )(__dirname+"/package.json");
let // bs folder
	folder_root;

const fc= (code, ...rest)=> format("%c"+( !Array.isArray(code) ? code : String.raw(code, ...rest) ), css.code); //format as code
const catchError= a=> { if(!error) return a; error(a); };
const api= require("sade")(name)
	.version(version)
	.describe([
		headline,
		"",
		"This script allows you to create build scripts using simple executables¹:",
		"",
		`1. Create a ${fc(name)} directory in your repository root`,
		"2. Implement commands just by adding shell scripts or any other executable (using shellbang¹)",
		"3. Now, you can run build scrip like:",
		...[ "bs/build", "./bs/build", "bs build", "bs .run build" ]
			/* fromat as code */.map(c=> format("%c"+c, css.code+css.tab))
			/* join with "or" */.reverse().map((s, i)=> i ? s+" or" : s).reverse(),
		"",
		"So, this script is not neccessary, but it provides some helpers:",
		`1. You can call executables without extensions (for example ${fc`${name}/test.py`} ⇔ ${fc`${name} test`})`,
		`2. You can use completion, see ${fc`.completion`} command`,
		`3. This utility can find current or any parent folder containing ${fc(name)} directory`,
		"",
		"To point out:",
		`1. To prevent colision all ${fc(name)} commands starts with ${fc`.`} (e.g. ${fc`.ls`})`,
		`2. It is a good practice to distinc non-commands from commands (eg. with preposition ${fc`.`}, ${fc`_`}, …)`,
		"",
		"Known pitfalls:",
		`1. The ${fc(name)} tries to find root folder and uses it as cwd, so ${fc`${name} command ./file`} can works unexpectedly!`,
		"",
		"Notes:",
		`[1] use ${fc`chmod +x`} and shebang² like ${fc`#!/usr/bin/env node`} (similarly for bash, …)`,
		"[2] https://en.wikipedia.org/wiki/Shebang_(Unix)"
	].map(linesToMaxLength(65)))

	.command(
		".run [script]",
		"Run the given build executable "+format("%c (default when `bs [script]`)", css.highlight),
		{ default: true }
	)
	.action(run)

	.command(
		".ls [filter]",
		"Lists all available executables"+format("%c (default when only `bs`)", css.highlight),
	)
	.action((filter)=> {
		const list= ls({ is_out: true });
		if(!list.length){
			if(!folder_root){
				log("%cNo `bs` for current directory: %c%s", css.error, css.unset, pwd());
				log("You may want to run %cbs .mkdir%c", css.code, css.unset);
			} else
				log(`No executables found in '${folder_root}'.`);
			log(`Run %c${name} --help%c for more info.`, css.code, css.unset);
			return process.exit(1);
		}
		(filter ? list.filter(x=> x.script.includes(filter)) : list)
			.forEach(lsPrintNth);
		log("\nFor more info use %cbs .cat%c", css.code, css.unset);
		return process.exit(0);
	})

	.command(".mkdir [root]", [ "This initializes the projects bs directory",
		`With ${fc`root`} folder defaults to ${fc`.`}.` ])
	.action(init)

	.command(".readme", "This is primarly used for update current bs/README.md content.")
	.action(init)

	.command(".cat [filter]", "This prints bs/README.md content")
	.action(cat)

	.command(".completion <shell>", [ "Register a completions for the given shell",
		`This provides completions for ${fc`bs`} itself and available executables`,
		"and argumnets for executables if specify in corresponding config file.",
		"",
		"To allow completions:",
		`Just add ${fc`eval "$(${name} .completion bash)"`} to your ${fc`.bashrc`}` ])
	.action(completion);
api.parse(passBuildArgs());

function readReadme(path_bs){
	const path= join(path_bs, "README.md");
	const content= existsSync(path) ? readFileSync(path, "utf8").split("\n") : [
		"# "+headline,
		`This project uses [${homepage.slice("https://github.com/".length)}: ${description}](${homepage}).`,
		"",
		"## Available executables",
		"",
	];
	let h_level= 3; // defaults to ###
	const found= content
		.flatMap((line, i)=> line.match(/^#+ `?(.\/)?bs\/(.*)/) ? [ [ content[i], i ] ] : []) //`
		.map(function([ l, i ]){
			h_level= l.indexOf(" ");
			const script_start= l.indexOf("bs/")+3;
			// index of space or ` or line end
			const script_end= /( |`|$)/g.exec(l.slice(script_start));
			const end_adjust= script_start + ( script_end[0]!=="" ? 0 : 1 );
			const key= l.slice(script_start, script_end.index+end_adjust);
			return [ key, i ];
		});

	return { path, content, found: Object.fromEntries(found), h_level };
}

function init(root= pwd()){
	const is_init= argv.slice(2)[0]===".mkdir";
	const folder_root_local= is_init ? join(root, name) : ( loadBS(), folder_root );
	if(!existsSync(folder_root_local)) mkdirSync(folder_root_local);
	console.log("Folder: "+folder_root_local);
	const readme= readReadme(folder_root_local);
	const execs= listExecutables(folder_root_local, 0).map(e=> e.replace(folder_root_local+"/", ""));
	const execs_known= Object.keys(readme.found);
	console.log("Executables: "+execs.join(", "));
	const execs_add= execs
		.filter(e=> !execs_known.includes(e))
		.map(e=> "#".repeat(readme.h_level)+" bs/"+e);
	writeFileSync(readme.path, readme.content.join("\n"));
	if(execs_add.length)
		console.log("Missing in README: \n```markdown\n"+execs_add.join("\n")+"\n```");
	console.log("Readme: "+readme.path);
	process.exit(0);
}
function cat(filter){
	loadBS();
	if(!folder_root){
		log("%cNo `bs` directory found", css.error);
		return process.exit(1);
	}
	log("%c"+folder_root, css.cwd);
	const readme= join(folder_root, "README.md");
	const readme_content= existsSync(readme) ? readFileSync(readme, "utf8") : "";
	if(!readme_content){
		log("%cNo `README.md` (content) found in `bs` directory", css.error);
		return process.exit(1);
	}
	let lines= [], filtered= false;
	for(const line of readme_content.split("\n")){
		if(!filter){
			lines.push(line);
			continue;
		}
		const is_headline= /^#+ *bs\//.test(line.trim());
		if(is_headline){
			if(filtered) filtered= false;
			if(filter) filtered= line.includes(filter);
		}
		if(filtered) lines.push(line);
	}
	lines.forEach(function echoLine(line){
		if(line.trim().startsWith("#"))
			return log("%c"+line, css.headline);
		log(line);
	});
	process.exit(0);
}
function ls({ is_out= false }= {}){
	loadBS();
	if(!folder_root) return [];
	if(is_out) log("%c"+folder_root, css.cwd);
	const { content, found }= readReadme(folder_root);

	return listExecutables(folder_root, 0)
	 .map(pipe(
		f=> f.slice(folder_root.length+1),
		function(script){
			const name= script.replace(/\.[^/.]+$/, "");
			const readme= Reflect.has(found, script) ? found[script] : -2;
			return { script, name, docs: content[readme+1] };
		}
	 ))
	.sort(function({ script: a }, { script: b }){
		const deep= [ a, b ].reduce((acc, curr, i)=>
			acc + (-1)**i * (curr.match(new RegExp("/", "g")) || []).length, 0);
		if(deep) return deep;
		return a.localeCompare(b);
	});
}
function lsPrintNth({ script, docs }){
	let out= fc(script);
	if(docs) out+= ": "+docs+"…";
	log("%c"+out, css.script);
}
function run(script){
	loadBS();
	const args= argv.slice(2);
	
	if(args[0]===".run") args.shift();
	if(!args.length) return api.tree[".ls"].handler();

	else args.shift();
	catchError();
	// TODO: what about `./` in args when cwd≠folder_root/..
	process.chdir(folder_root.replace(/\/bs$/, ""));
	script= "bs/"+script;
	if(!existsSync(script) || !statSync(script).isFile()){
		const candidate= listExecutables(script.slice(0, script.lastIndexOf("/")), 0)
			.find(f=> f.startsWith(script) && f[script.length]===".");
		if(candidate)
			script= candidate;
	}
	if(!stdoutIsFIFO)
		log("%c%s", css.cwd, folder_root);
	if(!isExecutable(script)){
		log(`%c'${script}' doesn't exist or is not executable`, css.error);
		const found= ls().filter(f=> f.script.includes(script.slice(3)));
		if(found.length){
			log("\nYou may want to run:");
			found.forEach(lsPrintNth);
		}
		return process.exit(1);
	}
	
	if(!stdoutIsFIFO)
		lsPrintNth({ script });
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
		return completionBash(
			{ api, completionScript, ls: ()=> ls().map(r=> r.name) },
			argv.slice(4)
		);
	log("Unknown shell: "+shell);
	process.exit(1);
}
function completionScript(name){
	let bsrc;
	if(!folder_root) loadBS();
	const end_empty= { "subcommands": [] };
	if(!folder_root) return end_empty;

	const { readdirSync }= require("node:fs");
	for(const file of readdirSync(folder_root)){
		if(!file.startsWith(".bsrc")) continue;
		bsrc= join(folder_root, file);
		break;
	}
	if(!bsrc || !isExecutable(bsrc)) return end_empty;
	const { script }= ls().find(f=> f.name===name) || {};
	if(!script) return end_empty;
	const { spawnSync }= require("node:child_process");
	try {
		return JSON.parse(spawnSync(bsrc, [ "completion", script ]).stdout);
	} catch(e){
		return end_empty;
	}
}

function loadBS(){
	if(!folder_root) folder_root= findBS();
}
function findBS(cwd= pwd()){
	const folder_root= "/bs"; // allow change?
	let candidate= cwd.replace(/\/$/, "");
	while(!existsSync(candidate+folder_root)){
		const last_slash= candidate.lastIndexOf("/");
		if(last_slash < 0){
			error= ()=> {
				log("%cNo `bs` for current directory: %c%s", css.error, css.unset, cwd);
				return process.exit(1);
			};
			return null;
		}
		candidate= candidate.slice(0, last_slash);
	}
	return candidate+folder_root;
}
