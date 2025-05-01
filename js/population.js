// Увеличение карты
function openMapModal(previewElement) {
    const imgSrc = previewElement.querySelector('img').src.replace('-thumb', '');
    const imgAlt = previewElement.querySelector('img').alt;
    
    const modal = document.getElementById("mapModal");
    const modalImg = document.getElementById("modalImage");
    const caption = document.getElementById("modalCaption");
    
    modal.style.display = "block";
    modalImg.src = imgSrc;
    caption.textContent = imgAlt;
    document.body.style.overflow = "hidden";
    
    // Закрытие по клику вне изображения
    modal.onclick = function(event) {
        if (event.target === modal || event.target.classList.contains('close-modal')) {
            closeMapModal();
        }
    }
}

// Закрытие модального окна
function closeMapModal() {
    document.getElementById("mapModal").style.display = "none";
    document.body.style.overflow = "auto";
}

// Закрытие по ESC
document.addEventListener('keydown', function(event) {
    if (event.key === "Escape" && document.getElementById("mapModal").style.display === "block") {
        closeMapModal();
    }
});

// Переключение между картами (остается без изменений)
function switchMap(btn, mapId) {
    const tabs = btn.parentElement.querySelectorAll('.map-tab');
    tabs.forEach(tab => tab.classList.remove('active'));
    btn.classList.add('active');
    
    const container = btn.closest('.country-card').querySelector('.map-container');
    const maps = container.querySelectorAll('.map-preview');
    maps.forEach(map => map.classList.remove('active'));
    container.querySelector(`.map-preview[data-map="${mapId}"]`).classList.add('active');
}

const scrollToTopBtn = document.getElementById("scrollToTopBtn");
const rootElement = document.documentElement;

// Показываем кнопку, когда пользователь прокрутил вниз на 100px
window.addEventListener("scroll", () => {
  if (window.pageYOffset > 100) {
    scrollToTopBtn.style.display = "block";
  } else {
    scrollToTopBtn.style.display = "none";
  }
});

// Плавная прокрутка вверх при клике
scrollToTopBtn.addEventListener("click", () => {
  rootElement.scrollTo({
    top: 0,
    behavior: "smooth"
  });
});