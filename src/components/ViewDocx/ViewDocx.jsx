'use client';

import { useEffect, useState } from 'react';
import styles from './ViewDocx.module.scss';
import PdfViewer from '../PdfViewer/PdfViewer';

export default function ViewDocx() {
	const [files, setFiles] = useState([]);
	const [selected, setSelected] = useState('');

	useEffect(() => {
		const load = async () => {
			const res = await fetch('/uploads-list.json');
			const data = await res.json();
			setFiles(data);
		};
		load();
	}, []);

	return (
		<div className={styles.viewer}>
			<h2>Просмотр DOCX в PDF</h2>
			<select onChange={(e) => setSelected(e.target.value)} value={selected}>
				<option value="" disabled>Выберите файл</option>
				{files.map(f => (
					<option key={f} value={f}>{f}</option>
				))}
			</select>

			{/* Блок просмотра PDF */}
			{selected && <PdfViewer fileUrl={`/api/docx-to-pdf?file=${encodeURIComponent(selected)}`} />}
			{/* {selected && (
				<div className={styles.pdfContainer} style={{ marginTop: 20, height: '600px', border: '1px solid #ccc' }}>
					<iframe
						src={`/api/docx-to-pdf?file=${encodeURIComponent(selected)}`}
						title="PDF Viewer"
						width="100%"
						height="100%"
						style={{ border: 'none' }}
					/>
				</div>
			)} */}
			{/* {selected && (
				<div style={{ height: 600, border: '1px solid #ccc', marginTop: 20 }}>
					<iframe
						src={`/api/docx-to-pdf?file=${encodeURIComponent(selected)}`}
						width="100%"
						height="100%"
						style={{ border: 'none' }}
						title="PDF Viewer"
					/>
				</div>
			)} */}
		</div>
	);
}
