const { existsSync }= require("node:fs");
const { cwd: pwd, exit }= require("node:process");
const { log } = require("css-in-console");
const { css, info }= require("./consts.js");
const { join } = require("node:path");

let folder_root;
function folderRoot(required= false){
	if(!folder_root) folder_root= findBSRaw();
	if(required && !folder_root){
		log(`%cNo \`${info.name}\` folder in current directory: %c%s`, css.error, css.unset, pwd());
		return exit(1);
	}
	return folder_root;
}
function findBSRaw(candidate= pwd()){
	while(!existsSync(join(candidate, info.name))){
		const parent= join(candidate, "..");
		if(parent === candidate) return null;
		candidate= parent;
	}
	return join(candidate, info.name);
}
const config_name= "."+info.name+"rc";
let folder_config;
function folderConfig(required= false){
	if(folder_config) return folder_config;
	const candidate= join(folderRoot(), config_name);
	if(!candidate || !existsSync(candidate)){
		if(required){
			log(`%cNo \`${config_name}\` folder in current bs: %c%s`, css.error, css.unset, pwd());
			return exit(1);
		}
		return null;
	}
	return (folder_config= candidate);
}

module.exports = { folderRoot, folderConfig, config_name };
