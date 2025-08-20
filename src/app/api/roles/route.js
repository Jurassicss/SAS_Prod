import { NextResponse } from 'next/server';
import { createTunnelAndConnect } from '@/lib/dbViaSsh';

export async function POST(req) {
	const name = await req.text(); // <-- читаем текст напрямую

	if (!name || !name.trim()) {
		return NextResponse.json({ error: 'Название роли обязательно' }, { status: 400 });
	}

	let client;
	try {
		client = await createTunnelAndConnect();

		const insertQuery = `
  	  	  	INSERT INTO hr.roles ("name")
			VALUES ($1)
			RETURNING *;
  	  	`;

		const { rows } = await client.pgClient.query(insertQuery, [name.trim()]);
		await client.close();

		// Сериализуем BigInt, если надо
		const result = JSON.parse(JSON.stringify(rows[0], (_, v) =>
			typeof v === 'bigint' ? Number(v) : v
		));

		return NextResponse.json(result);
	} catch (error) {
		console.error(error);
		if (client) await client.close();
		return NextResponse.json({ error: 'Ошибка сервера' }, { status: 500 });
	}
}


export async function GET() {
	const client = await createTunnelAndConnect();

	try {
		const result = await client.pgClient.query(`
		SELECT 
		  name,
		  id_roles
		FROM hr.roles;
	  `);

		// НЕ вызывать release у пула!

		// Если хочешь закрыть соединение (туннель и пул), вызывай:
		// await client.close();

		return NextResponse.json(result.rows);
	} catch (err) {
		console.error('Ошибка при загрузке этапов:', err);
		return NextResponse.json({ error: 'Ошибка при загрузке этапах' }, { status: 500 });
	}
}


