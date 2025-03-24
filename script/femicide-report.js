import { loadLayout } from '/script/layout.js';

document.addEventListener('DOMContentLoaded', async () => {
  await loadLayout();
  
  const form = document.getElementById('contactForm');
  const loadingOverlay = document.getElementById('loading-overlay');
  const successOverlay = document.getElementById('successOverlay');
  const errorOverlay = document.getElementById('errorOverlay');
  const dropArea = document.getElementById('drop-area');
  const fileInput = document.getElementById('file-input');
  const fileList = document.getElementById('file-list');
  const browseBtn = document.getElementById('browse-btn');
  
  const CLOUDINARY_URL = "https://api.cloudinary.com/v1_1/doqrhnjcs/upload";
  const UPLOAD_PRESET = "pf_report";
  const allowedTypes = [
    "image/png",
    "image/jpeg",
    "video/mp4",
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ];

  let uploadedFiles = [];
  const formId = generateUUID();
  document.getElementById('form-id').value = formId;

  function generateUUID() {
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
      const r = (Math.random() * 16) | 0;
      const v = c === "x" ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  }

  // File upload handlers
  browseBtn.addEventListener('click', () => fileInput.click());

  fileInput.addEventListener('change', (event) => {
    handleFiles(event.target.files);
  });

  dropArea.addEventListener('dragover', (event) => {
    event.preventDefault();
    dropArea.classList.add('dragover');
  });

  dropArea.addEventListener('dragleave', () => {
    dropArea.classList.remove('dragover');
  });

  dropArea.addEventListener('drop', (event) => {
    event.preventDefault();
    dropArea.classList.remove('dragover');
    handleFiles(event.dataTransfer.files);
  });

  function handleFiles(files) {
    for (const file of files) {
      if (!allowedTypes.includes(file.type)) {
        alert(`Error: ${file.name} is not a supported file type.`);
        continue;
      }

      if (file.size > 100 * 1024 * 1024) {
        alert(`Error: ${file.name} exceeds 100MB limit.`);
        continue;
      }

      const fileElement = createFileElement(file);
      fileList.appendChild(fileElement);
      uploadFile(file, fileElement);
    }
  }

  function createFileElement(file) {
    const fileItem = document.createElement('div');
    fileItem.className = 'file-item';

    fileItem.innerHTML = `
      <div class="file-info">
        <span class="file-name">${file.name}</span>
        <div class="progress-bar">
          <div class="progress-fill"></div>
        </div>
      </div>
      <button class="remove-btn">×</button>
    `;

    const removeBtn = fileItem.querySelector('.remove-btn');
    removeBtn.addEventListener('click', () => {
      fileItem.remove();
      uploadedFiles = uploadedFiles.filter((url) => !url.includes(file.name));
    });

    return fileItem;
  }

  async function uploadFile(file, fileElement) {
    const progressFill = fileElement.querySelector('.progress-fill');

    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', UPLOAD_PRESET);
    formData.append('public_id', `${formId}_${file.name}`);

    const xhr = new XMLHttpRequest();
    xhr.open('POST', CLOUDINARY_URL, true);

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) {
        const percentComplete = (event.loaded / event.total) * 100;
        progressFill.style.width = `${percentComplete}%`;
        progressFill.innerText = `${Math.round(percentComplete)}%`;
      }
    };

    xhr.onload = () => {
      if (xhr.status === 200) {
        const response = JSON.parse(xhr.responseText);
        progressFill.style.width = '100%';
        progressFill.style.backgroundColor = 'green';
        progressFill.innerText = '✔';

        uploadedFiles.push(response.secure_url);
      } else {
        progressFill.style.backgroundColor = 'red';
        progressFill.innerText = 'Failed';
      }
    };

    xhr.onerror = () => {
      progressFill.style.backgroundColor = 'red';
      progressFill.innerText = 'Error';
    };

    xhr.send(formData);
  }

  // Form submission handler
  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    clearErrors();

    if (!validateForm()) {
      return;
    }

    loadingOverlay.classList.add('active');

    const formData = new FormData(form);
    formData.append('uploadedFiles', JSON.stringify(uploadedFiles));

    try {
      const response = await fetch('https://script.google.com/macros/s/AKfycbwzJnbiEV-n54BkwR8woUVv5FonTu7QW2XlFUG2hG7eweJt6Wq3woNcm9BhyKeZwPBa/exec', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        successOverlay.classList.add('active');
        form.reset();
        // Reset file upload section
        fileList.innerHTML = '';
        uploadedFiles = [];
        dropArea.classList.remove('dragover');
        // Reset file input
        fileInput.value = '';
      } else {
        errorOverlay.classList.add('active');
      }
    } catch (error) {
      errorOverlay.classList.add('active');
    } finally {
      loadingOverlay.classList.remove('active');
    }
  });

  // Close button handlers
  document.getElementById('closeSuccess').addEventListener('click', () => {
    successOverlay.classList.remove('active');
  });

  document.getElementById('closeError').addEventListener('click', () => {
    errorOverlay.classList.remove('active');
  });

  // Validation functions
  function validateForm() {
    let valid = true;

    const name = document.getElementById('name');
    if (!name.value.trim()) {
      displayError('nameError', 'Please enter your name.');
      valid = false;
    } else if (!validateName(name.value.trim())) {
      displayError('nameError', 'Name cannot contain numbers or special characters.');
      valid = false;
    }

    const email = document.getElementById('email');
    if (!validateEmail(email.value.trim())) {
      displayError('emailError', 'Please enter a valid email address.');
      valid = false;
    }

    const incidentDate = document.getElementById('incidentDate');
    if (!incidentDate.value) {
      displayError('dateError', 'Please select the date of the incident.');
      valid = false;
    } else if (new Date(incidentDate.value) > new Date()) {
      displayError('dateError', 'Date of incident cannot be in the future.');
      valid = false;
    }

    const location = document.getElementById('location');
    if (!location.value) {
      displayError('locationError', 'Please select where the incident happened.');
      valid = false;
    }

    const victimName = document.getElementById('victimName');
    if (!victimName.value.trim()) {
      displayError('victimNameError', 'Please enter the victim\'s name.');
      valid = false;
    } else if (!validateName(victimName.value.trim())) {
      displayError('victimNameError', 'Victim name cannot contain numbers or special characters.');
      valid = false;
    }

    const killer = document.getElementById('killer');
    if (!killer.value.trim()) {
      displayError('killerError', 'Please describe who killed her.');
      valid = false;
    } else if (!validateName(killer.value.trim())) {
      displayError('killerError', 'Perpetrator name cannot contain numbers or special characters.');
      valid = false;
    }

    const message = document.getElementById('message');
    if (!message.value.trim()) {
      displayError('messageError', 'Please describe the incident.');
      valid = false;
    }

    return valid;
  }

  function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  }

  function validateName(name) {
    const re = /^[A-Za-z\s\-']+$/;
    return re.test(name);
  }

  function displayError(elementId, message) {
    const errorElement = document.getElementById(elementId);
    errorElement.textContent = message;
  }

  function clearErrors() {
    document.querySelectorAll('.error-message').forEach(el => el.textContent = '');
  }
});