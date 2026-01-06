const // global functions/utils
	{ log, format }= require("css-in-console"),
	{ readFileSync }= require("node:fs"),
	{ linesToMaxLength, pipe }= require("./utils.js");
const css= log.css`
	.error { color: lightred; }
	.code { color: blue; }
	.code::before, .code::after { content: "\`"; }
	.tab::before { content: "	"; }
	.info {}
	.headline { color: magenta; }
	.highlight { color: lightyellow; }
	.script::before { content: "λ "; }
	.lowpriority { color: gray; }
	.cwd::before { content: "⌂ "; }
`;
const { version, name: package_name, homepage, description }=
	pipe( readFileSync, JSON.parse )(__dirname+"/../package.json");
const name= package_name.startsWith("@") ? package_name.slice(package_name.indexOf("/")+1) : package_name;
const headline= name+": Build system based on executables";

const fc= (code, ...rest)=> format("%c"+( !Array.isArray(code) ? code : String.raw(code, ...rest) ), css.code); //format as code
const help = !process.argv.includes("--help") ? {} : {
	describe: [
		headline,
		"",
		"This script allows you to create build scripts using simple executables¹:",
		"",
		`1. Create a ${fc(name)} directory in your repository root`,
		"2. Implement commands just by adding shell scripts or any other executable (using shellbang¹)",
		"3. Now, you can run build scrip like:",
		...[ "bs/build", "./bs/build", "bs build", "bs .run build" ]
			/* fromat as code */.map(c=> format("	%c"+c, css.code))
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
		"Notes:",
		`[1] use ${fc`chmod +x`}/${fc`chmod u+x`} and shebang² like ${fc`#!/usr/bin/env node`} (similarly for bash, …)`,
		"[2] https://en.wikipedia.org/wiki/Shebang_(Unix)"
	].map(linesToMaxLength(65)),
	run: "Run the given build executable "+format("%c (default when `bs [script]`)", css.highlight),
	ls: "Lists all available executables"+format("%c (default when only `bs`)", css.highlight),
	mkdir: [
		"This initializes the projects bs directory",
		`With ${fc`root`} folder defaults to ${fc`.`}.`
	],
	readme: `This is primarly used for update current ${name}/README.md content.`,
	cat: "This prints bs/README.md content",
	completion:[ "Register a completions for the given shell",
		`This provides completions for ${fc`bs`} itself and available executables`,
		"and argumnets for executables if specify in corresponding config file.",
		"",
		"To allow completions:",
		`Just add ${fc`eval "$(${name} .completion bash)"`} to your ${fc`.bashrc`}` ],
};

module.exports= {
	css, fc,
	info: {
		name, headline, description,
		version,
		homepage
	},
	help,
};
