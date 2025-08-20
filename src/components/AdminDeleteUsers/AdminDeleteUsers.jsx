'use client';

import React, { useImperativeHandle, forwardRef, useState, useEffect } from 'react';
import styles from './AdminDeleteUsers.module.scss'
import CircleLoader from '../Preloader/circleLoader';
import Load from '../Preloader/load';

const AdminUsersDelete = forwardRef((props, ref) => {
	const [users, setUsers] = useState([]);
	const [loading, setLoading] = useState(true);
	const [message, setMessage] = useState('');

	// Загрузка пользователей
	const fetchUsers = async () => {
		try {
			const res = await fetch('/api/users');
			if (!res.ok) throw new Error('Ошибка загрузки пользователей');
			const data = await res.json();
			setUsers(data);
		} catch (e) {
			setMessage('Ошибка загрузки пользователей');
			console.error(e);
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchUsers();
	}, []);

	useImperativeHandle(ref, () => ({
		fetchUsers, // expose fetchUsers наружу
	}));
	// Удаление пользователя
	const deleteUser = async (id) => {
		if (!confirm('Удалить пользователя?')) return;

		try {
			const res = await fetch(`/api/users/${id}`, {
				method: 'DELETE',
			});
			if (!res.ok) {
				const errorData = await res.json();
				setMessage(errorData.error || 'Ошибка удаления');
				return;
			}

			setMessage('Пользователь удалён');
			// Обновляем список
			setUsers(users.filter(user => user.id !== id));
		} catch (e) {
			setMessage('Ошибка удаления пользователя');
			console.error(e);
		}
	};

	if (loading) return (
		<Load />
	);

	return (
		<details className={styles.base}>
			<summary>Список пользователей</summary>
			<div className={styles.base}>
				{message && <p className={styles.message}>{message}</p>}
				<ul className={styles.list}>
					{users.length === 0 && <li className={styles.emptyMessage}>Пользователи не найдены</li>}
					{users.map(user => (
						<li key={user.id} className={styles.listItem}>
							<span>{user.login}</span>
							<p>{user.role_name}</p>
							<button
								className={styles.deleteButton}
								onClick={() => deleteUser(user.id)}
							>
								Удалить
							</button>
						</li>
					))}
				</ul>
				<button className={styles.uodateButton} onClick={fetchUsers}>Обновить</button>
			</div>
		</details>
	);
})


export default AdminUsersDelete;