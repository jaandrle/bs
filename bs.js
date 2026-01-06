#!/usr/bin/env node
"use strict";
const // global functions/utils
	{ log, format }= require("css-in-console"),
	{ readFileSync, existsSync, mkdirSync, writeFileSync, statSync, fstatSync }= require("node:fs"),
	{ homedir } = require("node:os"),
	{ join, relative }= require("node:path"),
	{ stdout, argv, exit, cwd: pwd, chdir, kill, pid }= require("node:process"),
	{ pipe,
	  passBuildArgs,
	  listExecutables, isExecutable }= require("./src/utils.js"),
	{ folderRoot, folderConfig }= require("./src/find-bs.js");
const stdoutIsFIFO= (()=> {
	try { return fstatSync(stdout.fd).isFIFO(); }
	catch(_){ return false; }
})();
const { css, fc, info, help }= require("./src/consts.js");
function logHead(wd_bs){
	if(stdoutIsFIFO) return;
	let wd= join(wd_bs, "../");
	const h= homedir();
	if(wd.startsWith(h)) wd= join(
		format("%c~", css.lowpriority),
		wd.slice(h.length)
	);
	return log(
		"%c%s%c%s",
		css.cwd,
		css.lowpriority,
		wd,
		join(info.name, "./")
	);
}
const api= require("sade")(info.name)
	.version(info.version)
	.describe(help.describe)

	.command(".run [script]", help.run, { default: true })
	.action(run)

	.command(".ls [filter]", help.ls)
	.action((filter)=> {
		const folder_root= folderRoot();
		const list= ls({ is_out: true });
		if(!list.length){
			if(!folder_root){
				log("%cNo `bs` for current directory: %c%s.", css.error, css.unset, pwd());
				log("You may want to run %cbs .mkdir%c.", css.code);
			} else
				log("No executables found in '%s'.", folder_root);
			log("Run %c%s --help%c for more info.", css.code, css.unset, info.name);
			return exit(1);
		}
		const list_final= filter ? list.filter(x=> x.script.includes(filter)) : list;
		list_final.forEach(lsPrintNth);
		if(stdoutIsFIFO) return exit(0);

		log();
		if(!list_final.length){
			log("%cNo executables found.", css.error);
		} else {
			if(list_final.length>10 && !filter)
				log("You can filter executables using %cbs .ls filter%c.", css.code);
			log("You may find more info using %cbs .grep [name|filter]%c.", css.code);
		}
		return exit(0);
	})

	.command(".mkdir [root]", help.mkdir)
	.action(init)

	.command(".readme", help.readme)
	.action(init)

	.command(".grep [filter]", help.cat)
	.alias(".cat")
	.action(cat)

	.command(".completion <shell>", help.completion)
	.action(completion);
api.parse(passBuildArgs());

/** @returns {{ content: string[], found: { [script: string]: number }, path: string, exists: boolean, h_level: number }} */
function readReadme(path_bs){
	const path= join(path_bs, "README.md");
	const exists= existsSync(path);
	const content= exists ? readFileSync(path, "utf8").split("\n") : [
		"# "+info.headline,
		`This project uses [${info.homepage.slice("https://github.com/".length)}: ${info.description}](${info.homepage}).`,
		"",
		"## Available executables",
		"",
	];
	let h_level= 3; // defaults to ###
	const found= content
		.flatMap((line, i)=> line.match(new RegExp("^#+ `?(.\/)?"+info.name+"/(.*)")) ? [ [ content[i], i ] ] : []) //`
		.map(function([ l, i ]){
			h_level= l.indexOf(" ");
			const script_start= l.indexOf(info.name+"/")+3;
			// index of space or ` or line end
			const script_end= /( |`|$)/g.exec(l.slice(script_start));
			const end_adjust= script_start + ( script_end[0]!=="" ? 0 : 1 );
			const key= l.slice(script_start, script_end.index+end_adjust);
			return [ key, i ];
		});

	return { path, exists, content, found: Object.fromEntries(found), h_level };
}

function init(root= pwd()){
	const is_init= argv.slice(2)[0]===".mkdir";
	const folder_root_local= is_init ? join(root, info.name) : folderRoot();
	if(!existsSync(folder_root_local)) mkdirSync(folder_root_local);
	log("%cFolder:", css.highlight, folder_root_local);
	const readme= readReadme(folder_root_local);
	const execs= listExecutables(folder_root_local, 0).map(e=> e.replace(folder_root_local+"/", ""));
	const execs_known= Object.keys(readme.found);
	log("%cExecutables:", css.highlight, execs.join(", "));
	const execs_add= execs
		.filter(e=> !execs_known.includes(e))
		.map(e=> "#".repeat(readme.h_level)+" bs/"+e);
	if(!readme.exists)
		writeFileSync(readme.path, readme.content.join("\n"));
	log(
		"%cReadme%s:",
		css.highlight,
		readme.exists ? "" : " (created)",
		readme.path
	);
	if(execs_add.length){
		log("%cMissing in README:", css.highlight);
		log("```markdown\n%c"+execs_add.join("\n")+"\n%c```", css.headline, css.unset);
	}
	return exit(0);
}
function cat(filter){
	const folder_root= folderRoot(true);
	logHead(folder_root);
	const readme= join(folder_root, "README.md");
	const readme_content= existsSync(readme) ? readFileSync(readme, "utf8") : "";
	if(!readme_content){
		log("%cNo `README.md` (content) found in `bs` directory", css.error);
		return exit(1);
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
	if(!lines.length){
		if(!filter) log("%cReadme is empty!", css.error);
		else log("%cNo docs for given filter/name.", css.error);
		return exit(1);
	}
	lines.forEach(function echoLine(line){
		if(line.trim().startsWith("#"))
			return log("%c"+line, css.headline);
		log(line);
	});
	if(!filter && !stdoutIsFIFO && lines.length>10)
		log("\nYou can filter docs using %cbs .grep [name|filter]%c.", css.code);
	return exit(0);
}
/** @returns { { script: string, name: string, docs: string }[] } */
function ls({ is_out= false }= {}){
	const folder_root= folderRoot();
	if(!folder_root) return [];
	if(is_out) logHead(folder_root);
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
	const folder_root= folderRoot(true);
	const args= argv.slice(2);
	
	if(args[0]===".run") args.shift();
	if(!args.length) return api.tree[".ls"].handler();
	else args.shift();
	const wd_current= pwd();
	const wd_root= join(folder_root, "..");
	chdir(wd_root);
	script= info.name+"/"+script;
	if(!existsSync(script) || !statSync(script).isFile()){
		const candidate= listExecutables(script.slice(0, script.lastIndexOf("/")), 0)
			.find(f=> f.startsWith(script) && f[script.length]===".");
		if(candidate)
			script= candidate;
	}
	if(!stdoutIsFIFO) logHead(folder_root)
	if(!isExecutable(script)){
		log(`%c'${script}' doesn't exist or is not executable.`, css.error);
		const found= ls().filter(f=> f.script.includes(script.slice(3)));
		if(found.length){
			log("\nYou may want to run:");
			found.forEach(lsPrintNth);
		}
		return exit(1);
	}
	
	if(!stdoutIsFIFO)
		lsPrintNth({ script: script.slice(info.name.length+1) });
	const { spawn }= require("node:child_process");
	return spawn(
		script,
		args.map(a=> [ "./", "../" ].find(p=> a.startsWith(p)) ? relative(wd_root, join(wd_current, a)) : a),
		{ stdio: "inherit" }
	)
		.on("exit", function onexit(exit_code, signal){
			if(typeof exit_code === 'number')
				return exit(exit_code);
			
			log("%cUnknown error", css.error);
			kill(pid, signal)
		});
}
function completion(shell){
	const { completionBash, completionRegisterBash }= require("./src/completion.js");
	if("bash"===shell)
		return completionRegisterBash(info.name);
	if("bash--complete"===shell)
		return completionBash(
			{ api, completionScript, ls: ()=> ls().map(r=> r.name) },
			argv.slice(4)
		);
	log("Unknown shell: "+shell);
	exit(1);
}
function completionScript(name){
	let bsrc;
	const folder_root= folderConfig();
	const end_empty= { "subcommands": [] };
	if(!folder_root) return end_empty;

	const { readdirSync }= require("node:fs");
	for(const file of readdirSync(folder_root)){
		if(!file.startsWith("completion")) continue;
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
