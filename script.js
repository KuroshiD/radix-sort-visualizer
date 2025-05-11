// Elementos DOM
const originalArrayEl = document.getElementById('original-array');
const currentArrayEl = document.getElementById('current-array');
const bucketsEl = document.getElementById('buckets');
const explanationEl = document.getElementById('explanation');
const arrayInputEl = document.getElementById('array-input');
const sortTypeEl = document.getElementById('sort-type');
const startBtn = document.getElementById('start-btn');
const nextBtn = document.getElementById('next-btn');
const autoBtn = document.getElementById('auto-btn');
const resetBtn = document.getElementById('reset-btn');
const progressEl = document.getElementById('progress');

// Variáveis de estado
let originalArray = [];
let currentArray = [];
let maxDigits = 0;
let currentDigit = 0;
let buckets = Array.from({ length: 10 }, () => []);
let step = 0;
let totalSteps = 0;
let autoExecutionInterval = null;
let isMSD = false;
let msdSubarrays = [];
let currentSubarrayIndex = 0;

// Estados da visualização
const STATES = {
    INITIAL: 0,
    DIGIT_EXTRACTION: 1,
    BUCKETING: 2,
    COLLECTING: 3,
    MSD_SUBARRAYS: 4,
    COMPLETED: 5
};

let currentState = STATES.INITIAL;
let currentItemIndex = 0;

// Inicializar os baldes
const initializeBuckets = () => {
    document.getElementById('buckets-row-1').innerHTML = '';
    document.getElementById('buckets-row-2').innerHTML = '';
    buckets = Array.from({ length: 10 }, () => []);

    for (let row = 0; row < 2; row++) {
        const bucketRowEl = document.getElementById(`buckets-row-${row + 1}`);
        const startBucket = row * 5;
        const endBucket = startBucket + 5;

        for (let i = startBucket; i < endBucket; i++) {
            const bucket = document.createElement('div');
            bucket.className = 'bucket';

            const label = document.createElement('div');
            label.className = 'bucket-label';
            label.textContent = `Balde ${i}`;

            const bucketItems = document.createElement('div');
            bucketItems.className = 'bucket-items';
            bucketItems.id = `bucket-items-${i}`;

            bucket.appendChild(label);
            bucket.appendChild(bucketItems);
            bucket.id = `bucket-${i}`;
            bucketRowEl.appendChild(bucket);
        }
    }
};

// Renderizar o array
const renderArray = (arrayEl, array, highlightIndex = -1, digitPos = -1) => {
    arrayEl.innerHTML = '';

    array.forEach((num, index) => {
        const item = document.createElement('div');
        item.className = 'array-item';

        if (index === highlightIndex) {
            item.classList.add('current');
        }

        if (digitPos >= 0) {
            const numStr = num.toString().padStart(maxDigits, '0');
            let highlightIndex;

            if (isMSD) {
                highlightIndex = digitPos;
            } else {
                highlightIndex = maxDigits - 1 - digitPos;
            }

            const span = document.createElement('span');
            span.innerHTML = numStr.substring(0, highlightIndex) +
                `<span class="digit-highlight">${numStr[highlightIndex]}</span>` +
                numStr.substring(highlightIndex + 1);
            item.appendChild(span);
        } else {
            item.textContent = num;
        }

        arrayEl.appendChild(item);
    });
};

// Adicionar um número a um balde
const addToBucket = (bucketIndex, num) => {
    buckets[bucketIndex].push(num);

    const bucketItems = document.getElementById(`bucket-items-${bucketIndex}`);
    const item = document.createElement('div');
    item.className = 'bucket-item';
    item.textContent = num;
    bucketItems.appendChild(item);
};

// Limpar os baldes
const clearBuckets = () => {
    for (let i = 0; i < 10; i++) {
        const bucketItems = document.getElementById(`bucket-items-${i}`);
        if (bucketItems) {
            bucketItems.innerHTML = '';
        }
        buckets[i] = [];
    }
};

// Iniciar o algoritmo
const startAlgorithm = () => {
    const input = arrayInputEl.value.trim();
    if (!input) {
        alert('Por favor, insira alguns números.');
        return;
    }

    try {
        originalArray = input.split(',').map(n => parseInt(n.trim(), 10));
        if (originalArray.some(isNaN)) {
            throw new Error('Entrada inválida');
        }
        if (originalArray.some(n => n < 0)) {
            alert('Por favor, use apenas números positivos para esta demonstração.');
            return;
        }
    } catch (error) {
        alert('Por favor, insira números válidos separados por vírgulas.');
        return;
    }

    isMSD = sortTypeEl.value === 'msd';
    currentArray = [...originalArray];
    maxDigits = Math.max(...currentArray.map(n => n.toString().length));
    currentDigit = isMSD ? 0 : 0;
    currentState = STATES.INITIAL;
    currentItemIndex = 0;
    step = 0;

    if (isMSD) {
        totalSteps = calculateMSDSteps([...currentArray], 0);
    } else {
        totalSteps = maxDigits * (currentArray.length + 2);
    }

    if (isMSD) {
        msdSubarrays = [{ array: [...currentArray], digitPos: 0 }];
        currentSubarrayIndex = 0;
    }

    renderArray(originalArrayEl, originalArray);
    renderArray(currentArrayEl, currentArray);
    initializeBuckets();

    startBtn.disabled = true;
    nextBtn.disabled = false;
    autoBtn.disabled = false;
    resetBtn.disabled = false;

    if (isMSD) {
        explanationEl.innerHTML = `
                    <p>Vamos começar a ordenação MSD Radix Sort!</p>
                    <p>O array tem ${originalArray.length} números e o maior número tem ${maxDigits} dígitos.</p>
                    <p>Vamos processar dígito por dígito, começando pelo dígito mais significativo (primeiro dígito da esquerda).</p>
                    <p>Total de passos calculados: ${totalSteps}</p>
                `;
    } else {
        explanationEl.innerHTML = `
                    <p>Vamos começar a ordenação LSD Radix Sort!</p>
                    <p>O array tem ${originalArray.length} números e o maior número tem ${maxDigits} dígitos.</p>
                    <p>Vamos processar dígito por dígito, começando pelo dígito menos significativo (unidades).</p>
                    <p>Total de passos calculados: ${totalSteps}</p>
                `;
    }

    updateProgress();
};

// Função para calcular previamente o número de passos para o MSD
const calculateMSDSteps = (array, digitPos) => {
    if (array.length <= 1 || digitPos >= maxDigits) {
        return 1;
    }
    let steps = 1 + array.length;
    const tempBuckets = Array.from({ length: 10 }, () => []);
    for (const num of array) {
        const digit = getMSDDigit(num, digitPos);
        tempBuckets[digit].push(num);
    }
    steps += 1;
    for (const bucket of tempBuckets) {
        if (bucket.length > 0) {
            steps += calculateMSDSteps(bucket, digitPos + 1);
        }
    }
    return steps;
};

// Próximo passo do algoritmo
const nextStep = () => {
    step++;
    updateProgress();

    if (isMSD) {
        nextStepMSD();
    } else {
        nextStepLSD();
    }
};

// Próximo passo do algoritmo LSD
const nextStepLSD = () => {
    switch (currentState) {
        case STATES.INITIAL:
            explanationEl.innerHTML = `
                        <p>Começando a ordenação pelo dígito da posição ${currentDigit + 1} (da direita para a esquerda).</p>
                    `;
            currentState = STATES.DIGIT_EXTRACTION;
            currentItemIndex = 0;
            clearBuckets();
            break;

        case STATES.DIGIT_EXTRACTION:
            const num = currentArray[currentItemIndex];
            const digit = getDigit(num, currentDigit);

            renderArray(currentArrayEl, currentArray, currentItemIndex, currentDigit);

            explanationEl.innerHTML = `
                        <p>Extraindo o dígito da posição ${currentDigit + 1} do número <strong>${num}</strong>.</p>
                        <p>O dígito é <span class="digit-highlight">${digit}</span>, então colocamos ${num} no Balde ${digit}.</p>
                    `;

            addToBucket(digit, num);

            currentItemIndex++;
            if (currentItemIndex >= currentArray.length) {
                currentState = STATES.COLLECTING;
                currentItemIndex = 0;

                explanationEl.innerHTML += `
                            <p>Todos os números foram distribuídos nos baldes.</p>
                            <p>Agora vamos coletar os números de cada balde na ordem (0-9).</p>
                        `;
            }
            break;

        case STATES.COLLECTING:
            let newArray = [];
            for (let i = 0; i < 10; i++) {
                newArray = newArray.concat(buckets[i]);
            }

            currentArray = newArray;
            renderArray(currentArrayEl, currentArray);

            explanationEl.innerHTML = `
                        <p>Coletamos todos os números dos baldes na ordem de 0 a 9.</p>
                        <p>O array após processar o dígito da posição ${currentDigit + 1} é:</p>
                        <p><strong>[${currentArray.join(', ')}]</strong></p>
                    `;

            currentDigit++;
            if (currentDigit < maxDigits) {
                currentState = STATES.INITIAL;
            } else {
                currentState = STATES.COMPLETED;
                explanationEl.innerHTML = `
                            <p>Todos os dígitos foram processados!</p>
                            <p>O array está completamente ordenado: <strong>[${currentArray.join(', ')}]</strong></p>
                            <p>O LSD Radix Sort é um algoritmo estável, o que significa que a ordem relativa de elementos com o mesmo valor é preservada.</p>
                        `;

                nextBtn.disabled = true;
                autoBtn.disabled = true;
                stopAutoExecution();
            }
            break;
    }
};

// Próximo passo do algoritmo MSD
const nextStepMSD = () => {
    if (currentSubarrayIndex >= msdSubarrays.length) {
        currentState = STATES.COMPLETED;
        explanationEl.innerHTML = `
                    <p>Todos os subarrays foram processados!</p>
                    <p>O array está completamente ordenado: <strong>[${currentArray.join(', ')}]</strong></p>
                    <p>O MSD Radix Sort divide recursivamente o problema em subproblemas menores, ordenando cada subarray pelo dígito atual.</p>
                `;

        nextBtn.disabled = true;
        autoBtn.disabled = true;
        stopAutoExecution();
        return;
    }

    const currentSubarray = msdSubarrays[currentSubarrayIndex];

    switch (currentState) {
        case STATES.INITIAL:
            clearBuckets();
            currentArray = currentSubarray.array;
            currentDigit = currentSubarray.digitPos;

            if (currentArray.length <= 1 || currentDigit >= maxDigits) {
                currentSubarrayIndex++;
                if (currentSubarrayIndex >= msdSubarrays.length) {
                    currentArray = msdSubarrays.flatMap(sub => sub.array);
                    renderArray(currentArrayEl, currentArray);
                }
                break;
            }

            renderArray(currentArrayEl, currentArray);

            explanationEl.innerHTML = `
                        <p>Processando subarray [${currentArray.join(', ')}] pelo dígito na posição ${currentDigit + 1} (da esquerda para a direita).</p>
                    `;

            currentState = STATES.DIGIT_EXTRACTION;
            currentItemIndex = 0;
            break;

        case STATES.DIGIT_EXTRACTION:
            if (currentItemIndex >= currentArray.length) {
                currentState = STATES.COLLECTING;
                break;
            }

            const num = currentArray[currentItemIndex];
            const digitPos = currentDigit;
            const digit = getMSDDigit(num, digitPos);

            renderArray(currentArrayEl, currentArray, currentItemIndex, digitPos);

            explanationEl.innerHTML = `
                        <p>Extraindo o dígito da posição ${digitPos + 1} (da esquerda) do número <strong>${num}</strong>.</p>
                        <p>O dígito é <span class="digit-highlight">${digit}</span>, então colocamos ${num} no Balde ${digit}.</p>
                    `;

            addToBucket(digit, num);

            currentItemIndex++;
            break;

        case STATES.COLLECTING:
            msdSubarrays.splice(currentSubarrayIndex, 1);

            let anyBucketAdded = false;

            for (let i = 0; i < 10; i++) {
                if (buckets[i].length > 0) {
                    msdSubarrays.splice(currentSubarrayIndex, 0, {
                        array: [...buckets[i]],
                        digitPos: currentDigit + 1
                    });
                    currentSubarrayIndex++;
                    anyBucketAdded = true;
                }
            }

            if (anyBucketAdded) {
                currentSubarrayIndex -= anyBucketAdded ? 1 : 0;
            }

            currentArray = msdSubarrays.flatMap(sub => sub.array);
            renderArray(currentArrayEl, currentArray);

            explanationEl.innerHTML = `
                        <p>Distribuímos os números em baldes pelo dígito na posição ${currentDigit + 1}.</p>
                        <p>Agora temos ${msdSubarrays.length} subarrays para processar pelo próximo dígito.</p>
                        <p>Estado atual do array: <strong>[${currentArray.join(', ')}]</strong></p>
                    `;

            currentState = STATES.INITIAL;
            break;
    }
};

// Obter o dígito na posição especificada (da direita para a esquerda) para LSD
const getDigit = (num, pos) => Math.floor(Math.abs(num) / Math.pow(10, pos)) % 10;

// Obter o dígito na posição especificada (da esquerda para a direita) para MSD
const getMSDDigit = (num, pos) => {
    const numStr = num.toString().padStart(maxDigits, '0');
    return parseInt(numStr[pos], 10);
};

// Reiniciar a visualização
const resetVisualization = () => {
    originalArray = [];
    currentArray = [];
    currentDigit = 0;
    currentState = STATES.INITIAL;
    currentItemIndex = 0;
    step = 0;
    totalSteps = 0;
    msdSubarrays = [];
    currentSubarrayIndex = 0;

    originalArrayEl.innerHTML = '';
    currentArrayEl.innerHTML = '';
    clearBuckets();

    explanationEl.innerHTML = 'Clique em "Iniciar Algoritmo" para começar a visualização.';

    startBtn.disabled = false;
    nextBtn.disabled = true;
    autoBtn.disabled = true;
    resetBtn.disabled = true;

    stopAutoExecution();
    updateProgress();
};

// Atualizar a barra de progresso
const updateProgress = () => {
    const percentage = totalSteps > 0 ? (step / totalSteps) * 100 : 0;
    progressEl.style.width = `${Math.min(percentage, 100)}%`;
};

// Execução automática
const toggleAutoExecution = () => {
    if (autoExecutionInterval) {
        stopAutoExecution();
    } else {
        startAutoExecution();
    }
};

const startAutoExecution = () => {
    autoBtn.textContent = "Pausar Execução";
    autoExecutionInterval = setInterval(() => {
        nextStep();
        if (currentState === STATES.COMPLETED) {
            stopAutoExecution();
        }
    }, 1000);
};

const stopAutoExecution = () => {
    if (autoExecutionInterval) {
        clearInterval(autoExecutionInterval);
        autoExecutionInterval = null;
        autoBtn.textContent = "Execução Automática";
    }
};

// Event listeners
startBtn.addEventListener('click', startAlgorithm);
nextBtn.addEventListener('click', nextStep);
resetBtn.addEventListener('click', resetVisualization);
autoBtn.addEventListener('click', toggleAutoExecution);
sortTypeEl.addEventListener('change', resetVisualization);

// Inicialização
resetVisualization();