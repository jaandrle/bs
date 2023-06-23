/**
 * Compose fuctions
 * ```js
 * //instead of
 * console.log(fun1(fun2(input)));
 * //use
 * pipe(fun2, fun1, console.log.bind(console))(input);
 * ```
 * @param {...(i: any)=> any} fs
 * */
const pipe= (...fs)=> input=> fs.reduce((out, f)=> f(out), input);
/**
 * For help, this utility rearange lines to have max `length` chars.
 *
 * Use in `.map`:
 * ```js
 * [ "line", "line" ].map(linesToMaxLength(3));
 * ```
 * @param {number} length
 * @returns {(line: string)=> string}
 * */
function linesToMaxLength(length= 65){
	return line=> {
		const words= line.split(' ');
		let currentLine= '';
		let j= 1;
		for (let i = 0; i < words.length; i++) {
			const word= words[i];
			if(currentLine.length + word.length > length*j){
				j+= 1;
				currentLine+= "\n\t";
			}
				currentLine+= word + ' ';
		}
		return currentLine;
	};
}
/** Proper pass of `--help`/`--version` for `.run` */
function passBuildArgs(){
	const { argv }= process;
	const [ i2, i3 ]= argv.slice(2);
	if(!i2) return argv;
	if(i2.startsWith("-")) return argv;
	if(i2.startsWith(".") && i2!==".run" && i2!==".completion") return argv;
	if(( i2===".run" || i2===".completion" ) && ( !i3 || i3.startsWith("-") )) return argv;
	if(i2===".completion") return argv.slice(0, 4);
	return argv.map(l=> l==="--help" || l==="--version" ? "--$$$" : l);
}

const { accessSync, readdirSync, statSync, constants }= require("node:fs");
function listExecutables(dir, level){
	const out= [];
	for(const file of readdirSync(dir)){
		const file_path= dir + '/' + file;
		const stats= statSync(file_path);
		if(stats.isDirectory() && level < 3){
			out.push(...listExecutables(file_path, level + 1));
		}
		if(stats.isFile() && isExecutable(file_path))
			out.push(file_path);
	}
	return out;
}
function isExecutable(path){
	try{
		accessSync(path, constants.X_OK);
		return true;
	} catch(_){
		return false;
	}
}

module.exports= {
	pipe,
	linesToMaxLength, passBuildArgs,
	isExecutable, listExecutables
};
