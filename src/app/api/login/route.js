import { NextResponse } from 'next/server';
import { createTunnelAndConnect } from '@/lib/dbViaSsh';
import bcrypt from 'bcrypt';

export async function POST(req) {
  const { username, password } = await req.json();
  const client = await createTunnelAndConnect();

  try {
    const { rows } = await client.pgClient.query(
      `SELECT u.login, u.password, r.name as role_name
       FROM hr.users u
       JOIN hr.roles r ON r.id_roles = u.roles
       WHERE u.login = $1`,
      [username]
    );

    if (rows.length === 0) {
      await client.close();
      return NextResponse.json({ error: 'User not found' }, { status: 401 });
    }

    const user = rows[0];
    // Используйте либо прямое сравнение, либо bcrypt.compare
    const isValid = password === user.password; 
    // ИЛИ если пароли хешированы:
    // const isValid = await bcrypt.compare(password, user.password);

    if (!isValid) {
      await client.close();
      return NextResponse.json({ error: 'Invalid password' }, { status: 401 });
    }

    await client.close();
    
    return NextResponse.json({
      username: user.login, // используем login из БД
      roles: [user.role_name], // используем role_name из запроса
    });
  } catch (err) {
    console.error(err);
    await client.close();
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}