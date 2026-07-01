function renderCsvPreview() {
  // no-op on deployed site because preview was removed from the UI
}

window.onload = function () {
  document.getElementById('appointmentForm').addEventListener('submit', function (event) {
    event.preventDefault();
    bookAppointment();
  });

  document.getElementById('patientRegisterForm').addEventListener('submit', function (event) {
    event.preventDefault();
    registerPatient();
  });
};

function bookAppointment() {
  const name = document.getElementById('patientName').value.trim();
  const age = document.getElementById('age').value.trim();
  const gender = document.querySelector('input[name="gender"]:checked')?.value || '';
  const phone = document.getElementById('phoneNumber').value.trim();
  const email = document.getElementById('email').value.trim();
  const department = document.getElementById('department').value;
  const doctor = document.getElementById('doctor').value;
  const date = document.getElementById('appointmentDate').value;
  const time = document.getElementById('appointmentTime').value;
  const reason = document.getElementById('reason').value.trim();

  if (!name || !age || !gender || !phone || !email || !department || !doctor || !date || !time || !reason) {
    alert('Please fill all appointment fields.');
    return;
  }

  fetch('/api/appointments', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ patientName: name, age, gender, phoneNumber: phone, email, department, doctor, appointmentDate: date, appointmentTime: time, reason })
  }).then(() => {
    document.getElementById('appointmentForm').reset();
    alert('Appointment Booked Successfully and saved in CSV database!');
  });
}

function registerPatient() {
  const patientId = document.getElementById('patientId').value.trim();
  const patient = document.getElementById('regName').value.trim();
  const bloodGroup = document.getElementById('bloodGroup').value;
  const address = document.getElementById('address').value.trim();

  if (!patientId || !patient || !bloodGroup || !address) {
    alert('Please fill all patient registration fields.');
    return;
  }

  fetch('/api/patients', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ patientId, fullName: patient, bloodGroup, address })
  }).then(() => {
    document.getElementById('patientRegisterForm').reset();
    alert('Patient Registered Successfully and saved in CSV database!');
  });
}
