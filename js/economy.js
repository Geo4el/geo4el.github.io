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