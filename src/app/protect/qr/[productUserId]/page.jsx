'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useUser } from '@/app/context/UserContext';
import styles from "./productWindow.module.scss"
import { Preloader } from '@/components/Preloader/preloader';

export default function QrProductPage() {
	const { productUserId } = useParams(); // ✅ теперь имя точно совпадает
	const { user } = useUser();
	const [step, setStep] = useState(null);
	const [loading, setLoading] = useState(true);
	const router = useRouter();

	useEffect(() => {
		if (!user || !productUserId) return;
	
		const endpoint = user.roles.includes('admin')
			? `/api/qr/${productUserId}/all`
			: `/api/qr/${productUserId}`;
	
		fetch(endpoint)
			.then(async res => {
			  if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
			  const text = await res.text();
			  if (!text) throw new Error('Пустой ответ от сервера');
			  try {
				return JSON.parse(text);
			  } catch {
				throw new Error('Некорректный JSON в ответе');
			  }
			})
			.then(data => {
				if (user.roles.includes('admin')) {
					setStep(data); // тут массив шагов
				} else {
					const userStep = data.find(step => step.executor === user.roles[0]);
					if (!userStep) {
						alert('Нет доступа к данному этапу.');
						router.push('/');
					} else {
						setStep(userStep);
					}
				}
			})
			.catch(e => {
				console.error('Ошибка при получении данных по QR:', e);
				router.push('/');
			})
			.finally(() => setLoading(false));
	}, [productUserId, user]);
	
	const handleComplete = async () => {
		const res = await fetch(`/api/qr/${productUserId}`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ step_id: step.step_id }),
		});

		if (res.ok) {
			setStep(prev => ({ ...prev, state: true }));
		} else {
			alert('Ошибка при обновлении состояния');
		}
	};
	if (loading) return <Preloader />;
	// if (loading) return <div className={styles.load}>Загрузка... </div>;
	if (Array.isArray(step)) {
		return (
			<div className={styles.base}>
				<h2>Изделие № {productUserId}</h2>
				{step.map((s, i) => (
				  <div key={i} className={styles.stepBlock}>
				    <p><strong>{s.name}</strong></p>
				    <p>Исполнитель: {s.executor_login || s.executor}</p> {/* Показываем login, если есть */}
				    <p>Статус: {s.state ? '✅ Выполнено' : '❌ Не выполнено'}</p>
				  </div>
				))}
			</div>
		);
	}
	return step ? (
		<div className={styles.base}>
			<h2>Изделие № {productUserId}</h2>
			<p><strong>{step.name}</strong></p>
			<p>Статус: {step.state ? '✅ Выполнено' : '❌ Не выполнено'}</p>
			{!step.state && (
				<button onClick={handleComplete}>Готово</button>
			)}
		</div>
	) : (
		
		<div>Этап не найден или нет доступа</div>
	);
}
