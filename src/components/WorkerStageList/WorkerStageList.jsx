'use client';

import { useEffect, useState } from 'react';
import { useUser } from '@/app/context/UserContext';

export default function WorkerStageList() {
    const { user } = useUser();
    const [items, setItems] = useState([]);

    useEffect(() => {
      if (!user) return;
      fetch(`/api/worker-steps?executor=${user.roles[0]}`)
        .then(res => res.json())
        .then(setItems);
    }, [user]);

    const handleComplete = async (productId, stepId) => {
      await fetch(`/api/worker-steps`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId, stepId }),
      });
      setItems(prev => prev.filter(i => !(i.Product_id === productId && i.Step_id === stepId)));
    };

    if (!user) return <p>Нет доступа</p>;

    return (
        <div>
            <h2>Мои текущие этапы</h2>
            {items.length === 0 && <p>Нет текущих задач</p>}
            <ul>
              {items.map(({ Product_id, Step_id, name }) => (
                <li key={`${Product_id}-${Step_id}`}>
                    <b>Изделие:</b> {Product_id} | <b>Этап:</b> {name}
                    <button onClick={() => handleComplete(Product_id, Step_id)}>Завершить</button>
                </li>
              ))}
            </ul>
        </div>
    );
}