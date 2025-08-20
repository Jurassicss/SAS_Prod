import { createTunnelAndConnect } from '@/lib/dbViaSsh';
import { NextResponse } from 'next/server';

// Получить этап пользователя по продукту
export async function GET(_, { params }) {
	const { productUserId } = await (params); // ✅ здесь теперь правильное имя

	const client = await createTunnelAndConnect();
	const numericId = parseInt(productUserId, 10);

	if (isNaN(numericId)) {
		return NextResponse.json({ error: 'Некорректный product_id' }, { status: 400 });
	}

	try {
		// const result = await client.pgClient.query(`
		// 	SELECT 
		// 	  s.step_id AS step_id, 
		// 	  s.state_production AS state, 
		// 	  s.product_id, 
		// 	  t.name, 
		// 	  r.name AS role_name,               -- Название роли ответственного
		// 	  u.login AS executor_login,          -- Логин пользователя
		// 	  t.executor_id AS executor_id        -- ID исполнителя (опционально)
		// 	FROM steps_in_production s
		// 	JOIN tech_stages t ON s.step_id = t.id
		// 	LEFT JOIN hr.roles r ON t.executor_id = r.id_roles  -- Соединяем с таблицей ролей
		// 	LEFT JOIN hr.users u ON u.roles = r.id_roles        -- Соединяем с таблицей пользователей
		// 	WHERE s.product_id = $1
		//   `, [numericId]);

		const result = await client.pgClient.query(`
			SELECT 
			  s.step_id AS step_id, 
			  s.state_production AS state, 
			  s.product_id, 
			  t.name, 
			  r.name AS executor  -- Только название роли
			FROM steps_in_production s
			JOIN tech_stages t ON s.step_id = t.id
			LEFT JOIN hr.roles r ON t.executor_id = r.id_roles
			WHERE s.product_id = $1
		  `, [numericId]);

		await client.close();
		return NextResponse.json(result.rows);
	} catch (e) {
		console.error(e);
		await client.close();
		return NextResponse.json({ error: 'Ошибка загрузки этапа' }, { status: 500 });
	}
}
// import { createTunnelAndConnect } from '@/lib/dbViaSsh';
// import { NextResponse } from 'next/server';

// export async function GET(req, { params }) {
// 	const productId = params.id;
// 	const { searchParams } = new URL(req.url);
// 	const executor = searchParams.get('executor');

// 	if (!productId) {
// 		return NextResponse.json({ error: 'ID изделия не передан' }, { status: 400 });
// 	}

// 	let client;
// 	try {
// 		client = await createTunnelAndConnect();

// 		const query = `
// 			SELECT 
// 				ps.name,
// 				sp.id,
// 				sp.step_id,
// 				sp.state_production AS state,
// 				ps.executor
// 			FROM steps_in_production sp
// 			JOIN tech_stages ps ON ps.id = sp.step_id
// 			WHERE sp.product_id = $1
// 			ORDER BY sp.time_start
// 		`;

// 		const { rows } = await client.pgClient.query(query, [productId]);
// 		await client.close();

// 		if (executor === 'admin') {
// 			return NextResponse.json(rows); // массив шагов
// 		}

// 		const userStep = rows.find(r => r.executor === executor);

// 		if (!userStep) {
// 			return NextResponse.json([], { status: 200 });
// 		}

// 		return NextResponse.json([userStep]);
// 	} catch (e) {
// 		if (client) await client.close();
// 		console.error('Ошибка получения данных по QR:', e);
// 		return NextResponse.json({ error: 'Ошибка сервера' }, { status: 500 });
// 	}
// }



// Обновить состояние этапа
export async function POST(req, { params }) {
	const { productUserId } = params; // ✅ заменили id на productUserId
	const { step_id } = await req.json();

	const client = await createTunnelAndConnect();
	try {
		await client.pgClient.query(`
          UPDATE steps_in_production
          SET state_production = true
          WHERE product_id = $1 AND step_id = $2
        `, [productUserId, step_id]);

		await client.close();
		return NextResponse.json({ success: true });
	} catch (e) {
		console.error(e);
		await client.close();
		return NextResponse.json({ error: 'Ошибка обновления состояния' }, { status: 500 });
	}
}
