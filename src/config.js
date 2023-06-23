const { readFileSync, existsSync }= require("node:fs");
/**
 * @typedef Completions
 * @type {{
 *	options: string[],
 *	commands: Record<string, string[]>
 * }}
 * */
/**
 * @typedef Command
 * @type {{
 *	cmd?: string,
 *	help?: string,
 *	completions?: Completions
 * }}
 * */
const init= {
	commands: {}
};
/**
 * @param {...string} candidates
 * @returns {{
 *	commands: Record<string, Command>
 * }}
 * */
module.exports= function(...candidates){
	return Object.assign(init, ...candidates.map(readFile));
};

function readFile(path){
	if(!existsSync(path)) return {};
	const { bs= {} }= JSON.parse(readFileSync(path));
	return bs;
}
