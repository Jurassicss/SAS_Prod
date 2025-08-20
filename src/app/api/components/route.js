import { createTunnelAndConnect } from '@/lib/dbViaSsh';
import { NextResponse } from 'next/server';

export async function GET() {
	let client;

	try {
		client = await createTunnelAndConnect();

		const result = await client.pgClient.query(`
			SELECT * FROM public.components;
		`);

		await client.close();

		// группируем по типу
		const grouped = result.rows.reduce((acc, component) => {
			const { type } = component;
			if (!acc[type]) acc[type] = [];
			acc[type].push(component);
			return acc;
		}, {});

		return NextResponse.json(grouped);
	} catch (err) {
		console.error('Ошибка при загрузке компонентов:', err);
		if (client) await client.close();
		return NextResponse.json({ error: 'Ошибка сервера' }, { status: 500 });
	}
}
