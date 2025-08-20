import { createTunnelAndConnect } from '@/lib/dbViaSsh';
import { NextResponse } from 'next/server';

export async function GET() {
	const client = await createTunnelAndConnect();
	try {
		const result = await client.pgClient.query(`
			SELECT 
			  sp.product_id as product_id,
			  sp.step_id as step_id,
			  ts.name,
			  ts.deadlines,
			  r.name AS executor_name,  -- Имя исполнителя из таблицы roles
			  ts.executor_id,           -- Оставляем ID исполнителя, если нужно
			  sp.time_start AS time_start,
			  product.label AS name_product,
			  -- вычислим оставшиеся дни
			  GREATEST(
				  0,
				  FLOOR(EXTRACT(EPOCH FROM (ts.deadlines - (now() - sp.time_start))) / 86400)
				) AS days_left
			FROM steps_in_production sp 
			JOIN tech_stages ts ON ts.id = sp.step_id
			JOIN product ON product.id = sp.product_id
			LEFT JOIN hr.roles r ON ts.executor_id = r.id_roles  -- JOIN с таблицей roles
			WHERE sp.state_production = false
		  `);



		await client.close();
		return NextResponse.json(result.rows);
	} catch (e) {
		console.error('GET user-steps error:', e);
		await client.close();
		return NextResponse.json({ error: 'Ошибка при загрузке' }, { status: 500 });
	}
}

export async function POST(req) {
	const { productId, stepId } = await req.json();
	const client = await createTunnelAndConnect();

	try {
		await client.pgClient.query(`
            UPDATE steps_in_production
            SET state_production = true
            WHERE product_id = $1 AND step_id = $2
        `, [productId, stepId]);

		await client.close();
		return NextResponse.json({ success: true });
	} catch (e) {
		console.error('POST user-steps error:', e);
		await client.close();
		return NextResponse.json({ error: 'Ошибка при обновлении' }, { status: 500 });
	}
}
