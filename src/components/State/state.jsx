'use client';

import { useEffect, useState, useRef } from 'react';
import styles from "./state.module.scss";
import CircleLoader from '../Preloader/circleLoader';

import gsap from 'gsap';


// export default function ProductionStatusPage() {
// 	const [products, setProducts] = useState([]);
// 	const [expandedId, setExpandedId] = useState(null);
// 	const [error, setError] = useState('');

// 	const [loading, setLoading] = useState(true);          // для начальной загрузки
// 	const [loadingStepId, setLoadingStepId] = useState(null); // для загрузки шага

// 	const stepListRef = useRef({});
// 	const lineRefs = useRef({});



// 	useEffect(() => {
// 		setLoading(true);
// 		fetch('/api/products-active')
// 			.then((res) => res.json())
// 			.then(data => {
// 				setProducts(data);
// 				setLoading(false);
// 			})
// 			.catch(() => {
// 				setError('Ошибка загрузки данных');
// 				setLoading(false);
// 			});
// 	}, []);

// 	const handleToggle = (id) => {
// 		if (expandedId === id) {
// 			// Убираем линию → скрываем блок
// 			const [leftLine, rightLine] = lineRefs.current[id] || [];
	
// 			gsap.to([leftLine, rightLine], {
// 				scaleX: 0,
// 				duration: 0.2,
// 				transformOrigin: (i) => (i === 0 ? 'left' : 'right'),
// 				onComplete: () => {
// 					gsap.to(stepListRef.current[id], {
// 						height: 0,
// 						opacity: 0,
// 						duration: 0.6,
// 						ease: 'power1.in',
// 						onComplete: () => setExpandedId(null),
// 					});
// 				},
// 			});
// 		} else {
// 			setExpandedId(id); // Триггерит useEffect, где будет открытие и анимация линии
// 		}
// 	};
	

// 	const handleComplete = async (stepId) => {
// 		try {
// 			setLoadingStepId(stepId);

// 			const res = await fetch('/api/steps', {
// 				method: 'POST',
// 				headers: { 'Content-Type': 'application/json' },
// 				body: JSON.stringify({ stepId }),
// 			});

// 			if (!res.ok) throw new Error('Ошибка при обновлении шага');

// 			// Найдём продукт, которому принадлежит шаг
// 			const product = products.find((p) =>
// 				p.steps.some((s) => s.ID === stepId)
// 			);

// 			if (!product) throw new Error('Продукт не найден');

// 			// Получим обновлённый продукт с сервера
// 			const updatedRes = await fetch(`/api/products-active?id=${product.id}`);
// 			const updatedProduct = await updatedRes.json();

// 			// Проверка: если шагов нет или они невалидны — удалить продукт
// 			if (
// 				!updatedProduct.steps ||
// 				!Array.isArray(updatedProduct.steps) ||
// 				updatedProduct.steps.length === 0
// 			) {
// 				setProducts((prev) => prev.filter((p) => p.id !== product.id));
// 			} else {
// 				// Заменим только один продукт в списке
// 				setProducts((prev) =>
// 					prev.map((p) => (p.id === updatedProduct.id ? updatedProduct : p))
// 				);
// 			}
// 		} catch (e) {
// 			console.error(e);
// 			alert('Не удалось обновить шаг');
// 		} finally {
// 			setLoadingStepId(null);
// 		}
// 	};

// 	useEffect(() => {
// 		if (!expandedId || !stepListRef.current[expandedId]) return;
	
// 		// Этап 1: открываем блок
// 		gsap.fromTo(
// 			stepListRef.current[expandedId],
// 			{ height: 0, opacity: 0 },
// 			{
// 				height: 'auto',
// 				opacity: 1,
// 				duration: 0.4,
// 				ease: 'power2.out',
// 				onComplete: () => {
// 					// Этап 2: линия от краёв к центру
// 					const [leftLine, rightLine] = lineRefs.current[expandedId] || [];
	
// 					gsap.fromTo(leftLine, { scaleX: 0 }, {
// 						scaleX: 1,
// 						duration: 0.6,
// 						transformOrigin: 'left',
// 						ease: 'power2.out',
// 					});
	
// 					gsap.fromTo(rightLine, { scaleX: 0 }, {
// 						scaleX: 1,
// 						duration: 0.6,
// 						transformOrigin: 'right',
// 						ease: 'power2.out',
// 					});
// 				}
// 			}
// 		);
// 	}, [expandedId]);
	
	


// 	if (loading) {
// 		return (
// 			<div className={styles.base} style={{ maxWidth: 600, margin: '2rem auto', textAlign: 'center' }}>
// 				<h1 className={styles.title}>Продукция в производстве</h1>
// 				<p>Загрузка данных...</p>button
// 				<CircleLoader />
// 			</div>
// 		);
// 	}

// 	return (
// 		<div className={styles.base} >
// 			<h1 className={styles.title}>Продукция в производстве</h1>
// 			{error && <p >{error}</p>}

// 			{products.map((product) => (
// 				<div className={styles.listBase} key={product.id} >
// 					<div className={styles.contButtonBase}
// 						data-js-state={expandedId === product.id ? 'isActive' : 'isLock'}
// 						>
// 						{/* <div className={styles.buttonBase}>
//                     <strong onClick={() => handleToggle(product.ID)}>{product.Label}</strong>
//                 </div> */}
// 						{/* <button className={styles.buttonBase} onClick={() => handleToggle(product.ID)}>
//                   {expandedId === product.ID ? 'Скрыть' : 'Показать этапы'}
//                 </button> */}
// 						<span className={styles.line} ref={(el) => {
// 							if (!lineRefs.current[product.id]) lineRefs.current[product.id] = [];
// 							lineRefs.current[product.id][0] = el;
// 						}} />

// 						<span className={styles.line} ref={(el) => {
// 							if (!lineRefs.current[product.id]) lineRefs.current[product.id] = [];
// 							lineRefs.current[product.id][1] = el;
// 						}} />
// 						<button
// 							className={styles.buttonBase}
// 							data-js-state={expandedId === product.id ? 'isActive' : 'isLock'}
// 							onClick={() => handleToggle(product.id)}>
// 							{product.label}
// 						</button>
// 					</div>

// 					{expandedId === product.id && (
// 						<ul className={styles.list} ref={(el) => stepListRef.current[product.id] = el} >
// 							{product.steps.map((step) => (
// 								<li key={step.ID}>
// 									<strong>{step.name}</strong> | {' '}
// 									{step.State === null
// 										? '🚫 недоступен'
// 										: step.State
// 											? '✔️ готово'
// 											: '⏳ в процессе'}
// 									{step.State === false &&
// 										<button
// 											onClick={() => handleComplete(step.ID)}
// 											disabled={step.State !== false}
// 											className={styles.buttonState}
											
// 										>
// 											Готово
// 										</button>
// 									}
// 								</li>
// 							))}
// 						</ul>
// 					)}
// 				</div>
// 			))}
// 		</div>
// 	);
// }




// export default function ProductionStatusPage() {
//   	const [products, setProducts] = useState([]);
//   	const [expandedId, setExpandedId] = useState(null);
//   	const [closingId, setClosingId] = useState(null);
//   	const [error, setError] = useState('');

//   	const [loading, setLoading] = useState(true);
//   	const [loadingStepId, setLoadingStepId] = useState(null);

//   	const contentRefs = useRef({});

// 	 // Рефы для списков шагов и линий (две линии для каждого продукта)
// 	 const stepListRef = useRef({});
// 	 const lineRefs = useRef({});
	 

//   	useEffect(() => {
//   	  setLoading(true);
//   	  fetch('/api/products-active')
//   	    .then(res => res.json())
//   	    .then(data => {
//   	      setProducts(data);
//   	      setLoading(false);
//   	    })
//   	    .catch(() => {
//   	      setError('Ошибка загрузки данных');
//   	      setLoading(false);
//   	    });
//   	}, []);

//   	const handleToggle = (id) => {
//   	  if (expandedId === id) {
//   	    // Закрываем текущий
//     	  setClosingId(id);
//     	  gsap.to(contentRefs.current[id], {
//     	    height: 0,
//     	    opacity: 0,
//     	    duration: 0.3,
//     	    ease: 'power1.in',
//     	    onComplete: () => {
//     	      setExpandedId(null);
//     	      setClosingId(null);
//     	    }
//     	  });
//     	} else {
//     	  if (expandedId) {
//     	    // Закрываем старый, потом открываем новый
//     	    setClosingId(expandedId);
//     	    gsap.to(contentRefs.current[expandedId], {
//     	      height: 0,
//     	      opacity: 0,
//     	      duration: 0.3,
//     	      ease: 'power1.in',
//     	      onComplete: () => {
//     	        setClosingId(null);
//     	        setExpandedId(id);
//     	      }
//     	    });
//     	  } else {
//     	    // Просто открываем новый
//     	    setExpandedId(id);
//     	  }
//     	}
//   	};

//   	useEffect(() => {
//   	  	if (expandedId && contentRefs.current[expandedId]) {
//   	  	  	gsap.fromTo(
//   	  	  	  contentRefs.current[expandedId],
//   	  	  	  { height: 0, opacity: 0 },
//   	  	  	  {
//   	  	  	    height: 'auto',
//   	  	  	    opacity: 1,
//   	  	  	    duration: 0.4,
//   	  	  	    ease: 'power2.out',
//   	  	  	    clearProps: 'height', // чтобы потом не было ограничений по высоте
//   	  	  	  }
//   	  	  	);
//   	  	}
//   	}, [expandedId]);

//   	const handleComplete = async (stepId) => {
//   	  	try {
//   	  	  setLoadingStepId(stepId);

//   	  	  const res = await fetch('/api/steps', {
//   	  	    method: 'POST',
//   	  	    headers: { 'Content-Type': 'application/json' },
//   	  	    body: JSON.stringify({ stepId }),
//   	  	  });
		
//   	  	  if (!res.ok) throw new Error('Ошибка при обновлении шага');
		
//   	  	  const product = products.find((p) => p.steps.some((s) => s.ID === stepId));
//   	  	  if (!product) throw new Error('Продукт не найден');
		
//   	  	  const updatedRes = await fetch(`/api/products-active?id=${product.id}`);
//   	  	  const updatedProduct = await updatedRes.json();
		
//   	  	  if (!updatedProduct.steps || !Array.isArray(updatedProduct.steps) || updatedProduct.steps.length === 0) {
//   	  	    setProducts((prev) => prev.filter((p) => p.id !== product.id));
//   	  	  } else {
//   	  	    setProducts((prev) => prev.map((p) => (p.id === updatedProduct.id ? updatedProduct : p)));
//   	  	  }
//   	  	} catch (e) {
//   	  	  console.error(e);
//   	  	  alert('Не удалось обновить шаг');
//   	  	} finally {
//   	  	  setLoadingStepId(null);
//   	  	}
//   	};

//   	if (loading) {
//   	  	return (
//   	  	  	<div className={styles.base} style={{ maxWidth: 600, margin: '2rem auto', textAlign: 'center' }}>
//   	  	  	  	<h1 className={styles.title}>Продукция в производстве</h1>
//   	  	  	  	<p>Загрузка данных...</p>
//   	  	  	  	<CircleLoader />
//   	  	  	</div>
//   	  	);
//   	}

//   	return (
//   	  	<div className={styles.base}>
//   	    	<h1 className={styles.title}>Продукция в производстве</h1>
//   	    	{error && <p style={{ color: 'red' }}>{error}</p>}

//   	    	{products.map((product) => (
//   	      	<div className={styles.listBase} key={product.id}>
//   	        	<div
//   	        	  className={styles.contButtonBase}
//   	        	  data-js-state={expandedId === product.id ? 'isActive' : 'isLock'}
//   	        	>
//   	          		<button
//   	          		  className={styles.buttonBase}
//   	          		  data-js-state={expandedId === product.id ? 'isActive' : 'isLock'}
//   	          		  onClick={() => handleToggle(product.id)}
//   	          		  disabled={closingId === product.id} // блокируем кнопку пока анимация закрытия
//   	          		>
//   	          		  {product.label}
//   	          		</button>
//   	        	</div>

//   	        	{/* Контент показываем, если это текущий открытый продукт */}
//   	        	{(expandedId === product.id) && (
//   	        	  <ul
//   	        	    className={styles.list}
//   	        	    ref={(el) => (contentRefs.current[product.id] = el)}
//   	        	    style={{ overflow: 'hidden' }}
//   	        	  >
//   	        	    {product.steps.map((step) => (
//   	        	      <li key={step.ID}>
//   	        	        <strong>{step.name}</strong> |{' '}
//   	        	        {step.State === null
//   	        	          ? '🚫 недоступен'
//   	        	          : step.State
//   	        	            ? '✔️ готово'
//   	        	            : '⏳ в процессе'}
//   	        	        {step.State === false && (
//   	        	          	<button
//   	        	          	  onClick={() => handleComplete(step.ID)}
//   	        	          	  disabled={step.State !== false}
//   	        	          	  className={styles.buttonState}
//   	        	          	>
//   	        	          	  Готово
//   	        	          	</button>
//   	        	        )}
//   	        	      	</li>
//   	        	    ))}
//   	        	  	</ul>
//   	        	)}
//   	      	</div>
//   	    	))}
//   	  	</div>
//   	);
// }



export default function ProductionStatusPage() {
  const [products, setProducts] = useState([]);
  const [expandedId, setExpandedId] = useState(null);
  const [closingId, setClosingId] = useState(null);
  const [error, setError] = useState('');

  const [loading, setLoading] = useState(true);
  const [loadingStepId, setLoadingStepId] = useState(null);

  const contentRefs = useRef({}); // Для контента списка шагов
  const lineRefs = useRef({});    // Для двух линий (левой и правой) по product.id

  useEffect(() => {
    setLoading(true);
    fetch('/api/products-active')
      .then(res => res.json())
      .then(data => {
        setProducts(data);
        setLoading(false);
      })
      .catch(() => {
        setError('Ошибка загрузки данных');
        setLoading(false);
      });
  }, []);

  // Функция анимации открытия линий
  const animateLinesOpen = (id) => {
    const [leftLine, rightLine] = lineRefs.current[id] || [];
    if (!leftLine || !rightLine) return;

    gsap.killTweensOf([leftLine, rightLine]);
    gsap.fromTo(leftLine, { scaleX: 0 }, {
      scaleX: 1,
      duration: 0.6,
      transformOrigin: 'left',
      ease: 'power2.out',
    });
    gsap.fromTo(rightLine, { scaleX: 0 }, {
      scaleX: 1,
      duration: 0.6,
      transformOrigin: 'right',
      ease: 'power2.out',
    });
  };

  // Функция анимации закрытия линий, возвращает промис для onComplete цепочки
  const animateLinesClose = (id) => {
    const [leftLine, rightLine] = lineRefs.current[id] || [];
    if (!leftLine || !rightLine) return Promise.resolve();

    gsap.killTweensOf([leftLine, rightLine]);

    return new Promise(resolve => {
      gsap.to([leftLine, rightLine], {
        scaleX: 0,
        duration: 0.3,
        transformOrigin: (i) => (i === 0 ? 'left' : 'right'),
        ease: 'power1.in',
        onComplete: resolve,
      });
    });
  };

  const handleToggle = (id) => {
    if (expandedId === id) {
      // Закрываем текущий:
      setClosingId(id);

      // Сначала анимируем линии закрытия, потом контент
      animateLinesClose(id).then(() => {
        gsap.to(contentRefs.current[id], {
          height: 0,
          opacity: 0,
          duration: 0.3,
          ease: 'power1.in',
          onComplete: () => {
            setExpandedId(null);
            setClosingId(null);
          }
        });
      });

    } else {
      if (expandedId) {
        // Закрываем старый сначала
        setClosingId(expandedId);

        animateLinesClose(expandedId).then(() => {
          gsap.to(contentRefs.current[expandedId], {
            height: 0,
            opacity: 0,
            duration: 0.3,
            ease: 'power1.in',
            onComplete: () => {
              setClosingId(null);
              setExpandedId(id);
            }
          });
        });
      } else {
        // Просто открываем новый
        setExpandedId(id);
      }
    }
  };

  useEffect(() => {
    if (expandedId && contentRefs.current[expandedId]) {
      gsap.fromTo(
        contentRefs.current[expandedId],
        { height: 0, opacity: 0 },
        {
          height: 'auto',
          opacity: 1,
          duration: 0.4,
          ease: 'power2.out',
          clearProps: 'height',
          onComplete: () => {
            animateLinesOpen(expandedId);
          }
        }
      );
    }
  }, [expandedId]);

  const handleComplete = async (stepId) => {
    try {
      setLoadingStepId(stepId);

      const res = await fetch('/api/steps', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stepId }),
      });

      if (!res.ok) throw new Error('Ошибка при обновлении шага');

      const product = products.find((p) => p.steps.some((s) => s.ID === stepId));
      if (!product) throw new Error('Продукт не найден');

      const updatedRes = await fetch(`/api/products-active?id=${product.id}`);
      const updatedProduct = await updatedRes.json();

      if (!updatedProduct.steps || !Array.isArray(updatedProduct.steps) || updatedProduct.steps.length === 0) {
        setProducts((prev) => prev.filter((p) => p.id !== product.id));
      } else {
        setProducts((prev) => prev.map((p) => (p.id === updatedProduct.id ? updatedProduct : p)));
      }
    } catch (e) {
      console.error(e);
      alert('Не удалось обновить шаг');
    } finally {
      setLoadingStepId(null);
    }
  };

  if (loading) {
    return (
      <div className={styles.base} style={{ maxWidth: 600, margin: '2rem auto', textAlign: 'center' }}>
        <h1 className={styles.title}>Продукция в производстве</h1>
        <p>Загрузка данных...</p>
        <CircleLoader />
      </div>
    );
  }

  return (
    <div className={styles.base}>
      <h1 className={styles.title}>Продукция в производстве</h1>
      {error && <p style={{ color: 'red' }}>{error}</p>}

      {products.map((product) => (
        <div className={styles.listBase} key={product.id}>
          <div
            className={styles.contButtonBase}
            data-js-state={expandedId === product.id ? 'isActive' : 'isLock'}
          >
            {/* Линии слева и справа для анимации */}
            <span
              className={styles.line}
              ref={(el) => {
                if (!lineRefs.current[product.id]) lineRefs.current[product.id] = [];
                lineRefs.current[product.id][0] = el;
              }}
              style={{ transformOrigin: 'left', transform: 'scaleX(0)' }}
            />
            <span
              className={styles.line}
              ref={(el) => {
                if (!lineRefs.current[product.id]) lineRefs.current[product.id] = [];
                lineRefs.current[product.id][1] = el;
              }}
              style={{ transformOrigin: 'right', transform: 'scaleX(0)' }}
            />
            <button
              className={styles.buttonBase}
              data-js-state={expandedId === product.id ? 'isActive' : 'isLock'}
              onClick={() => handleToggle(product.id)}
              disabled={closingId === product.id} // блокируем кнопку пока анимация закрытия
            >
              {product.label}
            </button>
          </div>

          {(expandedId === product.id) && (
            <ul
              className={styles.list}
              ref={(el) => (contentRefs.current[product.id] = el)}
              style={{ overflow: 'hidden' }}
            >
              {product.steps.map((step) => (
                <li key={step.ID}>
                  <strong>{step.name}</strong> |{' '}
                  {step.State === null
                    ? '🚫 недоступен'
                    : step.State
                      ? '✔️ готово'
                      : '⏳ в процессе'}
                  {step.State === false && (
                    <button
                      onClick={() => handleComplete(step.ID)}
                      disabled={step.State !== false}
                      className={styles.buttonState}
                    >
                      Готово
                    </button>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      ))}
    </div>
  );
}
