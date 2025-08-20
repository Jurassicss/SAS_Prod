import { NextResponse } from 'next/server';
import { createTunnelAndConnect } from '@/lib/dbViaSsh';

export async function DELETE(req, { params }) {
	const { id } = params;

	if (!id) {
		return NextResponse.json({ error: 'Не указан ID пользователя' }, { status: 400 });
	}

	let client;
	try {
		client = await createTunnelAndConnect();

		const deleteQuery = `DELETE FROM hr.users WHERE id = $1 RETURNING *;`;
		const { rows } = await client.pgClient.query(deleteQuery, [parseInt(id)]);

		await client.close();

		if (rows.length === 0) {
			return NextResponse.json({ error: 'Пользователь не найден' }, { status: 404 });
		}

		return NextResponse.json({ message: 'Пользователь удалён' });
	} catch (error) {
		console.error(error);
		if (client) await client.close();

		// Обработка специфической ошибки из триггера или функции
		if (
			error.code === 'P0001' &&
			error.message.includes('Удаление пользователя с id=1 запрещено')
		) {
			return NextResponse.json(
				{ error: 'Удаление основного администратора запрещено' },
				{ status: 400 }
			);
		}

		return NextResponse.json({ error: 'Ошибка сервера' }, { status: 500 });
	}
}
