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
          FROM public.product_essence;
        `);

		await client.close(); // или client.pgClient.end(), или client.release() — зависит от твоей реализации

		return NextResponse.json(result.rows);
	} catch (err) {
		console.error('Ошибка при загрузке этапов:', err);
		return NextResponse.json({ error: 'Ошибка при загрузке этапов' }, { status: 500 });
	}
}




export async function POST(req) {
	let client;
	try {
		console.log("true")
		const body = await req.json();
		console.log('Получено тело:', body);

		const { essences } = body;

		if (!Array.isArray(essences) || essences.length === 0) {
			return NextResponse.json({ error: 'Некорректные данные: ожидался массив essences' }, { status: 400 });
		}

		client = await createTunnelAndConnect();

		for (const essence of essences) {
			const { label, components } = essence;

			if (!label || !components || typeof components !== 'object' || Array.isArray(components)) {
				return NextResponse.json({ error: 'Некорректные данные в одном из изделий' }, { status: 400 });
			}

			console.log('Добавляю изделие:', label, components);

			await client.pgClient.query(
				`INSERT INTO public.product_essence (label, components) VALUES ($1, $2::jsonb)`,
				[label, components]
			);
		}

		await client.close();

		return NextResponse.json({ success: true });
	} catch (e) {
		console.error('Ошибка при добавлении essence:', e);
		if (client) await client.close();

		if (e.code === '23505') {
			return NextResponse.json({ error: 'Такое изделие уже существует' }, { status: 400 });
		}

		return NextResponse.json({ error: 'Ошибка сервера' }, { status: 500 });
	}
}


