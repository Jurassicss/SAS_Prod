


// import { createTunnelAndConnect } from '@/lib/dbViaSsh';
// import { addDays, isAfter } from 'date-fns';
// import { NextResponse } from 'next/server';

// export async function GET() {
// 	let client;

// 	try {
// 		client = await createTunnelAndConnect();

// 		const query = `
//       SELECT 
//         p.id AS product_id,
//         p.label AS product_label,
//         ps.id AS step_instance_id,
//         ts.name AS step_name,
//         ps.time_start,
//         EXTRACT(DAY FROM ts.deadlines) AS deadlines_days,
//         ps.state_production AS step_state
//       FROM product p
//       JOIN steps_in_production ps ON ps.product_id = p.id
//       JOIN tech_stages ts ON ps.step_id = ts.id
//       WHERE p.state_product = false
//       ORDER BY p.id, ps.time_start;
//     `;

// 		const { rows } = await client.pgClient.query(query);

// 		const data = {};

// 		rows.forEach(row => {
// 			if (!data[row.product_id]) {
// 				data[row.product_id] = {
// 					id: row.product_id,
// 					Label: row.product_label,
// 					steps: [],
// 					plannedEnd: null, // будем считать позже
// 				};
// 			}

// 			const start = row.time_start ? new Date(row.time_start) : null;
// 			const duration = Number(row.deadlines_days) || 0;
// 			const expectedEnd = start ? addDays(start, duration) : null;

// 			const stepOverdue =
// 				row.step_state === false && expectedEnd ? isAfter(new Date(), expectedEnd) : false;

// 			data[row.product_id].steps.push({
// 				id: row.step_instance_id,
// 				StepName: row.step_name,
// 				Time_start: start,
// 				Deadline: duration,
// 				State: row.step_state,
// 				expectedEnd,
// 				stepOverdue,
// 			});
// 		});

// 		// Рассчитываем планируемую дату окончания продукта
// 		Object.values(data).forEach(product => {
// 			const startedSteps = product.steps.filter(s => s.Time_start);
// 			if (startedSteps.length) {
// 				const lastStartedStep = startedSteps[startedSteps.length - 1];
// 				product.plannedEnd = addDays(lastStartedStep.Time_start, lastStartedStep.Deadline);
// 			}
// 		});

// 		return NextResponse.json(Object.values(data));
// 	} catch (err) {
// 		console.error('Ошибка API /api/gantt:', err);
// 		return NextResponse.json({ error: 'Ошибка сервера' }, { status: 500 });
// 	} finally {
// 		if (client) await client.close(); // безопасно закрываем соединение
// 	}
// }


// src/app/api/gantt/route.js
import { createTunnelAndConnect } from '@/lib/dbViaSsh';
import { addDays, isAfter } from 'date-fns';
import { NextResponse } from 'next/server';

export async function GET() {
	let client;

	try {
		client = await createTunnelAndConnect();

		const query = `
     SELECT 
       p.id AS product_id,
       p.label AS product_label,
       ps.id AS step_instance_id,
       ts.name AS step_name,
       ps.time_start,
       EXTRACT(DAY FROM ts.deadlines) AS deadlines_days,
       ps.state_production AS step_state,
       sc.subsequence
     FROM product p
     JOIN steps_in_production ps ON ps.product_id = p.id
     JOIN tech_stages ts ON ps.step_id = ts.id
     JOIN scenario sc ON sc.target_child = ts.id AND sc.scenario = ps.scenario
     WHERE p.state_product = false
     ORDER BY p.id, sc.subsequence;
    `;

		const { rows } = await client.pgClient.query(query);

		const data = {};

		rows.forEach(row => {
			if (!data[row.product_id]) {
				data[row.product_id] = {
					id: row.product_id,
					Label: row.product_label,
					steps: [],
					plannedStart: null,
					plannedEnd: null,
				};
			}

			// Используем Date или null
			const prevSteps = data[row.product_id].steps;
			const start = row.time_start
				? new Date(row.time_start)
				: prevSteps.length
					? prevSteps[prevSteps.length - 1].expectedEnd
					: new Date();

			const duration = Number(row.deadlines_days) || 0;
			const expectedEnd = start ? addDays(start, duration) : null;

			const stepOverdue =
				row.step_state === false && expectedEnd ? isAfter(new Date(), expectedEnd) : false;

			prevSteps.push({
				id: row.step_instance_id,
				StepName: row.step_name,
				Time_start: start,
				Deadline: duration,
				State: row.step_state,
				expectedEnd,
				stepOverdue,
			});
		});

		// Рассчитываем планируемое время начала и конца продукта
		Object.values(data).forEach(product => {
			if (product.steps.length) {
				product.plannedStart = product.steps[0].Time_start;
				product.plannedEnd = product.steps[product.steps.length - 1].expectedEnd;
			}
		});

		// Преобразуем даты в ISO-строки для фронта
		const result = Object.values(data).map(prod => ({
			...prod,
			plannedStart: prod.plannedStart?.toISOString() || null,
			plannedEnd: prod.plannedEnd?.toISOString() || null,
			steps: prod.steps.map(step => ({
				...step,
				Time_start: step.Time_start?.toISOString() || null,
				expectedEnd: step.expectedEnd?.toISOString() || null,
			})),
		}));

		return NextResponse.json(result);
	} catch (err) {
		console.error('Ошибка API /api/gantt:', err);
		return NextResponse.json({ error: 'Ошибка сервера' }, { status: 500 });
	} finally {
		if (client) await client.close();
	}
}


