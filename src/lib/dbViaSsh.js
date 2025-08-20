
// import { Client as PgClient } from 'pg';
// import { Client as SSHClient } from 'ssh2';
// import getPort from 'get-port';
// import net from 'net';
// import { sshConfig, pgConfig } from './config.js'; // путь корректируй под свой проект
// import { Pool } from 'pg';

// let cachedConnection = null;

// export async function createTunnelAndConnect(preferredPort = 54330) {
// 	if (cachedConnection) return cachedConnection;

// 	const portsRange = Array.from({ length: 101 }, (_, i) => preferredPort + i);
// 	const tunnelPort = await getPort({ port: portsRange });

// 	return new Promise((resolve, reject) => {
// 		const ssh = new SSHClient();

// 		ssh.on('ready', () => {
// 			const server = net.createServer((clientSocket) => {
// 				ssh.forwardOut(
// 					clientSocket.remoteAddress || '127.0.0.1',
// 					clientSocket.remotePort || 0,
// 					'localhost',
// 					5432,
// 					(err, stream) => {
// 						if (err) {
// 							clientSocket.destroy();
// 							return;
// 						}
// 						clientSocket.pipe(stream).pipe(clientSocket);
// 					}
// 				);
// 			});

// 			server.listen(tunnelPort, '127.0.0.1', async () => {
// 				console.log(`✅ Tunnel listening on 127.0.0.1:${tunnelPort}`);

// 				const pgClient = new PgClient({
// 					...pgConfig,
// 					port: tunnelPort,
// 				});

// 				try {
// 					await pgClient.connect();

// 					const close = async () => {
// 						await pgClient.end();
// 						ssh.end();
// 						server.close();
// 						cachedConnection = null;
// 					};

// 					cachedConnection = { pgClient, close };
// 					resolve(cachedConnection);
// 				} catch (err) {
// 					ssh.end();
// 					server.close();
// 					reject(err);
// 				}
// 			});
// 		});

// 		ssh.on('error', (err) => {
// 			reject(err);
// 		});

// 		ssh.connect(sshConfig);
// 	});
// }



import { Pool } from 'pg';
import { Client as SSHClient } from 'ssh2';
import getPort from 'get-port';
import net from 'net';
import { sshConfig, pgConfig } from './config.js'; // путь корректируй под свой проект

let cachedConnection = null;

// export async function createTunnelAndConnect(preferredPort = 54330) {
// 	if (cachedConnection) return cachedConnection;

// 	const portsRange = Array.from({ length: 101 }, (_, i) => preferredPort + i);
// 	const tunnelPort = await getPort({ port: portsRange });

// 	return new Promise((resolve, reject) => {
// 		const ssh = new SSHClient();

// 		ssh.on('ready', () => {
// 			const server = net.createServer((clientSocket) => {
// 				ssh.forwardOut(
// 					clientSocket.remoteAddress || '127.0.0.1',
// 					clientSocket.remotePort || 0,
// 					'localhost',
// 					5432,
// 					(err, stream) => {
// 						if (err) {
// 							clientSocket.destroy();
// 							return;
// 						}
// 						clientSocket.pipe(stream).pipe(clientSocket);
// 					}
// 				);
// 			});

// 			server.listen(tunnelPort, '127.0.0.1', async () => {
// 				console.log(`✅ Tunnel listening on 127.0.0.1:${tunnelPort}`);

// 				const pgClient = new Pool({
// 					...pgConfig,
// 					port: tunnelPort,
// 				});

// 				try {
// 					// проверяем соединение, вызывая `connect` и сразу `release`
// 					const client = await pgClient.connect();
// 					client.release();

// 					const close = async () => {
// 						await pgClient.end();
// 						ssh.end();
// 						server.close();
// 						cachedConnection = null;
// 					};

// 					cachedConnection = { pgClient, close };
// 					resolve(cachedConnection);
// 				} catch (err) {
// 					ssh.end();
// 					server.close();
// 					reject(err);
// 				}
// 			});
// 		});

// 		ssh.on('error', (err) => {
// 			reject(err);
// 		});

// 		ssh.connect(sshConfig);
// 	});
// }


export async function createTunnelAndConnect(preferredPort = 54330) {
	if (cachedConnection) return cachedConnection;

	const portsRange = Array.from({ length: 101 }, (_, i) => preferredPort + i);
	const tunnelPort = await getPort({ port: portsRange });

	return new Promise((resolve, reject) => {
		const ssh = new SSHClient();

		ssh.on('ready', () => {
			const server = net.createServer((clientSocket) => {
				ssh.forwardOut(
					clientSocket.remoteAddress || '127.0.0.1',
					clientSocket.remotePort || 0,
					'localhost',
					5432,
					(err, stream) => {
						if (err) {
							clientSocket.destroy();
							return;
						}
						clientSocket.pipe(stream).pipe(clientSocket);
					}
				);
			});

			server.listen(tunnelPort, '127.0.0.1', async () => {
				console.log(`✅ Tunnel listening on 127.0.0.1:${tunnelPort}`);

				const pgClient = new Pool({
					...pgConfig,
					port: tunnelPort,
				});

				let isClosed = false; // флаг для безопасного закрытия

				try {
					const client = await pgClient.connect();
					client.release();

					const close = async () => {
						if (!isClosed) {
							try {
								await pgClient.end();
							} catch (e) {
								console.error('Ошибка при закрытии pgClient:', e);
							}
							ssh.end();
							server.close();
							cachedConnection = null;
							isClosed = true;
						}
					};

					cachedConnection = { pgClient, close };
					resolve(cachedConnection);
				} catch (err) {
					ssh.end();
					server.close();
					reject(err);
				}
			});
		});

		ssh.on('error', (err) => {
			reject(err);
		});

		ssh.connect(sshConfig);
	});
}
