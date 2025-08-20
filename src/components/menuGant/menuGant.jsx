// 'use client';

// import React, { useEffect, useState } from 'react';
// import styles from './GanttChart.module.scss';
// import { format, addDays, differenceInDays, startOfDay } from 'date-fns';

// export default function GanttChart() {
// 	const [products, setProducts] = useState([]);
// 	const [expandedProducts, setExpandedProducts] = useState({});

// 	useEffect(() => {
// 		async function fetchData() {
// 			try {
// 				const res = await fetch('/api/gantt');
// 				const data = await res.json();
// 				setProducts(data);
// 			} catch (err) {
// 				console.error('Ошибка загрузки данных:', err);
// 			}
// 		}
// 		fetchData();
// 	}, []);

// 	if (!products.length) return <div>Загрузка...</div>;

// 	// Определяем диапазон дат
// 	let minDate = null;
// 	let maxDate = null;
// 	products.forEach(product => {
// 		if (product.steps.length) {
// 			const stepDates = product.steps
// 				.filter(s => s.Time_start)
// 				.map(s => {
// 					const start = startOfDay(new Date(s.Time_start));
// 					const end = addDays(start, s.Deadline);
// 					return { start, end };
// 				});

// 			if (stepDates.length) {
// 				const productStart = stepDates.reduce(
// 					(min, s) => (s.start < min ? s.start : min),
// 					stepDates[0].start
// 				);
// 				const productEnd = stepDates.reduce(
// 					(max, s) => (s.end > max ? s.end : max),
// 					stepDates[0].end
// 				);
// 				product.rangeStart = productStart;
// 				product.rangeEnd = productEnd;
// 			}
// 		}
// 	});


// 	const totalDays = differenceInDays(maxDate, minDate) + 1;

// 	const toggleProduct = id => {
// 		setExpandedProducts(prev => ({ ...prev, [id]: !prev[id] }));
// 	};

// 	return (
// 		<div className={styles.ganttContainer}>
// 			<div className={styles.dateHeader}>
// 				<div className={styles.productColumn}></div>
// 				{Array.from({ length: totalDays }).map((_, i) => {
// 					const date = addDays(minDate, i);
// 					return (
// 						<div key={i} className={styles.dateCell}>
// 							{format(date, 'dd.MM')}
// 						</div>
// 					);
// 				})}
// 			</div>

// 			{products.map(product => (
// 				<div key={product.id} className={styles.productRow}>

// 					<div
// 						className={styles.productLabel}
// 						onClick={() => toggleProduct(product.id)}
// 					>
// 						{product.Label}{' '}
// 						{product.plannedEnd && (
// 							<span className={styles.plannedEnd}>
// 								(до {format(new Date(product.plannedEnd), 'dd.MM')})
// 							</span>
// 						)}
// 					</div>

// 					{product.rangeStart && product.rangeEnd && (
// 						<div
// 							className={styles.productBar}
// 							style={{
// 								gridColumnStart: differenceInDays(product.rangeStart, minDate) + 1,
// 								gridColumnEnd: differenceInDays(product.rangeEnd, minDate) + 2,
// 							}}
// 						></div>
// 					)}
// 					{expandedProducts[product.id] &&
// 						product.steps.map(step => {
// 							const startOffset = step.Time_start
// 								? differenceInDays(startOfDay(new Date(step.Time_start)), minDate)
// 								: 0;
// 							return (
// 								<div key={step.id} className={styles.stepRow}>
// 									<div className={styles.stepLabel}>{step.StepName}</div>
// 									<div className={styles.stepBarContainer}>
// 										<div
// 											className={`${styles.stepBar} ${step.stepOverdue ? styles.overdue : ''
// 												}`}
// 											style={{
// 												gridColumnStart: startOffset + 1,
// 												gridColumnEnd: startOffset + 1 + step.Deadline,
// 											}}
// 										>
// 											{step.Deadline} дн.
// 										</div>
// 									</div>
// 								</div>
// 							);
// 						})}
// 				</div>
// 			))}
// 		</div>
// 	);
// }


'use client';
import React, { useEffect, useState } from 'react';
import { addDays, differenceInDays, format, startOfDay } from 'date-fns';
import styles from './GanttChart.module.scss';

export default function GanttChart() {
	const [products, setProducts] = useState([]);
	const [expandedProducts, setExpandedProducts] = useState({});

	useEffect(() => {
		async function fetchData() {
			try {
				const res = await fetch('/api/gantt');
				const data = await res.json();
				if (!data || data.error) return setProducts([]);
				setProducts(data);
			} catch (err) {
				console.error('Ошибка загрузки данных:', err);
			}
		}
		fetchData();
	}, []);

	if (!products.length) return <div>Нет данных для отображения</div>;

	// Определяем глобальный диапазон дат
	let minDate = null;
	let maxDate = null;

	products.forEach(product => {
		if (product.steps.length) {
			const stepDates = product.steps
				.filter(s => s.Time_start)
				.map(s => {
					const start = startOfDay(new Date(s.Time_start));
					const end = addDays(start, s.Deadline);
					return { start, end };
				});

			if (stepDates.length) {
				const productStart = stepDates.reduce(
					(min, s) => (!min || s.start < min ? s.start : min),
					stepDates[0].start
				);
				const productEnd = stepDates.reduce(
					(max, s) => (!max || s.end > max ? s.end : max),
					stepDates[0].end
				);
				product.rangeStart = productStart;
				product.rangeEnd = productEnd;

				if (!minDate || productStart < minDate) minDate = productStart;
				if (!maxDate || productEnd > maxDate) maxDate = productEnd;
			}
		}
	});

	const totalDays = differenceInDays(maxDate, minDate) + 1;

	const toggleProduct = id => {
		setExpandedProducts(prev => ({ ...prev, [id]: !prev[id] }));
	};

	return (
		<div className={styles.ganttContainer}>
			{/* Шапка с датами */}
			<div className={styles.dateHeader}>
				<div className={styles.productColumn}></div>
				{Array.from({ length: totalDays }).map((_, i) => {
					const date = addDays(minDate, i);
					return (
						<div key={i} className={styles.dateCell}>
							{format(date, 'dd.MM')}
						</div>
					);
				})}
			</div>

			{/* Продукты и этапы */}
			{products.map(product => (
				<div key={product.id} className={styles.productRow}>
					<div
						className={styles.productLabel}
						onClick={() => toggleProduct(product.id)}
					>
						{expandedProducts[product.id] ? '▼ ' : '▶︎ '} {product.Label}{' '}
						{product.plannedEnd && (
							<span className={styles.plannedEnd}>
								(до {format(new Date(product.plannedEnd), 'dd.MM')})
							</span>
						)}
					</div>

					{/* Полоса продукта */}
					{product.rangeStart && product.rangeEnd && (
						<div
							className={styles.productBar}
							style={{
								gridColumnStart: differenceInDays(product.rangeStart, minDate) + 1,
								gridColumnEnd: differenceInDays(product.rangeEnd, minDate) + 2,
							}}
						></div>
					)}

					{/* Этапы */}
					{expandedProducts[product.id] &&
						product.steps.map(step => {
							const startOffset = step.Time_start
								? differenceInDays(startOfDay(new Date(step.Time_start)), minDate)
								: 0;

							return (
								<div key={step.id} className={styles.stepRow}>
									<div className={styles.stepLabel}>{step.StepName}</div>
									<div className={styles.stepBarContainer}>
										<div
											className={`${styles.stepBar} ${step.stepOverdue ? styles.overdue : step.State ? styles.completed : ''
												}`}
											style={{
												gridColumnStart: startOffset + 1,
												gridColumnEnd: startOffset + 1 + step.Deadline,
											}}
										>
											{step.Deadline} дн.
										</div>
									</div>
								</div>
							);
						})}
				</div>
			))}
		</div>
	);
}






