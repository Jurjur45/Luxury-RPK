import { NextResponse } from 'next/server';
import crypto from 'crypto';

const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
const apiKey = process.env.CLOUDINARY_API_KEY;
const apiSecret = process.env.CLOUDINARY_API_SECRET;

const extractPublicId = (url: string) => {
  try {
    const parsed = new URL(url);
    const parts = parsed.pathname.split('/upload/');
    if (parts.length < 2) return null;

    const filePath = parts[1].split('/').slice(1).join('/');
    const withoutExtension = filePath.replace(/\.[^/.]+$/, '');
    return withoutExtension || null;
  } catch {
    return null;
  }
};

async function destroyCloudinaryAsset(publicId: string) {
  if (!cloudName || !apiKey || !apiSecret) return;

  const timestamp = Math.floor(Date.now() / 1000);
  const signatureBase = `public_id=${publicId}&timestamp=${timestamp}${apiSecret}`;
  const signature = crypto.createHash('sha1').update(signatureBase).digest('hex');

  const body = new URLSearchParams({
    public_id: publicId,
    api_key: apiKey,
    timestamp: String(timestamp),
    signature,
  });

  await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/destroy`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
  });
}

export async function POST(request: Request) {
  try {
    const { imageUrls } = await request.json();

    if (!Array.isArray(imageUrls)) {
      return NextResponse.json({ error: 'imageUrls debe ser un array' }, { status: 400 });
    }


    await Promise.all(
      imageUrls
        .map((url) => extractPublicId(url))
        .filter(Boolean)
        .map((publicId) => destroyCloudinaryAsset(publicId as string)),
    );

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: 'No se pudieron eliminar las imágenes' }, { status: 500 });
  }
}
