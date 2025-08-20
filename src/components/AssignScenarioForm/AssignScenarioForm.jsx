'use client';

import { useEffect, useState } from 'react';
import styles from './ScenarioBinder.module.scss'

export default function AssignScenarioForm() {
	const [products, setProducts] = useState([]);
	const [scenarios, setScenarios] = useState([]);
	const [selectedProduct, setSelectedProduct] = useState('');
	const [selectedScenario, setSelectedScenario] = useState('');
	const [message, setMessage] = useState('');

	useEffect(() => {
		fetch('/api/products/list')
			.then(res => res.json())
			.then(data => setProducts(data))
			.catch(console.error);

		fetch('/api/scenario/list')
			.then(res => res.json())
			.then(data => setScenarios(data))
			.catch(console.error);
	}, []);

	const handleAssign = async () => {
		if (!selectedProduct || !selectedScenario) {
			setMessage('Выберите изделие и сценарий');
			return;
		}

		const res = await fetch('/api/products/scenario', {
			method: 'PUT',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				productId: selectedProduct,
				scenarioId: selectedScenario,
			}),
		});

		const result = await res.json();
		setMessage(result.success ? 'Сценарий привязан' : result.error);
	};

	return (
		<div className={styles.base}>
			<h2>Привязка сценария к изделию</h2>

			<select value={selectedProduct} onChange={e => setSelectedProduct(e.target.value)}>
				<option value="">Выберите изделие</option>
				{products.map(p => (
					<option key={p.id} value={p.id}>
						{p.label} (id: {p.id})
					</option>
				))}
			</select>

			<select value={selectedScenario} onChange={e => setSelectedScenario(e.target.value)}>
				<option value="">Выберите сценарий</option>
				{scenarios.map(s => (
					<option key={s.id} value={s.id}>
						Сценарий #{s.id}
					</option>
				))}
			</select>

			<button onClick={handleAssign}>Привязать</button>

			{message && <div>{message}</div>}
		</div>
	);
}
