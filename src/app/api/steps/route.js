import { createTunnelAndConnect } from '@/lib/dbViaSsh';
import { NextResponse } from 'next/server';

export async function POST(req) {
	let client;
	try {
		const { stepId } = await req.json();

		if (!stepId || typeof stepId !== 'number') {
			return NextResponse.json({ error: 'Неверный ID' }, { status: 400 });
		}

		client = await createTunnelAndConnect();

		await client.pgClient.query(`
          UPDATE steps_in_production
          SET state_production = true
          WHERE "id" = $1 AND state_production = false
        `, [stepId]);

		await client.close();

		return NextResponse.json({ success: true });
	} catch (e) {
		if (client) await client.close();
		console.error('Ошибка обновления шага:', e);
		return NextResponse.json({ error: 'Ошибка сервера' }, { status: 500 });
	}
}



// import { createTunnelAndConnect } from '@/lib/dbViaSsh';
// import { NextResponse } from 'next/server';

// export async function POST(req) {
// 	let client;
// 	try {
// 		const { stepId } = await req.json();

// 		if (!stepId || typeof stepId !== 'number') {
// 			return NextResponse.json({ error: 'Неверный ID' }, { status: 400 });
// 		}

// 		client = await createTunnelAndConnect();

// 		// Обновляем шаг
// 		await client.pgClient.query(`
//       UPDATE steps_in_production
//       SET state_production = true
//       WHERE "id" = $1 AND state_production = false
//     `, [stepId]);

// 		// Получаем продукт, которому принадлежит шаг
// 		const { rows: productRows } = await client.pgClient.query(`
//       SELECT
//         p."id" AS ID,
//         p."label" AS Label,
//         COALESCE(
//           json_agg(json_build_object(
//             'ID', sp."id",
//             'State', sp.state_production,
//             'step_id', sp.step_id,
//             'name', ps.name
//           ) ORDER BY sp.time_start)
//           FILTER (WHERE sp."id" IS NOT NULL), '[]'
//         ) AS steps
//       FROM product p
//       LEFT JOIN steps_in_production sp ON sp.product_id = p."id"
//       LEFT JOIN tech_stages ps ON ps."id" = sp.step_id
//       WHERE p.state_product = false AND p."id" = (
//         SELECT product_id FROM steps_in_production WHERE id = $1
//       )
//       GROUP BY p."id", p."label"
//       LIMIT 1
//     `, [stepId]);

// 		await client.close();

// 		const updatedProduct = productRows[0] ?? null;

// 		if (!updatedProduct) {
// 			return NextResponse.json({ error: 'Продукт не найден' }, { status: 404 });
// 		}

// 		return NextResponse.json({ success: true, product: updatedProduct });
// 	} catch (e) {
// 		if (client) await client.close();
// 		console.error('Ошибка обновления шага:', e);
// 		return NextResponse.json({ error: 'Ошибка сервера' }, { status: 500 });
// 	}
// }
