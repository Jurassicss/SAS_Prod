import { NextResponse } from 'next/server';
import { writeFile } from 'fs/promises';
import path from 'path';

export async function POST(req) {
  const formData = await req.formData();
  const file = formData.get('file');

  if (!file || !file.name.endsWith('.docx')) {
    return NextResponse.json({ error: 'Неверный формат файла' }, { status: 400 });
  }

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  const filePath = path.join(process.cwd(), 'public', 'uploads', file.name);
  await writeFile(filePath, buffer);

  return NextResponse.json({ success: true });
}
