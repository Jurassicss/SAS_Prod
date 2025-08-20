'use client';

import { useState } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/TextLayer.css';


// Указываем воркер как путь к статическому файлу в public
pdfjs.GlobalWorkerOptions.workerSrc = '/pdfjs/pdf.worker.min.mjs';

export default function PdfViewer({ fileUrl }) {
	const [numPages, setNumPages] = useState(null);

	function onDocumentLoadSuccess({ numPages }) {
		setNumPages(numPages);
	}

	return (
		<Document file={fileUrl} onLoadSuccess={onDocumentLoadSuccess}>
			{Array.from(new Array(numPages), (_, i) => (
				<Page key={i} pageNumber={i + 1} />
			))}
		</Document>
	);
}


