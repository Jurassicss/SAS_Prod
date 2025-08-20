// 'use client';

// import { createContext, useContext, useEffect, useState } from 'react';

// const UserContext = createContext(null);

// export function UserProvider({ children }) {
//     const [user, setUserState] = useState(null);
//     const [redirectPath, setRedirectPath] = useState(null); // 👉 сюда сохраним URL
//     const [isLoading, setIsLoading] = useState(true);
//     // При загрузке страницы — восстановим пользователя из localStorage
//     useEffect(() => {
//         console.log('🔄 useEffect start');
//         try {

//             const raw = localStorage.getItem('auth_user') !== null ?  localStorage.getItem('auth_user'): sessionStorage.getItem('auth_user')
          
//           const savedUser = JSON.parse(raw);
//           if (savedUser && savedUser.username) {
//             setUserState(savedUser);
//             console.log('✅ User loaded:', savedUser);
            
//           }
//           console.log('📦 LocalStorage raw:', raw);
//         } catch (e) {
//           console.error('❌ Error parsing auth_user:', e);
//         } finally {
//           setIsLoading(false);
//         }
//       }, []);
//     if (isLoading) {
//       // Пока загружаем пользователя, ничего не показываем или показываем лоадер
//       return null; 
//     }

//     // Установка пользователя + опциональное сохранение
//     const setUser = (user, remember = false) => {
//         setUserState(user);
//         if (remember) {
//               localStorage.setItem('auth_user', JSON.stringify(user));
//         }else{
//               sessionStorage.setItem('auth_user', JSON.stringify(user));
//         }
//     };



//     const logout = () => {
//       setUserState(null);
//       localStorage.removeItem('auth_user');
//     };

//     return (
//       <UserContext.Provider value={{ user, setUser, logout, redirectPath, setRedirectPath  }}>
//         {children}
//       </UserContext.Provider>
//     );
// }

// export function useUser() {
//   return useContext(UserContext);
// }



'use client';

import { createContext, useContext, useEffect, useState } from 'react';

const UserContext = createContext(null);

export function UserProvider({ children }) {
    const [user, setUserState] = useState(null);
    const [redirectPath, setRedirectPath] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    // Восстановление пользователя при загрузке
    useEffect(() => {
        const loadUser = () => {
            try {
                // Сначала проверяем localStorage (если была галочка "Запомнить меня")
                const localUser = localStorage.getItem('auth_user');
                if (localUser) {
                    const parsedUser = JSON.parse(localUser);
                    setUserState(parsedUser);
                    return;
                }

                // Если в localStorage нет, проверяем sessionStorage
                const sessionUser = sessionStorage.getItem('auth_user');
                if (sessionUser) {
                    const parsedUser = JSON.parse(sessionUser);
                    setUserState(parsedUser);
                }
            } catch (e) {
                console.error('Ошибка при загрузке пользователя:', e);
            } finally {
                setIsLoading(false);
            }
        };

        loadUser();
    }, []);

    // Установка пользователя с сохранением в хранилище
    const setUser = (newUser, remember = false) => {
        if (!newUser) return;

        setUserState(newUser);
        const userString = JSON.stringify(newUser);

        if (remember) {
            // Сохраняем в localStorage и очищаем sessionStorage
            localStorage.setItem('auth_user', userString);
            sessionStorage.removeItem('auth_user');
            console.log('Пользователь сохранен в localStorage');
        } else {
            // Сохраняем в sessionStorage и очищаем localStorage
            sessionStorage.setItem('auth_user', userString);
            localStorage.removeItem('auth_user');
            console.log('Пользователь сохранен в sessionStorage');
        }
    };

    const logout = () => {
        setUserState(null);
        localStorage.removeItem('auth_user');
        sessionStorage.removeItem('auth_user');
    };

    if (isLoading) {
        return null; // или лоадер
    }

    return (
        <UserContext.Provider value={{ 
            user, 
            setUser, 
            logout, 
            redirectPath, 
            setRedirectPath 
        }}>
            {children}
        </UserContext.Provider>
    );
}

export function useUser() {
    return useContext(UserContext);
}