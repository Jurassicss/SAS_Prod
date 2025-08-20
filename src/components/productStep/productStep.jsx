'use client'

import React, { useState, useEffect, useMemo } from 'react';
import ReactFlow, { Background, Controls, MiniMap, MarkerType } from 'reactflow';
import 'reactflow/dist/style.css';

export default function ScenarioGraph() {
    const [scenarios, setScenarios] = useState([]);
    const [scenarioId, setScenarioId] = useState(null);
    const [nodes, setNodes] = useState([]);
    const [edges, setEdges] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [creating, setCreating] = useState(false);

    // Загрузка списка сценариев
    useEffect(() => {
      fetch('/api/scenario')
        .then(res => res.json())
        .then(data => {
          setScenarios(data);
          if (data.length > 0) setScenarioId(data[0]);
        })
        .catch(console.error);
    }, []);

    // Загрузка графа при изменении выбранного сценария
    useEffect(() => {
        if (!scenarioId) return;

        setLoading(true);
        setError(null);

    fetch(`/api/scenario/${scenarioId}`)
      .then(res => {
        if (!res.ok) throw new Error(`Ошибка ${res.status}`);
        return res.json();
      })
      .then(data => {
        const nodesMapped = data.nodes.map(node => ({
          id: node.ID.toString(),
          data: { label: node.Name },
          position: { x: Math.random() * 600, y: Math.random() * 400 },
          style: {
            padding: 10,
            border: '1px solid #222',
            borderRadius: 5,
            backgroundColor: '#f0f0f0',
          },
          sourcePosition: 'right',
          targetPosition: 'left',
        }));

        const edgesMapped = data.edges.map(edge => ({
          id: `e${edge.target_parent}-${edge.target_child}`,
          source: edge.target_parent.toString(),
          target: edge.target_child.toString(),
          markerEnd: { type: MarkerType.Arrow },
          type: 'smoothstep',
          animated: true,
          style: { stroke: '#555' },
        }));

        setNodes(nodesMapped);
        setEdges(edgesMapped);
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [scenarioId]);

  // Создать новый сценарий
  async function createNewScenario() {
    setCreating(true);
    try {
      const res = await fetch('/api/scenario', { method: 'POST' });
      const data = await res.json();
      if (data.newScenarioId) {
        setScenarios(prev => [...prev, data.newScenarioId]);
        setScenarioId(data.newScenarioId);
      }
    } catch (e) {
      alert('Ошибка создания сценария');
    } finally {
      setCreating(false);
    }
  }

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: 10, background: '#eee', display: 'flex', gap: 10, alignItems: 'center' }}>
        <select
          value={scenarioId || ''}
          onChange={e => setScenarioId(e.target.value)}
          style={{ padding: 5, flexGrow: 1 }}
        >
          {scenarios.map(id => (
            <option key={id} value={id}>
              Сценарий {id}
            </option>
          ))}
        </select>
        <button onClick={createNewScenario} disabled={creating}>
          {creating ? 'Создаем...' : 'Создать новый'}
        </button>
      </div>

      <div style={{ flexGrow: 1 }}>
        {loading && <p>Загрузка...</p>}
        {error && <p style={{ color: 'red' }}>{error}</p>}
        {!loading && !error && scenarioId && (
          <ReactFlow
            nodes={nodes}
            edges={edges}
            fitView
            nodesDraggable
            nodesConnectable={false}
            elementsSelectable
          >
            <Background />
            <Controls />
            <MiniMap />
          </ReactFlow>
        )}
      </div>
    </div>
  );
}
