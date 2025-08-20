import { readdir } from 'fs/promises';
import path from 'path';
import { NextResponse } from 'next/server';

export async function GET() {
	const dirPath = path.join(process.cwd(), 'public', 'uploads');
	try {
		const files = await readdir(dirPath);
		const docxFiles = files.filter((f) => f.endsWith('.docx'));
		return NextResponse.json(docxFiles);
	} catch (e) {
		return NextResponse.json({ error: 'Ошибка чтения каталога' }, { status: 500 });
	}
}
