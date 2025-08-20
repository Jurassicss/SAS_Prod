import fs from 'fs/promises';
import path from 'path';
import { NextResponse } from 'next/server';

export async function POST(req) {
	const formData = await req.formData();
	const file = formData.get('file');

	if (!file) {
		return NextResponse.json({ error: 'Файл не найден' }, { status: 400 });
	}

	const bytes = await file.arrayBuffer();
	const buffer = Buffer.from(bytes);
	const uploadDir = path.join(process.cwd(), 'public/uploads');
	const filePath = path.join(uploadDir, file.name);

	await fs.mkdir(uploadDir, { recursive: true });
	await fs.writeFile(filePath, buffer);

	// Обновим список файлов
	const files = await fs.readdir(uploadDir);
	await fs.writeFile(
		path.join('public', 'uploads-list.json'),
		JSON.stringify(files)
	);

	return NextResponse.json({ success: true });
}
