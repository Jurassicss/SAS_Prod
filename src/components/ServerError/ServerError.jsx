import styles from './ServerError.module.scss';

export default function ServerError({ message = "Нет подключения к серверу" }) {
  return (
    <div className={styles.container}>
      <p className={styles.screen}>SCREEN</p>
      <div className={styles.message}>{message}</div>
    </div>
  );
}
