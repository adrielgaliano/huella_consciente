document.addEventListener("DOMContentLoaded", () => {
  const container = document.getElementById("pet-list");
  if (!container) return;

  // Tomamos todas las cards (espera que estén en HTML o creadas dinámicamente)
  const cards = Array.from(container.querySelectorAll(".pet-card"));

  // --- 0) Función utilitaria: calcular edad a partir de fecha de nacimiento ---
  function ageTextFromBirth(birthISO) {
    if (!birthISO) return "";
    const birth = new Date(birthISO);
    if (isNaN(birth)) return "";
    const ms = Date.now() - birth.getTime();
    const days = Math.floor(ms / (1000 * 60 * 60 * 24));
    if (days < 30) return `${days} ${days === 1 ? "día" : "días"}`;
    const months = Math.floor(days / 30);
    if (months < 12) return `${months} ${months === 1 ? "mes" : "meses"}`;
    const years = Math.floor(months / 12);
    return `${years} ${years === 1 ? "año" : "años"}`;
  }

  // --- 1) Rellenar cada tarjeta: edad calculada y asegurar estructura ---
  cards.forEach(card => {
    // 1A) imagen: si no tiene clase 'card-img' la aplicamos (flexibilidad)
    const img = card.querySelector("img");
    if (img) img.classList.add("card-img");

    // 1B) Edad desde data-birth o data-age fallback
    const birth = card.dataset.birth;           // espera formato YYYY-MM-DD
    const ageSpan = card.querySelector(".edad");
    const numericAgeAttr = card.dataset.age;    // fallback si usás datos numéricos
    let txt = "";
    if (birth) {
      txt = ageTextFromBirth(birth);
      // guarda también edad numérica (años decimales) si lo necesitás
      const diffYears = (Date.now() - new Date(birth).getTime()) / (1000*60*60*24*365);
      card.dataset._ageYears = diffYears;
    } else if (numericAgeAttr) {
      const n = parseFloat(numericAgeAttr);
      if (!isNaN(n)) {
        if (n < 1) txt = `${Math.round(n * 12)} ${Math.round(n*12) === 1 ? "mes" : "meses"}`;
        else txt = `${Math.floor(n)} ${Math.floor(n) === 1 ? "año" : "años"}`;
        card.dataset._ageYears = n;
      }
    }
    if (ageSpan) ageSpan.textContent = txt;

    // 1C) Si no hay <ul class="pet-attributes"> y hay una ul dentro de pet-info, 
    //     convertimos su estilo para que use la rejilla (por compatibilidad)
    const petInfo = card.querySelector(".pet-info");
    if (petInfo) {
      const ul = petInfo.querySelector("ul");
      if (ul && !ul.classList.contains("pet-attributes")) {
        ul.classList.add("pet-attributes");
      }
    }
  });

  // --- 2) POPULAR selects automáticamente (refugios, animal, tamaño, sexo) ---
  const filterAnimal = document.getElementById("filterAnimal");
  const filterSize = document.getElementById("filterSize");
  const filterSex = document.getElementById("filterSex");
  const filterAge = document.getElementById("filterAge"); // si usas categorías
  const filterShelter = document.getElementById("filterShelter");

  // Helper para poblar un select con array (incluye "Todos" como primera opción)
  function populateSelect(selectEl, values, defaultLabel = "Todos") {
    if (!selectEl) return;
    // guarda la opción actualmente seleccionada si la hay
    const current = selectEl.value || "";
    selectEl.innerHTML = "";
    const optAll = document.createElement("option");
    optAll.value = "";
    optAll.textContent = defaultLabel;
    selectEl.appendChild(optAll);

    values.sort((a,b)=> a.localeCompare(b, undefined, {sensitivity:'base'}))
          .forEach(v => {
      if (!v) return;
      const opt = document.createElement("option");
      opt.value = v;
      opt.textContent = v;
      selectEl.appendChild(opt);
    });

    // restaurar selección si todavía existe
    if (current) {
      const found = Array.from(selectEl.options).find(o => o.value.toLowerCase() === current.toLowerCase());
      if (found) selectEl.value = found.value;
    }
  }

  // Recopilar sets
  const shelters = new Set();
  const animals = new Set();
  const sizes = new Set();
  const sexes = new Set();

  cards.forEach(c => {
    if (c.dataset.shelter) shelters.add(c.dataset.shelter.trim());
    if (c.dataset.animal) animals.add(capitalize(c.dataset.animal.trim()));
    if (c.dataset.size) sizes.add(capitalize(c.dataset.size.trim()));
    if (c.dataset.sex) sexes.add(capitalize(c.dataset.sex.trim()));
  });

  function capitalize(s){ return s ? s[0].toUpperCase() + s.slice(1) : s; }

  populateSelect(filterShelter, Array.from(shelters), "Todos los refugios");
  populateSelect(filterAnimal, Array.from(animals), "Todos");
  populateSelect(filterSize, Array.from(sizes), "Tamaño");
  populateSelect(filterSex, Array.from(sexes), "Sexo");

  // --- 3) Buscador y eventos para filtros ---
  const searchInput = document.getElementById("searchInput");
  if (searchInput) searchInput.addEventListener("input", filtrar);

  [filterAnimal, filterSize, filterSex, filterAge, filterShelter].forEach(s => {
    if (s) s.addEventListener("change", filtrar);
  });

  // Toggle filtros (si usás el menú móvil)
  const toggleBtn = document.getElementById("toggleFilters");
  const filtersMenu = document.getElementById("filtersMenu");
  if (toggleBtn && filtersMenu) toggleBtn.addEventListener("click", ()=> filtersMenu.classList.toggle("oculto"));

  // --- 4) Función de filtrado ---
  function filtrar() {
    const searchTerm = (searchInput?.value || "").trim().toLowerCase();
    const animalVal = (filterAnimal?.value || "").trim().toLowerCase();
    const sizeVal = (filterSize?.value || "").trim().toLowerCase();
    const sexVal = (filterSex?.value || "").trim().toLowerCase();
    const ageCat = (filterAge?.value || "").trim().toLowerCase(); // 'cachorro','adulto','senior' o ''
    const shelterVal = (filterShelter?.value || "").trim().toLowerCase();

    cards.forEach(card => {
      const name = (card.querySelector("h3")?.textContent || "").toLowerCase();
      const dataAnimal = (card.dataset.animal || "").toLowerCase();
      const dataSize = (card.dataset.size || "").toLowerCase();
      const dataSex = (card.dataset.sex || "").toLowerCase();
      const dataShelter = (card.dataset.shelter || "").toLowerCase();

      // ENCUENTRA edad numérica (años) calculada previamente o en data
      let years = parseFloat(card.dataset._ageYears || card.dataset.age || "0");
      if (isNaN(years)) years = 0;

      // categoría de edad (como en tu lógica)
      let computedAgeCat = "";
      if (years < 1) computedAgeCat = "cachorro";
      else if (years >= 1 && years <= 7) computedAgeCat = "adulto";
      else computedAgeCat = "senior";

      const matchSearch = !searchTerm || name.includes(searchTerm) || dataShelter.includes(searchTerm);
      const matchAnimal = !animalVal || dataAnimal === animalVal || dataAnimal.includes(animalVal);
      const matchSize = !sizeVal || dataSize === sizeVal || dataSize.includes(sizeVal);
      const matchSex = !sexVal || dataSex === sexVal || dataSex.includes(sexVal);
      const matchAge = !ageCat || computedAgeCat === ageCat;
      const matchShelter = !shelterVal || dataShelter === shelterVal || dataShelter.includes(shelterVal);

      if (matchSearch && matchAnimal && matchSize && matchSex && matchAge && matchShelter) {
        card.style.display = ""; // muestra
      } else {
        card.style.display = "none"; // oculta
      }
    });
  }
// --- 5) Mezclar aleatoriamente las cards al cargar la página ---
shuffleCards();

function shuffleCards() {
  for (let i = cards.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    container.appendChild(cards[j]);
  }
}


});
