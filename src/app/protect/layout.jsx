'use client';

import { useEffect } from 'react';
import { useRouter, usePathname  } from 'next/navigation';
import { useUser } from '@/app/context/UserContext';
import { Header } from '@/components/header/header';

export default function ProtectedLayout({ children }) {
    const { user, isLoading, setRedirectPath } = useUser();
    const pathname = usePathname();
    const router = useRouter();

    useEffect(() => {
        

        if (!user && !isLoading ) {
            setRedirectPath(pathname);
            router.push('/login'); // перенаправление на страницу логина
        }
    }, [user, router, isLoading]);

    if (!user) return null; // или можно показать <Loading />
   

    return (
        <>
         <Header />
        {children}
        </>
    )
    
}
