import { createTunnelAndConnect } from '@/lib/dbViaSsh';
import { NextResponse } from 'next/server';

export async function GET() {
	let client;
	try {
		client = await createTunnelAndConnect();

		const { rows } = await client.pgClient.query(`
            SELECT DISTINCT rs.scenario 
            FROM router_scenario rs
            ORDER BY rs.scenario ASC
        `);

		return NextResponse.json(rows.map(r => r.scenario));
	} catch (e) {
		console.error('Error fetching scenarios:', e);
		return NextResponse.json(
			{ error: 'Failed to fetch scenarios' },
			{ status: 500 }
		);
	} finally {
		if (client) {
			try {
				await client.close();
			} catch (closeErr) {
				// Если уже закрыт — игнорируем
				if (!/end on pool more than once/i.test(closeErr.message)) {
					console.error('Error closing connection:', closeErr);
				}
			}
		}
	}
}
