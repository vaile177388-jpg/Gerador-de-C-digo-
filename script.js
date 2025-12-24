document.addEventListener('DOMContentLoaded', () => {
    const promptInput = document.getElementById('promptInput');
    const generateBtn = document.getElementById('generateBtn');
    const loadingIndicator = document.getElementById('loadingIndicator');
    const outputContainer = document.getElementById('outputContainer');
    const fileTabs = document.getElementById('fileTabs');
    const codeOutput = document.getElementById('codeOutput');

    let currentFiles = [];

    generateBtn.addEventListener('click', async () => {
        const val = promptInput.value.trim();
        if (!val) return alert('Digite algo!');

        generateBtn.disabled = true;
        loadingIndicator.classList.remove('hidden');
        
        try {
            const response = await fetch('/api/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ prompt: val })
            });

            if (!response.ok) throw new Error('Erro na resposta do servidor');

            const data = await response.json();
            currentFiles = data.files || [];
            
            fileTabs.innerHTML = '';
            currentFiles.forEach((file, i) => {
                const btn = document.createElement('button');
                btn.className = "px-4 py-2 border-b-2 border-indigo-500";
                btn.textContent = file.name;
                btn.onclick = () => { codeOutput.textContent = file.content; };
                fileTabs.appendChild(btn);
            });

            codeOutput.textContent = currentFiles[0]?.content || '';
            outputContainer.classList.remove('hidden');
        } catch (e) {
            alert('Falha: ' + e.message);
        } finally {
            generateBtn.disabled = false;
            loadingIndicator.classList.add('hidden');
        }
    });
});
