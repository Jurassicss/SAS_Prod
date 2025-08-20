import { createTunnelAndConnect } from '@/lib/dbViaSsh';
import { NextResponse } from 'next/server';

export async function GET(req) {
	const { searchParams } = new URL(req.url);
	const executor = searchParams.get('executor');
	const client = await createTunnelAndConnect();

	try {
		const { rows } = await client.pgClient.query(`
  	    	SELECT sip."Product_id", sip."Step_id", ts.name
  	    	FROM steps_in_production sip
  	    	JOIN tech_stages ts ON ts.id = sip."Step_id"
  	    	WHERE sip.state = false AND ts.executor = $1
  	  `, [executor]);

		await client.close();
		return NextResponse.json(rows);
	} catch (e) {
		await client.close();
		return NextResponse.json({ error: e.message }, { status: 500 });
	}
}

export async function POST(req) {
	const { productId, stepId } = await req.json();
	const client = await createTunnelAndConnect();

	try {
		await client.pgClient.query(`
  	    UPDATE steps_in_production 
  	    SET state = true 
  	    WHERE "Product_id" = $1 AND "Step_id" = $2
  	  `, [productId, stepId]);

		await client.close();
		return NextResponse.json({ success: true });
	} catch (e) {
		await client.close();
		return NextResponse.json({ error: e.message }, { status: 500 });
	}
}
