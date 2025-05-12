// Script para alternar entre os editores
const fileItems = document.querySelectorAll('.file-item');
const editorContainers = document.querySelectorAll('.editor-container');

fileItems.forEach(item => {
    item.addEventListener('click', () => {
        // Atualiza a classe ativa no item da lista
        fileItems.forEach(f => f.classList.remove('active'));
        item.classList.add('active');
        
        // Exibe o editor correspondente
        const fileType = item.getAttribute('data-file');
        editorContainers.forEach(editor => {
            editor.classList.remove('active');
        });
        document.getElementById(`${fileType}-editor`).classList.add('active');
    });
});

// Sincronização do scroll entre números de linha e conteúdo de código
document.querySelectorAll('.code-content').forEach(content => {
    content.addEventListener('scroll', function() {
        const lineNumbers = this.parentElement.querySelector('.line-numbers');
        lineNumbers.scrollTop = this.scrollTop;
    });
});

// Ajustar os números de linha para cada editor
document.querySelectorAll('.editor-container').forEach(container => {
    const codeContent = container.querySelector('.code-content');
    const lineNumbers = container.querySelector('.line-numbers');
    
    // Contar o número de linhas no código
    const lineCount = (codeContent.textContent.match(/\n/g) || []).length + 1;
    
    // Limpar e adicionar linhas suficientes
    lineNumbers.innerHTML = '';
    for (let i = 1; i <= lineCount; i++) {
        const div = document.createElement('div');
        div.textContent = i;
        lineNumbers.appendChild(div);
    }
});
