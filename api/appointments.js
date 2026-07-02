import fs from 'fs';
import path from 'path';
import { list, put } from '@vercel/blob';

const filePath = path.join(process.cwd(), 'appointments.csv');
const blobKey = 'appointments.csv';
const header = 'Patient Name,Age,Gender,Phone,Email,Department,Doctor,Appointment Date,Appointment Time,Reason';

function ensureLocalFile() {
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, header + '\n', 'utf8');
  }
}

function escapeCsvValue(value) {
  return `"${String(value).replace(/"/g, '""')}"`;
}

function getJsonBody(req) {
  if (req.body && typeof req.body === 'object' && !Array.isArray(req.body)) {
    return req.body;
  }

  if (typeof req.body === 'string') {
    try {
      return JSON.parse(req.body);
    } catch (error) {
      return {};
    }
  }

  return {};
}

async function readExistingContent() {
  const isProduction = process.env.VERCEL === '1' || process.env.NODE_ENV === 'production';

  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    if (isProduction) {
      throw new Error('Missing BLOB_READ_WRITE_TOKEN in the deployment environment.');
    }

    ensureLocalFile();
    return fs.readFileSync(filePath, 'utf8');
  }

  try {
    const { blobs } = await list({ prefix: blobKey, limit: 10, token: process.env.BLOB_READ_WRITE_TOKEN });
    const existing = blobs.find((blob) => blob.pathname === blobKey || blob.pathname === `/${blobKey}`);
    if (existing) {
      const response = await fetch(existing.url);
      if (response.ok) {
        return await response.text();
      }
    }
  } catch (error) {
    console.error('Appointment blob read failed:', error);
  }

  const initialContent = header + '\n';
  await put(blobKey, initialContent, {
    access: 'public',
    token: process.env.BLOB_READ_WRITE_TOKEN,
    allowOverwrite: true
  });
  return initialContent;
}

async function appendRecord(values) {
  const currentContent = await readExistingContent();
  const line = values.map(escapeCsvValue).join(',');
  const nextContent = currentContent.endsWith('\n') ? currentContent + line + '\n' : currentContent + '\n' + line + '\n';

  if (process.env.BLOB_READ_WRITE_TOKEN) {
    await put(blobKey, nextContent, {
      access: 'public',
      token: process.env.BLOB_READ_WRITE_TOKEN,
      allowOverwrite: true
    });
    return nextContent;
  }

  ensureLocalFile();
  fs.appendFileSync(filePath, line + '\n', 'utf8');
  return fs.readFileSync(filePath, 'utf8');
}

export default async function handler(req, res) {
  try {
    if (req.method === 'GET') {
      const data = await readExistingContent();
      res.status(200).send(data);
      return;
    }

    if (req.method === 'POST') {
      const body = getJsonBody(req);
      const values = [
        body.patientName || '',
        body.age || '',
        body.gender || '',
        body.phoneNumber || '',
        body.email || '',
        body.department || '',
        body.doctor || '',
        body.appointmentDate || '',
        body.appointmentTime || '',
        body.reason || ''
      ];

      await appendRecord(values);
      res.status(200).json({ ok: true });
      return;
    }

    res.status(405).json({ ok: false, message: 'Method not allowed' });
  } catch (error) {
    res.status(500).json({ ok: false, message: error.message || 'Appointment storage failed.' });
  }
}
