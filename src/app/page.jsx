'use client';
import { useUser } from '@/app/context/UserContext';
import { useRouter, usePathname, useParams } from 'next/navigation';
import { useEffect } from 'react';


import { redirect } from 'next/navigation';





export default function Home() {

	// const { user, logout } = useUser();
	// const pathname = usePathname();
	// const router = useRouter();

	// useEffect(() => {
	//     if (!user) return;

	//     const isQRPage = pathname.startsWith('/protect/qr/');
	//     const isAdmin = user.roles.includes('admin');

	//     if (!isAdmin && !isQRPage && pathname !== '/protect/state') {
	//       router.replace('/protect/state');
	//     }
	// }, [user, pathname, router]);

	//   // Пока нет данных о пользователе — ничего не рендерим
	// if (!user) return null;

	// const isAdmin = user.roles.includes('admin');

	redirect('/protect/view'); // или другой путь
}


