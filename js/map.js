// Инициализация карты
const map = L.map('map', {
    attributionControl: false,
    worldCopyJump: true,  
    maxBoundsViscosity: 0.5, 
    minZoom: 2,  
    maxZoom: 10  
}).setView([20, 80], 4);

// Границы карты
map.setMaxBounds([
    [-85, -180],  // Нижняя граница
    [85, 180]     // Верхняя граница
]);

// Добавление подложки OSM
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '',
    noWrap: false
}).addTo(map);


map.on('zoomend', function() {
    if (map.getZoom() < 2) map.setZoom(2);
    if (map.getZoom() > 8) map.setZoom(8);
});

// Стили
const bricsStyle = {
    fillColor: '#ffcaaf',
    weight: 1,
    opacity: 1,
    color: 'white',
    fillOpacity: 0.7
};

const brics5Style = {
    fillColor: '#eba987',
    weight: 1,
    opacity: 1,
    color: 'white',
    fillOpacity: 0.7
};

const bricsPlusStyle = {
    fillColor: '#ffdf84',
    weight: 1,
    opacity: 1,
    color: 'white',
    fillOpacity: 0.7
};

const getCityStyle = f => ({
    radius: 5,
    color: "#000",
    weight: 1.2,
    opacity: 1,
    fillOpacity: 1,
    fillColor: f.properties.Саммит === 1 ? "#926EAE" : "#fff"
});

const createCityMarker = (f, latlng) => {
    const marker = L.circleMarker(latlng, getCityStyle(f));
    
    if (f.properties.Столица === 1) {
        
        const group = L.featureGroup();
        marker.addTo(group);
        
        // Внутренняя точку
        const innerDot = L.circleMarker(latlng, {
            radius: 2,
            color: "#000",
            weight: 1,
            fillColor: "#000",
            fillOpacity: 1,
            interactive: false 
        }).addTo(group);
        
        // Привязка точки к маркеру
        marker.on('remove', () => group.removeLayer(innerDot));
        marker.on('add', () => {
            if (!group.hasLayer(innerDot)) {
                innerDot.addTo(group);
            }
            group.addTo(marker._map);
        });
        
        return group;
    }
    
    return marker;
};

// Подписи
function createLabel(latlng, name) {
    return L.marker(latlng, {
        icon: L.divIcon({
            className: 'city-label',
            html: `<div>${name}</div>`,
            iconSize: [100, 20]
        }),
        zIndexOffset: 1000,
        interactive: false
    });
}

// Функции для работы с попапом
function showPopup(content) {
    const popup = document.getElementById('customPopup');
    const nameElement = document.getElementById('popupCountryName');
    const imageElement = document.getElementById('popupCountryImage');
    const infoElement = document.getElementById('popupCountryInfo');
    
    nameElement.textContent = content.title || '';
    
    if (content.image) {
        imageElement.style.backgroundImage = `url(${content.image})`;
        imageElement.innerHTML = '';
    } else {
        imageElement.style.backgroundImage = '';
        imageElement.innerHTML = content.imagePlaceholder || '[]';
    }
    
    infoElement.innerHTML = content.description || '';
    popup.classList.add('visible');
}

function closePopup() {
    document.getElementById('customPopup').classList.remove('visible');
}

// Группу слоев
const bricsLayer = L.layerGroup();
const brics5Layer = L.layerGroup();
const bricsPlusLayer = L.layerGroup();
const citiesLayer = L.layerGroup();
const labelsLayer = L.layerGroup();

// Загрузка данных
Promise.all([
    fetch('brics.geojson').then(res => res.json()),
    fetch('brics5.geojson').then(res => res.json()),
    fetch('brics+.geojson').then(res => res.json()),
    fetch('cities.geojson').then(res => res.json())
])
.then(([bricsData, brics5Data, bricsPlusData, citiesData]) => {
    // Слой BRICS
L.geoJSON(bricsData, {
    style: bricsStyle,
    onEachFeature: (feature, layer) => {
        layer.on('click', () => {
            const countryName = feature.properties.Имя || feature.properties.NAME;
            let countryData = {
                title: countryName,
                description: `<p>Страна-член объединения BRICS</p>`,
                image: null
            };

            // Уникальные данные для каждой страны BRICS
            switch(countryName.toLowerCase()) {
                
                case 'египет':
                case 'egypt':
                    countryData.description = `
                        <div class="country-info">
                            <p>Страна с богатой историей, известная своими древними памятниками, такими как пирамиды Гизы и храм Карнака. Египет находится на пересечении Африки и Ближнего Востока, и его культура сочетает в себе элементы арабской, африканской и средиземноморской традиций. Каир, столица, является крупнейшим городом страны и важным культурным центром.</p>
                        </div>
                    `;
                    countryData.image = 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e3/Kheops-Pyramid.jpg/800px-Kheops-Pyramid.jpg';
                    break;
                
                case 'эфиопия':
                case 'ethiopia':
                    countryData.description = `
                        <div class="country-info">
                            <p>Одна из самых древних стран мира с уникальной историей и культурой. Эфиопия известна своим разнообразием языков и этнических групп, а также как родина кофе. Страна имеет множество исторических достопримечательностей, включая Лалибелу с её скальными церквями и Аксум с древними обелисками.</p>
                        </div>
                    `;
                    countryData.image = 'https://i.pinimg.com/736x/9e/31/df/9e31df0cffb7fa2dc5b2ea68079d8a12.jpg';
                    break;
                
                case 'иран':
                case 'iran':
                    countryData.description = `
                        <div class="country-info">
                            <p>Страна с богатым культурным наследием, известная своей архитектурой, поэзией и историей. Иран славится такими городами, как Исфахан и Шираз, а также историческими памятниками, такими как Персеполь. Страна имеет разнообразную природу, от гор до пустынь.</p>
                        </div>
                    `;
                    countryData.image = 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/ba/Naqsh-e_Jahan_Square_Isfahan_modified.jpg/800px-Naqsh-e_Jahan_Square_Isfahan_modified.jpg';
                    break;
                
                case 'саудовская аравия':
                case 'saudi arabia':
                    countryData.description = `
                        <div class="country-info">
                            <p>Страна, известная как родина ислама, с важными святыми местами, такими как Мекка и Медина. Саудовская Аравия обладает значительными запасами нефти и играет ключевую роль в мировой экономике. Страна активно развивает свои города, включая столицу Эр-Рияд.

</p>
                        </div>
                    `;
                    countryData.image = 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/38/Al_Masjid_an_Nabawi_%28The_Prophet%27s_Mosque%29%2C_Medina%2C_Saudi_Arabia.jpg/800px-Al_Masjid_an_Nabawi_%28The_Prophet%27s_Mosque%29%2C_Medina%2C_Saudi_Arabia.jpg';
                    break;

                    case 'индонезия':
                case 'indonesia':
                    countryData.description = `
                        <div class="country-info">
                            <p>Архипелаг, состоящий из более чем 17,000 островов, Индонезия известна своей разнообразной культурой и биоразнообразием. Страна славится своими пляжами, вулканами и уникальными традициями. Джакарта, столица, является одним из крупнейших городов Юго-Восточной Азии.</p>
                        </div>
                    `;
                    countryData.image = 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/38/Al_Masjid_an_Nabawi_%28The_Prophet%27s_Mosque%29%2C_Medina%2C_Saudi_Arabia.jpg/800px-Al_Masjid_an_Nabawi_%28The_Prophet%27s_Mosque%29%2C_Medina%2C_Saudi_Arabia.jpg';
                    break;
                
                case 'объединённые арабские эмираты':
                case 'united arab emirates':
                    countryData.description = `
                        <div class="country-info">
                            <p>Федерация семи эмиратов, включая Дубай и Абу-Даби. ОАЭ известны своей современной архитектурой, роскошными курортами и культурными мероприятиями. Страна активно развивает туризм и бизнес, привлекая людей со всего мира.</p>
                        </div>
                    `;
                    countryData.image = 'https://avatars.mds.yandex.net/i?id=e73862a29840d4fdc5cea033986631df1e27b456-5858870-images-thumbs&n=13';
                    break;
            }

            showPopup(countryData);
        });
    }
}).addTo(bricsLayer);

    // Слой BRICS5
L.geoJSON(brics5Data, {
    style: brics5Style,
    onEachFeature: (feature, layer) => {
        layer.on('click', () => {
            const countryName = feature.properties.Имя || feature.properties.name;
            let countryData = {
                title: countryName,
                description: `<p>Страна-основатель БРИКС</p>`,
                image: null
            };

            // Уникальные данные для каждой страны
            switch(countryName.toLowerCase()) {
                case 'китай':
                case 'china':
                    countryData.description = `
                        <div class="country-info">
                            <p>Китай известен своей древней цивилизацией, уникальной культурой, а также современными мегаполисами, такими как Пекин и Шанхай. Страна активно развивает технологии и промышленность.</p>
                        </div>
                    `;
                    countryData.image = 'https://img.freepik.com/free-photo/great-wall_1359-1016.jpg';
                    break;
                
                case 'россия':
                case 'russia':
                    countryData.description = `
                        <div class="country-info">
                            <p>Самая большая страна в мире, охватывающая Восточную Европу и Северную Азию. Россия славится своим разнообразием культур, природными ресурсами и историческим наследием, включая архитектуру, литературу и искусство.</p>
                        </div>
                    `;
                    countryData.image = 'https://avatars.dzeninfra.ru/get-zen_doc/271828/pub_678f5ca8c0330e0fc49d449b_678f5d241587ed47e08112f8/scale_1200';
                    break;
                
                case 'индия':
                case 'india':
                    countryData.description = `
                        <div class="country-info">
                            <p>Первая по населению страна, известная своим многообразием культур, языков и религий. Индия славится своей историей, архитектурными памятниками, такими как Тадж-Махал.</p>
                        </div>
                    `;
                    countryData.image = 'https://mir-s3-cdn-cf.behance.net/projects/max_808/c71d7478881861.Y3JvcCw0ODk1LDM4MjgsMjA1LDA.jpg';
                    break;
                
                case 'бразилия':
                case 'brazil':
                    countryData.description = `
                        <div class="country-info">
                            <p>Самая большая страна в Южной Америке, известная своей богатой природой, включая Амазонку, и культурными традициями, такими как карнавалы и самба. Бразилия имеет разнообразные экосистемы и является ведущим производителем кофе, сахара и сои.</p>
                        </div>
                    `;
                    countryData.image = 'https://www.lordabbett.com/content/dam/lordabbett-captivate/images/insights/markets-and-economy/2024/011124-Mapping-the-Landscape-for-Emerging-Markets-Debt.jpg';
                    break;
                
                case 'южно-африканская республика':
                case 'south africa':
                    countryData.description = `
                        <div class="country-info">
                            <p>Страна с разнообразной культурой и множеством языков. ЮАР известна своими природными красотами, включая национальные парки и заповедники, а также историей борьбы с апартеидом и значительными достижениями в области прав человека.</p>
                        </div>
                    `;
                    countryData.image = 'https://avatars.mds.yandex.net/i?id=08a665e8c599075f638cbcde899ade2e_l-5905783-images-thumbs&n=13';
                    break;
            }

            showPopup(countryData);
        });
    }
}).addTo(brics5Layer);

    // Слой BRICS+
    L.geoJSON(bricsPlusData, {
        style: bricsPlusStyle,
        onEachFeature: (feature, layer) => {
            layer.on('click', () => {
                showPopup({
                    title: feature.properties.Имя || feature.properties.NAME,
                    description: `<p>BRICS+</p>`
                });
            });
        }
    }).addTo(bricsPlusLayer);

    // Слой городов
L.geoJSON(citiesData, {
    pointToLayer: (feature, latlng) => {
        const marker = createCityMarker(feature, latlng);
        
        // Подпись города
        if (feature.properties.Имя) {
            createLabel(latlng, feature.properties.Имя).addTo(labelsLayer);
        }
        
        // Обработчик клика с информацией для каждого города
        marker.on('click', () => {
            const cityName = feature.properties.Имя.toLowerCase();
            let content = {
                title: feature.properties.Имя,
                description: feature.properties.population ? 
                    `<p>Население: ${feature.properties.population.toLocaleString()}</p>` : 
                    '<p></p>'
            };
            
            // Уникальная информация для конкретных городов
            switch(cityName) {
                case 'казань':
                    content.description += `
                        <div class="city-info">
                            <p>Столица Татарстана, известная своим богатым историческим и культурным наследием. Город славится Казанским Кремлём, который является объектом Всемирного наследия ЮНЕСКО, а также разнообразием культур, где сосуществуют ислам и православие.

</p>
                        </div>
                    `;
                    content.image = 'https://avatars.mds.yandex.net/get-entity_search/1539949/1132226598/orig';
                    break;
                    
                case 'москва':
                    content.description += `
                        <div class="city-info">
                            <p>Столица России и крупнейший город страны. Москва известна своими историческими памятниками, такими как Красная площадь, Кремль и собор Василия Блаженного. Город является культурным, экономическим и политическим центром России.</p>
                        </div>
                    `;
                    content.image = 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/01/Moscow_July_2011-16.jpg/800px-Moscow_July_2011-16.jpg';
                    break;
                    
                case 'уфа':
                    content.description += `
                        <div class="city-info">
                            <p>Столица Башкортостана, расположенная на берегу реки Белой. Уфа известна своим многонациональным населением и культурным разнообразием. Город также является важным промышленным и культурным центром, с множеством театров и музеев.</p>
                        </div>
                    `;
                    content.image = 'https://cdn.tripster.ru/thumbs2/2427a866-49f3-11ee-8bba-4e7c85935a75.1220x600.jpeg';
                    break;
                    
                case 'екатеринбург':
                    content.description += `
                        <div class="city-info">
                            <p>Крупный город на Урале, известный своей историей и архитектурой. Екатеринбург является важным промышленным и культурным центром, а также известен как место, где была убита царская семья Романовых. Город активно развивает бизнес и науку.</p>
                        </div>
                    `;
                    content.image = 'https://avatars.dzeninfra.ru/get-zen_doc/271828/pub_6670274de6db732f8edc21d9_667028786b7a9528adc345f2/scale_1200';
                    break;
            }
            
            showPopup(content);
        });
        
        return marker;
    }
}).addTo(citiesLayer);

    // Добавляем все слои на карту
    brics5Layer.addTo(map);
    bricsLayer.addTo(map);
    bricsPlusLayer.addTo(map);
    citiesLayer.addTo(map);
    labelsLayer.addTo(map);

    // Масштабирование под все данные
    const allData = {
        type: 'FeatureCollection',
        features: [...bricsData.features, ...brics5Data.features, ...bricsPlusData.features, ...citiesData.features]
    };
    map.fitBounds(L.geoJSON(allData).getBounds());
})
.catch(error => {
    console.error('Ошибка загрузки GeoJSON:', error);
    alert('Не удалось загрузить данные');
});

// Добавление масштаба
L.control.scale().addTo(map);

// Добавление контроля слоев
L.control.layers(null, {
    "Cтраны-основатели БРИКС": brics5Layer,
    "Cтраны БРИКС": bricsLayer,
    "Страны-партнеры БРИКС": bricsPlusLayer,
    "Города": citiesLayer,
    "Наименования городов": labelsLayer
}, { 
    position: 'topright',
    collapsed: false
}).addTo(map);

// Добавляем легенду
const legend = L.control({ position: 'topright' });

legend.onAdd = function(map) {
  const div = L.DomUtil.create('div', 'legend-image-only');
  div.innerHTML = `<img src="legend.png" alt="Легенда" style="width:220px">`;
  return div;
};

legend.addTo(map);