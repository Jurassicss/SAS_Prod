import { createTunnelAndConnect } from '@/lib/dbViaSsh';
import { NextResponse } from 'next/server';

// GET /api/scenarios/[id] - Получение данных сценария
// export async function GET(_, { params }) {
// 	const scenarioId = (await params)?.id;
// 	let client;
// 	try {

// 		client = await createTunnelAndConnect();


// 		// Получаем узлы графа
// 		const nodesQuery = `
// 		    SELECT ps.*, ps.executor_id 
// 		    FROM tech_stages ps
// 		    JOIN scenario s ON ps.id = s.target_child OR ps.id = s.target_parent
// 		    WHERE s.scenario = $1
// 		    GROUP BY ps."id"
// 		`;
// 		const nodesResult = await client.pgClient.query(nodesQuery, [scenarioId]);

// 		// Получаем связи графа
// 		const edgesQuery = `
//             SELECT * FROM scenario 
//             WHERE scenario = $1
//         `;
// 		const edgesResult = await client.pgClient.query(edgesQuery, [scenarioId]);

// 		await client.close();

// 		return NextResponse.json({
// 			// nodes: nodesResult.rows,
// 			edges: edgesResult.rows
// 		});
// 	} catch (e) {
// 		if (client) await client.close();
// 		console.error('Error fetching scenario:', e);
// 		return NextResponse.json(
// 			{ error: 'Failed to fetch scenario data' },
// 			{ status: 500 }
// 		);
// 	}
// }


// export async function GET(_, { params }) {
// 	const scenarioId = (await params)?.id;
// 	let client;
// 	try {
// 		client = await createTunnelAndConnect();

// 		// Получаем узлы графа
// 		const nodesQuery = `
// 		    SELECT ps.*, ps.executor_id 
// 		    FROM tech_stages ps
// 		    JOIN scenario s ON ps.id = s.target_child OR ps.id = s.target_parent
// 		    WHERE s.scenario = $1
// 		    GROUP BY ps.id
// 		`;
// 		const nodesResult = await client.pgClient.query(nodesQuery, [scenarioId]);
// 		// Получаем связи графа
// 		const edgesQuery = `
//             SELECT * FROM scenario 
//             WHERE scenario = $1
//         `;
// 		const edgesResult = await client.pgClient.query(edgesQuery, [scenarioId]);

// 		// Получаем роли
// 		const rolesResult = await client.pgClient.query(`
// 			SELECT id_roles, name FROM hr.roles
// 		`);

// 		// Вставляем роли в каждый узел
// 		const roles = rolesResult.rows;
// 		const nodesWithRoles = nodesResult.rows.map(node => ({
// 			...node,
// 			roles
// 		}));
// 		console.log(nodesWithRoles)
// 		await client.close();

// 		return NextResponse.json({
// 			nodes: nodesWithRoles,
// 			edges: edgesResult.rows
// 		});
// 	} catch (e) {
// 		if (client) await client.close();
// 		console.error('Error fetching scenario:', e);
// 		return NextResponse.json(
// 			{ error: 'Failed to fetch scenario data' },
// 			{ status: 500 }
// 		);
// 	}
// }


export async function GET(_, { params }) {
	const { id: scenarioId } = await params;
	let client;

	try {
		client = await createTunnelAndConnect();

		// Получаем узлы с присоединёнными ролями
		const nodesQuery = `
      SELECT
        ps.id,
        ps.name,
        ps.deadlines,
        ps.executor_id,
        r.name AS role_name  -- имя роли из hr.roles
      FROM tech_stages ps
      JOIN scenario s ON ps.id = s.target_child OR ps.id = s.target_parent
      LEFT JOIN hr.roles r ON ps.executor_id = r.id_roles
      WHERE s.scenario = $1
      GROUP BY ps.id, ps.name, ps.deadlines, ps.executor_id, r.name
      ORDER BY ps.id
    `;

		const nodesResult = await client.pgClient.query(nodesQuery, [scenarioId]);

		// Получаем связи графа (рёбра)
		const edgesQuery = `
      SELECT * FROM scenario WHERE scenario = $1 ORDER BY target_parent, target_child
    `;

		const edgesResult = await client.pgClient.query(edgesQuery, [scenarioId]);

		await client.close();
		return NextResponse.json({
			nodes: nodesResult.rows,
			edges: edgesResult.rows,
		});
	} catch (error) {
		if (client) await client.close();
		console.error('Error fetching scenario:', error);
		return NextResponse.json(
			{ error: 'Failed to fetch scenario data' },
			{ status: 500 }
		);
	}
}


// POST /api/scenarios/[id] - Сохранение сценария
export async function POST(request, { params }) {


	let client;
	try {
		client = await createTunnelAndConnect(54333);
		const scenarioId = (await params)?.id;
		const { nodes, edges } = await request.json();


		await client.pgClient.query(`
			INSERT INTO router_scenario (scenario)
			VALUES ($1)
			ON CONFLICT DO NOTHING
		  `, [scenarioId]);

		await client.pgClient.query('BEGIN');

		if (!Array.isArray(nodes)) {
			throw new Error("nodes is not iterable");
		}
		
		// Обновляем или создаем узлы
		for (const node of nodes) {
			await client.pgClient.query(`
			  INSERT INTO tech_stages ("id", name, deadlines, executor_id)
			  VALUES ($1, $2, ($3 || ' days')::interval, $4)
			  ON CONFLICT ("id") DO UPDATE
			  SET name = $2, deadlines = ($3 || ' days')::interval, executor_id = $4
			`, [node.id, node.name, node.deadlines, node.responsible]);
		}

		// Удаляем старые связи
		await client.pgClient.query(`
      DELETE FROM scenario WHERE scenario = $1
    `, [scenarioId]);

		// Добавляем новые связи
		for (const edge of edges) {
			await client.pgClient.query(`
        INSERT INTO scenario (scenario, target_child, target_parent, subsequence)
        VALUES ($1, $2, $3, $4)
      `, [scenarioId, edge.target, edge.source, edge.subsequence || 0]);
		}

		await client.pgClient.query('COMMIT');
		await client.close();

		return NextResponse.json({ success: true });
	} catch (e) {
		if (client) {
			await client.pgClient.query('ROLLBACK');
			await client.close();
		}
		console.error('Error saving scenario:', e);
		return NextResponse.json(
			{ error: 'Failed to save scenario' },
			{ status: 500 }
		);
	}
}

export async function DELETE(_, { params }) {
	const id = (await params)?.id;

	if (!id) {
		return NextResponse.json({ error: 'ID is required' }, { status: 400 });
	}

	let client;
	try {
		client = await createTunnelAndConnect();

		await client.pgClient.query('BEGIN');
		// Удаляем из scenario
		await client.pgClient.query('DELETE FROM scenario WHERE scenario = $1', [id]);

		// Удаляем из router_scenario
		await client.pgClient.query('DELETE FROM router_scenario WHERE scenario = $1', [id]);



		await client.pgClient.query('COMMIT');

		await client.close();

		return NextResponse.json({ message: `Scenario ${id} deleted from router_scenario and scenario` }, { status: 200 });
	} catch (e) {
		if (client) {
			try {
				await client.pgClient.query('ROLLBACK');
			} catch { }
			await client.close();
		}
		console.error('Delete error:', e);
		return NextResponse.json({ error: 'Failed to delete' }, { status: 500 });
	}
}
