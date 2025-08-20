'use client';

import { useState, useEffect, useRef } from 'react';
import styles from "./AdminUserRoleForm.module.scss";
import AdminUserDelete from '../AdminDeleteUsers/AdminDeleteUsers';
import AdminDeleteRoles from '../AdminDeleteRoles/AdminDeleteRoles';


export default function AdminUserRoleForm() {
	// Роли для селекта
	const [roles, setRoles] = useState([]);
	const [roleName, setRoleName] = useState('');
	const [userData, setUserData] = useState({ login: '', password: '', roleId: '', id_telegram: '' });
	const [message, setMessage] = useState('');

	const adminUsersDeleteRef = useRef();

	// Загрузка ролей для селекта
	useEffect(() => {
		fetch('/api/roles')
			.then(res => res.json())
			.then(data => setRoles(data))
			.catch(console.error);
	}, []);

	// Создать роль
	const createRole = async (e) => {
		e.preventDefault();
		if (!roleName.trim()) {
			setMessage('Введите название роли');
			return;
		}

		try {
			const res = await fetch('/api/roles', {
				method: 'POST',
				headers: { 'Content-Type': 'text/plain' },
				body: roleName.trim(),
			});
			const data = await res.json();
			if (res.ok) {
				setRoles(prev => [...prev, data]);
				setRoleName('');
				setMessage('Роль создана');
			} else {
				setMessage(data.error || 'Ошибка при создании роли');
			}
		} catch {
			setMessage('Ошибка при создании роли');
		}
	};

	// Создать пользователя
	const createUser = async (e) => {
		e.preventDefault();
		if (!userData.login.trim() || !userData.password || !userData.roleId) {
			setMessage('Заполните все поля для пользователя');
			return;
		}

		try {
			const res = await fetch('/api/users', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(userData),
			});
			const data = await res.json();
			if (res.ok) {
				setMessage(`Пользователь ${data.login} создан`);
				setUserData({ login: '', password: '', roleId: '', id_telegram: '' });
				if (adminUsersDeleteRef.current) {
					adminUsersDeleteRef.current.fetchUsers();
				}
			} else {
				setMessage(data.error || 'Ошибка при создании пользователя');
			}
		} catch {
			setMessage('Ошибка при создании пользователя');
		}
	};

	return (
		<div className={styles.baseWindow}>

			<div className={styles.base}>
				<h2>Создать роль</h2>
				<form onSubmit={createRole}>
					<input
						type="text"
						placeholder="Название роли"
						value={roleName}
						onChange={e => setRoleName(e.target.value)}
					/>
					<button type="submit">Создать роль</button>
				</form>

				<h2>Создать пользователя</h2>
				<form onSubmit={createUser}>
					<div>
						<input
							type="text"
							placeholder="Логин"
							value={userData.login}
							onChange={e => setUserData({ ...userData, login: e.target.value })}
						/>
						<input
							type="password"
							placeholder="Пароль"
							value={userData.password}
							onChange={e => setUserData({ ...userData, password: e.target.value })}
						/>
						<input
							type="number"
							placeholder="id телеграмма"
							value={userData.id_telegram}
							onChange={e => setUserData({ ...userData, id_telegram: e.target.value })}
						/>
						<select
							value={userData.roleId}
							onChange={e => setUserData({ ...userData, roleId: e.target.value })}
						>
							<option value="">Выберите роль</option>
							{roles.map(r => (
								<option key={r.id_roles} value={r.id_roles}>{r.name}</option>
							))}
						</select>
					</div>
					<button type="submit">Создать пользователя</button>

				</form>


				{message && <p>{message}</p>}
			</div>
			{/* <AdminUserDelete  /> */}
			<AdminDeleteRoles ref={adminUsersDeleteRef} />
		</div>
	);
}
