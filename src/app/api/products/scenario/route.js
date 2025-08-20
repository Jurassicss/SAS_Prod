// src/app/api/product/scenario/route.js
import { createTunnelAndConnect } from '@/lib/dbViaSsh';
import { NextResponse } from 'next/server';

export async function PUT(req) {
	const body = await req.json();
	const { productId, scenarioId } = body;

	if (!productId || !scenarioId) {
		return NextResponse.json({ error: 'Missing productId or scenarioId' }, { status: 400 });
	}

	let client;
	try {
		client = await createTunnelAndConnect();

		const { rowCount } = await client.pgClient.query(
			'UPDATE product_essence SET scenario = $1 WHERE id = $2',
			[scenarioId, productId]
		);

		await client.close();

		if (rowCount === 0) {
			return NextResponse.json({ error: 'Product not found' }, { status: 404 });
		}

		return NextResponse.json({ success: true });
	} catch (err) {
		if (client) await client.close();
		console.error(err);
		return NextResponse.json({ error: 'Server error' }, { status: 500 });
	}
}

