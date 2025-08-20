'use client'

import { useUser } from '@/app/context/UserContext';
import { useRouter } from 'next/navigation';
import ProductionFlow from "@/components/menuView/ProductionFlow";
import Carousel3D from '@/components/Slider/Carousel3d';
import styles from "./view.module.scss"
import GanttChart from '@/components/menuGant/menuGant';



export default function Home() {
	// const { user } = useUser();
	// const router = useRouter();

	// useEffect(() => {
	//     if (user && !user.roles.includes('admin')) {
	//       router.push('/protect/state');
	//     }
	//   }, [user]);
	// if (!user) return <div>⏳ Загрузка...</div>;

	return (
		<main >
			<Carousel3D>
				<ProductionFlow />
				<GanttChart />
			</Carousel3D>

		</main>
	);
}