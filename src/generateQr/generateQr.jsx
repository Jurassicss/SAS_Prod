import QRCode from 'qrcode';

export async function generateQr(productId) {
  // const url = `${process.env.NEXT_PUBLIC_BASE_URL}/protect/qr/${productId}`;
  const url = `192.168.0.162:3000/protect/qr/${productId}`;
  return await QRCode.toDataURL(url);
}