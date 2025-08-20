import { createTunnelAndConnect } from '@/lib/dbViaSsh';
import { NextResponse } from 'next/server';


export async function GET() {
	const client = await createTunnelAndConnect(); // Используем ваш порт туннеля

	try {
		const result = await client.pgClient.query(`
			SELECT 
			  ts.id AS "ID",
			  ts.name AS "Name",
			  ts.deadlines AS "Deadlines",
			  r.name AS "Responsible"  -- Получаем название роли вместо ID
			  -- ts.executor_id AS "Responsible_ID"  -- Раскомментируйте, если нужно сохранить ID
			FROM tech_stages ts
			LEFT JOIN hr.roles r ON ts.executor_id = r.id_roles  -- Соединяем с таблицей ролей
			ORDER BY ts.id;
		  `);

		await client.close(); // или 
		// client.pgClient.end()
		// или client.release() — зависит от твоей реализации

		return NextResponse.json(result.rows);
	} catch (err) {
		if (client) await client.close();
		console.error('Ошибка при загрузке этапов:', err);
		return NextResponse.json({ error: 'Ошибка при загрузке этапов' }, { status: 500 });
	}
}
