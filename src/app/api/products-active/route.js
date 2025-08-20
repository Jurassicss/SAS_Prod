// import { createTunnelAndConnect } from '@/lib/dbViaSsh';
// import { NextResponse } from 'next/server';

// export async function GET() {
// 	let client;
// 	try {
// 		client = await createTunnelAndConnect();

// 		const { rows } = await client.pgClient.query(`
//           SELECT 
//             p."id" AS ID,
//             p."label" AS Label,
//             COALESCE(
//                 json_agg(json_build_object(
//                   'ID', sp."id",
//                   'State', sp.state_production,
//                   'step_id', sp.step_id,
//                   'name', ps.name
//                 ) ORDER BY sp.time_start)
//                 FILTER (WHERE sp."id" IS NOT NULL), '[]'
//             ) AS steps
//           FROM product p
//           LEFT JOIN steps_in_production sp ON sp.product_id = p."id"
//           LEFT JOIN tech_stages ps ON ps."id" = sp.step_id
//           WHERE p.state_product = False 
//           GROUP BY p."id", p."label"
//           ORDER BY p."id"
//         `);

// 		await client.close();
// 		return NextResponse.json(rows);
// 	} catch (e) {
// 		if (client) await client.close();
// 		console.error('Ошибка получения данных продуктов:', e);
// 		return NextResponse.json({ error: 'Ошибка сервера' }, { status: 500 });
// 	}
// }


import { createTunnelAndConnect } from '@/lib/dbViaSsh';
import { NextResponse } from 'next/server';

export async function GET(req) {
	const { searchParams } = new URL(req.url);
	const productId = searchParams.get('id'); // параметр ?id=...

	let client;
	try {
		client = await createTunnelAndConnect();

		const query = `
            SELECT 
                p."id" AS ID,
                p."label" AS Label,
                COALESCE(
                    json_agg(json_build_object(
                        'ID', sp."id",
                        'State', sp.state_production,
                        'step_id', sp.step_id,
                        'name', ps.name
                    ) ORDER BY sp.time_start)
                    FILTER (WHERE sp."id" IS NOT NULL), '[]'
                ) AS steps
            FROM product p
            LEFT JOIN steps_in_production sp ON sp.product_id = p."id"
            LEFT JOIN tech_stages ps ON ps."id" = sp.step_id
            WHERE p.state_product = False
            ${productId ? 'AND p.id = $1' : ''}
            GROUP BY p."id", p."label"
            ORDER BY p."id"
        `;

		const { rows } = await client.pgClient.query(query, productId ? [productId] : []);

		await client.close();

		// Если был запрос по конкретному ID, возвращаем один объект
		return NextResponse.json(productId ? rows[0] ?? {} : rows);
	} catch (e) {
		if (client) await client.close();
		console.error('Ошибка получения данных продуктов:', e);
		return NextResponse.json({ error: 'Ошибка сервера' }, { status: 500 });
	}
}
