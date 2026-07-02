import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const rootDir = __dirname;
const appointmentsPath = path.join(rootDir, 'appointments.csv');
const patientsPath = path.join(rootDir, 'patients.csv');

const appointmentsHeader = 'Patient Name,Age,Gender,Phone,Email,Department,Doctor,Appointment Date,Appointment Time,Reason';
const patientsHeader = 'Patient ID,Full Name,Blood Group,Address';

function ensureCsvFile(filePath, header) {
    if (!fs.existsSync(filePath)) {
        fs.writeFileSync(filePath, header + '\n', 'utf8');
    }
}

ensureCsvFile(appointmentsPath, appointmentsHeader);
ensureCsvFile(patientsPath, patientsHeader);

function getContentType(filePath) {
    const ext = path.extname(filePath).toLowerCase();
    switch (ext) {
        case '.html': return 'text/html; charset=utf-8';
        case '.css': return 'text/css; charset=utf-8';
        case '.js': return 'application/javascript; charset=utf-8';
        case '.json': return 'application/json; charset=utf-8';
        default: return 'text/plain; charset=utf-8';
    }
}

function escapeCsvValue(value) {
    return '"' + String(value).replace(/"/g, '""') + '"';
}

function appendRecord(filePath, values) {
    const line = values.map(escapeCsvValue).join(',');
    fs.appendFileSync(filePath, line + '\n', 'utf8');
}

function readText(filePath) {
    return fs.existsSync(filePath) ? fs.readFileSync(filePath, 'utf8') : '';
}

const server = http.createServer((req, res) => {
    const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
    const { pathname } = url;

    const isAppointmentsRequest = pathname === '/api/appointments' || pathname === '/.netlify/functions/store/appointments';
    const isPatientsRequest = pathname === '/api/patients' || pathname === '/.netlify/functions/store/patients';

    if (req.method === 'GET' && isAppointmentsRequest) {
        res.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8' });
        res.end(readText(appointmentsPath));
        return;
    }

    if (req.method === 'GET' && isPatientsRequest) {
        res.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8' });
        res.end(readText(patientsPath));
        return;
    }

    if (req.method === 'POST' && isAppointmentsRequest) {
        let body = '';
        req.on('data', chunk => body += chunk);
        req.on('end', () => {
            try {
                const data = JSON.parse(body || '{}');
                const values = [
                    data.patientName || '',
                    data.age || '',
                    data.gender || '',
                    data.phoneNumber || '',
                    data.email || '',
                    data.department || '',
                    data.doctor || '',
                    data.appointmentDate || '',
                    data.appointmentTime || '',
                    data.reason || ''
                ];
                appendRecord(appointmentsPath, values);
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ ok: true }));
            } catch (error) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ ok: false, message: 'Invalid appointment data' }));
            }
        });
        return;
    }

    if (req.method === 'POST' && isPatientsRequest) {
        let body = '';
        req.on('data', chunk => body += chunk);
        req.on('end', () => {
            try {
                const data = JSON.parse(body || '{}');
                const values = [
                    data.patientId || '',
                    data.fullName || '',
                    data.bloodGroup || '',
                    data.address || ''
                ];
                appendRecord(patientsPath, values);
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ ok: true }));
            } catch (error) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ ok: false, message: 'Invalid patient data' }));
            }
        });
        return;
    }

    const requested = pathname === '/' ? '/hop.html' : pathname;
    const filePath = path.join(rootDir, requested);

    if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
        const contentType = getContentType(filePath);
        res.writeHead(200, { 'Content-Type': contentType });
        res.end(fs.readFileSync(filePath));
        return;
    }

    res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('Not found');
});

server.listen(3100, () => {
    console.log('Hospital CSV server running at http://localhost:3100');
});
