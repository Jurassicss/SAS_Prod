// 'use client';

// import { useState } from 'react';
// import styles from './EssenceForm.module.scss';
// import EssenceList from '../EssenceList/EssenceList';

// export default function EssenceForm() {
// 	const [essences, setEssences] = useState([]);
// 	const [label, setLabel] = useState('');
// 	const [components, setComponents] = useState({});
// 	const [type, setType] = useState('');
// 	const [compLabel, setCompLabel] = useState('');
// 	const [characteristics, setCharacteristics] = useState('');

// 	const handleAddComponent = () => {
// 		if (!type || !compLabel || !characteristics) {
// 			alert('Заполните все поля компонента');
// 			return;
// 		}

// 		setComponents(prev => ({
// 			...prev,
// 			[type]: {
// 				label: compLabel,
// 				characteristics,
// 			},
// 		}));

// 		setType('');
// 		setCompLabel('');
// 		setCharacteristics('');
// 	};

// 	const handleDeleteComponent = (compType) => {
// 		setComponents(prev => {
// 			const updated = { ...prev };
// 			delete updated[compType];
// 			return updated;
// 		});
// 	};

// 	const handleAddEssence = () => {
// 		if (!label) {
// 			alert('Введите название изделия');
// 			return;
// 		}

// 		// Клонируем объект components (поверхностное копирование)
// 		const componentsCopy = { ...components };

// 		setEssences(prev => [...prev, { label, components: componentsCopy }]);
// 		setLabel('');
// 		setComponents({});
// 	};


// 	const handleDeleteEssence = (index) => {
// 		setEssences(prev => prev.filter((_, i) => i !== index));
// 	};

// 	const handleSubmitAll = async () => {
// 		const res = await fetch('/api/essence', {
// 			method: 'POST',
// 			headers: { 'Content-Type': 'application/json' },
// 			body: JSON.stringify({ essences }),
// 		});

// 		if (res.ok) {
// 			alert('Все изделия успешно сохранены!');
// 			setEssences([]);
// 		} else {
// 			alert('Ошибка при сохранении изделий');
// 		}
// 	};

// 	return (
// 		<>
// 			<div className={styles.base}>
// 				<div className={styles.baseCreate}>
// 					<h2>Создание экземпляра изделия</h2>

// 					<label>
// 						Название изделия:
// 						<input
// 							value={label}
// 							onChange={e => setLabel(e.target.value)}
// 							placeholder="Например: Корпус П-24"
// 						/>
// 					</label>

// 					<h3>Состав изделия</h3>
// 					<div className={styles.windowComponentCreate}>
// 						{Object.entries(components).map(([key, val]) => (
// 							<div key={key} >
// 								<div>
// 									<strong>{key}</strong> — {val.label}
// 									<br />
// 									<small>{val.characteristics}</small>
// 								</div>
// 								<button
// 									onClick={() => handleDeleteComponent(key)}
// 								>
// 									Удалить
// 								</button>
// 							</div>
// 						))}
// 					</div>
// 					<div className={styles.windowButtons}>
// 						<div>
// 							<input
// 								placeholder="Тип компонента (например: antenna)"
// 								value={type}
// 								onChange={e => setType(e.target.value)}
// 							/>
// 							<input
// 								placeholder="Название компонента (label)"
// 								value={compLabel}
// 								onChange={e => setCompLabel(e.target.value)}
// 							/>
// 							<input
// 								placeholder="Характеристики (только на английском)"
// 								value={characteristics}
// 								onChange={e => setCharacteristics(e.target.value)}
// 							/>
// 						</div>
// 						<button type="button" onClick={handleAddComponent}>
// 							Добавить компонент
// 						</button>
// 					</div>

// 					<button
// 						onClick={handleAddEssence}
// 						className={styles.buttonCreate}
// 					>
// 						Добавить изделие в список
// 					</button>
// 				</div>
// 				<div className={styles.baseList}>
// 					<h3>Список изделий</h3>
// 					{essences.length > 0 && (
// 						<>
// 							<div className={styles.list}>
// 								{essences.map((ess, i) => (
// 									<div key={i} className={styles.windowElementList}>
// 										<div className={styles.elementList}>
// 											<strong>{ess.label}</strong>
// 											<ul>
// 												{Object.entries(ess.components).map(([k, v]) => (
// 													<li key={k}>
// 														{k} — {v.label} | {v.characteristics}
// 													</li>
// 												))}
// 											</ul>
// 										</div>
// 										<button
// 											onClick={() => handleDeleteEssence(i)}
// 										>
// 											Удалить изделие
// 										</button>
// 									</div>
// 								))}
// 							</div>

// 						</>
// 					)}
// 					<button className={styles.delete}
// 						onClick={handleSubmitAll}
// 					>
// 						Сохранить все изделия
// 					</button>

// 				</div>
// 			</div>
// 			<EssenceList />
// 		</>
// 	);
// }



'use client';

import { useState, useMemo } from 'react';
import styles from './EssenceForm.module.scss';
import EssenceList from '../EssenceList/EssenceList';
import AssignScenarioForm from '../AssignScenarioForm/AssignScenarioForm';
// import AssignScenarioForm from '../AssignScenarioForm/AssignScenarioForm';

export default function EssenceForm() {
	const [essences, setEssences] = useState([]);
	const [label, setLabel] = useState('');
	const [components, setComponents] = useState({});
	const [type, setType] = useState('');
	const [compLabel, setCompLabel] = useState('');
	const [characteristics, setCharacteristics] = useState('');

	// Получаем уникальные компоненты из всех изделий
	const allAvailableComponents = useMemo(() => {
		const map = new Map();
		essences.forEach(ess => {
			Object.entries(ess.components).forEach(([type, val]) => {
				const key = `${type}_${val.label}_${val.characteristics}`;
				if (!map.has(key)) {
					map.set(key, { type, ...val });
				}
			});
		});
		return Array.from(map.values());
	}, [essences]);

	const handleAddComponent = () => {
		if (!type || !compLabel || !characteristics) {
			alert('Заполните все поля компонента');
			return;
		}

		setComponents(prev => ({
			...prev,
			[type]: {
				label: compLabel,
				characteristics,
			},
		}));

		setType('');
		setCompLabel('');
		setCharacteristics('');
	};

	const handleAddExistingComponent = (event) => {
		const selectedIndex = event.target.value;
		if (!selectedIndex) return;
		const { type, label, characteristics } = allAvailableComponents[selectedIndex];
		setComponents(prev => ({
			...prev,
			[type]: { label, characteristics }
		}));
	};

	const handleDeleteComponent = (compType) => {
		setComponents(prev => {
			const updated = { ...prev };
			delete updated[compType];
			return updated;
		});
	};

	const handleAddEssence = () => {
		if (!label) {
			alert('Введите название изделия');
			return;
		}

		const componentsCopy = { ...components };

		setEssences(prev => [...prev, { label, components: componentsCopy }]);
		setLabel('');
		setComponents({});
	};

	const handleDeleteEssence = (index) => {
		setEssences(prev => prev.filter((_, i) => i !== index));
	};

	const handleSubmitAll = async () => {
		const res = await fetch('/api/essence', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ essences }),
		});

		if (res.ok) {
			alert('Все изделия успешно сохранены!');
			setEssences([]);
		} else {
			alert('Ошибка при сохранении изделий');
		}
	};

	return (
		<>
			<div className={styles.base}>
				<div className={styles.baseCreate}>
					<h2>Создание экземпляра изделия</h2>

					<label>
						Название изделия:
						<input
							value={label}
							onChange={e => setLabel(e.target.value)}
							placeholder="Например: Корпус П-24"
						/>
					</label>

					<h3>Состав изделия</h3>
					<div className={styles.windowComponentCreate}>
						{Object.entries(components).map(([key, val]) => (
							<div key={key}>
								<div>
									<strong>{key}</strong> — {val.label}
									<br />
									<small>{val.characteristics}</small>
								</div>
								<button onClick={() => handleDeleteComponent(key)}>
									Удалить
								</button>
							</div>
						))}
					</div>

					<div className={styles.windowButtons}>
						<div>
							<input
								placeholder="Тип компонента (например: antenna)"
								value={type}
								onChange={e => setType(e.target.value)}
							/>
							<input
								placeholder="Название компонента (label)"
								value={compLabel}
								onChange={e => setCompLabel(e.target.value)}
							/>
							<input
								placeholder="Характеристики (только на английском)"
								value={characteristics}
								onChange={e => setCharacteristics(e.target.value)}
							/>
						</div>
						<button type="button" onClick={handleAddComponent}>
							Добавить компонент
						</button>
					</div>

					{allAvailableComponents.length > 0 && (
						<div className={styles.selectWrapper}>
							<label>
								Или выберите компонент из существующих:
								<select onChange={handleAddExistingComponent} defaultValue="">
									<option value="" disabled>
										-- Выберите компонент --
									</option>
									{allAvailableComponents.map((comp, idx) => (
										<option key={idx} value={idx}>
											{comp.type} — {comp.label} ({comp.characteristics})
										</option>
									))}
								</select>
							</label>
						</div>
					)}

					<button
						onClick={handleAddEssence}
						className={styles.buttonCreate}
					>
						Добавить изделие в список
					</button>
				</div>

				<div className={styles.baseList}>
					<h3>Список изделий</h3>
					{essences.length > 0 && (
						<div className={styles.list}>
							{essences.map((ess, i) => (
								<div key={i} className={styles.windowElementList}>
									<div className={styles.elementList}>
										<strong>{ess.label}</strong>
										<ul>
											{Object.entries(ess.components).map(([k, v]) => (
												<li key={k}>
													{k} — {v.label} | {v.characteristics}
												</li>
											))}
										</ul>
									</div>
									<button onClick={() => handleDeleteEssence(i)}>
										Удалить изделие
									</button>
								</div>
							))}
						</div>
					)}

					<button className={styles.delete} onClick={handleSubmitAll}>
						Сохранить все изделия
					</button>
				</div>
			</div>

			<EssenceList />
			<AssignScenarioForm />
		</>
	);
}
