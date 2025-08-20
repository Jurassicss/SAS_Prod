// src/app/api/scenario/list/route.js
import { createTunnelAndConnect } from '@/lib/dbViaSsh';
import { NextResponse } from 'next/server';

export async function GET() {
	let client;
	try {
		client = await createTunnelAndConnect();
		const { rows } = await client.pgClient.query(
			'SELECT DISTINCT scenario AS id FROM scenario'
		);
		await client.close();
		return NextResponse.json(rows);
	} catch (e) {
		if (client) await client.close();
		console.error(e);
		return NextResponse.json({ error: 'Ошибка сервера' }, { status: 500 });
	}
}
