document.addEventListener('DOMContentLoaded', function() {
    // Обработчик для отслеживания скачиваний
    const downloadButtons = document.querySelectorAll('.download-btn');
    
    downloadButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            const fileName = this.getAttribute('download');
            console.log(`Начато скачивание: ${fileName}`);
            
            // Можно добавить аналитику или логирование
            // Например, отправить данные в Google Analytics
            if (typeof gtag !== 'undefined') {
                gtag('event', 'download', {
                    'file_name': fileName
                });
            }
        });
    });
    
    // Анимация при загрузке
    const countryBlocks = document.querySelectorAll('.country-block');
    countryBlocks.forEach((block, index) => {
        block.style.opacity = '0';
        block.style.transform = 'translateY(20px)';
        block.style.animation = `fadeInUp 0.5s ease-out ${index * 0.1}s forwards`;
    });
    
    // Добавляем стили для анимации
    const style = document.createElement('style');
    style.textContent = `
        @keyframes fadeInUp {
            from {
                opacity: 0;
                transform: translateY(20px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }
    `;
    document.head.appendChild(style);
});