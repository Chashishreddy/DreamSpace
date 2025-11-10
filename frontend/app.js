const metaApiBase = document.querySelector('meta[name="dreamspace-api-base-url"]')?.content?.trim();
const rawBase = window.DREAMSPACE_API_BASE_URL || metaApiBase || '';
const API_BASE_URL = rawBase.endsWith('/') ? rawBase.slice(0, -1) : rawBase;

function buildApiUrl(path) {
  if (!API_BASE_URL) return path;
  return `${API_BASE_URL}${path}`;
}

const dropZone = document.getElementById('dropZone');
const fileInput = document.getElementById('fileInput');
const preview = document.getElementById('preview');
const previewImage = document.getElementById('previewImage');
const clearBtn = document.getElementById('clearBtn');
const styleSelect = document.getElementById('styleSelect');
const generateBtn = document.getElementById('generateBtn');
const statusMessage = document.getElementById('statusMessage');
const resultsCard = document.getElementById('resultsCard');
const sliderWrapper = document.getElementById('sliderWrapper');
const beforeImage = document.getElementById('beforeImage');
const afterImage = document.getElementById('afterImage');
const imageOverlay = document.getElementById('imageOverlay');
const slider = document.getElementById('slider');
const downloadBtn = document.getElementById('downloadBtn');

let uploadedFile = null;
let redesignedBlobUrl = null;

const STYLE_PROMPTS = {
  Minimalist: 'minimalist living room, soft neutral palette, clean lines, natural light, airy interior, high end styling, photography',
  Japandi: 'japandi style interior, calm zen atmosphere, neutral beige tones, low furniture, natural wood, soft diffused light, magazine photo',
  'Cozy Scandinavian': 'cozy scandinavian apartment, warm textiles, soft lighting, natural wood, hygge vibes, nordic design, wide angle photo',
  'Luxury Modern': 'luxury modern penthouse interior, marble textures, gold accents, statement lighting, designer furniture, cinematic lighting',
  'Cyberpunk Neon': 'futuristic cyberpunk interior, neon purple and blue lighting, holographic displays, high tech decor, dramatic mood',
  'Warm Boho': 'warm bohemian interior, woven materials, plants, sunlit tones, eclectic decor, inviting atmosphere',
};

function setStatus(message, type = 'info') {
  statusMessage.textContent = message;
  statusMessage.classList.remove('error', 'success');
  if (type === 'error') {
    statusMessage.classList.add('error');
  } else if (type === 'success') {
    statusMessage.classList.add('success');
  }
}

function resetResults() {
  sliderWrapper.hidden = true;
  downloadBtn.disabled = true;
  downloadBtn.removeAttribute('href');
  if (redesignedBlobUrl) {
    URL.revokeObjectURL(redesignedBlobUrl);
    redesignedBlobUrl = null;
  }
}

function showPreview(file) {
  preview.hidden = false;
  const objectUrl = URL.createObjectURL(file);
  previewImage.src = objectUrl;
  beforeImage.src = objectUrl;
  resultsCard.hidden = false;
  resetResults();
}

function clearUpload() {
  uploadedFile = null;
  preview.hidden = true;
  fileInput.value = '';
  beforeImage.removeAttribute('src');
  afterImage.removeAttribute('src');
  resultsCard.hidden = true;
  resetResults();
}

function handleFiles(files) {
  if (!files || !files.length) return;
  const file = files[0];
  const allowedTypes = ['image/jpeg', 'image/png'];
  if (!allowedTypes.includes(file.type)) {
    setStatus('Only JPG and PNG images are supported.', 'error');
    return;
  }
  if (file.size > 5 * 1024 * 1024) {
    setStatus('Image is too large. Please upload a file under 5 MB.', 'error');
    return;
  }
  uploadedFile = file;
  showPreview(file);
  setStatus('Image ready. Choose a style and generate.');
}

function initDragAndDrop() {
  ['dragenter', 'dragover'].forEach(eventName => {
    dropZone.addEventListener(eventName, event => {
      event.preventDefault();
      event.stopPropagation();
      dropZone.classList.add('dragging');
    });
  });

  ['dragleave', 'drop'].forEach(eventName => {
    dropZone.addEventListener(eventName, event => {
      event.preventDefault();
      event.stopPropagation();
      if (eventName === 'drop') {
        const files = event.dataTransfer.files;
        handleFiles(files);
      }
      dropZone.classList.remove('dragging');
    });
  });

  dropZone.addEventListener('click', () => fileInput.click());
  dropZone.addEventListener('keypress', event => {
    if (event.key === ' ' || event.key === 'Enter') {
      event.preventDefault();
      fileInput.click();
    }
  });

  fileInput.addEventListener('change', event => handleFiles(event.target.files));
  clearBtn.addEventListener('click', clearUpload);
}

async function requestRedesign() {
  if (!uploadedFile) {
    setStatus('Please upload a room photo first.', 'error');
    return;
  }
  if (!styleSelect.value) {
    setStatus('Please choose a design style.', 'error');
    return;
  }

  try {
    generateBtn.disabled = true;
    generateBtn.textContent = 'Working…';
    setStatus('Uploading image securely…');

    const formData = new FormData();
    formData.append('style', styleSelect.value);
    formData.append('prompt', STYLE_PROMPTS[styleSelect.value]);
    formData.append('image', uploadedFile);

    const response = await fetch(buildApiUrl('/api/redesign'), {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorPayload = await response.json().catch(() => ({ message: 'Unable to process image.' }));
      throw new Error(errorPayload.message || 'Unable to process image.');
    }

    const blob = await response.blob();
    redesignedBlobUrl = URL.createObjectURL(blob);
    afterImage.src = redesignedBlobUrl;
    downloadBtn.href = redesignedBlobUrl;
    downloadBtn.download = `dreamspace-${styleSelect.value.toLowerCase().replace(/\s+/g, '-')}.png`;
    downloadBtn.disabled = false;

    sliderWrapper.hidden = false;
    setStatus('Redesign complete! Drag the slider to compare.', 'success');
  } catch (error) {
    console.error(error);
    setStatus(error.message || 'Generation failed. Please try again later.', 'error');
    resetResults();
  } finally {
    generateBtn.disabled = false;
    generateBtn.textContent = 'Generate redesign';
  }
}

function initSlider() {
  slider.addEventListener('input', event => {
    const value = Number(event.target.value);
    imageOverlay.style.width = `${value}%`;
  });
}

function initDownloadButton() {
  downloadBtn.addEventListener('click', () => {
    if (downloadBtn.disabled) return;
    setStatus('Image downloaded to your device.');
  });
}

function initFooterYear() {
  document.getElementById('year').textContent = new Date().getFullYear();
}

function registerEvents() {
  initDragAndDrop();
  initSlider();
  initDownloadButton();
  initFooterYear();
  generateBtn.addEventListener('click', requestRedesign);
}

registerEvents();
