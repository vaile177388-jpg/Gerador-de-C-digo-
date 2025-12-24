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

    generateBtn.addEventListener('click', async () => {
        const prompt = promptInput.value.trim();
        
        if (!prompt) {
            alert('Please enter a project description');
            return;
        }

        // Show loading state
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
                throw new Error('Failed to generate code');
            }

            const data = await response.json();
            currentFiles = data.files || [];
            
            if (currentFiles.length === 0) {
                throw new Error('No files were generated');
            }

            // Update UI with generated files
            renderFileTabs();
            showFileContent(0);
            outputContainer.classList.remove('hidden');
        } catch (error) {
            console.error('Error:', error);
            alert('Failed to generate code: ' + error.message);
        } finally {
            generateBtn.disabled = false;
            loadingIndicator.classList.add('hidden');
        }
    });

    downloadBtn.addEventListener('click', () => {
        if (currentFiles.length === 0) {
            alert('No files to download');
            return;
        }

        const zip = new JSZip();
        
        // Add all files to the zip
        currentFiles.forEach(file => {
            zip.file(file.name, file.content);
        });

        // Generate the zip file and trigger download
        zip.generateAsync({ type: 'blob' })
            .then(content => {
                const url = URL.createObjectURL(content);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'generated-project.zip';
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
            });
    });

    function renderFileTabs() {
        fileTabs.innerHTML = '';
        
        currentFiles.forEach((file, index) => {
            const tab = document.createElement('div');
            tab.className = `file-tab px-4 py-3 cursor-pointer border-b-2 ${index === currentTabIndex ? 'border-indigo-500 text-indigo-600 font-medium' : 'border-transparent text-gray-500'}`;
            tab.textContent = file.name;
            tab.addEventListener('click', () => showFileContent(index));
            fileTabs.appendChild(tab);
        });
    }

    function showFileContent(index) {
        if (index < 0 || index >= currentFiles.length) return;
        
        currentTabIndex = index;
        codeOutput.textContent = currentFiles[index].content;
        
        // Highlight the active tab
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
        
        // Apply syntax highlighting (basic example)
        applyBasicSyntaxHighlighting();
    }

    function applyBasicSyntaxHighlighting() {
        // This is a very basic syntax highlighting approach
        // For a real project, consider using a library like Prism.js or Highlight.js
        const content = codeOutput.textContent;
        let highlighted = content;
        
        // HTML tags
        highlighted = highlighted.replace(/&lt;(\/?)(\w+)([^&]*)&gt;/g, '<span class="text-blue-600">&lt;$1$2$3&gt;</span>');
        
        // JavaScript keywords
        const jsKeywords = ['function', 'const', 'let', 'var', 'return', 'if', 'else', 'for', 'while', 'switch', 'case', 'break', 'default', 'try', 'catch', 'finally', 'throw', 'new', 'this', 'class', 'extends', 'import', 'export', 'async', 'await', 'true', 'false', 'null', 'undefined'];
        jsKeywords.forEach(keyword => {
            const regex = new RegExp(`\\b${keyword}\\b`, 'g');
            highlighted = highlighted.replace(regex, `<span class="text-purple-600">${keyword}</span>`);
        });
        
        // Strings
        highlighted = highlighted.replace(/(".*?"|'.*?')/g, '<span class="text-green-600">$1</span>');
        
        // Numbers
        highlighted = highlighted.replace(/\b(\d+)\b/g, '<span class="text-orange-600">$1</span>');
        
        // Comments
        highlighted = highlighted.replace(/\/\/.*$/gm, '<span class="text-gray-400">$&</span>');
        highlighted = highlighted.replace(/\/\*[\s\S]*?\*\//g, '<span class="text-gray-400">$&</span>');
        
        codeOutput.innerHTML = highlighted;
    }
});