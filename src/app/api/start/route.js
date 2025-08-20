import { createTunnelAndConnect } from '@/lib/dbViaSsh';
import { NextResponse } from 'next/server';

export async function POST(req) {
	const { id_product, label, quantity, customer, printKTP } = await req.json();

	if (!id_product || !quantity || !customer) {
		return NextResponse.json({ error: 'Неверные данные' }, { status: 400 });
	}

	const client = await createTunnelAndConnect();

	try {
		let createdCount = 0;
		console.log('label:', label);
		console.log('client:', customer);
		console.log('id_product:', id_product);

		for (let i = 0; i < quantity; i++) {
			await client.pgClient.query(`
        INSERT INTO product (id_product, client, label )
        VALUES ($1, $2, $3)
      `, [id_product, customer, label]);

			createdCount++;
		}

		await client.close();

		return NextResponse.json({ count: createdCount });
	} catch (err) {
		console.error('Ошибка создания продукта:', err);
		return NextResponse.json({ error: 'Ошибка создания продукта' }, { status: 500 });
	}
}
