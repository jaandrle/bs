const { existsSync } = require("node:fs");
const { cwd, exit } = require("node:process");
const { log } = require("css-in-console");
const { css, info } = require("./consts.js");
const { join } = require("node:path");

function cwdInConfig() {
	const config = folderGlobalConfig(true);
	return join(config, "my", cwd());
}
let islocal = true;
function bspwd() {
	return islocal ? cwd() : cwdInConfig();
}
function processArgsLocation(argv) {
	const a2 = argv[2];
	if (a2 !== ".my") return argv;
	islocal = false;
	return argv.slice(0, 2).concat(argv.slice(3));
}

let folder_root;
function folderRoot(required = false) {
	if (!folder_root) folder_root = findBSRaw();
	if (required && !folder_root) {
		log(
			`%cNo \`${info.name}\` folder in current directory: %c%s`,
			css.error,
			css.unset,
			bspwd(),
		);
		return exit(1);
	}
	return folder_root;
}
function findBSRaw(candidate = bspwd()) {
	while (!existsSync(join(candidate, info.name))) {
		const parent = join(candidate, "..");
		if (parent === candidate) return null;
		candidate = parent;
	}
	return join(candidate, info.name);
}
const config_name = "." + info.name + "rc";
let folder_config;
function folderConfig(required = false) {
	if (folder_config) return folder_config;
	const candidate = join(folderRoot(), config_name);
	if (!candidate || !existsSync(candidate)) {
		if (required) {
			log(
				`%cNo \`${config_name}\` folder in current bs: %c%s`,
				css.error,
				css.unset,
				bspwd(),
			);
			return exit(1);
		}
		return null;
	}
	return (folder_config = candidate);
}

const { homedir, platform } = require("node:os");
const global_config = join(homedir(), platform() === "win32" ? "AppData" : ".config", info.name+"rc");
let folder_global_config;
function folderGlobalConfig(required = false) {
	if (folder_global_config) return folder_global_config;
	const candidate = global_config;
	if (!candidate || !existsSync(candidate)) {
		if (required) {
			log(
				`%cNo global config folder: %c%s`,
				css.error,
				css.unset,
				candidate
			);
			return exit(1);
		}
		return null;
	}
	return (folder_global_config = candidate);
}

function bsEchoHome() {
	if (islocal) return [homedir(), "~"];
	return [join(folderGlobalConfig(), "my", homedir()), "MY"];
}

function pwd(){
	const root= join(folderRoot(true), "..");
	if(islocal) return root;
	return root.slice(join(folderGlobalConfig(true), "my").length);
}

module.exports = { folderRoot, folderConfig, processArgsLocation, pwd, bspwd, bsEchoHome, config_name };
