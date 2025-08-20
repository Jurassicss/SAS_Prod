'use client'

// import dynamic from 'node_modules/next/dynamic';
import styles from './CircleLoader.module.scss';


export const CircleLoader =  function () {
    
    return(
        <span className={styles.circle}></span>
    )
}

// const CircleLoaderCSR = dynamic(
//     () => Promise.resolve(CircleLoader),
//     {
//         ssr: false,
//         // loading: () => <div >Loading...</div> // Опционально
//     }
//     );
    
    export default CircleLoader