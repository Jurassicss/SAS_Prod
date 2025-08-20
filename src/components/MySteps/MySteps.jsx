'use client'

import { useEffect, useState } from 'react';
import { useUser } from '@/app/context/UserContext';

import styles from './Mystep.module.scss';
import CircleLoader from '../Preloader/circleLoader';

export default function MySteps() {
  	const { user } = useUser();
  	const [steps, setSteps] = useState([]);
  	const [loading, setLoading] = useState(true); // ⬅️ состояние загрузки

  	useEffect(() => {
  	  if (!user?.roles?.length) return;

  	  setLoading(true);
  	  fetch('/api/user-steps')
  	    .then(res => res.json())
  	    .then(setSteps)
  	    .catch(err => {
  	      console.error('Ошибка загрузки этапов:', err);
  	    })
  	    .finally(() => setLoading(false));
  	}, [user]);

  	const handleComplete = async (productId, stepId) => {
  	  	await fetch('/api/user-steps', {
  	  	  method: 'POST',
  	  	  headers: { 'Content-Type': 'application/json' },
  	  	  body: JSON.stringify({ productId, stepId })
  	  	});
	  
  	  	// Обновить после смены состояния
  	  	setSteps(prev =>
  	  	  prev.filter(s => !(s.product_id === productId && s.step_id === stepId))
  	  	);
  	};

  	if (!user) return <p>Нет данных пользователя</p>;

  	const visibleSteps = steps.filter(step =>
		user.roles.includes(step.executor_name)
  	);

  	return (
  	  	<div className={styles.baseWindow}>
  	  	  	<h2 className={styles.title}>Изделия</h2>

  	  	  	{loading ? (
  	  	  	  	<>
  	  	  	  	    <p>⏳ Загрузка этапов...</p>
  	  	  	  	    <CircleLoader />
  	  	  	  	</>
  	  	  	) : visibleSteps.length === 0 ? (
  	  	  	  <p>✅ Нет незавершённых этапов</p>
  	  	  	) : (
  	  	  	  	<ul>
  	  	  	  	  {visibleSteps.map(step => (
  	  	  	  	    <li key={`${step.product_id}-${step.step_id}`}>
  	  	  	  	      <h3>Изделие {step.name_product} — {step.name}</h3>
  	  	  	  	      <p>Осталось: {step.days_left} дней</p>
  	  	  	  	      <button onClick={() => handleComplete(step.product_id, step.step_id)}>
  	  	  	  	        Завершить
  	  	  	  	      </button>
  	  	  	  	    </li>
  	  	  	  	  ))}
  	  	  	  	</ul>
  	  	  	)}
  	  	</div>
  	);
}

