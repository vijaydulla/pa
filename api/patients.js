import fs from 'fs';
import path from 'path';

const filePath = path.join(process.cwd(), 'patients.csv');

function ensureFile() {
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, 'Patient ID,Full Name,Blood Group,Address\n', 'utf8');
  }
}

ensureFile();

export default function handler(req, res) {
  if (req.method === 'GET') {
    const data = fs.readFileSync(filePath, 'utf8');
    res.status(200).send(data);
    return;
  }

  if (req.method === 'POST') {
    const body = req.body || {};
    const values = [body.patientId || '', body.fullName || '', body.bloodGroup || '', body.address || ''];
    const line = values.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(',');
    fs.appendFileSync(filePath, line + '\n', 'utf8');
    res.status(200).json({ ok: true });
    return;
  }

  res.status(405).json({ ok: false, message: 'Method not allowed' });
}
