// // src/app/api/docx-to-html/route.js
// import { NextResponse } from 'next/server';
// import mammoth from 'mammoth';
// import fs from 'fs/promises';
// import path from 'path';

// export async function GET(req) {
//   const { searchParams } = new URL(req.url);
//   const fileName = searchParams.get('file');

//   if (!fileName) {
//     return NextResponse.json({ error: 'Missing file parameter' }, { status: 400 });
//   }

//   try {
//     const filePath = path.resolve('public/uploads', fileName);
//     const buffer = await fs.readFile(filePath);

//     const result = await mammoth.convertToHtml({ buffer });

//     return new Response(result.value, {
//       headers: { 'Content-Type': 'text/html' }
//     });
//   } catch (e) {
//     console.error(e);
//     return NextResponse.json({ error: 'File not found or error processing' }, { status: 500 });
//   }
// }



import { NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs/promises';

const UPLOAD_DIR = path.resolve('./public/uploads');

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const file = searchParams.get('file');
  if (!file) return NextResponse.json({ error: 'Missing file parameter' }, { status: 400 });

  const pdfFileName = file.replace(/\.docx$/i, '.pdf');
  const pdfPath = path.join(UPLOAD_DIR, pdfFileName);

  try {
    const fileBuffer = await fs.readFile(pdfPath);
    
    // Возвращаем PDF с корректными заголовками
    return new Response(fileBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `inline; filename="${pdfFileName}"`,
      },
    });
  } catch (e) {
    return NextResponse.json({ error: 'PDF not found or error reading file' }, { status: 404 });
  }
}

