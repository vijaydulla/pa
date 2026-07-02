import { getStore } from '@netlify/blobs';

const appointmentsStore = getStore({ name: 'appointments' });
const patientsStore = getStore({ name: 'patients' });

function parseBody(req) {
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

function csvEscape(value) {
  return `"${String(value).replace(/"/g, '""')}"`;
}

async function readCsv(store) {
  try {
    const existing = await store.get('data.csv');
    return existing || '';
  } catch (error) {
    return '';
  }
}

async function appendCsv(store, headers, values) {
  let content = await readCsv(store);
  if (!content) {
    content = headers + '\n';
  }

  const line = values.map(csvEscape).join(',');
  content += line + '\n';
  await store.set('data.csv', content);
  return content;
}

export async function handler(req) {
  const method = req.httpMethod || req.method;

  if (method === 'GET') {
    const store = req.path.includes('/patients') ? patientsStore : appointmentsStore;
    const content = await readCsv(store);
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
      body: content || ''
    };
  }

  if (method === 'POST') {
    const body = parseBody(req);
    const store = req.path.includes('/patients') ? patientsStore : appointmentsStore;

    if (req.path.includes('/patients')) {
      const values = [body.patientId || '', body.fullName || '', body.bloodGroup || '', body.address || ''];
      await appendCsv(store, 'Patient ID,Full Name,Blood Group,Address', values);
    } else {
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
      await appendCsv(store, 'Patient Name,Age,Gender,Phone,Email,Department,Doctor,Appointment Date,Appointment Time,Reason', values);
    }

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ok: true })
    };
  }

  return {
    statusCode: 405,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ok: false, message: 'Method not allowed' })
  };
}
