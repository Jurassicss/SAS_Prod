'use client';

import { useState } from 'react';
import styles from './LoginForm.module.scss';

const users = [
    {
      username: 'SCREEN',
      password: 'SCREEN',
      roles: ['admin', 'editor'],
    },
    {
      username: 'Громов',
      password: 'worker123',
      roles: ['Антенна'],
    },
    {
      username: 'Жуков',
      password: 'qa456',
      roles: ['Механика'],
    },
];

export default function LoginForm({ onLogin }) {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [remember, setRemember] = useState(false);
    const [error, setError] = useState('');

    // const handleSubmit = (e) => {
    //   e.preventDefault();

    //   const user = users.find(
    //     (u) => u.username === username && u.password === password
    //   );

    //   if (user) {
    //     onLogin(user, remember);
    //   } else {
    //     setError('Неверный логин или пароль');
    //   }
    // };

		// const handleSubmit = async (e) => {
	// 	e.preventDefault();
	  
	// 	try {
	// 	  const res = await fetch('/api/login', {
	// 		method: 'POST',
	// 		headers: { 'Content-Type': 'application/json' },
	// 		body: JSON.stringify({ username, password }),
	// 	  });
	  
	// 	  if (!res.ok) {
	// 		setError('Неверный логин или пароль');
	// 		return;
	// 	  }
	  
	// 	  const user = await res.json();
	// 	  onLogin(user, remember);
	// 	} catch (err) {
	// 	  console.error('Ошибка входа:', err);
	// 	  setError('Ошибка подключения');
	// 	}
	//   };


	const handleSubmit = async (e) => {
		e.preventDefault();
		
		try {
		  const res = await fetch('/api/login', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ username, password }),
		  });
	  
		  const data = await res.json();
		  
		  if (!res.ok) {
			setError(data.error || 'Неверный логин или пароль');
			return;
		  }
	  
		  onLogin(data, remember); // data должен содержать username и roles
		} catch (err) {
		  console.error('Ошибка входа:', err);
		  setError('Ошибка подключения');
		}
	  };


  	return (
    	<div className={styles.base}>
    		<div className={styles.logo}> 
    		    <h1>SCREEN</h1>
    		    <p>company</p>
    		</div>
    		<div className={styles.container}>
      			{/* <h2 className={styles.title}>Вход в систему</h2> */}
      			<h2 className={styles.title}><p>System Automatic</p> <p>Screen</p></h2>
      			<form onSubmit={handleSubmit} className={styles.form}>
      				<div className={styles.inputWrapper}>
      			  		<input
      			  		  type="text"
      			  		  placeholder="Логин"
      			  		  value={username}
      			  		  onChange={(e) => setUsername(e.target.value)}
      			  		  className={styles.input}
      			  		  required
      			  		/>
      			  	</div>
      			  	<input
      			    	type="password"
      			    	placeholder="Пароль"
      			    	value={password}
      			    	onChange={(e) => setPassword(e.target.value)}
      			    	className={styles.input}
      			    	required
      			  	/>
      			  	<label className={styles.radioSave}>
      			    	<input
      			      		type="checkbox"
      			      		checked={remember}
      			      		onChange={(e) => setRemember(e.target.checked)}
      			    	/>
      			    	Запомнить меня
      			  	</label>
      			  	{error && <p className={styles.error}>{error}</p>}
      			  	<button type="submit" className={styles.button}>
      			   		 Вход
      			  	</button>
      			</form>
    		</div>
    	</div>
  	);
}
