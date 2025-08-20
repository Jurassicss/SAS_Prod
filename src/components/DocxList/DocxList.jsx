'use client';

import { useState } from 'react';

export default function DocxUploadAndView() {
	const [htmlContent, setHtmlContent] = useState('');
	const [error, setError] = useState('');

	const handleFileChange = async (e) => {
		const [fileUrl, setFileUrl] = useState('');

		const handleChange = (e) => {
			setFileUrl(e.target.value);
		};

		return (
			<div style={{ maxWidth: 900, margin: '0 auto' }}>
				<h2>Просмотр DOCX через Office Online</h2>

				<input
					type="text"
					placeholder="Вставьте публичный URL на docx"
					value={fileUrl}
					onChange={handleChange}
					style={{ width: '100%', padding: '8px', marginBottom: '1rem' }}
				/>

				{fileUrl && (
					<iframe
						src={`https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(fileUrl)}`}
						width="100%"
						height="600px"
						frameBorder="0"
						allowFullScreen
						title="Docx Viewer"
					/>
				)}
			</div>
		);
	}
}