
import CircleLoader from './circleLoader';
import styles from './Preloader.module.scss';

export const Load = function () {

	return (
		<div className={styles.preloader}>
			<p >Загрузка...</p>
			<CircleLoader />
		</div>
	)
}

// const CircleLoaderCSR = dynamic(
//     () => Promise.resolve(CircleLoader),
//     {
//         ssr: false,
//         // loading: () => <div >Loading...</div> // Опционально
//     }
//     );

export default Load


