// ===============================
// Hospital Management System JS
// ===============================

const APPOINTMENTS_CSV_KEY = "hospital_appointments_csv";
const PATIENTS_CSV_KEY = "hospital_patients_csv";

function escapeCsv(value) {
    return '"' + String(value).replace(/"/g, '""') + '"';
}

function appendCsvRecord(storageKey, header, values) {
    const line = values.map(escapeCsv).join(",");
    const current = localStorage.getItem(storageKey) || "";
    const content = current.trim()
        ? current.trimEnd() + "\n" + line
        : header + "\n" + line;

    localStorage.setItem(storageKey, content);
}

function renderCsvPreview() {
    const appointmentsPreview = document.getElementById("savedAppointments");
    const patientsPreview = document.getElementById("savedPatients");

    if (appointmentsPreview) {
        const appointmentsData = localStorage.getItem(APPOINTMENTS_CSV_KEY);
        appointmentsPreview.textContent = appointmentsData || "Patient Name,Age,Gender,Phone,Email,Department,Doctor,Appointment Date,Appointment Time,Reason";
    }

    if (patientsPreview) {
        const patientsData = localStorage.getItem(PATIENTS_CSV_KEY);
        patientsPreview.textContent = patientsData || "Patient ID,Full Name,Blood Group,Address";
    }
}

// Welcome Message
window.onload = function () {
    showDateTime();
    renderCsvPreview();

    document.getElementById("appointmentForm").addEventListener("submit", function (event) {
        event.preventDefault();
        bookAppointment();
    });

    document.getElementById("patientRegisterForm").addEventListener("submit", function (event) {
        event.preventDefault();
        registerPatient();
    });
};

// ===============================
// Live Date and Time
// ===============================
function showDateTime() {
    setInterval(function () {
        const now = new Date();

        const date =
            now.getDate() + "/" +
            (now.getMonth() + 1) + "/" +
            now.getFullYear();

        const time = now.toLocaleTimeString();

        const display = document.getElementById("datetime");

        if (display) {
            display.innerHTML = "📅 " + date + " | 🕒 " + time;
        }

    }, 1000);
}

// ===============================
// Appointment Booking
// ===============================
function bookAppointment() {

    let name = document.getElementById("patientName").value.trim();
    let age = document.getElementById("age").value.trim();
    let gender = document.querySelector('input[name="gender"]:checked')?.value || "";
    let phone = document.getElementById("phoneNumber").value.trim();
    let email = document.getElementById("email").value.trim();
    let department = document.getElementById("department").value;
    let doctor = document.getElementById("doctor").value;
    let date = document.getElementById("appointmentDate").value;
    let time = document.getElementById("appointmentTime").value;
    let reason = document.getElementById("reason").value.trim();

    if (name == "" || age == "" || gender == "" || phone == "" || email == "" || department == "" || doctor == "" || date == "" || time == "" || reason == "") {
        alert("Please fill all appointment fields.");
        return;
    }

    const header = "Patient Name,Age,Gender,Phone,Email,Department,Doctor,Appointment Date,Appointment Time,Reason";
    appendCsvRecord(APPOINTMENTS_CSV_KEY, header, [name, age, gender, phone, email, department, doctor, date, time, reason]);
    renderCsvPreview();
    document.getElementById("appointmentForm").reset();

    alert("Appointment Booked Successfully and saved locally in CSV format!");
}

// ===============================
// Patient Registration
// ===============================
function registerPatient() {

    let patientId = document.getElementById("patientId").value.trim();
    let patient = document.getElementById("regName").value.trim();
    let bloodGroup = document.getElementById("bloodGroup").value;
    let address = document.getElementById("address").value.trim();

    if (patientId == "" || patient == "" || bloodGroup == "" || address == "") {
        alert("Please fill all patient registration fields.");
        return;
    }

    const header = "Patient ID,Full Name,Blood Group,Address";
    appendCsvRecord(PATIENTS_CSV_KEY, header, [patientId, patient, bloodGroup, address]);
    renderCsvPreview();
    document.getElementById("patientRegisterForm").reset();

    alert("Patient Registered Successfully and saved locally in CSV format!");
}

// ===============================
// Doctor Search
// ===============================
function searchDoctor() {

    let input = document.getElementById("searchDoctor").value.toLowerCase();

    if (input == "") {
        alert("Enter Doctor Name");
        return;
    }

    alert("Searching for Dr. " + input + "...");
}

// ===============================
// Dark Mode
// ===============================
function darkMode() {

    document.body.classList.toggle("dark-mode");

}

// ===============================
// Emergency Button
// ===============================
function emergencyCall() {

    alert("🚑 Emergency Ambulance has been requested!");

}

// ===============================
// Billing Calculator
// ===============================
function calculateBill() {

    let doctorFee = parseFloat(document.getElementById("doctorFee").value) || 0;
    let medicine = parseFloat(document.getElementById("medicineFee").value) || 0;
    let lab = parseFloat(document.getElementById("labFee").value) || 0;

    let total = doctorFee + medicine + lab;

    document.getElementById("totalBill").innerHTML =
        "Total Bill : ₹" + total;

}

// ===============================
// Logout
// ===============================
function logout() {

    let result = confirm("Are you sure you want to logout?");

    if(result){
        alert("Logged Out Successfully.");
        window.location.href="index.html";
    }

}