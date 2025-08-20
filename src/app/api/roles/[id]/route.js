import { NextResponse } from 'next/server';
import { createTunnelAndConnect } from '@/lib/dbViaSsh';

export async function DELETE(req, { params }) {
	const { id: id_roles } = params;

	if (!id_roles) {
		return NextResponse.json({ error: 'Не указан ID пользователя' }, { status: 400 });
	}

	let client;
	try {
		client = await createTunnelAndConnect();

		// 🧠 Проверка: используется ли эта роль в таблице users
		const usageCheckQuery = `SELECT COUNT(*) FROM hr.users WHERE roles = $1;`;
		const usageResult = await client.pgClient.query(usageCheckQuery, [parseInt(id_roles)]);
		const usageCount = parseInt(usageResult.rows[0].count);

		if (usageCount > 0) {
			await client.close();
			return NextResponse.json({
				error: `Нельзя удалить роль, так как она используется.`,
			}, { status: 409 }); // 409 Conflict — подходит по смыслу
		}

		const deleteQuery = `DELETE FROM hr.roles WHERE id_roles = $1 RETURNING *;`;
		const { rows } = await client.pgClient.query(deleteQuery, [parseInt(id_roles)]);

		await client.close();

		if (rows.length === 0) {
			return NextResponse.json({ error: 'Пользователь не найден' }, { status: 404 });
		}

		return NextResponse.json({ message: 'Пользователь удалён' });
	} catch (error) {
		console.error(error);
		if (client) await client.close();
		return NextResponse.json({ error: 'Ошибка сервера' }, { status: 500 });
	}
}
