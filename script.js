let uploadedFile = null;
let selectedStyle = null;

const apiKeyInput = document.getElementById("apiKeyInput");
const saveKeyBtn = document.getElementById("saveKeyBtn");
const uploadArea = document.getElementById("upload-area");
const roomInput = document.getElementById("room-input");
const previewContainer = document.getElementById("preview");
const beforePreview = document.getElementById("beforeImage");
const beforeImg = document.getElementById("before-img");
const afterImg = document.getElementById("after-img");
const generateBtn = document.getElementById("generateBtn");
const downloadBtn = document.getElementById("downloadBtn");
const statusMessage = document.getElementById("status-message");
const resultsCard = document.getElementById("results-card");
const slider = document.getElementById("slider");
const afterImageContainer = document.getElementById("after-image");

// Load saved API key
apiKeyInput.value = localStorage.getItem("STABILITY_API_KEY") || "";

saveKeyBtn.addEventListener("click", () => {
  const key = apiKeyInput.value.trim();
  localStorage.setItem("STABILITY_API_KEY", key);
  alert("API Key Saved ✅");
});

const resetDownload = () => {
  downloadBtn.removeAttribute("href");
  downloadBtn.setAttribute("aria-disabled", "true");
  downloadBtn.classList.add("disabled");
};

// Upload handling
const triggerFilePicker = () => roomInput.click();
document.getElementById("browse-btn").addEventListener("click", triggerFilePicker);
uploadArea.addEventListener("click", triggerFilePicker);

const setPreviewImage = (file) => {
  if (!file) return;
  uploadedFile = file;
  const objectURL = URL.createObjectURL(file);
  beforePreview.src = objectURL;
  beforeImg.src = objectURL;
  previewContainer.hidden = false;
  resultsCard.hidden = false;
  slider.value = 50;
  afterImageContainer.style.width = "50%";
  resetDownload();
  setStatus("");
};

roomInput.addEventListener("change", (event) => {
  const [file] = event.target.files;
  setPreviewImage(file);
});

["dragenter", "dragover"].forEach((eventName) => {
  uploadArea.addEventListener(eventName, (event) => {
    event.preventDefault();
    uploadArea.classList.add("dragover");
  });
});

["dragleave", "drop"].forEach((eventName) => {
  uploadArea.addEventListener(eventName, (event) => {
    event.preventDefault();
    uploadArea.classList.remove("dragover");
  });
});

uploadArea.addEventListener("drop", (event) => {
  const [file] = event.dataTransfer.files;
  setPreviewImage(file);
});

// Style selection
const styleButtons = document.querySelectorAll(".style-btn");
styleButtons.forEach((button) => {
  button.addEventListener("click", () => {
    styleButtons.forEach((btn) => btn.classList.remove("active"));
    button.classList.add("active");
    selectedStyle = button.dataset.style;
  });
});

const setStatus = (message, type = "") => {
  statusMessage.textContent = message;
  statusMessage.classList.remove("success", "error");
  if (type) {
    statusMessage.classList.add(type);
  }
};

const toggleLoading = (isLoading) => {
  generateBtn.disabled = isLoading;
  generateBtn.textContent = isLoading ? "Redesigning..." : "Redesign Room";
};

async function generateRedesign() {
  const apiKey = apiKeyInput.value.trim();

  if (!apiKey) {
    alert("Enter your API key first.");
    return;
  }
  if (!uploadedFile) {
    alert("Upload a room image first.");
    return;
  }
  if (!selectedStyle) {
    alert("Select a style first.");
    return;
  }

  toggleLoading(true);
  setStatus("Please wait...");

  const formData = new FormData();
  formData.append("image", uploadedFile);
  formData.append("prompt", selectedStyle);

  try {
    const response = await fetch("https://api.stability.ai/v2beta/stable-image/edit", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        Accept: "image/png",
      },
      body: formData,
    });

    if (!response.ok) {
      throw new Error("Request failed");
    }

    const blob = await response.blob();
    const objectURL = URL.createObjectURL(blob);
    afterImg.src = objectURL;
    downloadBtn.href = objectURL;
    downloadBtn.setAttribute("aria-disabled", "false");
    downloadBtn.classList.remove("disabled");
    setStatus("Done ✅ Drag the slider to compare", "success");
  } catch (error) {
    console.error(error);
    setStatus("⚠️ Generation failed. Check API key or credits.", "error");
  } finally {
    toggleLoading(false);
  }
}

generateBtn.addEventListener("click", generateRedesign);

// Slider
slider.addEventListener("input", (event) => {
  afterImageContainer.style.width = `${event.target.value}%`;
});
