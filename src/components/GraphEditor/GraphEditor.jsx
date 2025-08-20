

'use client'

import React, { useEffect, useState, useCallback, useRef, useMemo } from 'react';
import ReactFlow, {
	ReactFlowProvider,
	addEdge,
	Background,
	Controls,
	MiniMap,
	useNodesState,
	useEdgesState,
	useReactFlow,
	Handle,
	EdgeLabelRenderer,
	getBezierPath
} from 'reactflow';
import 'reactflow/dist/style.css';
import styles from './ScenarioGraphEditor.module.scss';
import CircleLoader from '../Preloader/circleLoader';
import Load from '../Preloader/load';


import Select, { components } from 'react-select';
import { X } from 'lucide-react';

const ScenarioOption = (props) => {
	const { data, onDelete } = props;
	return (
		<components.Option {...props}>
			<div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
				<span>{data.label}</span>
				<X
					size={16}
					style={{ cursor: 'pointer' }}
					onClick={(e) => {
						e.stopPropagation();
						onDelete(data.value);
					}}
				/>
			</div>
		</components.Option>
	);
};





const apiBase = '/api/scenario';


function EditEdgeModal({ initialValue, onSave, onCancel }) {
	const [value, setValue] = useState(initialValue.toString());

	useEffect(() => {
		setValue(initialValue.toString());
	}, [initialValue]);

	const handleChange = (e) => {
		const val = e.target.value;
		if (/^\d*$/.test(val)) setValue(val);
	};

	const handleSave = () => {
		onSave(value === '' ? 0 : parseInt(value, 10));
	};

	return (
		<div style={{
			position: 'fixed',
			top: '30%',
			left: '50%',
			transform: 'translate(-50%, -30%)',
			backgroundColor: 'white',
			border: '1px solid #ccc',
			borderRadius: 8,
			padding: 20,
			zIndex: 10000,
			boxShadow: '0 4px 10px rgba(0,0,0,0.25)'
		}}>

			<h3>Редактировать subsequence</h3>
			<input
				type="text"
				value={value}
				onChange={handleChange}
				style={{ width: 100, fontSize: 16, padding: 4, marginBottom: 10 }}
				autoFocus
			/>
			<div>
				<button onClick={handleSave} style={{ marginRight: 10 }}>Сохранить</button>
				<button onClick={onCancel}>Отмена</button>
			</div>
		</div>
	);
}


const EditableEdge = React.memo(({
	id,
	sourceX, sourceY, targetX, targetY,
	sourcePosition, targetPosition,
	data,
	selected,
	style,
	markerEnd,
	onSubsequenceChange,
}) => {
	const [edgePath, labelX, labelY] = getBezierPath({
		sourceX, sourceY, sourcePosition,
		targetX, targetY, targetPosition,
	});

	const [modalOpen, setModalOpen] = useState(false);
	const [inputValue, setInputValue] = useState(data?.subsequence ?? 0);

	useEffect(() => {
		setInputValue(data?.subsequence ?? 0);
	}, [data?.subsequence]);

	const openModal = useCallback(() => setModalOpen(true), []);
	const closeModal = useCallback(() => setModalOpen(false), []);

	const handleSave = useCallback((newValue) => {
		if (newValue !== data?.subsequence) {
			onSubsequenceChange(id, newValue);
		}
		closeModal();
	}, [data?.subsequence, id, onSubsequenceChange, closeModal]);

	return (
		<>
			<path
				id={id}
				style={{ ...style, pointerEvents: 'none', zIndex: 0 }}
				className={`react-flow__edge-path ${selected ? 'react-flow__edge-path-selected' : ''}`}
				d={edgePath}
				markerEnd={markerEnd}
				onPointerDown={e => e.stopPropagation()}
			/>
			<EdgeLabelRenderer>
				<div
					style={{
						position: 'absolute',
						transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
						background: selected ? '#eee' : 'white',
						padding: '2px 6px',
						borderRadius: 3,
						fontSize: 12,
						pointerEvents: 'auto',
						userSelect: 'text',
						display: 'flex',
						alignItems: 'center',
						gap: 6,
						display: 'flex',
						flexDirection: 'column'
					}}
					onPointerDown={e => e.stopPropagation()}
					onClick={e => e.stopPropagation()}
				>
					{/* <span>Шаг: {inputValue}</span> */}
					<span>Шаг</span>
					<input
						type="text"
						className={styles.inputEdge}
						value={inputValue}
						onChange={(e) => {
							const val = e.target.value;
							setInputValue(val);
							const parsed = val === '' ? 0 : parseInt(val, 10);
							if (!isNaN(parsed)) {
								onSubsequenceChange(id, parsed);
							}
						}}
						style={{ fontSize: 12, padding: '2px 4px' }}
					/>
				</div>
			</EdgeLabelRenderer>

			{modalOpen && (
				<EditEdgeModal
					initialValue={inputValue}
					onSave={handleSave}
					onCancel={closeModal}
				/>
			)}
		</>
	);
});



const getDeadlineValue = (d) => {
	if (typeof d === 'string' || typeof d === 'number') return d;
	if (d && typeof d === 'object' && 'days' in d) return d.days.toString();
	return '';
};



const NodeEditable = React.memo((props) => {
	const { data, id, onChange, deadlines: propDeadlines } = props;

	const [name, setName] = useState(data.name || '');
	const [deadlines, setDeadlines] = useState(getDeadlineValue(propDeadlines) || getDeadlineValue(data.deadlines));
	const [responsible, setResponsible] = useState(data.responsible || '');
	const [responsibleId, setResponsibleId] = useState(data.executor_id);

	const roles = data.roles || [];

	useEffect(() => {
		setName(data.name || '');
		setDeadlines(getDeadlineValue(propDeadlines) || getDeadlineValue(data.deadlines));
		setResponsible(data.responsible || '');
		setResponsibleId(data.executor_id);
	}, [data.name, data.deadlines, data.responsible, data.executor_id, propDeadlines]);

	const onFieldChange = useCallback((field, value) => {
		console.log('onFieldChange', field, value);
		if (field === 'deadlines' && value !== '' && !/^\d*$/.test(value)) return;

		if (field === 'name') setName(value);
		if (field === 'deadlines') setDeadlines(value);
		if (field === 'responsible') {
			setResponsibleId(value);
			const selectedRole = roles.find(r => r.id_roles.toString() === value);
			setResponsible(selectedRole?.name || '');
		}

		onChange(id, {
			name: field === 'name' ? value : name,
			deadlines: field === 'deadlines' ? value : deadlines,
			executor_id: field === 'responsible' ? Number(value) : Number(responsibleId),
			roles,
		});
	}, [id, name, deadlines, responsibleId, onChange, roles]);

	return (
		<div
			className={styles.node}
			style={{
				padding: 10,
				border: '1px solid #ccc',
				borderRadius: 4,
				background: '#fff',
				minWidth: 180,
			}}
		>
			<Handle type="target" position="right" />

			<div>
				<input
					value={name}
					onChange={(e) => onFieldChange('name', e.target.value)}
					placeholder="Имя"
					style={{ width: '100%', marginBottom: 4 }}
				/>
			</div>

			<div>
				<input
					value={deadlines}
					onChange={(e) => onFieldChange('deadlines', e.target.value)}
					placeholder="Сроки (дни)"
					style={{ width: '100%', marginBottom: 4 }}
				/>
			</div>

			<div>
				<select
					value={responsibleId || ''}
					onChange={(e) => onFieldChange('responsible', e.target.value)}
					style={{ width: '100%' }}
				>
					<option value="">{responsible || 'Выберите роль'}</option>
					{roles.map((r) => (
						<option key={`role-${r.id_roles}`} value={r.id_roles}>
							{r.name}
						</option>
					))}
				</select>
			</div>

			<Handle type="source" position="left" />
		</div>
	);
});



function ScenarioGraphEditor() {
	// === состояния ===
	const [routerScenarios, setRouterScenarios] = useState([]);
	const [selectedScenario, setSelectedScenario] = useState(null);

	const [availableSteps, setAvailableSteps] = useState([]);
	const [originalData, setOriginalData] = useState({ nodes: [], edges: [] });
	const [roles, setRoles] = useState([]);

	const [nodes, setNodes, onNodesChange] = useNodesState([]);
	const [edges, setEdges, onEdgesChange] = useEdgesState([]);
	const { setViewport } = useReactFlow();
	const reactFlowInstance = useReactFlow();

	const [newNodeName, setNewNodeName] = useState('');
	const [newNodeDeadline, setNewNodeDeadline] = useState('');
	const [newNodeResponsible, setNewNodeResponsible] = useState('');
	const [modalOpen, setModalOpen] = useState(false);

	// Для контекстного меню и редактирования subsequence
	const [contextMenu, setContextMenu] = useState({ visible: false, x: 0, y: 0, edgeId: null });
	const [editingEdgeId, setEditingEdgeId] = useState(null);
	const [tempSubsequence, setTempSubsequence] = useState('');


	const [draggingNodeId, setDraggingNodeId] = useState(null);
	const dragStartPos = React.useRef({ x: 0, y: 0 });
	const nodeStartPos = React.useRef({ x: 0, y: 0 });

	const dragOffset = React.useRef({ x: 0, y: 0 });

	const [saveSuccess, setSaveSuccess] = useState(false);

	// Функция начала перетаскивания
	const onNodeMouseDown = useCallback((event, nodeId) => {
		if (!event.shiftKey || event.button !== 0) return; // только Shift + ЛКМ

		event.preventDefault();
		event.stopPropagation();

		setDraggingNodeId(nodeId);

		// dragStartPos.current = { x: event.clientX, y: event.clientY };

		const flowPoint = reactFlowInstance.project({
			x: event.clientX,
			y: event.clientY,
		});
		dragStartPos.current = flowPoint;

		const node = nodes.find(n => n.id === nodeId);
		nodeStartPos.current = node?.position || { x: 0, y: 0 };

		// Рассчитываем смещение курсора внутри узла


		const nodeElement = document.querySelector(`[data-id="${nodeId}"]`);
		if (nodeElement) {
			const rect = nodeElement.getBoundingClientRect();

			const offsetClient = {
				x: event.clientX - rect.left,
				y: event.clientY - rect.top,
			};

			// Переводим offset в canvas координаты
			const offsetCanvas = reactFlowInstance.project({
				x: rect.left + offsetClient.x,
				y: rect.top + offsetClient.y,
			});

			const rectOriginCanvas = reactFlowInstance.project({
				x: rect.left,
				y: rect.top,
			});

			dragOffset.current = {
				x: offsetCanvas.x - rectOriginCanvas.x,
				y: offsetCanvas.y - rectOriginCanvas.y,
			};
		} else {
			dragOffset.current = { x: 0, y: 0 };
		}
	}, [setNodes]);

	// Обработчик движения мыши
	const onMouseMove = (event) => {
		if (!draggingNodeId) return;

		event.preventDefault();

		const mousePoint = reactFlowInstance.project({
			x: event.clientX,
			y: event.clientY,
		});

		setNodes((nodes) =>
			nodes.map((node) =>
				node.id === draggingNodeId
					? {
						...node,
						position: {
							x: mousePoint.x - dragOffset.current.x,
							y: mousePoint.y - dragOffset.current.y,
						},
					}
					: node
			)
		);

	};

	// Обработчик отпускания мыши — завершение drag
	const onMouseUp = (event) => {
		if (draggingNodeId) {
			setDraggingNodeId(null);
		}
	};

	// Навесим обработчики на window
	React.useEffect(() => {
		window.addEventListener('mousemove', onMouseMove);
		window.addEventListener('mouseup', onMouseUp);

		return () => {
			window.removeEventListener('mousemove', onMouseMove);
			window.removeEventListener('mouseup', onMouseUp);
		};
	}, [draggingNodeId, nodes]);



	useEffect(() => {
		fetch('/api/scenario')
			.then(res => res.json())
			.then(setRouterScenarios);
	}, []);

	useEffect(() => {
		fetch('/api/stages')
			.then(res => res.json())
			.then(setAvailableSteps);
	}, []);

	useEffect(() => {
		fetch('/api/roles')
			.then(res => res.json())
			.then(setRoles);
	}, []);


	useEffect(() => {
		const flowWrapper = document.querySelector('.react-flow');

		let isCtrlDragging = false;
		let lastPos = { x: 0, y: 0 };

		function onMouseDown(e) {
			if (e.button === 0 && e.ctrlKey) {
				isCtrlDragging = true;
				lastPos = { x: e.clientX, y: e.clientY };
				e.preventDefault();
			}
		}

		function onMouseMove(e) {
			if (isCtrlDragging) {
				const dx = e.clientX - lastPos.x;
				const dy = e.clientY - lastPos.y;

				const { x, y, zoom } = reactFlowInstance.getViewport();
				reactFlowInstance.setViewport({ x: x + dx, y: y + dy, zoom });

				lastPos = { x: e.clientX, y: e.clientY };
			}
		}

		function onMouseUp() {
			isCtrlDragging = false;
		}

		flowWrapper?.addEventListener('mousedown', onMouseDown);
		window.addEventListener('mousemove', onMouseMove);
		window.addEventListener('mouseup', onMouseUp);

		return () => {
			flowWrapper?.removeEventListener('mousedown', onMouseDown);
			window.removeEventListener('mousemove', onMouseMove);
			window.removeEventListener('mouseup', onMouseUp);
		};
	}, [reactFlowInstance]);

	// calculateNodeLevels без изменений
	function calculateNodeLevels(edges, nodes) {
		const levels = new Map();
		const graph = new Map();
		const inDegree = new Map();

		for (const node of nodes) {
			graph.set(node.id.toString(), []);
			inDegree.set(node.id.toString(), 0);
		}

		for (const edge of edges) {
			const source = edge.target_parent.toString();
			const target = edge.target_child.toString();
			graph.get(source)?.push(target);
			inDegree.set(target, (inDegree.get(target) || 0) + 1);
		}

		const queue = [];
		for (const [id, degree] of inDegree.entries()) {
			if (degree === 0) {
				queue.push(id);
				levels.set(id, 0);
			}
		}

		while (queue.length > 0) {
			const current = queue.shift();
			const currentLevel = levels.get(current);

			for (const neighbor of graph.get(current) || []) {
				inDegree.set(neighbor, inDegree.get(neighbor) - 1);
				if (inDegree.get(neighbor) === 0) {
					levels.set(neighbor, currentLevel + 1);
					queue.push(neighbor);
				}
			}
		}

		return levels;
	}

	// Обновляем subsequence у ребер


	useEffect(() => {
		if (!selectedScenario) return;

		fetch(`${apiBase}/${selectedScenario}`)
			.then(res => res.json())
			.then(data => {
				// // Сформировать роли из data.nodes

				// Уникальные ID узлов из рёбер
				const uniqueNodeIds = new Set();
				data.edges.forEach(e => {
					uniqueNodeIds.add(e.target_parent.toString());
					uniqueNodeIds.add(e.target_child.toString());
				});

				// Фильтруем этапы
				const scenarioNodes = data.nodes.filter(step =>
					uniqueNodeIds.has(step.id.toString())
				);

				// Рассчитываем уровни
				const levels = calculateNodeLevels(
					data.edges,
					scenarioNodes.map(s => ({ id: s.id.toString() }))
				);
				const maxLevel = Math.max(...levels.values());

				// Группируем по уровню
				const grouped = {};
				for (const node of scenarioNodes) {
					const level = levels.get(node.id.toString()) ?? 0;
					const reversedLevel = maxLevel - level;

					if (!grouped[reversedLevel]) grouped[reversedLevel] = [];
					grouped[reversedLevel].push(node);
				}

				// Построение узлов
				const stepX = 400;
				const stepY = 150;
				const maxNodesInColumn = Math.max(...Object.values(grouped).map(g => g.length));

				const nodeMap = [];

				Object.entries(grouped).forEach(([levelStr, nodesAtLevel]) => {
					const level = parseInt(levelStr);
					const offsetY = (maxNodesInColumn - nodesAtLevel.length) * stepY / 2;

					nodesAtLevel.forEach((node, j) => {
						const roleName = roles.find(r => r.id_roles === node.executor_id)?.name || '—';
						nodeMap.push({
							id: node.id.toString(),
							position: {
								x: level * stepX,
								y: offsetY + j * stepY
							},
							data: {
								label: `${node.name} (${roleName})`,
								name: node.name,
								deadlines: node.deadlines,
								responsible: roleName,          // <-- имя роли
								executor_id: node.executor_id,  // <-- id роли
								roles: roles
							},
							type: 'horizontal'
						});
					});
				});

				// Построение рёбер
				const edgeMap = data.edges.map(e => ({
					id: `${e.target_parent}->${e.target_child}`,
					source: e.target_parent.toString(),
					target: e.target_child.toString(),
					label: `subsequence: ${e.subsequence}`,
					data: { subsequence: e.subsequence }
				}));

				setNodes(nodeMap);
				setEdges(edgeMap);
				setOriginalData({ nodes: nodeMap, edges: edgeMap });
			});
	}, [selectedScenario, availableSteps]);

	useEffect(() => {
		async function loadData() {
			try {
				const [stagesRes, rolesRes] = await Promise.all([
					fetch('/api/stages'),
					fetch('/api/roles')
				]);

				const stagesData = await stagesRes.json();
				let rolesData = await rolesRes.json();

				// Фильтруем роли, убирая admin
				rolesData = rolesData.filter(role => role.name.toLowerCase() !== 'admin');

				// Создаем мапу id роли => имя роли
				const roleIdToName = new Map(rolesData.map(r => [r.id_roles, r.name]));

				// Нормализуем availableSteps, сразу подставляя role_name
				const normalizedSteps = stagesData.map(step => {
					const executorId = step.executor_id ?? step.Responsible;
					return {
						...step,
						executor_id: executorId,
						role_name: roleIdToName.get(executorId) || '—'
					};
				});

				setRoles(rolesData);
				setAvailableSteps(normalizedSteps);
			} catch (error) {
				console.error('Ошибка загрузки этапов и ролей:', error);
			}
		}

		loadData();
	}, []);


	const onEdgeSubsequenceChange = useCallback(
		(edgeId, newSubsequence) => {
			setEdges((eds) =>
				eds.map((e) =>
					e.id === edgeId
						? { ...e, data: { ...e.data, subsequence: newSubsequence }, label: `subsequence: ${newSubsequence}` }
						: e
				)
			);
		},
		[setEdges]
	);

	// Обновление данных узлов (name, deadlines, responsible)

	const onNodeDataChange = useCallback(
		(nodeId, newData) => {
			setNodes((nds) =>
				nds.map((n) => {
					if (n.id === nodeId) {
						// Приводим к числу
						const roleId = Number(newData.executor_id ?? n.data.executor_id ?? 0);
						const roleName = roles.find(r => r.id_roles === roleId)?.name || '—';

						const name = newData.name ?? n.data.name;
						const deadlines = newData.deadlines ?? n.data.deadlines;

						return {
							...n,
							data: {
								...n.data,
								name,
								deadlines,
								executor_id: roleId,
								responsible: roleName,
								role_name: roleName,
								label: `${name} (${roleName})`,
							},
						};
					}
					return n;
				})
			);
		},
		[roles]
	);

	// Компонент узла с кастомным onMouseDown

	const nodeTypes = useMemo(() => ({
		horizontal: (props) => (
			<div onMouseDown={(e) => onNodeMouseDown(e, props.id)}>
				{/* {console.log(props)} */}
				<NodeEditable
					{...props}
					onChange={onNodeDataChange}
					roles={roles}
					// deadlines={props.data?.deadlines}
					deadlines={props.deadlines}
				/>
			</div>
		)
	}), [onNodeMouseDown, onNodeDataChange, roles]);

	// edgeTypes с кастомным ребром
	const edgeTypes = useMemo(() => ({
		editable: (props) => <EditableEdge {...props} onSubsequenceChange={onEdgeSubsequenceChange} />
	}), [onEdgeSubsequenceChange]);

	const EditableEdgeWrapper = (props) => {
		return <EditableEdge {...props} onSubsequenceChange={onEdgeSubsequenceChange} />;
	};

	// Создание нового сценария
	const createNewScenario = async () => {
		const next = Math.max(...routerScenarios, 0) + 1;
		const apiRouter = `/api/scenario/${next}`;
		await fetch(apiRouter, {
			method: 'POST',
			body: JSON.stringify({ scenario: next }),
			headers: { 'Content-Type': 'application/json' },
		});
		setRouterScenarios([...routerScenarios, next]);
		setSelectedScenario(next);
	};

	// Добавление существующего узла
	const [selectedStepToAdd, setSelectedStepToAdd] = useState('');

	const addExistingNode = () => {
		if (!selectedStepToAdd) return;
		const step = availableSteps.find(s => s.ID === parseInt(selectedStepToAdd));
		if (!step) return;

		const exists = nodes.some(n => n.id === selectedStepToAdd.toString());
		if (exists) return;

		const roleName = roles.find(r => r.id_roles === step.Responsible)?.name || step.Responsible;

		const newNode = {
			id: selectedStepToAdd.toString(),
			position: { x: Math.random() * 500, y: Math.random() * 300 },
			data: {
				label: `${step.Name} (${roleName})`,
				name: step.Name,
				deadlines: step.Deadlines,
				responsible: step.Responsible,
			},
			type: 'horizontal',
		};

		setNodes(prev => [...prev, newNode]);
		setSelectedStepToAdd('');
	};

	const validateDeadline = function (step, value, name) {
		return /^\d+$/.test(value) && step !== '' && name !== ''
	}

	const createNewNode = () => {
		const trimmedName = newNodeName.trim();
		const trimmedResp = newNodeResponsible;

		if (!trimmedName || !validateDeadline(trimmedName, newNodeDeadline, trimmedResp)) return;

		const getRoleNameById = (id) => {
			const role = roles.find(r => r.id_roles === id);
			return role ? role.name : '';
		};

		const id = Date.now().toString();
		const newNode = {

			id,
			position: { x: Math.random() * 600, y: Math.random() * 400 },
			data: {
				label: `${trimmedName} (${getRoleNameById(trimmedResp) || '—'})`,
				name: trimmedName,
				deadlines: newNodeDeadline,
				responsible: trimmedResp,
			},
			type: 'horizontal'
		};
		setNodes(prev => [...prev, newNode]);
		setModalOpen(false);
		setNewNodeName('');
		setNewNodeDeadline('');
		setNewNodeResponsible('');
	};

	const saveChanges = async () => {
		const { nodes: oldNodes, edges: oldEdges } = originalData;

		const hasChanges =
			JSON.stringify(oldNodes) !== JSON.stringify(nodes) ||
			JSON.stringify(oldEdges) !== JSON.stringify(edges);

		if (!hasChanges) return;
		console.log(nodes)
		const payload = {
			nodes: nodes.map(n => ({
				id: parseInt(n.id),
				name: n.data.name,
				deadlines: n.data.deadlines,
				responsible: parseInt(n.data.executor_id)
			})),
			edges: edges.map(e => ({
				source: parseInt(e.source),
				target: parseInt(e.target),
				subsequence: parseInt(e.data?.subsequence || 0)
			}))
		};


		try {
			const res = await fetch(`${apiBase}/${selectedScenario}`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(payload)
			});

			if (res.ok) {
				setSaveSuccess(true);
				// Обновим оригинальные данные (чтобы не показывать повторно save)
				setOriginalData({ nodes, edges });
				setTimeout(() => setSaveSuccess(false), 3000); // Скрыть через 3 сек
			} else {
				// Можно добавить обработку ошибок
				alert('Ошибка при сохранении');
			}
		} catch (error) {
			alert('Ошибка сети при сохранении');
		}
	};

	const handleChange = (e) => {
		const selectedRoleId = parseInt(e.target.value); // id_roles — число
		setNewNodeResponsible(selectedRoleId);
	};

	// Функция обработчик контекстного меню на ребре
	const onContextMenuEdge = (edgeId, x, y) => {
		setContextMenu({ visible: true, x, y, edgeId });
		setEditingEdgeId(null);
	};

	// Закрыть меню по клику вне
	useEffect(() => {
		const handleClick = () => {
			if (contextMenu.visible) setContextMenu({ visible: false, x: 0, y: 0, edgeId: null });
		};
		window.addEventListener('click', handleClick);
		return () => window.removeEventListener('click', handleClick);
	}, [contextMenu.visible]);

	if (!Array.isArray(availableSteps) || !Array.isArray(roles) || !Array.isArray(routerScenarios)) {
		return <Load />;
	}



	const handleDeleteScenario = async (id) => {
		await fetch(`/api/scenario/${id}`, { method: 'DELETE' });
		setRouterScenarios(prev => prev.filter(s => s !== id));
		setSelectedScenario(parseInt(id))
	};


	// Меню и поле редактирования subsequence
	return (
		<div className={styles.editorGrid}>
			<div className={styles.editorTopbar}>
				<h1>Выбранный сценарий</h1>
				<p>{selectedScenario === null ? "не выбран" : selectedScenario}</p>
			</div>

			<div className={styles.editorTool}>
				<div className={styles.editorSidebar} style={{ display: 'flex', gap: '20px' }}>
					{/* <select
						value={selectedScenario || ''}
						onChange={e => setSelectedScenario(parseInt(e.target.value))}
					>
						<option value="" disabled>Выбрать сценарий</option>
						{routerScenarios.map(s => <option key={`scenario-${s}`} value={s}>{s}</option>)}
					</select> */}
					<Select
						options={routerScenarios.map(s => ({ value: s, label: s }))}
						components={{ Option: (props) => <ScenarioOption {...props} onDelete={handleDeleteScenario} /> }}
						value={routerScenarios
							.map(s => ({ value: s, label: s }))
							.find(option => option.value === selectedScenario) || null}
						onChange={(selectedOption) => {
							if (selectedOption) setSelectedScenario(selectedOption.value);
							else setSelectedScenario(null);
						}}
					/>
					<button onClick={createNewScenario}>Создать</button>
				</div>
				<div className={styles.editorSidebar}>
					<h4>Существующие этапы</h4>
					<div style={{ display: 'flex', gap: '20px' }}>
						<select
							value={selectedStepToAdd}
							onChange={e => setSelectedStepToAdd(e.target.value)}
						>
							<option value="">Выбрать этап</option>
							{availableSteps.map(s => (
								<option key={`step-${s.ID}`} value={s.ID}>{s.Name}</option>
							))}
						</select>
						<button onClick={addExistingNode}>Добавить</button>
					</div>

					<button onClick={() => setModalOpen(true)}>Создать этап</button>
					<button onClick={saveChanges}>Сохранить</button>
				</div>
			</div>

			<div className={styles.editorGraph} style={{ height: 600 }}>
				<ReactFlow
					nodes={nodes}
					edges={edges.map(e => ({ ...e, type: 'editable' }))}
					onNodesChange={onNodesChange}
					onEdgesChange={onEdgesChange}
					onConnect={params =>
						setEdges(eds => addEdge({ ...params, label: 'subsequence: 0', data: { subsequence: 0 }, type: 'editable' }, eds))
					}
					fitView
					nodeTypes={nodeTypes}
					edgeTypes={edgeTypes}
					panOnDrag={false}
					nodesDraggable={false} // Отключаем дефолтное перетаскивание
				>
					<Background />
					<Controls />
					<MiniMap />
				</ReactFlow>
			</div>

			{/* Контекстное меню */}
			{contextMenu.visible && (
				<div
					style={{
						position: 'fixed',
						top: contextMenu.y,
						left: contextMenu.x,
						backgroundColor: 'white',
						border: '1px solid #ccc',
						borderRadius: 4,
						boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
						zIndex: 1000,
						padding: '6px 10px',
						cursor: 'pointer',
						userSelect: 'none',
					}}
					onClick={() => {
						setEditingEdgeId(contextMenu.edgeId);
						setTempSubsequence(edges.find(e => e.id === contextMenu.edgeId)?.data?.subsequence?.toString() || '0');
						setContextMenu({ visible: false, x: 0, y: 0, edgeId: null });
					}}
					onContextMenu={e => e.preventDefault()}
				>
					Редактировать subsequence
				</div>
			)}

			{/* Инпут для редактирования subsequence */}
			{editingEdgeId && (
				<div
					style={{
						position: 'fixed',
						top: contextMenu.y,
						left: contextMenu.x,
						backgroundColor: 'white',
						border: '1px solid #ccc',
						borderRadius: 4,
						padding: 6,
						zIndex: 1001,
					}}
				>
					<input
						type="text"
						value={tempSubsequence}
						onChange={(e) => {
							if (/^\d*$/.test(e.target.value)) setTempSubsequence(e.target.value);
						}}
						onBlur={() => {
							if (tempSubsequence !== '') {
								onEdgeSubsequenceChange(editingEdgeId, parseInt(tempSubsequence));
							}
							setEditingEdgeId(null);
						}}
						onKeyDown={(e) => {
							if (e.key === 'Enter') {
								e.target.blur();
							} else if (e.key === 'Escape') {
								setEditingEdgeId(null);
							}
						}}
						autoFocus
						style={{ width: 50 }}
					/>
				</div>
			)}
			{saveSuccess && (
				<div style={{
					position: 'fixed',
					bottom: 20,
					right: 20,
					backgroundColor: 'green',
					color: 'white',
					padding: '10px 20px',
					borderRadius: 5,
					boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
					zIndex: 10000,
					fontWeight: 'bold',
				}}>
					Сохранено успешно!
				</div>
			)}
			{/* Модальное окно создания нового узла */}
			{modalOpen && (
				<div className={styles.modal}>
					<div className={styles.modalContent}>
						<h3>Создать новый этап</h3>
						<label>Название этапа</label>
						<input
							type="text"
							value={newNodeName}
							onChange={(e) => setNewNodeName(e.target.value)}
						/>
						<label>Сроки (целое число)</label>
						<input
							type="text"
							value={newNodeDeadline}
							onChange={(e) => {
								if (/^\d*$/.test(e.target.value)) setNewNodeDeadline(e.target.value);
							}}
						/>
						<label>Ответственный</label>
						<select value={newNodeResponsible} onChange={handleChange}>
							<option value="">Выбрать</option>
							{roles.map(r => (
								<option key={`role-${r.id_roles}`} value={r.id_roles}>
									{r.name}
								</option>
							))}
						</select>

						<div className={styles.modalButtons}>
							<button onClick={() => setModalOpen(false)}>Отмена</button>
							<button onClick={createNewNode}>Создать</button>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}

export default function ScenarioGraphEditorWrapper() {
	return (
		<ReactFlowProvider>
			<ScenarioGraphEditor />
		</ReactFlowProvider>
	);
}

