document.addEventListener('DOMContentLoaded', () => {
    const promptInput = document.getElementById('promptInput');
    const generateBtn = document.getElementById('generateBtn');
    const loadingIndicator = document.getElementById('loadingIndicator');
    const outputContainer = document.getElementById('outputContainer');
    const fileTabs = document.getElementById('fileTabs');
    const codeOutput = document.getElementById('codeOutput');
    const downloadBtn = document.getElementById('downloadBtn');

    let currentFiles = [];
    let currentTabIndex = 0;

    if (!generateBtn) {
        console.error("Erro: Botão generateBtn não encontrado no HTML.");
        return;
    }

    generateBtn.addEventListener('click', async () => {
        const prompt = promptInput.value.trim();
        
        if (!prompt) {
            alert('Por favor, descreva o seu projeto.');
            return;
        }

        generateBtn.disabled = true;
        loadingIndicator.classList.remove('hidden');
        outputContainer.classList.add('hidden');

        try {
            const response = await fetch('/api/generate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ prompt }),
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(errorText || 'Erro na resposta do servidor');
            }

            const data = await response.json();
            currentFiles = data.files || [];
            
            if (currentFiles.length === 0) {
                throw new Error('A IA não gerou arquivos.');
            }

            renderFileTabs();
            showFileContent(0);
            outputContainer.classList.remove('hidden');
        } catch (error) {
            console.error('Erro detalhado:', error);
            alert('Erro: ' + error.message);
        } finally {
            generateBtn.disabled = false;
            loadingIndicator.classList.add('hidden');
        }
    });

    downloadBtn.addEventListener('click', () => {
        if (currentFiles.length === 0) return;
        const zip = new JSZip();
        currentFiles.forEach(file => {
            zip.file(file.name, file.content);
        });
        zip.generateAsync({ type: 'blob' }).then(content => {
            const url = URL.createObjectURL(content);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'projeto.zip';
            a.click();
            URL.revokeObjectURL(url);
        });
    });

    function renderFileTabs() {
        fileTabs.innerHTML = '';
        currentFiles.forEach((file, index) => {
            const tab = document.createElement('div');
            tab.className = `file-tab px-4 py-3 cursor-pointer border-b-2 ${index === currentTabIndex ? 'border-indigo-500 text-indigo-600 font-medium' : 'border-transparent text-gray-500'}`;
            tab.textContent = file.name;
            tab.onclick = () => showFileContent(index);
            fileTabs.appendChild(tab);
        });
    }

    function showFileContent(index) {
        if (index < 0 || index >= currentFiles.length) return;
        currentTabIndex = index;
        codeOutput.textContent = currentFiles[index].content;
        const tabs = fileTabs.querySelectorAll('.file-tab');
        tabs.forEach((tab, i) => {
            if (i === index) {
                tab.classList.add('border-indigo-500', 'text-indigo-600', 'font-medium');
                tab.classList.remove('border-transparent', 'text-gray-500');
            } else {
                tab.classList.remove('border-indigo-500', 'text-indigo-600', 'font-medium');
                tab.classList.add('border-transparent', 'text-gray-500');
            }
        });
    }
});
