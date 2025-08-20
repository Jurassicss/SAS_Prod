import { NextResponse } from 'next/server';
import { createTunnelAndConnect } from '@/lib/dbViaSsh';


export async function GET() {
	const client = await createTunnelAndConnect(); // Используем ваш порт туннеля

	try {
		// const result = await client.pgClient.query(`
		//   SELECT 
		//     login, 
		// 	password, 
		// 	roles, 
		// 	telegram_id,
		// 	id
		//   FROM hr.users;
		// `);

		const result = await client.pgClient.query(`
			SELECT 
			  u.login, 
			  u.password, 
			  r.name AS role_name,  -- Получаем название роли вместо ID
			  u.roles AS role_id,   -- Оставляем ID роли, если он нужен
			  u.telegram_id,
			  u.id
			FROM hr.users u
			LEFT JOIN hr.roles r ON u.roles = r.id_roles
		  `);

		await client.close(); // или client.pgClient.end(), или client.release() — зависит от твоей реализации

		return NextResponse.json(result.rows);
	} catch (err) {
		console.error('Ошибка при загрузке этапов:', err);
		return NextResponse.json({ error: 'Ошибка при загрузке этапов' }, { status: 500 });
	}
}



export async function POST(req) {
	const { login, password, roleId, id_telegram } = await req.json();

	if (!login || !password || !roleId) {
		return NextResponse.json({ error: 'Все поля обязательны' }, { status: 400 });
	}

	const parsedRoleId = parseInt(roleId);
	if (isNaN(parsedRoleId)) {
		return NextResponse.json({ error: 'Неверный ID роли' }, { status: 400 });
	}

	// id_telegram — необязательное поле, если нужно — парсим
	const parsedTelegram = id_telegram ? parseInt(id_telegram) : null;

	let client;
	try {
		client = await createTunnelAndConnect();

		const insertQuery = `
		INSERT INTO hr.users (login, password, roles, telegram_id)
		VALUES ($1, $2, $3, $4)
		RETURNING *;
	  `;

		const { rows } = await client.pgClient.query(insertQuery, [
			login.trim(),
			password,
			parsedRoleId,
			parsedTelegram,
		]);

		await client.close();

		return NextResponse.json(rows[0]);
	} catch (error) {
		console.error('Ошибка при добавлении пользователя:', error);
		if (client) await client.close();
		return NextResponse.json({ error: 'Ошибка сервера' }, { status: 500 });
	}
}





