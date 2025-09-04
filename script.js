document.addEventListener("DOMContentLoaded", function () {
  // DOM Elements
  const studentForm = document.getElementById("studentForm");
  const saveBtn = document.getElementById("saveBtn");
  const clearBtn = document.getElementById("clearBtn");
  const searchInput = document.getElementById("searchInput");
  const studentsTableBody = document.getElementById("studentsTableBody");

  // Student data array
  let students = JSON.parse(localStorage.getItem("students")) || [];
  let editingId = null;

  // Initialize the app
  function init() {
    renderStudentTable();
    setupEventListeners();
  }

  // Set up event listeners
  function setupEventListeners() {
    // Form submission
    studentForm.addEventListener("submit", handleFormSubmit);

    // Clear form
    clearBtn.addEventListener("click", clearForm);

    // Search functionality
    searchInput.addEventListener("input", function (e) {
      renderStudentTable(e.target.value.toLowerCase());
    });

    // Event delegation for edit/delete buttons
    studentsTableBody.addEventListener("click", function (e) {
      const btn = e.target.closest("button");
      if (!btn) return;

      const studentId = btn.dataset.id;
      if (!studentId) return;

      if (btn.classList.contains("btn-danger")) {
        deleteStudent(studentId);
      } else {
        editStudent(studentId);
      }
    });
  }

  // Handle form submission
  function handleFormSubmit(e) {
    e.preventDefault();

    // Get form values
    const studentData = {
      id: editingId || Date.now().toString(),
      firstName: document.getElementById("firstName").value.trim(),
      lastName: document.getElementById("lastName").value.trim(),
      dob: document.getElementById("dob").value,
      gender: document.getElementById("gender").value,
      grade: document.getElementById("grade").value,
      section: document.getElementById("section").value.trim(),
      address: document.getElementById("address").value.trim(),
      parentName: document.getElementById("parentName").value.trim(),
      parentContact: document.getElementById("parentContact").value.trim(),
      email: document.getElementById("email").value.trim(),
      medicalInfo: document.getElementById("medicalInfo").value.trim(),
    };

    // Validate required fields
    if (!validateForm(studentData)) {
      return;
    }

    // Add or update student
    if (editingId) {
      // Update existing student
      const index = students.findIndex((s) => s.id === editingId);
      if (index !== -1) {
        students[index] = studentData;
      }
    } else {
      // Add new student
      students.push(studentData);
    }

    // Save to localStorage
    localStorage.setItem("students", JSON.stringify(students));

    // Refresh UI
    renderStudentTable();
    clearForm();
  }

  // Form validation
  function validateForm(studentData) {
    let isValid = true;

    // Clear previous error highlights
    document.querySelectorAll(".error").forEach((el) => {
      el.classList.remove("error");
      const errorMsg = el.nextElementSibling;
      if (errorMsg && errorMsg.classList.contains("error-message")) {
        errorMsg.remove();
      }
    });

    // Check required fields
    const requiredFields = [
      { id: "firstName", value: studentData.firstName, name: "First Name" },
      { id: "lastName", value: studentData.lastName, name: "Last Name" },
      { id: "dob", value: studentData.dob, name: "Date of Birth" },
      { id: "gender", value: studentData.gender, name: "Gender" },
      { id: "grade", value: studentData.grade, name: "Grade" },
      { id: "address", value: studentData.address, name: "Address" },
      { id: "parentName", value: studentData.parentName, name: "Parent Name" },
      {
        id: "parentContact",
        value: studentData.parentContact,
        name: "Parent Contact",
      },
    ];

    requiredFields.forEach((field) => {
      if (!field.value) {
        const input = document.getElementById(field.id);
        input.classList.add("error");
        const errorMsg = document.createElement("div");
        errorMsg.className = "error-message";
        errorMsg.textContent = `${field.name} is required`;
        errorMsg.style.color = "red";
        errorMsg.style.marginTop = "5px";
        errorMsg.style.fontSize = "0.8em";
        input.after(errorMsg);
        isValid = false;
      }
    });

    // Validate date (simple check)
    if (studentData.dob) {
      const dobDate = new Date(studentData.dob);
      const currentDate = new Date();
      if (dobDate >= currentDate) {
        const input = document.getElementById("dob");
        input.classList.add("error");
        const errorMsg = document.createElement("div");
        errorMsg.className = "error-message";
        errorMsg.textContent = "Date of Birth must be in the past";
        errorMsg.style.color = "red";
        errorMsg.style.marginTop = "5px";
        errorMsg.style.fontSize = "0.8em";
        input.after(errorMsg);
        isValid = false;
      }
    }

    return isValid;
  }

  // Render student table
  function renderStudentTable(searchTerm = "") {
    studentsTableBody.innerHTML = "";

    const filteredStudents = searchTerm
      ? students.filter(
          (student) =>
            student.firstName.toLowerCase().includes(searchTerm) ||
            student.lastName.toLowerCase().includes(searchTerm) ||
            student.grade.toLowerCase().includes(searchTerm) ||
            student.parentName.toLowerCase().includes(searchTerm) ||
            student.parentContact.toLowerCase().includes(searchTerm)
        )
      : students;

    if (filteredStudents.length === 0) {
      const row = document.createElement("tr");
      row.innerHTML = `<td colspan="6" style="text-align: center;">No student records found</td>`;
      studentsTableBody.appendChild(row);
      return;
    }

    filteredStudents.forEach((student) => {
      const row = document.createElement("tr");
      row.innerHTML = `
                <td>${student.id.substring(0, 6)}</td>
                <td>${student.firstName} ${student.lastName}</td>
                <td>Grade ${student.grade}${
        student.section ? ` (${student.section})` : ""
      }</td>
                <td>${student.parentName}</td>
                <td>${student.parentContact}</td>
                <td class="actions-cell">
                    <button class="btn" data-id="${student.id}">Edit</button>
                    <button class="btn btn-danger" data-id="${
                      student.id
                    }">Delete</button>
                </td>
            `;
      studentsTableBody.appendChild(row);
    });
  }

  // Edit student
  function editStudent(id) {
    const student = students.find((s) => s.id === id);
    if (student) {
      editingId = student.id;

      // Fill the form
      document.getElementById("studentId").value = student.id;
      document.getElementById("firstName").value = student.firstName;
      document.getElementById("lastName").value = student.lastName;
      document.getElementById("dob").value = student.dob;
      document.getElementById("gender").value = student.gender;
      document.getElementById("grade").value = student.grade;
      document.getElementById("section").value = student.section;
      document.getElementById("address").value = student.address;
      document.getElementById("parentName").value = student.parentName;
      document.getElementById("parentContact").value = student.parentContact;
      document.getElementById("email").value = student.email;
      document.getElementById("medicalInfo").value = student.medicalInfo;

      // Update button text
      saveBtn.textContent = "Update Student";

      // Scroll to form
      document
        .getElementById("studentForm")
        .scrollIntoView({ behavior: "smooth" });
    }
  }

  // Delete student
  function deleteStudent(id) {
    if (confirm("Are you sure you want to delete this student record?")) {
      students = students.filter((s) => s.id !== id);
      localStorage.setItem("students", JSON.stringify(students));

      if (editingId === id) {
        clearForm();
      }

      renderStudentTable();
    }
  }

  // Clear form
  function clearForm() {
    studentForm.reset();
    editingId = null;
    saveBtn.textContent = "Save Student";

    // Clear any error messages
    document
      .querySelectorAll(".error")
      .forEach((el) => el.classList.remove("error"));
    document.querySelectorAll(".error-message").forEach((el) => el.remove());
  }

  // Initialize the app
  init();
});
