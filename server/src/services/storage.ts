import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { PutObjectCommand, DeleteObjectCommand, S3Client } from '@aws-sdk/client-s3';

export type StorageProvider = 'local' | 'cloudinary' | 's3';

export interface StoredFile {
  url: string;
  /** Provider-specific key for deletion (local relative path, Cloudinary public_id, S3 key) */
  storageKey: string;
  provider: StorageProvider;
  mimeType: string;
  size: number;
  filename: string;
}

function resolveProvider(): StorageProvider {
  const explicit = (process.env.STORAGE_PROVIDER || '').toLowerCase();
  if (explicit === 'cloudinary' || explicit === 's3' || explicit === 'local') return explicit;
  if (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET) {
    return 'cloudinary';
  }
  if (process.env.S3_BUCKET && (process.env.AWS_ACCESS_KEY_ID || process.env.S3_ACCESS_KEY_ID)) {
    return 's3';
  }
  return 'local';
}

export function getStorageProvider(): StorageProvider {
  return resolveProvider();
}

function localUploadDir() {
  return process.env.UPLOAD_DIR || 'uploads';
}

function ensureLocalDir() {
  const dir = localUploadDir();
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  return dir;
}

async function uploadLocal(file: Express.Multer.File): Promise<StoredFile> {
  const dir = ensureLocalDir();
  const safeName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${path.extname(file.originalname)}`;
  const dest = path.join(dir, safeName);

  if (file.path) {
    fs.renameSync(file.path, dest);
  } else if (file.buffer) {
    fs.writeFileSync(dest, file.buffer);
  } else {
    throw new Error('Upload buffer missing');
  }

  const urlPath = `/${dir.replace(/\\/g, '/')}/${safeName}`;
  return {
    url: urlPath,
    storageKey: urlPath,
    provider: 'local',
    mimeType: file.mimetype,
    size: file.size,
    filename: file.originalname,
  };
}

async function uploadCloudinary(file: Express.Multer.File): Promise<StoredFile> {
  const cloud = process.env.CLOUDINARY_CLOUD_NAME!;
  const apiKey = process.env.CLOUDINARY_API_KEY!;
  const apiSecret = process.env.CLOUDINARY_API_SECRET!;
  const folder = process.env.CLOUDINARY_FOLDER || 'portfolio';
  const timestamp = Math.round(Date.now() / 1000);
  const publicId = `${folder}/${Date.now()}-${Math.round(Math.random() * 1e9)}`;

  const toSign = `folder=${folder}&public_id=${publicId}&timestamp=${timestamp}${apiSecret}`;
  const signature = crypto.createHash('sha1').update(toSign).digest('hex');

  const resourceType = file.mimetype.startsWith('image/') ? 'image' : 'raw';
  const bytes = file.buffer || fs.readFileSync(file.path);
  const form = new FormData();
  // data-URI upload avoids Node FormData/Blob quirks
  form.append('file', `data:${file.mimetype};base64,${bytes.toString('base64')}`);
  form.append('api_key', apiKey);
  form.append('timestamp', String(timestamp));
  form.append('signature', signature);
  form.append('folder', folder);
  form.append('public_id', publicId);

  const res = await fetch(`https://api.cloudinary.com/v1_1/${cloud}/${resourceType}/upload`, {
    method: 'POST',
    body: form,
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Cloudinary upload failed: ${text.slice(0, 200)}`);
  }
  const data = (await res.json()) as { secure_url: string; public_id: string; bytes?: number };

  if (file.path && fs.existsSync(file.path)) fs.unlinkSync(file.path);

  return {
    url: data.secure_url,
    storageKey: data.public_id,
    provider: 'cloudinary',
    mimeType: file.mimetype,
    size: data.bytes ?? file.size,
    filename: file.originalname,
  };
}

function s3Client() {
  return new S3Client({
    region: process.env.S3_REGION || process.env.AWS_REGION || 'us-east-1',
    credentials: {
      accessKeyId: process.env.S3_ACCESS_KEY_ID || process.env.AWS_ACCESS_KEY_ID || '',
      secretAccessKey: process.env.S3_SECRET_ACCESS_KEY || process.env.AWS_SECRET_ACCESS_KEY || '',
    },
    ...(process.env.S3_ENDPOINT ? { endpoint: process.env.S3_ENDPOINT, forcePathStyle: true } : {}),
  });
}

async function uploadS3(file: Express.Multer.File): Promise<StoredFile> {
  const bucket = process.env.S3_BUCKET!;
  const prefix = (process.env.S3_PREFIX || 'portfolio').replace(/\/$/, '');
  const key = `${prefix}/${Date.now()}-${Math.round(Math.random() * 1e9)}${path.extname(file.originalname)}`;
  const body = file.buffer || fs.readFileSync(file.path);

  await s3Client().send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: body,
      ContentType: file.mimetype,
      ACL: process.env.S3_PUBLIC_ACL === 'false' ? undefined : 'public-read',
    })
  );

  if (file.path && fs.existsSync(file.path)) fs.unlinkSync(file.path);

  const publicBase =
    process.env.S3_PUBLIC_URL ||
    (process.env.S3_ENDPOINT
      ? `${process.env.S3_ENDPOINT.replace(/\/$/, '')}/${bucket}`
      : `https://${bucket}.s3.${process.env.S3_REGION || process.env.AWS_REGION || 'us-east-1'}.amazonaws.com`);

  return {
    url: `${publicBase.replace(/\/$/, '')}/${key}`,
    storageKey: key,
    provider: 's3',
    mimeType: file.mimetype,
    size: file.size,
    filename: file.originalname,
  };
}

export async function storeUpload(file: Express.Multer.File): Promise<StoredFile> {
  const provider = resolveProvider();
  if (provider === 'cloudinary') return uploadCloudinary(file);
  if (provider === 's3') return uploadS3(file);
  return uploadLocal(file);
}

export async function deleteStoredFile(asset: {
  url: string;
  storageKey?: string | null;
  provider?: string | null;
}): Promise<void> {
  const provider = (asset.provider as StorageProvider) || 'local';
  const key = asset.storageKey || asset.url;

  if (provider === 'cloudinary' && key) {
    const cloud = process.env.CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;
    if (!cloud || !apiKey || !apiSecret) return;
    const timestamp = Math.round(Date.now() / 1000);
    const signature = crypto
      .createHash('sha1')
      .update(`public_id=${key}&timestamp=${timestamp}${apiSecret}`)
      .digest('hex');
    const form = new FormData();
    form.append('public_id', key);
    form.append('api_key', apiKey);
    form.append('timestamp', String(timestamp));
    form.append('signature', signature);
    await fetch(`https://api.cloudinary.com/v1_1/${cloud}/image/destroy`, {
      method: 'POST',
      body: form,
    }).catch(() => undefined);
    return;
  }

  if (provider === 's3' && key && process.env.S3_BUCKET) {
    await s3Client()
      .send(new DeleteObjectCommand({ Bucket: process.env.S3_BUCKET, Key: key }))
      .catch(() => undefined);
    return;
  }

  const rel = asset.url.replace(/^\//, '');
  const filePath = path.join(process.cwd(), rel);
  if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
}
