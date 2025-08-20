'use client'

import { useEffect, useRef, useState } from 'react';
import styles from './Sidebar.module.scss';
import gsap from 'gsap';

export default function Sidebar({ setActiveComponent }) {
	const [isOpen, setIsOpen] = useState(false);
	const sidebarRef = useRef();
	const buttonRef = useRef();
	const topBar = useRef();
	const middleBar = useRef();
	const bottomBar = useRef();

	useEffect(() => {
		gsap.set(sidebarRef.current, { x: '100%' });
		gsap.set(buttonRef.current, { x: '100%' });
	}, []);

	const toggleMenu = () => {
		setIsOpen(prev => {
			const next = !prev;

			// Меню
			gsap.to(sidebarRef.current, {
				x: next ? 0 : '100%',
				duration: 0.5,
				ease: 'power2.out',
			});

			// Анимация иконки
			if (next) {
				// В крест
				gsap.to(topBar.current, {
					rotation: 45,
					y: 8,
					transformOrigin: 'center',
					backgroundColor: 'white',
					duration: 0.3,
					ease: 'power2.out',
				});
				gsap.to(middleBar.current, {
					scaleX: 0,
					backgroundColor: 'white',
					duration: 0.2,
					ease: 'power2.out',
				});
				gsap.to(bottomBar.current, {
					rotation: -45,
					y: -10,
					transformOrigin: 'center',
					backgroundColor: 'white',
					duration: 0.3,
					ease: 'power2.out',
				});

				// Сбросим стиль
				gsap.to(buttonRef.current, {
					backgroundColor: 'transparent',
					boxShadow: 'none',
					duration: 0.1,
					ease: 'expoScale',
				});

				// Последовательное движение: вниз → влево (по центру)
				const tl = gsap.timeline();
				tl.to(buttonRef.current, {
					y: 150, // вниз
					duration: 0.3,
					ease: 'power2.out',
				}).to(buttonRef.current, {
					x: -50, // влево к центру
					duration: 0.3,
					ease: 'power2.out',
				});
			} else {
				// Обратно в гамбургер
				gsap.to(topBar.current, {
					rotation: 0,
					y: 0,
					backgroundColor: 'black',
					duration: 0.3,
					ease: 'power2.out',
				});
				gsap.to(middleBar.current, {
					scaleX: 1,
					backgroundColor: 'black',
					duration: 0.2,
					ease: 'power2.out',
				});
				gsap.to(bottomBar.current, {
					rotation: 0,
					y: 0,
					backgroundColor: 'black',
					duration: 0.3,
					ease: 'power2.out',
				});

				gsap.to(buttonRef.current, {
					backgroundColor: 'white',
					boxShadow: '3px 7px 10px rgb(146, 146, 146)',
					duration: 0.2,
					ease: 'power2.out',
				});

				// Обратно вправо → вверх
				const tl = gsap.timeline();
				tl.to(buttonRef.current, {
					x: '100%',
					duration: 0.3,
					ease: 'power2.out',
				}).to(buttonRef.current, {
					y: 0,
					duration: 0.3,
					ease: 'power2.out',
				});
			}

			return next;
		});
	};



	const handleClick = (componentName) => {
		setActiveComponent(componentName);
		toggleMenu();
	};

	return (
		<>
			<div ref={sidebarRef} className={styles.sidebar}>
				<div className={styles.menuItem} onClick={() => handleClick('essence')}>Изделия</div>
				<div className={styles.menuItem} onClick={() => handleClick('graph')}>Сценарии</div>
				<div className={styles.menuItem} onClick={() => handleClick('createUser')}>Учетные записи</div>
				<div className={styles.menuItem} onClick={() => handleClick('docx')}>КТП</div>

			</div>

			<div ref={buttonRef} className={styles.menuButton} onClick={toggleMenu}>
				<span ref={topBar} className={styles.bar} />
				<span ref={middleBar} className={styles.bar} />
				<span ref={bottomBar} className={styles.bar} />
			</div>
		</>
	);
}


