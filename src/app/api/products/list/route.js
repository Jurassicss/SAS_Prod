// src/app/api/products/list/route.js
import { createTunnelAndConnect } from '@/lib/dbViaSsh';
import { NextResponse } from 'next/server';

export async function GET() {
	let client;
	try {
		client = await createTunnelAndConnect();
		const { rows } = await client.pgClient.query(
			'SELECT id, label FROM product_essence'
		);
		await client.close();
		return NextResponse.json(rows);
	} catch (e) {
		if (client) await client.close();
		console.error(e);
		return NextResponse.json({ error: 'Ошибка сервера' }, { status: 500 });
	}
}
