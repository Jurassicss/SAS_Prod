'use client'

import React, { useState, useEffect, useMemo, useRef } from 'react';
import ReactFlow, { Background, Controls, MiniMap, MarkerType, Handle, Position } from 'reactflow';
import 'reactflow/dist/style.css';
import gsap from 'gsap';
import styles from './ProductionFlow.module.scss'



// export default function ProductsGraph() {
// 	const [products, setProducts] = useState([]);
// 	const [selectedProductId, setSelectedProductId] = useState(null);
// 	const [steps, setSteps] = useState([]);
// 	const [scenario, setScenario] = useState([]);
// 	const [hoverInfo, setHoverInfo] = useState(null);
// 	const [filter, setFilter] = useState('all'); // <-- добавлено состояние фильтра
// 	const [filterActive, setFilterActive] = useState(false)



// 	const [tooltip, setTooltip] = useState({ visible: false, x: 0, y: 0, text: '' });
// 	const tooltipRef = useRef(null);
// 	// Загружаем список продуктов
// 	useEffect(() => {
// 		fetch('/api/products')
// 			.then(res => res.json())
// 			.then(data => setProducts(data))
// 			.catch(console.error);
// 	}, []);

// 	// При выборе продукта загружаем шаги и связи
// 	useEffect(() => {
// 		if (!selectedProductId) return;

// 		fetch(`/api/products/${selectedProductId}`)
// 			.then(res => res.json())
// 			.then(data => {
// 				setSteps(data.steps || []);
// 				setScenario(data.scenario || []);
// 			})
// 			.catch(console.error);
// 	}, [selectedProductId]);

// 	const selectedProduct = useMemo(
// 		() => products.find(p => p.id === selectedProductId),
// 		[products, selectedProductId]
// 	);


// 	// Фильтруем продукты по состоянию
// 	const filteredProducts = Array.isArray(products)
// 		? products.filter(product => {
// 			if (filter === 'all') return true;
// 			if (filter === 'inProduction') return product.state_product === false;
// 			if (filter === 'done') return product.state_product === true;
// 			return true;
// 		})
// 		: [];

// 	function buildNodeGraph(steps, scenario) {
// 		const graph = {};
// 		const inDegree = {};
// 		const stepMap = {};

// 		steps.forEach(step => {
// 			stepMap[step.StepId] = step;
// 			inDegree[step.StepId] = 0;
// 			graph[step.StepId] = [];
// 		});

// 		scenario.forEach(({ target_parent, target_child }) => {
// 			graph[target_parent]?.push(target_child);
// 			inDegree[target_child] = (inDegree[target_child] || 0) + 1;
// 		});

// 		const levels = {};
// 		const queue = [];

// 		Object.keys(inDegree).forEach(id => {
// 			if (inDegree[id] === 0) {
// 				queue.push(+id);
// 				levels[id] = 0;
// 			}
// 		});

// 		while (queue.length) {
// 			const current = queue.shift();
// 			const currentLevel = levels[current];

// 			for (const child of graph[current]) {
// 				inDegree[child] -= 1;
// 				if (inDegree[child] === 0) {
// 					levels[child] = currentLevel + 1;
// 					queue.push(child);
// 				}
// 			}
// 		}

// 		return { levels, stepMap };
// 	}


// 	// Преобразуем шаги в узлы для ReactFlow
// 	const nodes = useMemo(() => {
// 		const { levels, stepMap } = buildNodeGraph(steps, scenario);

// 		// Группируем по уровням
// 		const levelGroups = {};
// 		let maxLevel = 0;

// 		Object.entries(levels).forEach(([id, level]) => {
// 			if (!levelGroups[level]) levelGroups[level] = [];
// 			levelGroups[level].push(id);
// 			if (level > maxLevel) maxLevel = level;
// 		});

// 		// Максимальное число узлов на одном уровне — для центрирования
// 		const maxNodesInLevel = Math.max(...Object.values(levelGroups).map(arr => arr.length));

// 		const horizontalSpacing = 220;
// 		const verticalSpacing = 100;
// 		const nodes = [];

// 		Object.entries(levelGroups).forEach(([levelStr, ids]) => {
// 			const level = parseInt(levelStr);

// 			// Реверсируем уровни (X от максимума к 0)
// 			const x = (maxLevel - level) * horizontalSpacing;

// 			// Центрирование по вертикали для параллельных узлов
// 			const nodesInLevel = ids.length;
// 			const offsetY = ((maxNodesInLevel - nodesInLevel) * verticalSpacing) / 2;

// 			ids.forEach((id, index) => {
// 				const step = stepMap[id];
// 				nodes.push({
// 					id: id.toString(),
// 					data: {
// 						label: (
// 							<div
// 								onMouseEnter={e => {
// 									const rect = e.currentTarget.getBoundingClientRect();
// 									setTooltip({
// 										visible: true,
// 										x: rect.right + 10,  // позиция справа от узла
// 										y: rect.top,
// 										text: step.executorLogin || 'Ответственный не назначен',
// 									});
// 								}}
// 								onMouseLeave={() => setTooltip(prev => ({ ...prev, visible: false }))}
// 							>
// 								<div>
// 									<div className={styles.card}>
// 										<strong>{step.StepName}</strong>
// 										<small>
// 											{step.state_production === null
// 												? 'в ожидании'
// 												: step.state_production === false
// 													? 'в работе'
// 													: step.state_production === true
// 														? 'готово'
// 														: '—'}
// 										</small>
// 										{step.executorLogin && <div className={styles.executor}>Ответственный: {step.executorLogin}</div>}
// 									</div>
// 								</div>
// 							</div>
// 						),
// 					},
// 					position: {
// 						x,
// 						y: offsetY + index * verticalSpacing,
// 					},
// 					sourcePosition: 'right',
// 					targetPosition: 'left',
// 					style: {
// 						padding: 10,
// 						border: '0px solid #333',
// 						borderRadius: 5,
// 						background:
// 							step.state_production === null
// 								? 'linear-gradient(135deg, white, gray)'
// 								: step.state_production === false
// 									? 'linear-gradient(135deg, white, #DC143C, white)'
// 									: 'green',
// 						color:
// 							step.state_production === null
// 								? 'gray'
// 								: step.state_production === false
// 									? 'black'
// 									: 'black',
// 						textStroke:
// 							step.state_production === null
// 								? '1px white'
// 								: step.state_production === false
// 									? '0px gray'
// 									: '0px gray',
// 					},
// 				});
// 			});
// 		});

// 		return nodes;
// 	}, [steps, scenario]);



// 	// Преобразуем scenario в рёбра
// 	const edges = useMemo(() => {
// 		return scenario.map(({ target_parent, target_child }) => ({
// 			id: `e${target_child}-${target_parent}`,
// 			source: target_child.toString(), // теперь source — потомок
// 			target: target_parent.toString(), // target — родитель
// 			markerEnd: { type: MarkerType.Arrow },
// 			type: 'smoothstep',
// 			animated: true,
// 			style: { stroke: '#555' },
// 		}));
// 	}, [scenario]);


// 	return (
// 		<div className={styles.WindowBase}>
// 			<nav className={styles.listProd}>
// 				<div className={styles.listUp}>
// 					<h3>Продукты</h3>

// 					{/* Меню фильтра */}
// 					<div className={styles.menuFilter}>
// 						<button
// 							className={`${filter === 'all' ? styles.buttonActive : ''}`}
// 							onClick={() => setFilter('all')}
// 						>
// 							Все
// 						</button>
// 						<button
// 							className={`${filter === 'inProduction' ? styles.buttonActive : ''}`}
// 							onClick={() => setFilter('inProduction')}
// 						>
// 							В производстве
// 						</button>
// 						<button
// 							className={`${filter === 'done' ? styles.buttonActive : ''}`}
// 							onClick={() => setFilter('done')}
// 						>
// 							Готовые
// 						</button>
// 					</div>
// 				</div>

// 				{/* Список продуктов */}
// 				<div className={styles.list}>
// 					{filteredProducts.length === 0 && <p>Нет продуктов</p>}
// 					{filteredProducts.map(product => (
// 						<button
// 							key={product.id}
// 							onClick={() => setSelectedProductId(product.id)}
// 						>
// 							{product.label}
// 						</button>
// 					))}
// 				</div>
// 				<div className={styles.contextInfo}>
// 					<h4>Количество</h4>
// 					<p>{filteredProducts.length}</p>
// 				</div>
// 			</nav>

// 			<div style={{ flexGrow: 1, position: 'relative', height: '100%' }}>
// 				{selectedProductId === null ? (
// 					<p
// 						className={styles.loadFlow}
// 					>
// 						Выберите продукт для отображения
// 					</p>
// 				) : (
// 					<>
// 						{selectedProduct && (
// 							<div
// 								className={styles.labelFlow}
// 							>
// 								Изделие: <span >{selectedProduct.label}</span>
// 							</div>
// 						)}
// 						<ReactFlow
// 							nodes={nodes}
// 							edges={edges}
// 							fitView
// 							fitViewOptions={{ padding: 0.1 }}
// 							nodesDraggable={false}
// 							nodesConnectable={false}
// 							elementsSelectable={false}
// 						>
// 							<Background />
// 							<Controls />
// 							<MiniMap />
// 						</ReactFlow>
// 					</>
// 				)}
// 				{hoverInfo && (
// 					<div className={styles.bottomTooltip}>
// 						<strong>{hoverInfo.step.StepName}</strong> (ID: {hoverInfo.step.StepId})
// 						<br />
// 						Состояние:{' '}
// 					</div>
// 				)}
// 			</div>
// 		</div>
// 	);

// }

function CustomNode({ data }) {
	const nodeRef = useRef();

	useEffect(() => {
		if (!nodeRef.current) return;
		const el = nodeRef.current;

		const handleMouseEnter = () => {
			if (data.onHover) {
				data.onHover(el);
			}
		};
		const handleMouseLeave = () => {
			if (data.onLeave) {
				data.onLeave();
			}
		};

		el.addEventListener('mouseenter', handleMouseEnter);
		el.addEventListener('mouseleave', handleMouseLeave);

		return () => {
			el.removeEventListener('mouseenter', handleMouseEnter);
			el.removeEventListener('mouseleave', handleMouseLeave);
		};
	}, [data]);

	return (
		<div ref={nodeRef} className={styles.card}>
			<strong>{data.StepName}</strong>
			<small>{data.state}</small>
		</div>
	);
}

export default function ProductsGraph() {
	const [products, setProducts] = useState([]);
	const [selectedProductId, setSelectedProductId] = useState(null);
	const [steps, setSteps] = useState([]);
	const [scenario, setScenario] = useState([]);
	const [filter, setFilter] = useState('all');

	const [tooltip, setTooltip] = useState({ visible: false, x: 0, y: 0, text: '' });
	const tooltipRef = useRef(null);

	const nodeTypes = useMemo(() => ({ custom: CustomNode }), []);

	useEffect(() => {
		fetch('/api/products')
			.then(res => res.json())
			.then(data => setProducts(data))
			.catch(console.error);
	}, []);

	useEffect(() => {
		if (!selectedProductId) return;

		fetch(`/api/products/${selectedProductId}`)
			.then(res => res.json())
			.then(data => {
				setSteps(data.steps || []);
				setScenario(data.scenario || []);
			})
			.catch(console.error);
	}, [selectedProductId]);

	useEffect(() => {
		if (!tooltipRef.current) return;

		if (tooltip.visible) {
			gsap.to(tooltipRef.current, {
				opacity: 1,
				visibility: 'visible',
				duration: 0.2,
				ease: 'power1.out',
			});
		} else {
			gsap.to(tooltipRef.current, {
				opacity: 0,
				visibility: 'hidden',
				duration: 0.2,
				ease: 'power1.out',
			});
		}
	}, [tooltip.visible]);

	const selectedProduct = useMemo(
		() => products.find(p => p.id === selectedProductId),
		[products, selectedProductId]
	);

	const filteredProducts = Array.isArray(products)
		? products.filter(product => {
			if (filter === 'all') return true;
			if (filter === 'inProduction') return product.state_product === false;
			if (filter === 'done') return product.state_product === true;
			return true;
		})
		: [];

	function buildNodeGraph(steps, scenario) {
		const graph = {};
		const inDegree = {};
		const stepMap = {};

		steps.forEach(step => {
			stepMap[step.StepId] = step;
			inDegree[step.StepId] = 0;
			graph[step.StepId] = [];
		});

		scenario.forEach(({ target_parent, target_child }) => {
			graph[target_parent]?.push(target_child);
			inDegree[target_child] = (inDegree[target_child] || 0) + 1;
		});

		const levels = {};
		const queue = [];

		Object.keys(inDegree).forEach(id => {
			if (inDegree[id] === 0) {
				queue.push(+id);
				levels[id] = 0;
			}
		});

		while (queue.length) {
			const current = queue.shift();
			const currentLevel = levels[current];

			for (const child of graph[current]) {
				inDegree[child] -= 1;
				if (inDegree[child] === 0) {
					levels[child] = currentLevel + 1;
					queue.push(child);
				}
			}
		}

		return { levels, stepMap };
	}

	const nodes = useMemo(() => {
		const { levels, stepMap } = buildNodeGraph(steps, scenario);
		const levelGroups = {};
		let maxLevel = 0;

		Object.entries(levels).forEach(([id, level]) => {
			if (!levelGroups[level]) levelGroups[level] = [];
			levelGroups[level].push(id);
			if (level > maxLevel) maxLevel = level;
		});

		const maxNodesInLevel = Math.max(...Object.values(levelGroups).map(arr => arr.length));
		const horizontalSpacing = 220;
		const verticalSpacing = 100;
		const nodes = [];

		Object.entries(levelGroups).forEach(([levelStr, ids]) => {
			const level = parseInt(levelStr);
			const x = (maxLevel - level) * horizontalSpacing;
			const nodesInLevel = ids.length;
			const offsetY = ((maxNodesInLevel - nodesInLevel) * verticalSpacing) / 2;

			ids.forEach((id, index) => {
				const step = stepMap[id];
				nodes.push({
					id: id.toString(),
					data: {
						label: (
							<div
								onMouseEnter={e => {
									const rect = e.currentTarget.getBoundingClientRect();
									setTooltip({
										visible: true,
										x: rect.right + 10,
										y: rect.top,
										text: step.executorLogin || 'Ответственный не назначен',
									});
								}}
								onMouseLeave={() =>
									setTooltip(prev => ({ ...prev, visible: false }))
								}
							>
								<div className={styles.card}>
									<strong>{step.StepName}</strong>
									<small>
										{step.state_production === null
											? 'в ожидании'
											: step.state_production === false
												? 'в работе'
												: step.state_production === true
													? 'готово'
													: '—'}
									</small>
								</div>
							</div>
						),
					},
					position: {
						x,
						y: offsetY + index * verticalSpacing,
					},
					sourcePosition: 'right',
					targetPosition: 'left',
					style: {
						padding: 10,
						borderRadius: 5,
						background:
							step.state_production === null
								? 'linear-gradient(135deg, white, gray)'
								: step.state_production === false
									? 'linear-gradient(135deg, white, #DC143C, white)'
									: 'green',
						color: 'black',
					},
				});
			});
		});

		return nodes;
	}, [steps, scenario]);

	const edges = useMemo(() => {
		return scenario.map(({ target_parent, target_child }) => ({
			id: `e${target_child}-${target_parent}`,
			source: target_child.toString(),
			target: target_parent.toString(),
			markerEnd: { type: MarkerType.Arrow },
			type: 'smoothstep',
			animated: true,
			style: { stroke: '#555' },
		}));
	}, [scenario]);

	return (
		<div className={styles.WindowBase}>
			<nav className={styles.listProd}>
				<div className={styles.listUp}>
					<h3>Продукты</h3>
					<div className={styles.menuFilter}>
						<button
							className={`${filter === 'all' ? styles.buttonActive : ''}`}
							onClick={() => setFilter('all')}
						>
							Все
						</button>
						<button
							className={`${filter === 'inProduction' ? styles.buttonActive : ''}`}
							onClick={() => setFilter('inProduction')}
						>
							В производстве
						</button>
						<button
							className={`${filter === 'done' ? styles.buttonActive : ''}`}
							onClick={() => setFilter('done')}
						>
							Готовые
						</button>
					</div>
				</div>

				<div className={styles.list}>
					{filteredProducts.length === 0 && <p>Нет продуктов</p>}
					{filteredProducts.map(product => (
						<button key={product.id} onClick={() => setSelectedProductId(product.id)}>
							{product.label}
						</button>
					))}
				</div>
				<div className={styles.contextInfo}>
					<h4>Количество</h4>
					<p>{filteredProducts.length}</p>
				</div>
			</nav>

			<div style={{ flexGrow: 1, position: 'relative', height: '100%' }}>
				{selectedProductId === null ? (
					<p className={styles.loadFlow}>Выберите продукт для отображения</p>
				) : (
					<>
						{selectedProduct && (
							<div className={styles.labelFlow}>
								Изделие: <span>{selectedProduct.label}</span>
							</div>
						)}
						<ReactFlow
							nodes={nodes}
							edges={edges}
							fitView
							fitViewOptions={{ padding: 0.1 }}
							nodesDraggable={false}
							nodesConnectable={false}
							elementsSelectable={false}
						>
							<Background />
							<Controls />
							<MiniMap />
						</ReactFlow>
					</>
				)}

				{/* Tooltip элемент */}
				<div
					ref={tooltipRef}
					className={styles.tooltip}
					style={{
						position: 'fixed',
						top: tooltip.y,
						left: tooltip.x,
						pointerEvents: 'none',
						opacity: 0,
						visibility: 'hidden',
					}}
				>
					{tooltip.text}
				</div>
			</div>
		</div>
	);
}


function FlipNode({ data, id }) {
	const cardRef = useRef(null);
	const [flipped, setFlipped] = useState(false);

	const handleMouseEnter = () => {
		if (!flipped) {
			gsap.to(cardRef.current, {
				rotateY: 180,
				duration: 0.6,
				ease: 'power2.inOut',
			});
			setFlipped(true);
		}
	};

	const handleMouseLeave = () => {
		if (flipped) {
			gsap.to(cardRef.current, {
				rotateY: 0,
				duration: 0.6,
				ease: 'power2.inOut',
			});
			setFlipped(false);
		}
	};

	return (
		<div className={styles.nodeContainer}>
			<div
				className={styles.card}
				ref={cardRef}
				onMouseEnter={handleMouseEnter}
				onMouseLeave={handleMouseLeave}
			>
				<div className={`${styles.side} ${styles.front}`}>
					<strong>{data.step.StepName}</strong>
					<br />
					<p>{data.step.StepName}</p>
					<br />
					<small>
						Состояние: {
							data.step.state_production === null ? 'в ожидании' :
								data.step.state_production === false ? 'в работе' :
									data.step.state_production === true ? 'готово' :
										'—'
						}
					</small>
				</div>
				<div className={`${styles.side} ${styles.back}`}>
					<strong>Доп. информация</strong>
					<p>ID: {id}</p>
					<p>Продолжительность: {data.step.Duration ?? '—'}</p>
				</div>
			</div>

			{/* Обязательные ручки */}
			<Handle type="target" position={Position.Left} />
			<Handle type="source" position={Position.Right} />
		</div>
	);
}


