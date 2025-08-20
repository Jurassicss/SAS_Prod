// app/api/convert-docx/route.js
import { NextResponse } from 'next/server';
import mammoth from 'mammoth';

export async function POST(req) {
  	const formData = await req.formData();
  	const file = formData.get('file');

  	if (!file || file.type !== 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
  	  	return NextResponse.json({ error: 'Invalid file format. Only .docx is allowed.' }, { status: 400 });
  	}

  	const arrayBuffer = await file.arrayBuffer();
  	const buffer = Buffer.from(arrayBuffer);

  	try {
  	  	const result = await mammoth.convertToHtml({ buffer });
  	  	return NextResponse.json({ html: result.value });
  	} catch (err) {
  	  	return NextResponse.json({ error: 'Conversion failed', details: err.message }, { status: 500 });
  	}
}
