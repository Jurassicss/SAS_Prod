'use client';

import { useState, useEffect, useRef, Children, cloneElement } from 'react';
import gsap from 'gsap';
import styles from './Carousel3D.module.scss';

export default function Carousel3D({ children }) {
	const slides = Children.toArray(children);
	const [current, setCurrent] = useState(0);
	const containerRef = useRef(null);
	const slideRefs = useRef([]);
	const sceneRef = useRef(null);

	//   useEffect(() => {
	//     centerSlides();
	//     const resizeObserver = new ResizeObserver(centerSlides);
	//     if (sceneRef.current) resizeObserver.observe(sceneRef.current);
	//     return () => resizeObserver.disconnect();
	//   }, [current]);

	//   const centerSlides = () => {
	//     const container = containerRef.current;
	//     const activeSlide = slideRefs.current[current];
	//     if (container && activeSlide) {
	//       const offset = (container.clientHeight - activeSlide.clientHeight) / 2;
	//       activeSlide.style.top = `${offset}px`;
	//     }
	//   };

	const animateSlide = (fromIndex, toIndex) => {
		const from = slideRefs.current[fromIndex];
		const to = slideRefs.current[toIndex];

		if (from) {
			gsap.fromTo(
				from,
				{
					zIndex: 3,
					opacity: 1,
					x: 0,
					z: 0,
					rotateY: 0,
					scale: 1,
				},
				{
					duration: 0.6,
					x: 150,
					z: -200,
					rotateY: -45,
					scale: 0.8,
					opacity: 0,
					ease: 'power2.inOut',
				}
			);
		}

		if (to) {
			gsap.fromTo(
				to,
				{
					zIndex: 4,
					opacity: 0,
					x: -150,
					z: -200,
					rotateY: 45,
					scale: 0.8,
				},
				{
					duration: 0.6,
					x: 0,
					z: 0,
					rotateY: 0,
					opacity: 1,
					scale: 1,
					ease: 'power2.inOut',
				}
			);
		}
	};

	const prevSlide = () => {
		const nextIndex = (current - 1 + slides.length) % slides.length;
		animateSlide(current, nextIndex);
		setCurrent(nextIndex);
	};

	const nextSlide = () => {
		const nextIndex = (current + 1) % slides.length;
		animateSlide(current, nextIndex);
		setCurrent(nextIndex);
	};

	return (
		<div className={styles.carouselContainer} ref={containerRef}>

			<div className={styles.carouselScene} ref={sceneRef}>
				{slides.map((child, index) => (
					<div
						key={index}
						className={styles.slide}
						ref={(el) => (slideRefs.current[index] = el)}
						style={{
							zIndex: index === current ? 4 : 1,
							opacity: index === current ? 1 : 0,
						}}
					>
						{cloneElement(child)}
					</div>
				))}
			</div>
			<div className={styles.ButtonsBase}>
				<button onClick={prevSlide} className={styles.navLeft}>‹</button>
				<button onClick={nextSlide} className={styles.navRight}>›</button>
			</div>

		</div>
	);
}
