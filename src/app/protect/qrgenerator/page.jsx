'use client';

import { useEffect, useState } from 'react';
import QRCode from 'qrcode';

import styles from "./qr.module.scss"

export default function QrGeneratorPage() {
	const [products, setProducts] = useState([]);
	const [selectedProduct, setSelectedProduct] = useState('');
	const [qrUrl, setQrUrl] = useState('');
	const [qrDataUrl, setQrDataUrl] = useState('');

	useEffect(() => {
		fetch('/api/products') // ⚠️ заменишь на свой эндпоинт для списка изделий
			.then(res => res.json())
			.then(setProducts);
	}, []);

	const handleGenerate = async () => {
		if (!selectedProduct) return;

		// const url = `http://192.168.0.162:3000/protect/qr/${selectedProduct}`;
		const url = `http://10.10.10.157:3000/protect/qr/${selectedProduct}`;
		const dataUrl = await QRCode.toDataURL(url);
		setQrUrl(url);
		setQrDataUrl(dataUrl);
	};

	return (
		<div className={styles.base}>
			<h2>QR-кода для изделия</h2>

			<select value={selectedProduct} onChange={e => setSelectedProduct(e.target.value)}>
				<option value="">Выберите изделие</option>
				{products.map(p => (
					<option key={p.id} value={p.id}>
						Изделие #{p.id}
					</option>
				))}
			</select>

			<button onClick={handleGenerate} disabled={!selectedProduct}>
				Сгенерировать QR
			</button>

			{qrDataUrl && (
				<div style={{ marginTop: 20 }}>
					<h3>QR для перехода:</h3>
					<p><a href={qrUrl} target="_blank">{qrUrl}</a></p>
					<img src={qrDataUrl} alt="QR Code" />
					<a href={qrDataUrl} download={`qr-product-${selectedProduct}.png`}>
						Скачать QR
					</a>
				</div>
			)}
		</div>
	);
}
