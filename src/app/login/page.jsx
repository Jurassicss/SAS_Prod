'use client'

import LoginForm from "@/components/LogOpen/LogOpen";

import { useUser } from '@/app/context/UserContext';
// import LoginForm from '@/components/LoginForm';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
    const { setUser, redirectPath, setRedirectPath } = useUser();
    const router = useRouter();

    const handleLogin = (user, remember) => {
        setUser(user, remember);
        
        const destination = redirectPath || '/';
        setRedirectPath(null); // очистим, чтобы не оставался старый путь
        
        router.push(destination);
    };

    return <LoginForm onLogin={handleLogin} />;
}