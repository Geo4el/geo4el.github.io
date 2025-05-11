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
    [-85, -180],  
    [85, 180]     
]);

// Добавление подложки 
L.tileLayer('https://core-renderer-tiles.maps.yandex.net/tiles?l=map&x={x}&y={y}&z={z}', {
  attribution: 'Яндекс.Карты'
}).addTo(map);


map.on('zoomend', function() {
    if (map.getZoom() < 2) map.setZoom(2);
    if (map.getZoom() > 8) map.setZoom(8);
});

// Стили для стран
const bricsStyle = {
    fillColor: '#ffcaaf',
    weight: 1,
    opacity: 1,
    color: 'white',
    fillOpacity: 1
};

const brics5Style = {
    fillColor: '#eba987',
    weight: 1,
    opacity: 1,
    color: 'white',
    fillOpacity: 1
};

const bricsPlusStyle = {
    fillColor: '#ffdf84',
    weight: 1,
    opacity: 1,
    color: 'white',
    fillOpacity: 1
};


// Стили для природных зон
const naturalColors = {
    'тундра': '#ccaac2',    
    'бор': '#b4c291',       
    'шир': '#bcd256',       
    'саванны': '#dde598',
    'хво': '#cccccc',       
    'степь': '#F5DB64',     
    'влаж': '#AFE4E3',      
    'манг': '#BB172C',     
    'тхво': '#3E4BE3',      
    'тсаванны': '#97cbf0', 
    'сред': '#8f4e4a'      
};

function getNaturalStyle(feature) {
    const type = feature.properties.name;
    const fillColor = naturalColors[type] || '#AAAAAA'; 
    
    return {
        fillColor: fillColor,
        weight: 0,          
        opacity: 1,
        color: 'transparent', 
        fillOpacity: 0.7
    };
}

// Стиль для ООПТ 
const reserveStyle = {
    fillColor: '#ff0000',
    weight: 0.6,
    opacity: 1,
    color: '#ff0000', 
    fillOpacity: 0.3,
    dashArray: null 
};

// Стиль для угольных месторождений 
const coalStyle = {
    color: "#000",
    weight: 1,
    opacity: 1,
    fillOpacity: 0.8,
    fillColor: "#333"  
};

// Стиль для золотых месторождений 
const goldStyle = {
    color: "#000",
    weight: 1,
    opacity: 1,
    fillOpacity: 0.8,
    fillColor: "#FFD700"  
};

const squareIcon = L.divIcon({
    className: 'coal-square-marker',
    html: '<div style="background-color:#333; width:8px; height:8px; border:1px solid #000"></div>',
    iconSize: [10, 10],
    iconAnchor: [5, 5]
});


const goldCircleIcon = L.divIcon({
    className: 'gold-circle-marker',
    html: `
        <div style="
            width: 10px;
            height: 10px;
            border-radius: 50%;
            border: 1px solid #000;
            overflow: hidden;
            position: relative;
        ">
            <div style="
                position: absolute;
                left: 0;
                top: 0;
                width: 50%;
                height: 100%;
                background-color: #000;
            "></div>
            <div style="
                position: absolute;
                right: 0;
                top: 0;
                width: 50%;
                height: 100%;
                background-color: #fff;
            "></div>
        </div>
    `,
    iconSize: [12, 12],
    iconAnchor: [6, 6]
});

// Знак для нефти
const oilTriangleIcon = L.divIcon({
    className: 'oil-triangle-marker',
    html: `
        <div style="
            width: 0;
            height: 0;
            border-left: 4px solid transparent;
            border-right: 4px solid transparent;
            border-bottom: 12px solid #000;
            transform: rotate(0deg);
        "></div>
    `,
    iconSize: [12, 12],
    iconAnchor: [6, 12]
});

// Знак для газа
const gasTriangleIcon = L.divIcon({
    className: 'gas-triangle-marker',
    html: `
        <div style="
            position: relative;
            width: 0;
            height: 0;
            border-left: 5px solid transparent;
            border-right: 5px solid transparent;
            border-bottom: 14px solid #000;
        ">
            <div style="
                position: absolute;
                left: -4px;
                top: 1px;
                width: 0;
                height: 0;
                border-left: 4px solid transparent;
                border-right: 4px solid transparent;
                border-bottom: 12px solid #fff;
            "></div>
        </div>
    `,
    iconSize: [12, 14],
    iconAnchor: [6, 14]
});

// стили для городов
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

// Создаем группы слоев
const bricsLayer = L.layerGroup();
const brics5Layer = L.layerGroup();
const bricsPlusLayer = L.layerGroup();
const reserveLayer = L.layerGroup();
const naturalLayer = L.layerGroup();
const coalLayer = L.layerGroup();
const goldLayer = L.layerGroup(); 
const oilLayer = L.layerGroup();
const gasLayer = L.layerGroup();
const citiesLayer = L.layerGroup();
const labelsLayer = L.layerGroup();

// Загружаем файлы
Promise.all([
    fetch('brics.geojson').then(res => res.json()),
    fetch('brics5.geojson').then(res => res.json()),
    fetch('brics+.geojson').then(res => res.json()),
    fetch('reserve.geojson').then(res => res.json()),
    fetch('cities.geojson').then(res => res.json()),
    fetch('coal.geojson').then(res => res.json()),
    fetch('gold.geojson').then(res => res.json()),
    fetch('oil.geojson').then(res => res.json()),
    fetch('gas.geojson').then(res => res.json()),
    Promise.all([
        fetch('natural1.geojson').then(res => res.json()),
        fetch('natural2.geojson').then(res => res.json())
    ]).then(([natural1Data, natural2Data]) => ({
        type: "FeatureCollection",
        features: [...natural1Data.features, ...natural2Data.features]
    }))
])
.then(([bricsData, brics5Data, bricsPlusData, reserveData, citiesData, coalData, goldData, oilData, gasData, naturalData]) => {
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

            // Данные для каждой страны BRICS
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
                    countryData.image = 'https://avatars.mds.yandex.net/i?id=1ff6dea89d0fe29078775b2663d1b1ae_l-5246363-images-thumbs&n=13';
                    break;

                    case 'индонезия':
                case 'indonesia':
                    countryData.description = `
                        <div class="country-info">
                            <p>Архипелаг, состоящий из более чем 17,000 островов, Индонезия известна своей разнообразной культурой и биоразнообразием. Страна славится своими пляжами, вулканами и уникальными традициями. Джакарта, столица, является одним из крупнейших городов Юго-Восточной Азии.</p>
                        </div>
                    `;
                    countryData.image = 'https://www.indonesia.travel/content/dam/indtravelrevamp/en/partner/Bali.jpg';
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
                            <p>Китайская Народная Республика – государство, расположенное в Центральной и Восточной Азии и занимающее территорию площадью 9598 тысяч кв. км. Это древнейшая цивилизация, возрастом в несколько тысяч лет и по сей  день обладает одной из крупнейших мировых экономик.
</p>
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
            const countryName = feature.properties.Имя || feature.properties.name;
            let countryData = {
                title: countryName,
                description: `<p>БРИКС +</p>`,
                image: null
            };

            // Уникальные данные для каждой страны
            switch(countryName.toLowerCase()) {
                case 'турция':
                    countryData.description = `
                        <div class="country-info">
                            <p>Турция — государство в Юго-Западной Азии, небольшая часть которого находится в Южной Европе. Расположена между Чёрным и Средиземным морями, а также омывается Эгейским морем.</p>
                        </div>
                    `;
                    countryData.image = 'https://media.istockphoto.com/id/629791108/ru/видео/хагия-софия-в-стамбуле-всемирно-известный-памятник-византийской-архитектуры.jpg?s=640x640&k=20&c=8oNM7Dqw_jTF_rIiQihBNnOwjecEeCxiqhpKPLCt3S8=';
                    break;
                
                case 'боливия':
                    countryData.description = `
                        <div class="country-info">
                            <p>Боливия находится в центральной Южной Америке. Это самое «индейское» государство, так как большинство его населения составляют индейцы кечуа и аймара. Как нигде более, здесь проявляются основные черты менталитета южноамериканских коренных народов — созерцательность, спокойствие и доброжелательность. Свое современное название страна получила после обретения независимости в 1825 году, в честь Симона Боливара — известного борца за свободу своей Родины.</p>
                        </div>
                    `;
                    countryData.image = 'https://avatars.dzeninfra.ru/get-zen_doc/271828/pub_6703367e92eb807fc9186ec5_670339ce03818b6973707977/scale_1200';
                    break;

                case 'нигерия':
                    countryData.description = `
                        <div class="country-info">
                            <p>Нигерия — одна из крупнейших по площади (923 768 км²) стран Западной Африки, по численности населения (более 190 млн человек) она занимает первое место на континенте. С юга страна омывается Гвинейским заливом, на суше граничит с Бенином, Нигером, Чадом и Камеруном, на северо-востоке выходит к берегам озера Чад. Нигерия имеет древнюю историю: археологические раскопки обнаружили следы населения с высоким уровнем развития (знакомого с земледелием и обработкой железа), датируемые I–II тыс. до н. э.</p>
                        </div>
                    `;
                    countryData.image = 'https://i.pinimg.com/736x/82/7d/e5/827de55aa53fa38db0831b832e1831d8.jpg';
                    break;

                case 'алжир':
                    countryData.description = `
                        <div class="country-info">
                            <p>Алжир – это самая большая и одна из наиболее развитых стран Африки. Он расположен у побережья Средиземного моря и занимает площадь 2381,7 тыс. км². Еще совсем недавно Алжир был второй по величине африканской страной, но из-за разделения Судана на Северный и Южный, он уверенно перехватил пальму первенства. Более того, по размерам Алжир занимает 10-е место в мире!</p>
                        </div>
                    `;
                    countryData.image = 'https://wikiway.com/upload/resize_cache/uf/6f5/460_300_2/aljir_5.jpg';
                    break;

                case 'уганда':
                    countryData.description = `
                        <div class="country-info">
                            <p>Уганда — государство, расположенное в Восточной Африке. Официальное название – Республика Уганда. «Жемчужина Африки» не относится к числу наиболее посещаемых туристами стран, однако в этом и заключается её ценность. В Уганде можно наблюдать красочный животный мир – самый разнообразный на континенте!</p>
                        </div>
                    `;
                    countryData.image = 'https://i.pinimg.com/originals/5b/be/30/5bbe300e0c2e8b85a72fd313f9d1ca46.jpg';
                    break;

                case 'беларусь':
                    countryData.description = `
                        <div class="country-info">
                            <p>Беларусь (Республика Беларусь, Белоруссия) – восточноевропейское государство, имеющее сухопутные границы с такими странами, как Россия, Украина, Польша, Латвия и Литва. В туристическом отношении Беларусь считается лакомым кусочком и для охотников за культурными ценностями, и для природоманов, грезящих о прогулках по сказочному Полесью, и для фуд-блогеров, ищущих новые вкусы там, где не все догадаются это сделать.</p>
                        </div>
                    `;
                    countryData.image = 'https://i.pinimg.com/originals/a2/fd/a3/a2fda35ed0474f5bd477367484225712.jpg';
                    break;

                case 'казахстан':
                    countryData.description = `
                        <div class="country-info">
                            <p>Казахстан (Республика Казахстан) – государство в центральной части Евразии, на западе и севере граничащее с Россией, а на востоке – с Китаем. Страна является активным членом Евразийского экономического союза. Удачно разместившийся в самом сердце материка, объединивший в себе скромную часть европейских территорий и более чем приличный кусок Азии, Казахстан может по праву считаться самобытной, но при этом шагающей в ногу со временем страной.</p>
                        </div>
                    `;
                    countryData.image = 'https://aftershock.news/sites/default/files/u41086/teasers/казахстан.jpg';
                    break;

                case 'узбекистан':
                    countryData.description = `
                        <div class="country-info">
                            <p>Узбекистан – суверенное государство, занимающее обширную территорию в центральной части Средней Азии, окруженное пятью державами, с которыми его связывают века общей истории. Узбекистан расположен вдали от Мирового океана, и является одной из двух, наряду с Лихтенштейном, стран на планете, отделенных от морских просторов территориями сразу двух государств.</p>
                        </div>
                    `;
                    countryData.image = 'https://lp-cms-production.imgix.net/2023-07/GettyImages-1193462464.jpg?fit=crop&w=3840&auto=format&q=75';
                    break;
                    
                case 'таиланд':
                    countryData.description = `
                        <div class="country-info">
                            <p>Таиланд – один из наиболее экзотических уголков планеты; королевство, где чтят и исполняют не только светские законы, но и буддийские нормы. Его называют «страной улыбок», благодаря гостеприимным и веселым местным жителям, которые всегда рады туристам.</p>
                        </div>
                    `;
                    countryData.image = 'https://i.pinimg.com/originals/85/9a/2b/859a2b59abcecf63a59f2d74ea9b7464.jpg';
                    break;

                case 'вьетнам':
                    countryData.description = `
                        <div class="country-info">
                            <p>Вьетнам – многонациональная республика, культура которой формировалась под влиянием местных племен, стран-соседей и колонизаторов. Как результат – перед нами современная страна с развитой экономикой, играющая важную роль в Ассоциации государств Юго-Восточной Азии и в мире в целом. © «wikiway.com»</p>
                        </div>
                    `;
                    countryData.image = 'https://avatars.mds.yandex.net/i?id=f08384c0bf9a487ee02d1ba4d461924b_l-8263615-images-thumbs&n=13';
                    break;

                case 'малайзия':
                    countryData.description = `
                        <div class="country-info">
                            <p>Малайзия находится в самом сердце Юго-Восточной Азии, по площади сопоставима с Японией и имеет население более 26 млн человек. Страна разделена на две основные области: полуостровная, ограниченная Таиландом, Малаккским проливом и Южно-Китайским морем, и Восточная Малайзия, два штата которой — Саравак и Сабах — расположены на острове Борнео (Калимантан) и отделены от полуострова 800 километровой полосой Южно-Китайского моря.</p>
                        </div>
                    `;
                    countryData.image = 'https://www.kualalumpurtours.com.my/wp-content/uploads/2024/07/Untitled-design.png';
                    break;
            }

            showPopup(countryData);
        });
    }
    }).addTo(bricsPlusLayer);


    // леса по типу
    L.geoJSON(naturalData, {
    style: getNaturalStyle,
    onEachFeature: (feature, layer) => {
        const type = feature.properties.name;
        layer.on('click', () => {
            const naturalName = feature.properties.Имя || feature.properties.name;
            let naturalData = {
                title: naturalName,
                description: ``,
                image: null
            };

            // Уникальные данные для леса
            switch(naturalName.toLowerCase()) {
                case 'бор':
                    naturalData.title = 'Бореальные леса'
                    naturalData.description = `
                        <div class="country-info">
                            <p>Бореальные леса — это лесные массивы, произрастающие в Северном полушарии, где большую часть года преобладают снега и низкие температуры. В России эти леса расположились от Карелии до Камчатки.

К бореальным относятся леса в зонах тундры и лесотундры, подзонах северной и средней тайги, а также, частично, в подзоне южной тайги. В этих лесах преобладают хвойные породы деревьев (сосна, пихта, сибирский кедр, тсуга и туя), но встречаются и лиственные (берёза и осина).

Общая площадь бореальных лесов составляет около 1,4 млрд га, или 38% от лесопокрытой площади мира. Большая часть бореальных лесов находятся в России — около 70%.</p>
                        </div>
                    `;
                    naturalData.image = 'https://avatars.mds.yandex.net/i?id=7c11b71d90f20ff509eba408822b4e84_l-5243656-images-thumbs&n=13';
                    break;
                
                case 'тундра':
                    naturalData.title = 'Тундра'
                    naturalData.description = `
                        <div class="country-info">
                            <p>Тундра — вид природных зон, лежащих за северными пределами лесной растительности, пространства с вечномёрзлой почвой, не заливаемой морскими или речными водами, сильно заболоченная местность.

Климат холодный и ветреный с коротким летом и длинной суровой зимой. Зимой средняя температура от −10 до −30 °C.

Растительность тундры составляют мхи, лишайники, низкорослые кустарники (карликовая берёза), невысокие травы. Также тут растут ягоды: голубика, морошка. Деревья отсутствуют из-за короткого вегетационного периода и мерзлоты.

В тундре обитают различные виды животных: северные олени, полярные волки и лемминги, а также другие млекопитающие, птицы и насекомые.</p>
                        </div>
                    `;
                    naturalData.image = 'https://pp.userapi.com/c636217/v636217847/49fff/ZbD8Yxrt6Fs.jpg';
                    break;

                case 'степь':
                    naturalData.title = 'Степи'
                    naturalData.description = `
                        <div class="country-info">
                            <p>Степь — природная зона, где доминирует травянистая растительность, развивающаяся в условиях сухого климата умеренного и субтропического поясов Северного и Южного полушарий.

В России степи расположены на юге фактически по всей границе страны. Они протянулись по южной части Восточно-Европейской равнины, охватывают территорию Западной Сибири и предгорья Северного Кавказа.

Климат степей засушливый, характеризуется сильными ветрами, особенно зимой. Летом температура повышается до +40 °C, зимой опускается до -35 °C.

Растительность в степи представлена разнотравно-злаковыми растениями, среди которых тимофеевка луговая, мятлик тонконог, полынь, ковыль.

Животный мир адаптирован к природным условиям и недостатку влаги. Здесь обитают суслики, полёвки, хомяки, сурки, пищухи, слепыши, полевые мыши.</p>
                        </div>
                    `;
                    naturalData.image = 'https://i.pinimg.com/originals/32/9b/3b/329b3b220cc865e66b4de753ee3e8177.jpg';
                    break;
                
                case 'шир':
                    naturalData.title = 'Широколиственные леса'
                    naturalData.description = `
                        <div class="country-info">
                            <p>Широколиственные леса — разновидность лиственных лесов, образованных листопадными деревьями с широкими листовыми пластинками.

Распространены в Европе (в том числе на Кавказе), Азии (Дальний Восток, Северный Китай), Северной Америке (преимущественно в восточной части), на юге Чили и островах Новой Зеландии.

Произрастают в умеренно влажном климате, с относительно равномерным в течение года распределением осадков, без резких температурных колебаний.

В широколиственных лесах преобладают лиственные деревья: дуб, клён, ясень, бук, граб, липа. Много кустарников: орешник, малина, шиповник, бересклет. Среди травянистых растений часто встречаются ландыш, ветреница, копытень.

В широколиственных лесах обитают, например, благородный олень, изюбрь, вапити, косуля, кабан, а также медведь, волк, лисица, рысь, горностай, ласка, куница.</p>
                        </div>
                    `;
                    naturalData.image = 'https://cdn.culture.ru/images/6bdc0627-9ec1-501f-8775-c57045afcde4';
                    break;

                case 'хво':
                    naturalData.title = 'Хвойные леса'
                    naturalData.description = `
                        <div class="country-info">
                            <p>Хвойные леса, леса с преобладанием в древостое одной или нескольких хвойных пород. В зависимости от доминирования в составе древостоев тех или иных видов хвойных деревьев выделяют две лесные формации: темнохвойную и светлохвойную. Темнохвойные леса формируют теневыносливые породы, в числе которых представители родов ель и пихта, а также сосна кедровая сибирская. Светлохвойные леса образуют светолюбивые породы – сосна обыкновенная и различные виды лиственниц.</p>
                        </div>
                    `;
                    naturalData.image = 'https://wallpaperswide.com/download/carpathians_forest_romania-wallpaper-3840x2400.jpg';
                    break;
                
                case 'тхво':
                    naturalData.title = 'Тропические хвойные леса'
                    naturalData.description = `
                        <div class="country-info">
                            <p>Тропические хвойные леса встречаются в некоторых точках тропиков.

На островах Карибского моря произрастает карибская, западная и тропическая сосна. В Южной Азии и на островах встречается суматранская и островная сосна. В южноамериканских лесах представлены такие хвойные растения, как фитцройя кипарисовидная и араукария бразильская. В тропической зоне Австралии хвойные леса образованы подокарпом.</p>
                        </div>
                    `;
                    naturalData.image = 'https://img2.wallspic.com/previews/1/7/5/7/97571/97571-vegetation-old_growth_forest-spruce_fir_forest-temperate_coniferous_forest-landscape-x750.jpg';
                    break;

                case 'тсаванны':
                    naturalData.title = 'Тропические саванны'
                    naturalData.description = `
                        <div class="country-info">
                            <p>Тропические саванны — это пространства в субэкваториальном поясе, покрытые травянистой растительностью с редко разбросанными деревьями и кустарниками.

Они располагаются в аридных, но не слишком засушливых зонах, в Северной Африке, Австралии и Южной Америке.

В саваннах обитают крупные животные: антилопы, жирафы, африканские слоны, носороги. В основном они живут стадами и перемещаются в поисках сытных пастбищ. На них охотятся львы, леопарды, гиены.</p>
                        </div>
                    `;
                    naturalData.image = 'https://s9.travelask.ru/system/images/files/001/077/156/wysiwyg/91758006111365.jpg';
                    break;
                
                case 'саванны':
                    naturalData.title = 'Саванны'
                    naturalData.description = `
                        <div class="country-info">
                            <p>Саванны — пространства в субэкваториальном поясе, покрытые травяной растительностью с редко разбросанными деревьями и кустарниками. Типичны для субэкваториального климата с резким разделением года на сухой и дождливый сезоны.

Распространены на всех материках, кроме Антарктиды. 1 Занимают до 40% Африки и порядка 10% общей земной поверхности.

Сообщества саванн — двухъярусные: нижний ярус мощный, травяной (главным образом злаковый), верхний — представлен обычно кустарниками и редкостойными деревьями с глубокими распростёртыми корневыми системами.

В саваннах обитают газели, антилопы гну, зебры, буйволы, слоны, жирафы, носороги, бородавочники.</p>
                        </div>
                    `;
                    naturalData.image = 'https://avatars.mds.yandex.net/i?id=4b61b6c91ca006ab4794a70e48db2035_l-5413570-images-thumbs&n=13';
                    break;

                case 'сред':
                    naturalData.title = 'Средиземноморские леса'
                    naturalData.description = `
                        <div class="country-info">
                            <p>Средиземноморские леса — это биом, который в основном встречается в средиземноморских климатических зонах. Также может присутствовать в других климатических зонах, которые обычно граничат со средиземноморской.

Растительный мир средиземноморских лесов характеризуется вечнозелёными жестколистными лесами и кустарниками. Для сохранения и удержания ценной влаги в засушливый период им на помощь приходят жёсткие листья, зачастую с восковым налётом, высокая концентрация эфирных масел, пробка или толстая, крепкая кора на стволах, широкая крона, крепкая корневая система, уходящая глубоко в почву.

Среди деревьев обычны вечнозелёные заросли (лавр, дуб пробковый, мирт, кипарис, лаванда, ель, пихта, кедр). Также встречаются леса и кустарники с опадающей листвой (бук, граб, инжир, виноград, фисташка).</p>
                        </div>
                    `;
                    naturalData.image = 'https://kupuk.net/wp-content/uploads/2023/05/sredizemnomorskaja-prirodnaja-zona-osobennosti-klimata-flory-i-fauny-a0c1cb5.jpg';
                    break;
                
                case 'манг':
                    naturalData.title = 'Мангровые леса'
                    naturalData.description = `
                        <div class="country-info">
                            <p>Мангровые леса — вечнозелёные лиственные леса, произрастающие в приливно-отливной полосе морских побережий и устьев рек в местах, защищённых от энергии волн коралловыми рифами или островами.

Распространены в основном во влажных тропиках, иногда в зонах с умеренным климатом (там, где этому благоприятствуют морские течения). Они занимают полосу между самым низким уровнем воды во время отлива и самым высоким во время прилива — литораль.

Мангровые леса богаты биоразнообразием. Они являются важным местом обитания и размножения для многих видов рыб и ракообразных; источником питания для обезьян, оленей, птиц и кенгуру; а также источником нектара для пчёл.

Мангровые экосистемы играют важную роль в обеспечении защиты от стихийных бедствий и сокращении негативных последствий изменения климата. Они снижают силу волн во время штормов и цунами, защищая прибрежные поселения от разрушений.</p>
                        </div>
                    `;
                    naturalData.image = 'https://wallpapers.com/images/hd/swamp-background-1920-x-1200-xidkfpa176mfe6ph.jpg';
                    break;

            }

            showPopup(naturalData);
        });
    }
    
}).addTo(naturalLayer);

    // Добавляем слой ООПТ 
    const reserveFeatures = L.geoJSON(reserveData, {
        style: reserveStyle,
        onEachFeature: (feature, layer) => {
            layer.on('click', () => {
                showPopup({
                    title: feature.properties.name || "ООПТ",
                    description: ``
                });
            });
        }
    });
    reserveFeatures.addTo(reserveLayer);

    // Добавляем слой угольных месторождений
    L.geoJSON(coalData, {
        pointToLayer: (feature, latlng) => {
            return L.marker(latlng, {
                icon: squareIcon,
                riseOnHover: true
            });
        },
        onEachFeature: (feature, layer) => {
            layer.on('click', () => {
                showPopup({
                    title: feature.properties.name || "Месторождение угля",
                    description: ``,
                });
            });
        }
    }).addTo(coalLayer);

    // Добавляем слой золотых месторождений
    L.geoJSON(goldData, {
        pointToLayer: (feature, latlng) => {
            return L.marker(latlng, {
                icon: goldCircleIcon,
                riseOnHover: true
            });
        },
        onEachFeature: (feature, layer) => {
            layer.on('click', () => {
                showPopup({
                    title: feature.properties.name || "Месторождение золота",
                    description: ``,
                });
            });
        }
    }).addTo(goldLayer);

    // Добавляем слой нефтяных месторождений
    L.geoJSON(oilData, {
        pointToLayer: (feature, latlng) => {
            return L.marker(latlng, {
                icon: oilTriangleIcon,
                riseOnHover: true
            });
        },
        onEachFeature: (feature, layer) => {
            layer.on('click', () => {
                showPopup({
                    title: feature.properties.name || "Месторождение нефти",
                    description: ``,
                });
            });
        }
    }).addTo(oilLayer);
    
    L.geoJSON(gasData, {
        pointToLayer: (feature, latlng) => {
            return L.marker(latlng, {
                icon: gasTriangleIcon,
                riseOnHover: true
            });
        },
        onEachFeature: (feature, layer) => {
            layer.on('click', () => {
                showPopup({
                    title: feature.properties.name || "Месторождение газа",
                    description: ``,
                });
            });
        }
    }).addTo(gasLayer);

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
                            <p>Столица Татарстана, известная своим богатым историческим и культурным наследием. Город славится Казанским Кремлём, который является объектом Всемирного наследия ЮНЕСКО, а также разнообразием культур, где сосуществуют ислам и православие. XVI саммит БРИКС проходил в Казани с 22 по 24 октября 2024 года.

                            XVI саммит БРИКС проходил в Казани с 22 по 24 октября 2024 года. Это была встреча глав государств объединения БРИКС.

На саммит прибыли и участвовали в его работе делегации 35 государств, из которых 24 делегации возглавляли первые лица.
</p>
                        </div>
                    `;
                    content.image = 'https://avatars.mds.yandex.net/get-entity_search/1539949/1132226598/orig';
                    break;
                    
                case 'москва':
                    content.description += `
                        <div class="city-info">
                            <p>Столица России и крупнейший город страны. Москва известна своими историческими памятниками, такими как Красная площадь, Кремль и собор Василия Блаженного. Город является культурным, экономическим и политическим центром России.
                            
                            XII саммит БРИКС проходил 17 ноября 2020 года под председательством России. Он стал первым в истории объединения, который состоялся в режиме видеоконференции.

Темой стало «Партнёрство БРИКС в интересах глобальной стабильности, общей безопасности и инновационного роста». Главы государств и правительств стран — участниц объединения обсудили состояние и перспективы сотрудничества, а также подвели итоги российского председательства в БРИКС в 2020 году.</p>
                        </div>
                    `;
                    content.image = 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/01/Moscow_July_2011-16.jpg/800px-Moscow_July_2011-16.jpg';
                    break;
                    
                case 'уфа':
                    content.description += `
                        <div class="city-info">
                            <p>Столица Башкортостана, расположенная на берегу реки Белой. Уфа известна своим многонациональным населением и культурным разнообразием. Город также является важным промышленным и культурным центром, с множеством театров и музеев.
                            
                            VII саммит БРИКС состоялся 8–9 июля 2015 года в Уфе (Башкортостан, Россия). В работе приняли участие лидеры государств — участников организации: Бразилии, России, Индии, Китая и Южной Африки.
                            
                            Подписано соглашение о сотрудничестве государств до 2020 года, где говорится о расширении взаимодействия между государствами как в социально-экономическом плане, так и во внешнеполитическом.</p>
                        </div>
                    `;
                    content.image = 'https://cdn.tripster.ru/thumbs2/2427a866-49f3-11ee-8bba-4e7c85935a75.1220x600.jpeg';
                    break;
                    
                case 'екатеринбург':
                    content.description += `
                        <div class="city-info">
                            <p>Крупный город на Урале, известный своей историей и архитектурой. Екатеринбург является важным промышленным и культурным центром, а также известен как место, где была убита царская семья Романовых. Город активно развивает бизнес и науку.
                            
                            Первый саммит стран БРИК состоялся 16 июня 2009 года в Екатеринбурге. На повестке саммита обсуждались темы глобального экономического кризиса, мировой политики и дальнейшее развитие формата БРИК. Кроме того, страны-участники обсуждали проблемы глобальной продовольственной безопасности.</p>
                        </div>
                    `;
                    content.image = 'https://avatars.dzeninfra.ru/get-zen_doc/271828/pub_6670274de6db732f8edc21d9_667028786b7a9528adc345f2/scale_1200';
                    break;

                case 'бразилиа':
                    content.description += `
                        <div class="city-info">
                            <p>Бразилиа – столица Бразилии и центр Федерального округа. Это один из самых удивительных столичных городов в мире, технократическое чудо, задуманное политиками и воплощенное в жизнь на диком плоскогорье талантливыми инженерами, зодчими, дизайнерами – апологетами модернистского урбанизма. 11-й саммит БРИКС состоялся 13–14 ноября 2019 года в городе этом городе. Главной темой встречи стало «Экономический рост для инновационного будущего». В ходе саммита лидеры стран-участниц - Бразилии, России, Индии, Китая и ЮАР - приняли так называемую «Декларацию Бразилиа».</p>
                        </div>
                    `;
                    content.image = 'https://img-s-msn-com.akamaized.net/tenant/amp/entityid/AA19R6aP.img';
                    break;
                    
                case 'форталеза':
                    content.description += `
                        <div class="city-info">
                            <p>Форталеза — город в Бразилии, столица штата Сеара. Пятый по величине город в стране. Его населяет более 2,5 млн человек.

Название города связано с существовавшим с середины XVII века голландским фортом Схоненборх (нидерл. Schoonenborch). В переводе с португальского языка fortaleza означает «крепость». VI саммит БРИКС проходил с 15 по 17 июля 2014 года в бразильском городе Форталеза. В нём участвовали главы всех государств-участниц БРИКС: Бразилии, Индии, Китая, России и ЮАР. 

Одно из важных решений саммита — создание Банка развития БРИКС с уставным капиталом 100 миллиардов долларов и долевым участием всех членов БРИКС.

Также на саммите была принята Форталезская декларация, в которой, в частности, обсуждалась тема «Инклюзивный рост: устойчивые решения».</p>
                        </div>
                    `;
                    content.image = 'https://i.pinimg.com/736x/fa/f5/66/faf56639a42c68ecc6c0060b52dc2310.jpg';
                    break;

                case 'дурбан':
                    content.description += `
                        <div class="city-info">
                            <p>Дурбан — третий по величине город ЮАР славится своими набережными, колониальной архитектурой и насыщенной культурной жизнью. Достоинства здешней бухты оценил еще Васко да Гама - считается, что это произошло на Рождество 1497 г. По этой причине бухта, а позднее и вся прилегающая провинция получили имя Наталь (порт. «Рождество»). V саммит БРИКС проходил 26–27 марта 2013 года в южно-африканском городе Дурбан. В саммите принимали участие главы всех государств-участниц БРИКС: Бразилии, Индии, Китая, России и ЮАР.

Тема саммита — «БРИКС и Африка: партнёрство в целях развития, интеграции и индустриализации».</p>
                        </div>
                    `;
                    content.image = 'https://i.pinimg.com/originals/54/db/25/54db2595814d6f55a4c71e9c2a500da6.jpg';
                    break;

                case 'йоханнесбург':
                    content.description += `
                        <div class="city-info">
                            <p>У ЮАР несколько столиц. Из органов государственной власти крупнейшему городу страны Йоханнесбургу достался конституционный суд. V саммит БРИКС проходил с 22 по 24 августа 2023 года в южноафриканском городе Йоханнесбурге.

По итогам саммита были достигнуты договорённости о расширении круга участников объединения. С 1 января 2024 года его полноправными членами станут Аргентина, Египет, Иран, Объединённые Арабские Эмираты и Эфиопия.</p>
                        </div>
                    `;
                    content.image = 'https://a0.muscache.com/im/pictures/INTERNAL/INTERNAL-ImageByPlaceId-ChIJUWpA8GgMlR4RQUDTsdnJiiM-large_background/original/2fbe0237-8e82-4704-a736-b58f5cff607c.jpeg';
                    break;

                case 'кейптаун':
                    content.description += `
                        <div class="city-info">
                            <p>Кейптаун — красивейший город Южной Африки, который одновременно знаком и незнаком нашему человеку. ак и следует из названия, Кейптаун находится близ мыса, считающегося крайней южной точкой материка. Со времен Васко да Гамы каждый мореплаватель, обогнувший мыс Доброй Надежды, считал долгом отметить это достижение на берегу.</p>
                        </div>
                    `;
                    content.image = 'https://i.pinimg.com/originals/ce/6f/a0/ce6fa06f6c2b4e9f67f3c7b89c75390c.jpg';
                    break;
                    
                case 'претория':
                    content.description += `
                        <div class="city-info">
                            <p>Претория — одна из «трёх столиц» ЮАР, служит символом боевой славы белых африканеров. Город носит имя Андриса Преториуса, возглавлявшего буров во время Великого трека и войны с зулусами. Он невелик и относится к немногим городам Африки, где слово «архитектура» не пустой звук.</p>
                        </div>
                    `;
                    content.image = 'https://i.pinimg.com/originals/9a/9a/f3/9a9af32cc1d3740877f2af08e80dc70f.jpg';
                    break;
                    
                case 'блумфонтейн':
                    content.description += `
                        <div class="city-info">
                            <p>Блумфонтейн — город в ЮАР, центр провинции Фри-Стейт, судебная столица страны.

Расположен на юге региона Высокий Вельд (обширного степного холмистого плато, лежащего на высоте 1300–2000 метров над уровнем моря), который к юго-западу от города переходит в полупустынный регион Карру.</p>
                        </div>
                    `;
                    content.image = 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/bf/Bloemfontein01.jpg/1200px-Bloemfontein01.jpg';
                    break;

                case 'кампала':
                    content.description += `
                        <div class="city-info">
                            <p>Кампала — столица Уганды. Утверждают, что она, подобно Риму, стоит на семи холмах. Сами кампальцы насчитывают у себя более 20 пригорков, так что прогулка по городу представляет собой череду подъемов и спусков. Город был основан в 1890 году британским колонистом Ф. Лугардом как форпост на холме Кампала. Название происходит от слова импала (вид антилоп).</p>
                        </div>
                    `;
                    content.image = 'https://i.insider.com/589ed2e4dd0895bf548b4c9e';
                    break;
                    
                case 'абуджа':
                    content.description += `
                        <div class="city-info">
                            <p>Абуджа — новая столица, строящаяся в центре страны. Абуджа – местопребывание президента и правительства, политико-административный и культурный центр страны. Решение о переносе столицы из Лагоса было принято в 1976 г. Лагос, бывшая столица Нигерии, остается главным экономическим центром страны.</p>
                        </div>
                    `;
                    content.image = 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d4/AbujaNationalMosque.jpg/600px-AbujaNationalMosque.jpg';
                    break;

                case 'аддис-абеба':
                    content.description += `
                        <div class="city-info">
                            <p>Аддис-Абеба — столица Эфиопии, расположенная на высоте 2400 м. Ее часто называют "городом вечной весны" из-за умеренного климата. Это крупнейший город страны, ее торговый, промышленный и культурный центр, а также административный центр территории Аддис-Абеба. </p>
                        </div>
                    `;
                    content.image = 'https://aif-s3.aif.ru/images/025/625/7a6f367cbcc64abc42d833932eb55f95.JPG';
                    break;

                    
                case 'алжир':
                    content.description += `
                        <div class="city-info">
                            <p>Алжир (араб. Аль-Джазаир) — столица Алжирской Народной Демократической Республики; солнечный портовый город, который местные жители называют белым или “ла бланш”. Это экономический и культурный центр страны, который считают своим домом более 2 миллионов жителей. Алжир занимает площадь 273 км² и является одним из крупнейших африканских городов. </p>
                        </div>
                    `;
                    content.image = 'https://porusski.me/wp-content/uploads/2022/04/6E987EFD-FC91-4396-A3DE-796B505D8B05.jpeg';
                    break;

                case 'каир':
                    content.description += `
                        <div class="city-info">
                            <p>Каир — столица Египта. Крупнейший город Ближнего Востока и третий по величине город Африки (без учёта агломерации).

Расположен в северной части страны, на правом берегу реки Нил. На севере граничит с мухафазой Кальюбия, на западе — с мухафазой Гиза. С юга и востока окружён пустыней.</p>
                        </div>
                    `;
                    content.image = 'https://cdn.tripster.ru/thumbs2/d27778ea-533c-11ee-8d03-0200f0493868.1200x1000.jpeg?width=1200&height=630';
                    break; 
                    
                case 'минск':
                    content.description += `
                        <div class="city-info">
                            <p>Минск — столица республики Беларусь, её промышленный, культурный и научный центр. Город находится в центральной части страны, на берегах реки Свислочь. Минск — один из древнейших европейских городов, обладающий огромным культурным наследием и богатыми традициями. Он удивляет сочетанием средневековой и советской архитектуры, своей ухоженностью и неторопливостью. </p>
                        </div>
                    `;
                    content.image = 'https://34travel.me/media/posts/5f97deedeb17d-670x400-9.jpg';
                    break;
                    
                case 'анкара':
                    content.description += `
                        <div class="city-info">
                            <p>Анкара — столица Турции и её административный центр. Расположена в центре страны, в северо-западной части Центральной Анатолии, на востоке Анатолийского плоскогорья, у слияния рек Чубук и Анкара.

По данным на 2024 год, население Анкары составляет 5,803 миллиона человек. В городе сосредоточено множество исторических памятников, государственных и культурных учреждений. </p>
                        </div>
                    `;
                    content.image = 'https://i.pinimg.com/originals/6c/2f/fc/6c2ffc603eed16b030bbc1f308c016e2.jpg';
                    break;
                    
                case 'тегеран':
                    content.description += `
                        <div class="city-info">
                            <p>Тегеран — столица и крупнейший город Ирана и один из крупнейших городов Азии. Административный центр одноимённого остана, политический, экономический, транспортный, торгово-финансовый и культурный центр страны. </p>
                        </div>
                    `;
                    content.image = 'https://img.pac.ru/resorts/485595/485611/big/9469327E7F0001015C3A833ECF80728C.jpg';
                    break;

                case 'абу-даби':
                    content.description += `
                        <div class="city-info">
                            <p>Абу-Даби — столица Объединённых Арабских Эмиратов и эмирата Абу-Даби. Политический, промышленный, торговый и культурный центр страны.

Город находится на острове в юго-восточной части Персидского залива в четверти километра от материка. Остров связан с материком тремя автомобильными мостами.</p>
                        </div>
                    `;
                    content.image = 'https://cdn.al-ain.com/images/2024/11/29/260-201903-2345_16749e97791500.jpg';
                    break;
                    
                case 'астана':
                    content.description += `
                        <div class="city-info">
                            <p>Астана – город на северо-востоке Казахстана, в 1997 году получивший статус столицы государства вместо Алматы. Прежний центр остается культурной и образовательной доминантой страны, но недавно ставшая городом-миллионником Астана стремительно догоняет неофициальную «южную столицу». </p>
                        </div>
                    `;
                    content.image = 'https://media.istockphoto.com/id/1642462709/ru/фото/вид-с-воздуха-на-город-астана-казахстан.jpg?s=612x612&w=0&k=20&c=tq-eLecavgwOCT4Ozoyrt2DxKkWJwM3giC6sHwxt3ic=';
                    break;

                case 'ташкент':
                    content.description += `
                        <div class="city-info">
                            <p>Ташкент – один из крупнейших городов Центральной Азии, столица суверенной Республики Узбекистан. Город расположен в предгорьях Тянь-Шаньского хребта, в долинной пойме реки Чирчик. В хорошую погоду горы видны из города на северо-восточном горизонте. </p>
                        </div>
                    `;
                    content.image = 'https://blog.ostrovok.ru/wp-content/uploads/2024/02/6копия-10.jpg';
                    break;

                case 'нью-дели':
                    content.description += `
                        <div class="city-info">
                            <p>Нью-Дели — столица Индии и второй по величине город страны (после Мумбаи), пользуется популярностью у туристов благодаря обилию достопримечательностей и переплетению различных культур. Дели не всегда был столицей Индии, но как город, через который идут все дороги, всегда играл главную роль. Его выстроили на равнинах возле брода через реку Ямуна (Джамна), на пути между Западной, Центральной и Юго-Восточной Азией. IV саммит БРИКС в Нью-Дели проходил с 28 по 29 марта 2012 года. Тема встречи: «Партнёрство БРИКС в интересах глобальной стабильности, безопасности и процветания». </p>
                        </div>
                    `;
                    content.image = 'https://www.it-world.ru/upload/iblock/5b7/tkilbix8rpt0hf5ew2je3ev211fu7uoa.jpg';
                    break;

                case 'бенаулим':
                    content.description += `
                        <div class="city-info">
                            <p>Бенаулим — индийский курорт в Южном Гоа. Расположен на западе страны, примерно в 40 км от столицы штата города Панаджи, в 28 км от аэропорта Даболим. 15-16 октября в Гоа состоялся восьмой саммит БРИКС. Главы стран «пятёрки» подписали итоговую декларацию и два меморандума, подтвердили солидарную позицию по всем актуальным внешнеполитическим проблемам, договорились о создании рейтингового агентства БРИКС. В рамках саммита был подписан меморандум о взаимопонимании по совместной разработке Ключевского золоторудного месторождения. </p>
                        </div>
                    `;
                    content.image = 'https://avatars.mds.yandex.net/i?id=3a2de65e0be843846709a9aa9438c90a_l-5239038-images-thumbs&n=13';
                    break;

                case 'пекин':
                    content.description += `
                        <div class="city-info">
                            <p>Пекин — столица Китая, политический и культурный центр страны. Основан в 1045 году до н. э., входит в число четырёх древних столиц Китая и является одним из древнейших городов мира. XIV саммит БРИКС проходил 24 июня 2022 года в Пекине. Встреча стала третьей в истории объединения, которая состоялась в режиме видеоконференции.

Тема саммита — «Развитие стратегического партнёрства внутри объединения». Лидеры государств и правительств стран — участниц БРИКС подвели итоги председательства Китая в 2022 году и обсудили состояние и перспективы сотрудничества в рамках объединения. </p>
                        </div>
                    `;
                    content.image = 'https://avatars.mds.yandex.net/i?id=e0482990afcd380af8476eaa609a9aed_l-4576817-images-thumbs&n=13';
                    break;

                case 'сямынь':
                    content.description += `
                        <div class="city-info">
                            <p>Сямынь — город субпровинциального значения в провинции Фуцзянь, крупнейший порт провинции на побережье Тайваньского пролива. Расположен на островах и прилегающем побережье материка между Цюаньчжоу (к северу) и Чжанчжоу (к югу). 
                            IX саммит БРИКС прошёл 4–5 сентября 2017 года в китайском городе Сямынь. В повестке саммита особое место занял кризис на Корейском полуострове. </p>
                        </div>
                    `;
                    content.image = 'https://cdn.worldota.net/t/640x400/content/13/43/1343df5d75eb2b5dc7641241e5b8b78eb23c30f4.jpeg';
                    break;

                case 'санья':
                    content.description += `
                        <div class="city-info">
                            <p>Санья — город окружного значения на юге острова Хайнань в одноимённой провинции Китая. Это тропический приморский курорт, международный центр туризма.

Территория Санья простирается вдоль залива Саньявань. 

III саммит БРИКС состоялся 13–14 апреля 2011 года в городе Санья (КНР). Это был третий саммит БРИКС с 2009 года и первый, в котором официально участвовала Южная Африка после её присоединения к группе в декабре 2010 года.

На саммите обсуждались вопросы закупок бразильской авиатехники и индийской фармацевтики.</p>
                        </div>
                    `;
                    content.image = 'https://i.pinimg.com/originals/d2/3f/30/d23f30b76e68a9cd2952c8ccec269037.jpg';
                    break;

                case 'ханой':
                    content.description += `
                        <div class="city-info">
                            <p>Ханой — столица Вьетнама и второй по численности населения город страны. Главный политический, образовательный и культурный центр страны и второй по значению промышленный центр (после Хошимина).

Расположен в экономико-географическом районе Равнина Красной реки на севере страны. </p>
                        </div>
                    `;
                    content.image = 'https://avatars.mds.yandex.net/i?id=d609cd794af92d99c817ea4926ebbe28add72063-9243216-images-thumbs&n=13';
                    break;

                case 'бангкок':
                    content.description += `
                        <div class="city-info">
                            <p>Бангкок — столица и самый крупный город Таиланда с населением 5,4 млн чел. (2022). Расположен на восточном берегу реки Чаупхраи, недалеко от её впадения в Сиамский залив.

Город основал в 1782 году Рама I, первый монарх династии Чакри, после того как предыдущую столицу Аюттхаю разрушили бирманские войска. </p>
                        </div>
                    `;
                    content.image = 'https://cdnn21.img.ria.ru/images/07e7/0a/18/1905015373_0:129:3072:1857_1920x1080_80_0_0_15d08cc118089114b9bd5c2f558685b9.jpg';
                    break;

                case 'куала-лумпур':
                    content.description += `
                        <div class="city-info">
                            <p>Куала-Лумпур — столица и самый крупный город Малайзии. Расположен на юго-западе полуострова Малакка в низкогорной долине у слияния рек Кланг и Гомбак.

Население по данным на 2020 год — 1 982 112 человек. </p>
                        </div>
                    `;
                    content.image = 'https://breeze.ru/files/images/kuala-lumpur-petronas.jpg';
                    break;

                case 'джакарта':
                    content.description += `
                        <div class="city-info">
                            <p>Джакарта — столица и крупнейший город Индонезии. Расположена на северо-западе побережья острова Ява при впадении реки Чиливунг в Яванское море.

В Джакарте много исторических памятников, интересных музеев, сохранились целые кварталы старинных зданий колониальной эпохи.</p>
                        </div>
                    `;
                    content.image = 'https://s7d1.scene7.com/is/image/wbcollab/adobestock_15449962_-_copy?qlt=90&fmt=webp&resMode=sharp2';
                    break;
            }
            
            showPopup(content);
        });
        
        return marker;
    }
}).addTo(citiesLayer);


   // Добавляем слои на карту
brics5Layer.addTo(map);
bricsLayer.addTo(map);
bricsPlusLayer.addTo(map);
citiesLayer.addTo(map);   
labelsLayer.addTo(map);


const allData = {
    type: 'FeatureCollection',
    features: [
        ...bricsData.features,
        ...brics5Data.features,
        ...bricsPlusData.features,
        ...reserveData.features,
        ...citiesData.features,
        ...coalData.features,
        ...goldData.features,
        ...oilData.features,
        ...gasData.features,
        ...naturalData.features
        ]
};
map.fitBounds(L.geoJSON(allData).getBounds());
})
.catch(error => {
console.error('Ошибка загрузки GeoJSON:', error);
alert('Не удалось загрузить данные');
});

// Добавление масштаба
L.control.scale().addTo(map);

// Контроль слоев
L.control.layers(null, {
    "Cтраны-основатели БРИКС": brics5Layer,
    "Cтраны БРИКС": bricsLayer,
    "Страны-партнеры БРИКС": bricsPlusLayer,
    "Природные зоны": naturalLayer,
    "ООПТ (заповедники)": reserveLayer,
    "Месторождения угля": coalLayer,
    "Месторождения золота": goldLayer,
    "Месторождения нефти": oilLayer,
    "Месторождения газа": gasLayer,
    "Города": citiesLayer,
    "Наименования городов": labelsLayer
}, { 
    position: 'topright',
    collapsed: false
}).addTo(map);

legend.addTo(map);