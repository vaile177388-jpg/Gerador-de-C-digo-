const response = await fetch('/api/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt: val })
});

if (!response.ok) {
    const errorText = await response.text(); // Pega o erro real do servidor
    throw new Error(errorText);
}
