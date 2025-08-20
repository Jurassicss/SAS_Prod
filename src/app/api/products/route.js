import { createTunnelAndConnect } from '@/lib/dbViaSsh';
import { NextResponse } from 'next/server';

export async function GET() {
	let client;
	try {
		client = await createTunnelAndConnect();

		const { rows } = await client.pgClient.query(
			`SELECT "id", "label", "state_product" FROM product ORDER BY id LIMIT 100`
		);

		await client.close();
		return NextResponse.json(rows);
	} catch (e) {
		if (client) await client.close();
		console.error('Ошибка API /products:', e);
		return NextResponse.json({ error: 'Ошибка сервера' }, { status: 500 });
	}
}