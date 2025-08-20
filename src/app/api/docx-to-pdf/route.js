// import { NextResponse } from 'next/server';
// import { execFile } from 'child_process';
// import path from 'path';
// import fs from 'fs/promises';

// const UPLOAD_DIR = path.resolve('./public/uploads');

// export async function GET(request) {
// 	const { searchParams } = new URL(request.url);
// 	const file = searchParams.get('file');
// 	if (!file) return NextResponse.json({ error: 'Missing file parameter' }, { status: 400 });

// 	const docxPath = path.join(UPLOAD_DIR, file);
// 	const pdfFileName = file.replace(/\.docx$/i, '.pdf');
// 	const pdfPath = path.join(UPLOAD_DIR, pdfFileName);

// 	try {
// 		await fs.access(docxPath);
// 	} catch {
// 		return NextResponse.json({ error: 'File not found' }, { status: 404 });
// 	}

// 	try {
// 		await fs.access(pdfPath);
// 	} catch {
// 		// Конвертация docx в pdf
// 		await new Promise((resolve, reject) => {
// 			const libreOfficePath = 'C:\\Program Files\\LibreOffice\\program\\soffice.exe';
// 			execFile(
// 				libreOfficePath,
// 				['--headless', '--convert-to', 'pdf', '--outdir', UPLOAD_DIR, docxPath],
// 				(error) => {
// 					if (error) reject(error);
// 					else resolve();
// 				}
// 			);
// 		});
// 	}

// 	// Читаем pdf файл в Buffer
// 	const fileBuffer = await fs.readFile(pdfPath);

// 	// Конвертируем Buffer в Uint8Array (ArrayBuffer) для Response
// 	const uint8Array = new Uint8Array(fileBuffer.buffer, fileBuffer.byteOffset, fileBuffer.byteLength);

// 	return new Response(uint8Array, {
// 		status: 200,
// 		headers: {
// 			'Content-Type': 'application/pdf',
// 			'Content-Disposition': `inline; filename="${pdfFileName}"`,
// 		},
// 	});
// }


import { NextResponse } from 'next/server';
import { execFile } from 'child_process';
import path from 'path';
import fs from 'fs';
import fsPromises from 'fs/promises';

const UPLOAD_DIR = path.resolve('./public/uploads');

export async function GET(request) {
	const { searchParams } = new URL(request.url);
	const file = searchParams.get('file');
	if (!file) return NextResponse.json({ error: 'Missing file parameter' }, { status: 400 });

	const docxPath = path.join(UPLOAD_DIR, file);
	const pdfFileName = file.replace(/\.docx$/i, '.pdf');
	const pdfPath = path.join(UPLOAD_DIR, pdfFileName);

	try {
		await fsPromises.access(docxPath);
	} catch {
		return NextResponse.json({ error: 'File not found' }, { status: 404 });
	}

	try {
		await fsPromises.access(pdfPath);
	} catch {
		// Конвертация docx в pdf
		await new Promise((resolve, reject) => {
			const libreOfficePath = 'C:\\Program Files\\LibreOffice\\program\\soffice.exe';
			execFile(
				libreOfficePath,
				['--headless', '--convert-to', 'pdf', '--outdir', UPLOAD_DIR, docxPath],
				(error) => {
					if (error) reject(error);
					else resolve();
				}
			);
		});
	}

	// Создаем ReadableStream из файла
	const fileStream = fs.createReadStream(pdfPath);

	return new Response(fileStream, {
		status: 200,
		headers: {
			'Content-Type': 'application/pdf',
			'Content-Disposition': `inline; filename="${encodeURIComponent(pdfFileName)}"`,
		},
	});
}