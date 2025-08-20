'use client';

import styles from './CreateProductForm.module.scss';
import { useEffect, useState } from 'react';

export default function CreateProductPage() {
	const [selectedProductId, setSelectedProductId] = useState('');

	const [selectedProduct, setSelectedProduct] = useState(null);
	const [products, setProducts] = useState([]);
	const [quantity, setQuantity] = useState(1);
	const [customer, setCustomer] = useState('');
	const [printKTP, setPrintKTP] = useState(false);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [error, setError] = useState('');

	useEffect(() => {
		fetch('/api/essence/start')
			.then(res => res.json())
			.then(setProducts)
			.catch(() => setError('Не удалось загрузить продукты'));
	}, []);

	const isValid = () =>
		selectedProduct &&
		customer.trim() &&
		Number.isInteger(+quantity) &&
		+quantity >= 1;

	const handleSubmit = async () => {
		if (!isValid()) {
			setError('Пожалуйста, заполните все поля корректно');
			return;
		}

		setIsSubmitting(true);
		setError('');

		const res = await fetch('/api/start', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				id_product: selectedProduct.id,
				label: selectedProduct.label, // если надо
				quantity: parseInt(quantity),
				customer,
				printKTP,
			}),
		});

		const data = await res.json();

		if (!res.ok) {
			setError(data.error || 'Ошибка при создании продукта');
		} else {
			alert(`${data.count} продукт(ов) успешно создано`);
			setSelectedProductId('');
			setQuantity(1);
			setCustomer('');
			setPrintKTP(false);
		}

		setIsSubmitting(false);
	};

	return (
		<div className={styles.container}>
			<h1 className={styles.title}>Создание продукта</h1>

			<select
				className={styles.input}
				value={selectedProduct ? selectedProduct.id : ''}
				onChange={e => {
					const prod = products.find(p => p.id === parseInt(e.target.value));
					setSelectedProduct(prod);
				}}
			>
				<option value="">Выберите продукцию</option>
				{products.map(p => (
					<option key={p.id} value={p.id}>
						{p.label}
					</option>
				))}
			</select>

			<input
				className={styles.input}
				type="number"
				placeholder="Количество изделий"
				min="1"
				value={quantity}
				onChange={e => setQuantity(e.target.value)}
			/>

			<input
				className={styles.input}
				type="text"
				placeholder="Заказчик"
				value={customer}
				onChange={e => setCustomer(e.target.value)}
			/>

			<label className={styles.checkboxLabel}>
				<input
					type="checkbox"
					checked={printKTP}
					onChange={e => setPrintKTP(e.target.checked)}
				/>
				📄 Распечатать КТП
			</label>

			<button
				className={styles.button}
				onClick={handleSubmit}
				disabled={!isValid() || isSubmitting}
			>
				Создать
			</button>

			{error && <p className={styles.error}>{error}</p>}
		</div>
	);
}
