var headerText = <div>
Моя шапка
<span>
    <div class="navbar">
      <a href="./mainpage.html">Главная</a>
      <div class="dropdown">
        <button class="dropbtn"> <a href = "./developed.html">Освоенная территория</a></button>
        <div class="dropdown-content">
          <a href="./developed.html#d_first">Население</a>
          <a href="./developed.html#d_second">Дорожная сеть</a>
          <a href="./developed.html#d_third">Промышленность</a>
        </div>
      </div> 
      <div class="dropdown">
        <button class="dropbtn"> <a href = "./developed.html">Дикая природа</a></button>
        <div class="dropdown-content">
          <a href="#">ООПТ</a>
          <a href="#">Коренные малые народы</a>
        </div>
      </div> 
      <a href="./map2.html">Интерактивная карта</a>
    </div>
</span>
</div>;

function setHeader() {
  var header =  document.createElement("div");
  header.innerHTML = headerText ;
  document.body.insertAdjacentElement('afterbegin', header );
}

setHeader();