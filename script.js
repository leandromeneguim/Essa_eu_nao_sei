import { processImageWithGemini } from './api.js';

let accordion;

document.addEventListener('DOMContentLoaded', () => {
    initializeAccordion();
    setupEventListeners();
});

function initializeAccordion() {
    accordion = new Accordion('.accordion-container');
}

function setupEventListeners() {
    document.getElementById('takePhoto').addEventListener('click', handleTakePhoto);
    document.getElementById('uploadPhoto').addEventListener('click', handleUploadPhoto);
    document.getElementById('pasteImage').addEventListener('click', handlePasteImage);
    document.getElementById('newQuestion').addEventListener('click', handleNewQuestion);
    document.getElementById('fileInput').addEventListener('change', handleFileSelect);
}

async function handleTakePhoto() {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        // Implementar lógica da câmera
    } catch (error) {
        console.error('Erro ao acessar câmera:', error);
        alert('Não foi possível acessar a câmera');
    }
}

function handleUploadPhoto() {
    document.getElementById('fileInput').click();
}

async function handlePasteImage() {
    try {
        const clipboardItems = await navigator.clipboard.read();
        for (const clipboardItem of clipboardItems) {
            for (const type of clipboardItem.types) {
                if (type.startsWith('image/')) {
                    const blob = await clipboardItem.getType(type);
                    const file = new File([blob], "clipboard-image.png", { type });
                    await processImage(file);
                    return;
                }
            }
        }
        alert('Nenhuma imagem encontrada na área de transferência');
    } catch (error) {
        console.error('Erro ao acessar área de transferência:', error);
        alert('Não foi possível acessar a área de transferência');
    }
}

async function handleFileSelect(event) {
    const file = event.target.files[0];
    if (file) {
        await processImage(file);
    }
}

function handleNewQuestion() {
    localStorage.clear();
    sessionStorage.clear();
    location.reload();
}

function showLoading() {
    const loading = document.querySelector('.loading-container');
    loading.style.display = 'flex';
}

function hideLoading() {
    const loading = document.querySelector('.loading-container');
    loading.style.display = 'none';
}

async function processImage(file) {
    try {
        showLoading();
        document.getElementById('newQuestion').style.display = 'block';
        const results = await processImageWithGemini(file);
        displayResults(results);
    } catch (error) {
        console.error('Erro ao processar imagem:', error);
        alert('Erro ao processar a imagem. Por favor, tente novamente.');
    } finally {
        hideLoading();
    }
}

function displayResults(results) {
    document.getElementById('linksContent').innerHTML = marked.parse(results.links);
    document.getElementById('lessonContent').innerHTML = marked.parse(results.lesson);
    accordion.open(0);
}