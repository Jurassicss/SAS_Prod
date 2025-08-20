import { createTunnelAndConnect } from '@/lib/dbViaSsh';
import { NextResponse } from 'next/server';

export async function DELETE(req, { params }) {
	const { id } = params;

	if (!id) {
		return NextResponse.json({ error: 'Не указан ID' }, { status: 400 });
	}

	let client;
	try {
		client = await createTunnelAndConnect();

		const result = await client.pgClient.query(
			`DELETE FROM public.product_essence WHERE id = $1 RETURNING *;`,
			[parseInt(id)]
		);

		await client.close();

		if (result.rowCount === 0) {
			return NextResponse.json({ error: 'Изделие не найдено' }, { status: 404 });
		}

		return NextResponse.json({ message: 'Изделие удалено' });
	} catch (err) {
		console.error('Ошибка при удалении essence:', err);
		if (client) await client.close();
		return NextResponse.json({ error: 'Ошибка сервера' }, { status: 500 });
	}
}
