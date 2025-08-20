import React, { useState, useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import Load from '../Preloader/load';
import CircleLoader from '../Preloader/circleLoader';
import styles from './AdminDeleteRoles.module.scss'; // подставь свои стили

import gsap from 'gsap';



const SmoothDetails = ({ summary, children, isOpen, onToggle, className = '', id }) => {
	const contentRef = useRef(null);

	useEffect(() => {
		const content = contentRef.current;
		if (!content) return;

		if (isOpen) {
			content.style.display = 'block';
			const height = content.scrollHeight;

			gsap.fromTo(
				content,
				{ height: 0 },
				{
					height,
					duration: 0.5,
					ease: 'power2.out',
					onComplete: () => {
						content.style.height = 'auto';
					},
				}
			);
		} else {
			const height = content.scrollHeight;

			gsap.fromTo(
				content,
				{ height },
				{
					height: 0,
					duration: 0.5,
					ease: 'power2.in',
					onComplete: () => {
						content.style.display = 'none';
					},
				}
			);
		}
	}, [isOpen]);

	return (
		<div className={`${styles.base} ${className}`}>
			<button
				className={styles.summary}
				onClick={onToggle}
				aria-expanded={isOpen}
				aria-controls={id}
			>
				{summary}
			</button>
			<div
				id={id}
				className={styles.content}
				ref={contentRef}
				style={{ display: 'none', height: 0, overflow: 'hidden' }}
			>
				{children}
			</div>
		</div>
	);
};






const AdminUsersAndRolesDelete = forwardRef((props, ref) => {
	// Пользователи
	const [users, setUsers] = useState([]);
	const [usersLoading, setUsersLoading] = useState(true);
	const [usersMessage, setUsersMessage] = useState('');

	// Роли
	const [roles, setRoles] = useState([]);
	const [rolesLoading, setRolesLoading] = useState(true);
	const [rolesMessage, setRolesMessage] = useState('');

	const [openIndex, setOpenIndex] = useState(null);

	// Загрузка пользователей
	const fetchUsers = async () => {
		setUsersLoading(true);
		setUsersMessage('');
		try {
			const res = await fetch('/api/users');
			if (!res.ok) throw new Error('Ошибка загрузки пользователей');
			const data = await res.json();
			setUsers(data);
		} catch (e) {
			setUsersMessage('Ошибка загрузки пользователей');
			console.error(e);
		} finally {
			setUsersLoading(false);
		}
	};

	// Загрузка ролей
	const fetchRoles = async () => {
		setRolesLoading(true);
		setRolesMessage('');
		try {
			const res = await fetch('/api/roles');
			if (!res.ok) throw new Error('Ошибка загрузки ролей');
			const data = await res.json();
			setRoles(data);
		} catch (e) {
			setRolesMessage('Ошибка загрузки ролей');
			console.error(e);
		} finally {
			setRolesLoading(false);
		}
	};

	useEffect(() => {
		fetchUsers();
		fetchRoles();
	}, []);

	useImperativeHandle(ref, () => ({
		fetchUsers,
		fetchRoles,
	}));

	// Удаление пользователя
	const deleteUser = async (id) => {
		if (!confirm('Удалить пользователя?')) return;

		try {
			const res = await fetch(`/api/users/${id}`, { method: 'DELETE' });
			if (!res.ok) {
				const errorData = await res.json();
				setUsersMessage(errorData.error || 'Ошибка удаления пользователя');
				return;
			}
			setUsersMessage('Пользователь удалён');
			setUsers(users.filter(user => user.id !== id));
		} catch (e) {
			setUsersMessage('Ошибка удаления пользователя');
			console.error(e);
		}
	};

	// Удаление роли
	const deleteRole = async (id) => {
		if (!confirm('Удалить роль?')) return;

		try {
			const res = await fetch(`/api/roles/${id}`, { method: 'DELETE' });
			if (!res.ok) {
				const errorData = await res.json();
				setRolesMessage(errorData.error || 'Ошибка удаления роли');
				return;
			}
			setRolesMessage('Роль удалена');
			setRoles(roles.filter(role => role.id_roles !== id));
		} catch (e) {
			setRolesMessage('Ошибка удаления роли');
			console.error(e);
		}
	};

	return (
		<>
			<SmoothDetails summary="Список пользователей"
				id="users-content"
				isOpen={openIndex === 0}
				onToggle={() => setOpenIndex(openIndex === 0 ? null : 0)}
			>
				{/* <summary>Список пользователей</summary> */}
				<div className={styles.base}>
					{usersMessage && <p className={styles.message}>{usersMessage}</p>}
					{usersLoading ? (
						<Load />
					) : (
						<ul className={styles.list}>
							{users.length === 0 && <li className={styles.emptyMessage}>Пользователи не найдены</li>}
							{users.map(user => (
								<li key={user.id} className={styles.listItem}>
									<span>{user.login}</span>
									<p>{user.role_name}</p>
									<button className={styles.deleteButton} onClick={() => deleteUser(user.id)}>
										Удалить
									</button>
								</li>
							))}
						</ul>
					)}
					<button className={styles.uodateButton} onClick={fetchUsers}>Обновить</button>
				</div>
			</SmoothDetails>

			<SmoothDetails summary="Список ролей"
				id="roles-content"
				isOpen={openIndex === 1}
				onToggle={() => setOpenIndex(openIndex === 1 ? null : 1)}
			>
				{/* <summary>Список ролей</summary> */}
				<div className={styles.base}>
					{rolesMessage && <p className={styles.message}>{rolesMessage}</p>}
					{rolesLoading ? (
						<div className={styles.preloader}>
							<p>Загрузка ролей...</p>
							<CircleLoader />
						</div>
					) : (
						<ul className={styles.list}>
							{roles.length === 0 && <li className={styles.emptyMessage}>Роли не найдены</li>}
							{roles.map(role => (
								<li key={role.id_roles} className={styles.listItem}>
									<span>{role.name}</span>
									<button className={styles.deleteButton} onClick={() => deleteRole(role.id_roles)}>
										Удалить
									</button>
								</li>
							))}
						</ul>
					)}
					<button className={styles.uodateButton} onClick={fetchRoles}>Обновить</button>
				</div>
			</SmoothDetails>
		</>
	);
});

export default AdminUsersAndRolesDelete;
