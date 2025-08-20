import { createTunnelAndConnect } from '@/lib/dbViaSsh';
import { NextResponse } from 'next/server';

export async function GET(_request, { params }) {
	const productId = (await params)?.id;

	if (!productId) {
		return NextResponse.json({ error: 'Missing product id' }, { status: 400 });
	}

	let client;
	try {
		client = await createTunnelAndConnect();

		// Получаем id_product
		const { rows: products } = await client.pgClient.query(
			`SELECT id_product FROM product WHERE id = $1`,
			[productId]
		);
		if (products.length === 0) {
			await client.close();
			return NextResponse.json({ error: 'Product not found' }, { status: 404 });
		}
		const id_product = products[0].id_product;

		// Получаем scenario из product_essence
		const { rows: essences } = await client.pgClient.query(
			`SELECT scenario FROM product_essence WHERE id = $1`,
			[id_product]
		);
		if (essences.length === 0) {
			await client.close();
			return NextResponse.json({ error: 'Product essence not found' }, { status: 404 });
		}
		const scenarioId = essences[0].scenario;

		// Получаем шаги производства
		// const { rows: steps } = await client.pgClient.query(
		// 	`SELECT sip.step_id AS "StepId", ps.name AS "StepName", sip.state_production
		//      FROM steps_in_production sip
		//      JOIN tech_stages ps ON ps.id = sip.step_id
		//      WHERE sip.product_id = $1`,
		// 	[productId]
		// );

		const { rows: steps } = await client.pgClient.query(
			`SELECT
  sip.step_id AS "StepId",
  ps.name AS "StepName",
  sip.state_production,
  u.login AS "executorLogin"
FROM steps_in_production sip
JOIN tech_stages ps ON ps.id = sip.step_id
LEFT JOIN hr.users u ON u.roles = ps.executor_id
WHERE sip.product_id = $1`,
			[productId]
		);
		// Получаем связи сценария
		const { rows: scenario } = await client.pgClient.query(
			`SELECT target_parent, target_child FROM scenario WHERE scenario = $1`,
			[scenarioId]
		);

		await client.close();

		return NextResponse.json({ steps, scenario });
	} catch (e) {
		if (client) await client.close();
		console.error(e);
		return NextResponse.json({ error: 'Server error' }, { status: 500 });
	}
}

