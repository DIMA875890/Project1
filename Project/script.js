const components = document.querySelectorAll('.component');
const dropzone = document.getElementById('dropzone');
const completeBtn = document.getElementById('completeBtn');
const resetBtn = document.getElementById('resetBtn');
const configOutput = document.getElementById('configOutput');

components.forEach(component => {
    component.addEventListener('dragstart', handleDragStart);
});

dropzone.addEventListener('dragover', handleDragOver);
dropzone.addEventListener('drop', handleDrop);

completeBtn.addEventListener('click', handleComplete);
resetBtn.addEventListener('click', handleReset);

function handleDragStart(e) {
    if (e.target.classList.contains('blocked')) {
        e.preventDefault();
        return;
    }
    e.dataTransfer.setData('text/plain', e.target.id);
    e.dataTransfer.effectAllowed = 'move';
}

function handleDragOver(e) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    dropzone.classList.add('dragover');
}

function handleDrop(e) {
    e.preventDefault();
    const id = e.dataTransfer.getData('text/plain');
    const component = document.getElementById(id);
    const componentType = component.getAttribute('data-type');

    if (!isComponentTypeInDropzone(componentType)) {
        const clone = component.cloneNode(true); 
        clone.removeAttribute('id'); 
        component.addEventListener('click', handleComponentClick); 
        dropzone.appendChild(clone); 
        clone.classList.add('selected'); 
        component.classList.add('blocked'); 
        dropzone.classList.remove('dragover');
    }
}

function handleComponentClick(e) {
    const component = e.target;
    const componentType = component.getAttribute('data-type');
    
    dropzone.removeChild(component);
    component.removeEventListener('click', handleComponentClick); 
    component.classList.remove('selected'); 
    unblockComponentsOfType(componentType); 
}

function isComponentTypeInDropzone(type) {
    return Array.from(dropzone.children).some(child => child.getAttribute('data-type') === type);
}

function blockComponentsOfType(type) {
    components.forEach(component => {
        if (component.getAttribute('data-type') === type) {
            component.classList.add('blocked');
            component.setAttribute('draggable', 'false');
        }
    });
}

function unblockComponentsOfType(type) {
    components.forEach(component => {
        if (component.getAttribute('data-type') === type) {
            component.classList.remove('blocked');
            component.setAttribute('draggable', 'true');
        }
    });
}

function handleComplete() {
    const selectedComponents = Array.from(dropzone.children).map(child => ({
        type: child.getAttribute('data-type'),
        name: child.textContent
    }));
    const allComponentsSelected = checkAllComponentsSelected();

    if (allComponentsSelected) {
        const configurationSummary = getConfigurationSummary(selectedComponents);
        configOutput.innerHTML = `${configurationSummary}`;
        configOutput.style.display = 'block';
    } else {
        configOutput.innerHTML = `<p>Виберіть всі необхідні компоненти перед завершенням</p>`;
        configOutput.style.display = 'block';
    }
}

function getConfigurationSummary(selectedComponents) {
    const componentCategories = {
        'cpu': 'Процесор',
        'gpu': 'Відеокарта',
        'ram': 'Оперативна пам\'ять',
        'hdd': 'Жорсткий диск',
        'psu': 'Блок живлення',
        'cooling': 'Охолодження'
    };

    let summary = '<h3>Ваша конфігурація:</h3><ul>';
    selectedComponents.forEach(component => {
        const categoryName = componentCategories[component.type];
        if (categoryName) {
            summary += `<li>${categoryName}: ${component.name}</li>`;
        }
    });
    summary += '</ul>';

    return summary || "Немає вибраних компонентів";
}

function checkAllComponentsSelected() {
    const types = ['cpu', 'gpu', 'ram', 'hdd', 'psu', 'cooling'];
    let allSelected = true;

    types.forEach(type => {
        if (!isComponentTypeInDropzone(type)) {
            allSelected = false;
        }
    });

    return allSelected;
}

function handleReset() {
    while (dropzone.firstChild) {
        dropzone.removeChild(dropzone.firstChild);
    }
    components.forEach(component => {
        component.classList.remove('blocked');
        component.setAttribute('draggable', 'true');
    });
}
