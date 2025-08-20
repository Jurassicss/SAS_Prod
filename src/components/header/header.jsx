'use client';
import { useUser } from '@/app/context/UserContext';
import styles from "./hader.module.scss"
import { useRouter, usePathname, useParams } from 'next/navigation';
import { useEffect } from 'react';


export function Header() {
	const { user, logout } = useUser();
	const pathname = usePathname();
	const router = useRouter();

	useEffect(() => {
		if (!user) return;

		const isQRPage = pathname.startsWith('/protect/qr/');
		const isAdmin = user.roles.includes('admin');

		if (!isAdmin && !isQRPage && pathname !== '/protect/state') {
			router.replace('/protect/state');
		}
	}, [user, pathname, router]);

	// Пока нет данных о пользователе — ничего не рендерим
	if (!user) return null;


	return (
		<>
			<header className={styles.Header}>
				<RenderHeaderByRole user={user} />
			</header>
			{user && (
				<div className={styles.userBlock}>
					<div><span>🙋‍♂️ </span>{user.username}</div>
					<button onClick={logout}>Выйти</button>
				</div>
			)}
		</>
	)
}



function RenderHeaderByRole({ user }) {
	const role = user.roles[0]; // Предполагаем, что роль одна (или важна только первая)

	switch (role) {
		case 'admin':
			return (
				<>
					<div>
						<a href="/protect/view">View</a>
						<a href="/protect/editor">Editor</a>
						<a href="/protect/state">State</a>
						<a href="/protect/qrgenerator">QR</a>
					</div>
					<a href="/protect/start"><h1>Start</h1></a>
				</>
			);

		case 'assembler':
			return <a href="/protect/state">State</a>;

		case 'painter':
			return <div className={styles.info}>Только маляру доступен этот блок</div>;

		default:
			return <a href="/protect/state">State</a>;
	}
}
