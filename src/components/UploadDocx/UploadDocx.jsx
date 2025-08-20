'use client';

import { useState } from 'react';
import styles from './UploadDocx.module.scss';

export default function UploadDocx() {
	const [file, setFile] = useState(null);
	const [status, setStatus] = useState('');

	const handleUpload = async () => {
		if (!file) return;

		const formData = new FormData();
		formData.append('file', file);

		setStatus('Загрузка...');

		const res = await fetch('/api/upload', {
			method: 'POST',
			body: formData,
		});

		if (res.ok) {
			setStatus('Файл успешно загружен!');
		} else {
			setStatus('Ошибка при загрузке.');
		}
	};

	return (
		<div className={styles.container}>
			<h2>Загрузка DOCX</h2>
			<input type="file" accept=".docx" onChange={(e) => setFile(e.target.files[0])} />
			<button onClick={handleUpload}>Загрузить</button>
			<p>{status}</p>
		</div>
	);
}

