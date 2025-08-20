import { NextResponse } from 'next/server';
import { createTunnelAndConnect } from '@/lib/dbViaSsh';

export async function GET(_, { params }){
	const { productUserId } = await (params);
  	let client;

  	try {
  	  client = await createTunnelAndConnect();
	
  	  const { rows } = await client.pgClient.query(`
		SELECT
		  s.id,
		  s.step_id,
		  ts.name,
		  r.name AS executor_role_name,  -- Название роли исполнителя
		  u.login AS executor_login,     -- Логин пользователя-исполнителя
		  s.state_production AS state
		FROM steps_in_production s
		JOIN tech_stages ts ON ts.id = s.step_id
		LEFT JOIN hr.roles r ON r.id_roles = ts.executor_id  -- Соединяем по executor_id
		LEFT JOIN hr.users u ON u.roles = r.id_roles        -- Ищем пользователя с этой ролью
		WHERE s.product_id = $1
		ORDER BY s.time_start
	  `, [productUserId]);
	
  	  await client.close();
  	  return NextResponse.json(rows || []);
  	} catch (e) {
  	  console.error(e);
  	  if (client) await client.close();
  	  return NextResponse.json({ error: 'Ошибка сервера' }, { status: 500 });
  	}
}

