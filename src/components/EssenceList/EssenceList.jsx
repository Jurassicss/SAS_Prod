'use client';

import { useEffect, useState } from 'react';
import styles from './EssenceList.module.scss';

export default function EssenceList() {
	const [essences, setEssences] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState('');

	useEffect(() => {
		const fetchEssences = async () => {
			try {
				const res = await fetch('/api/essence');
				const data = await res.json();

				if (res.ok) {
					setEssences(data);
				} else {
					throw new Error(data.message || 'Ошибка при загрузке изделий');
				}
			} catch (err) {
				setError(err.message);
			} finally {
				setLoading(false);
			}
		};

		fetchEssences();
	}, []);

	const handleDelete = async (id) => {
		const confirmDelete = confirm('Вы уверены, что хотите удалить это изделие?');
		if (!confirmDelete) return;

		try {
			const res = await fetch(`/api/essence/${id}`, { method: 'DELETE' });
			if (res.ok) {
				setEssences(prev => prev.filter(e => e.id !== id));
			} else {
				const data = await res.json();
				throw new Error(data.message || 'Ошибка при удалении');
			}
		} catch (err) {
			alert(`Ошибка: ${err.message}`);
		}
	};

	if (loading) return <p>Загрузка...</p>;
	if (error) return <p>Ошибка: {error}</p>;

	return (
		<div className={styles.wrapper}>
			<h2>Существующие изделия</h2>
			{essences.length === 0 ? (
				<p>Нет сохранённых изделий</p>
			) : (
				<div className={styles.list}>
					{essences.map((essence) => (
						<details key={essence.id} className={styles.card}>
							<summary>{essence.label}</summary>
							<ul>
								{Object.entries(essence.components || {}).map(([type, comp]) => (
									<li key={type}>
										{type} — {comp.label} | {comp.characteristics}
									</li>
								))}
							</ul>
							<button onClick={() => handleDelete(essence.id)}>Удалить</button>
						</details>
					))}
				</div>
			)}
		</div>
	);
}
