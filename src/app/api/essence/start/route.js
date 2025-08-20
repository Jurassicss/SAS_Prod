import { createTunnelAndConnect } from '@/lib/dbViaSsh';
import { NextResponse } from 'next/server';




export async function GET() {
	const client = await createTunnelAndConnect(); // Используем ваш порт туннеля

	try {
		const result = await client.pgClient.query(`
          SELECT 
            id, 
			label, 
			components
          FROM public.product_essence
		  WHERE scenario IS NOT NULL;
        `);

		await client.close(); // или client.pgClient.end(), или client.release() — зависит от твоей реализации

		return NextResponse.json(result.rows);
	} catch (err) {
		console.error('Ошибка при загрузке этапов:', err);
		return NextResponse.json({ error: 'Ошибка при загрузке этапов' }, { status: 500 });
	}
}