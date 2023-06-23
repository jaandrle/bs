const { readFileSync, readdirSync, statSync }= require("node:fs");
/**
 * @typedef Command
 * @type {{
 *	help?: string,
 *	options: string[],
 *	commands: Record<string, string[]>
 * }}
 * */
/**
 * @param {...string} candidates
 * @returns {{
 *	commands: Record<string, Command>
 * }}
 * */
module.exports= function(folder){
	const commands= listTOML(folder).map(readTOML)
		.reduce(function(out, [ cmd, { help= "", completions= {} } ]){
			const { ['--options']: options, ...commands }= completions;
			const curr= { help };
			curr.options= options ? options : [];
			curr.commands= commands ? commands : {};
			out[cmd]= curr;
			return out;
		}, {});
	return { commands };
};

function readTOML(path){
	const file_name= path.slice(path.lastIndexOf("/")+2, -".toml".length);
	const pre= readFileSync(path).toString().split("\n")
		.reduce(function(out, line){
			line= line.trim();
			if(!line) return out;
			if(line.startsWith('[')){
				out.push([ line.slice(1, line.length - 1), {} ]);
				return out;
			}
			const eq= line.indexOf("=");
			const key= line.slice(0, eq);
			const value= line.slice(eq+1).trim();
			out.at(-1)[1][key]= JSON.parse(value);
			return out;
		}, [ [ file_name, {} ] ]);
	const out= pre.shift();
	return [ out[0], pre.reduce((out, [key, o])=> (out[key]= o, out), out[1]) ];
}
function listTOML(dir, level= 0){
	const out= [];
	for(const file of readdirSync(dir)){
		const file_path= dir + '/' + file;
		const stats= statSync(file_path);
		if(stats.isDirectory() && level < 3){
			out.push(...listTOML(file_path, level + 1));
		}
		if(stats.isFile() && isTOML(file_path))
			out.push(file_path);
	}
	return out;
}
function isTOML(file_path){
	const file_name= file_path.slice(file_path.lastIndexOf("/")+1);
	return file_name.startsWith('.') && file_name.toLowerCase().endsWith(".toml");
}
