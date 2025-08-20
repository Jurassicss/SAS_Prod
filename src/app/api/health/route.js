// src/app/api/health/route.js

export async function GET(req) {
	try {
	  // Здесь можно проверить подключение к БД или другой сервер
	  // await db.query('SELECT 1'); 
  
	  return new Response(JSON.stringify({ status: "ok" }), {
		status: 200,
		headers: { "Content-Type": "application/json" },
	  });
	} catch (err) {
	  return new Response(JSON.stringify({ status: "error" }), {
		status: 500,
		headers: { "Content-Type": "application/json" },
	  });
	}
  }
  