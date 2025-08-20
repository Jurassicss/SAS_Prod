const fs = require('fs');
const path = require('path');

const SRC_DIR = path.resolve(__dirname, 'src');
const EXTENSIONS = ['.js', '.ts', '.jsx', '.tsx']; // можно расширить список по необходимости

function countLinesInFile(filePath) {
	const content = fs.readFileSync(filePath, 'utf-8');
	return content.split('\n').length;
}

function walkDir(dir) {
	let totalLines = 0;
	const files = fs.readdirSync(dir, { withFileTypes: true });

	for (const file of files) {
		const fullPath = path.join(dir, file.name);

		if (file.isDirectory()) {
			totalLines += walkDir(fullPath);
		} else if (EXTENSIONS.includes(path.extname(file.name))) {
			totalLines += countLinesInFile(fullPath);
		}
	}

	return totalLines;
}

const totalLines = walkDir(SRC_DIR);
console.log(`Total lines of code in ${SRC_DIR}: ${totalLines}`);
