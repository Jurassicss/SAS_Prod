import { createServer } from 'https';
import { readFileSync } from 'fs';
import express from 'express';
import { createProxyMiddleware } from 'http-proxy-middleware';

const app = express();

app.use(
    '/',
    createProxyMiddleware({
        target: 'http://localhost:3000',
        changeOrigin: true,
        secure: false,
    })
);

const options = {
    key: readFileSync('./192.168.0.162-key.pem'),
    cert: readFileSync('./192.168.0.162.pem'),
};

createServer(options, app).listen(3443, () => {
    console.log('✅ HTTPS Proxy запущен на: https://192.168.0.162:3443');
});