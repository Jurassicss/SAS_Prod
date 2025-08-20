'use client';

import { useUser } from '@/app/context/UserContext';
import ProductionStatusPage from '@/components/State/state';
import MySteps from '@/components/MySteps/MySteps';

export default function Page() {
    const { user } = useUser();
    
    if (!user) return <div>⏳ Загрузка...</div>;
    
    // Если у пользователя есть роль admin — показываем полный компонент
    if (user.roles.includes('admin')) {
      return <ProductionStatusPage />;
    }
  
    // Во всех остальных случаях — показываем только свои этапы
    return <MySteps />;
}