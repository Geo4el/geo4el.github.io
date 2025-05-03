document.addEventListener('DOMContentLoaded', function() {
    // Показываем первую страну по умолчанию
    const defaultCountry = 'brazil';
    showCountry(defaultCountry);
    document.getElementById('countrySelect').value = defaultCountry;
    
    // Обработчик выбора страны
    document.getElementById('countrySelect').addEventListener('change', function() {
        const selectedCountry = this.value;
        if (selectedCountry) {
            showCountry(selectedCountry);
        }
    });
    
    // Инициализация карт
    initMapViewers();
});

function showCountry(countryId) {
    // Скрываем все страны
    document.querySelectorAll('.country-economy').forEach(el => {
        el.classList.remove('active');
    });
    
    // Показываем выбранную
    const countryElement = document.getElementById(countryId);
    if (countryElement) {
        countryElement.classList.add('active');
        countryElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
}

document.addEventListener('DOMContentLoaded', function() {
    // Инициализация всех карт
    document.querySelectorAll('.map-preview').forEach(preview => {
        // Установка размеров превью из data-атрибутов
        const width = preview.dataset.previewWidth || '600';
        const height = preview.dataset.previewHeight || '400';
        preview.style.maxWidth = `${width}px`;
        preview.querySelector('img').style.height = `${height}px`;

        // Обработчик клика
        preview.addEventListener('click', function() {
            const fullMapUrl = this.dataset.fullMap;
            const title = this.querySelector('img').alt;
            
            openMapModal(fullMapUrl, title);
        });

        // Предзагрузка при наведении
        preview.addEventListener('mouseenter', function() {
            const img = new Image();
            img.src = this.dataset.fullMap;
        });
    });
});

function openMapModal(url, title) {
    const modal = document.getElementById('mapModal');
    const img = document.getElementById('fullMapImage');
    const titleElement = document.getElementById('mapTitle');
    
    img.src = url;
    img.alt = title;
    titleElement.textContent = title;
    
    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
}

// Закрытие модального окна
document.querySelector('.close-btn').addEventListener('click', closeModal);
document.getElementById('mapModal').addEventListener('click', function(e) {
    if (e.target === this) closeModal();
});

function closeModal() {
    document.getElementById('mapModal').style.display = 'none';
    document.body.style.overflow = 'auto';
}

// Закрытие по ESC
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') closeModal();
});

let comparisonBaseCountry = null;

function initComparison(countryId) {
    // Скрываем все открытые контролы сравнения
    document.querySelectorAll('.compare-controls').forEach(el => {
        el.style.display = 'none';
    });
    
    // Устанавливаем базовую страну для сравнения
    comparisonBaseCountry = countryId;
    
    // Показываем контролы для выбранной страны
    const controls = document.getElementById(`compareControls-${countryId}`);
    controls.style.display = 'flex';
    
    // Обновляем список стран (исключая текущую)
    const select = document.getElementById(`compareSelect-${countryId}`);
    Array.from(select.options).forEach(option => {
        option.disabled = option.value === countryId;
    });
}

function cancelComparison(countryId) {
    document.getElementById(`compareControls-${countryId}`).style.display = 'none';
    comparisonBaseCountry = null;
}

function confirmComparison(countryId) {
    const select = document.getElementById(`compareSelect-${countryId}`);
    const selectedCountry = select.value;
    
    if (!selectedCountry) {
        alert('Пожалуйста, выберите страну для сравнения');
        return;
    }
    
    showComparison(countryId, selectedCountry);
    cancelComparison(countryId);
}

function showComparison(country1Id, country2Id) {
    const country1 = document.getElementById(country1Id);
    const country2 = document.getElementById(country2Id);
    
    // Создаем HTML для сравнения
    const comparisonHTML = `
        <div class="comparison-view active">
            <h3>Сравнение стран</h3>
            <div class="comparison-grid">
                <div>
                    <div class="comparison-header">
                        <img src="${country1.querySelector('.flag-svg').src}" 
                             alt="${country1Id}" class="comparison-flag">
                        <h4>${country1.querySelector('.country-name').textContent}</h4>
                    </div>
                    ${getComparisonData(country1)}
                </div>
                <div>
                    <div class="comparison-header">
                        <img src="${country2.querySelector('.flag-svg').src}" 
                             alt="${country2Id}" class="comparison-flag">
                        <h4>${country2.querySelector('.country-name').textContent}</h4>
                    </div>
                    ${getComparisonData(country2)}
                </div>
            </div>
            <button class="brics-btn" onclick="closeComparison()">Закрыть сравнение</button>
        </div>
    `;
    
    // Вставляем на страницу (или обновляем существующее)
    let comparisonContainer = document.querySelector('.comparison-view');
    if (!comparisonContainer) {
        comparisonContainer = document.createElement('div');
        document.querySelector('.country-economy-container').appendChild(comparisonContainer);
    }
    comparisonContainer.innerHTML = comparisonHTML;
    
    // Прокрутка к результатам сравнения
    comparisonContainer.scrollIntoView({ behavior: 'smooth' });
}

function getComparisonData(countryElement) {
const exportPartners = Array.from(countryElement.querySelectorAll('.trade-column:nth-child(1) .partner'))
        .map(p => `<li>${p.querySelector('.partner-name').textContent} (${p.querySelector('.partner-percent').textContent})</li>`)
        .join('');

    const importPartners = Array.from(countryElement.querySelectorAll('.trade-column:nth-child(2) .partner'))
        .map(p => `<li>${p.querySelector('.partner-name').textContent} (${p.querySelector('.partner-percent').textContent})</li>`)
        .join(''); 
    return `
        <p><strong>ВВП:</strong> ${countryElement.querySelector('.indicator .value').textContent}</p>
        <p><strong>ВВП на душу:</strong> ${countryElement.querySelectorAll('.indicator .value')[1].textContent}</p>
        <p><strong>Рост экономики:</strong> ${countryElement.querySelectorAll('.indicator .value')[2].textContent}</p>
        <p><strong>Основные торговые партнеры:</strong></p>
        <h5>Экспорт:</h5>
        <ul>
            ${exportPartners}
        </ul>
        <h5>Импорт:</h5>
        <ul>
            ${importPartners}
        </ul>
    `;
}

function closeComparison() {
    const comparisonContainer = document.querySelector('.comparison-view');
    if (comparisonContainer) {
        comparisonContainer.remove();
    }
}

function updateTradeData(countryId, data) {
    const countryElement = document.getElementById(countryId);
    
    // Обновление экспорта
    const exportContainer = countryElement.querySelector('.trade-column:nth-child(1) .trade-partners');
    exportContainer.innerHTML = data.export.map(partner => `
        <div class="partner">
            <span class="partner-name">${partner.name}</span>
            <span class="partner-percent">${partner.percent}%</span>
        </div>
    `).join('');
    
    // Обновление импорта
    const importContainer = countryElement.querySelector('.trade-column:nth-child(2) .trade-partners');
    importContainer.innerHTML = data.import.map(partner => `
        <div class="partner">
            <span class="partner-name">${partner.name}</span>
            <span class="partner-percent">${partner.percent}%</span>
        </div>
    `).join('');
}