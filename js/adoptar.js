document.addEventListener("DOMContentLoaded", () => {
  const container = document.getElementById("pet-list");
  if (!container) return;

  const cards = Array.from(container.querySelectorAll(".pet-card"));

  // --- Función para calcular edad desde fecha de nacimiento ---
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

  // --- 1) Rellenar tarjetas ---
  cards.forEach(card => {
    const img = card.querySelector("img");
    if (img) img.classList.add("card-img");

    const birth = card.dataset.birth;           
    const ageSpan = card.querySelector(".edad");
    const numericAgeAttr = card.dataset.age;    
    let txt = "";
    if (birth) {
      txt = ageTextFromBirth(birth);
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

    const petInfo = card.querySelector(".pet-info");
    if (petInfo) {
      const ul = petInfo.querySelector("ul");
      if (ul && !ul.classList.contains("pet-attributes")) {
        ul.classList.add("pet-attributes");
      }
    }
  });

  // --- 2) Poblar selects ---
  const filterAnimal = document.getElementById("filterAnimal");
  const filterSize = document.getElementById("filterSize");
  const filterSex = document.getElementById("filterSex");
  const filterAge = document.getElementById("filterAge");
  const filterShelter = document.getElementById("filterShelter");

  function populateSelect(selectEl, values, defaultLabel = "Todos") {
    if (!selectEl) return;
    const current = selectEl.value || "";
    selectEl.innerHTML = "";
    const optAll = document.createElement("option");
    optAll.value = "";
    optAll.textContent = defaultLabel;
    selectEl.appendChild(optAll);

    values.sort((a,b)=> a[1].localeCompare(b[1], undefined, {sensitivity:'base'}))
          .forEach(([val,label]) => {
      if (!val) return;
      const opt = document.createElement("option");
      opt.value = val;
      opt.textContent = label;
      selectEl.appendChild(opt);
    });

    if (current) {
      const found = Array.from(selectEl.options).find(o => o.value.toLowerCase() === current.toLowerCase());
      if (found) selectEl.value = found.value;
    }
  }

  const shelters = new Map();
  const animals = new Set();
  const sizes = new Set();
  const sexes = new Set();

  cards.forEach(c => {
    if (c.dataset.shelter) {
      const key = c.dataset.shelter.trim();
      const label = c.dataset.shelterName || key;
      shelters.set(key, label);
    }
    if (c.dataset.animal) animals.add(capitalize(c.dataset.animal.trim()));
    if (c.dataset.size) sizes.add(capitalize(c.dataset.size.trim()));
    if (c.dataset.sex) sexes.add(capitalize(c.dataset.sex.trim()));
  });

  function capitalize(s){ return s ? s[0].toUpperCase() + s.slice(1) : s; }

  populateSelect(filterShelter, Array.from(shelters.entries()), "Todos los refugios");
  populateSelect(filterAnimal, Array.from(animals).map(v=>[v,v]), "Todos");
  populateSelect(filterSize, Array.from(sizes).map(v=>[v,v]), "Tamaño");
  populateSelect(filterSex, Array.from(sexes).map(v=>[v,v]), "Sexo");

  // --- 3) Filtros ---
  const searchInput = document.getElementById("searchInput");
  if (searchInput) searchInput.addEventListener("input", filtrar);

  [filterAnimal, filterSize, filterSex, filterAge, filterShelter].forEach(s => {
    if (s) s.addEventListener("change", filtrar);
  });

  const toggleBtn = document.getElementById("toggleFilters");
  const filtersMenu = document.getElementById("filtersMenu");
  if (toggleBtn && filtersMenu) {
    toggleBtn.addEventListener("click", () => {
      filtersMenu.classList.toggle("oculto");
    });
  }

  function filtrar() {
    const searchTerm = (searchInput?.value || "").trim().toLowerCase();
    const animalVal = (filterAnimal?.value || "").trim().toLowerCase();
    const sizeVal = (filterSize?.value || "").trim().toLowerCase();
    const sexVal = (filterSex?.value || "").trim().toLowerCase();
    const ageCat = (filterAge?.value || "").trim().toLowerCase();
    const shelterVal = (filterShelter?.value || "").trim().toLowerCase();

    cards.forEach(card => {
      const name = (card.querySelector("h3")?.textContent || "").toLowerCase();
      const dataAnimal = (card.dataset.animal || "").toLowerCase();
      const dataSize = (card.dataset.size || "").toLowerCase();
      const dataSex = (card.dataset.sex || "").toLowerCase();
      const dataShelter = (card.dataset.shelter || "").toLowerCase();

      let years = parseFloat(card.dataset._ageYears || card.dataset.age || "0");
      if (isNaN(years)) years = 0;

      let computedAgeCat = "";
      if (years < 1) computedAgeCat = "cachorro";
      else if (years >= 1 && years <= 7) computedAgeCat = "adulto";
      else computedAgeCat = "senior";

      const matchSearch = !searchTerm || name.includes(searchTerm) || dataShelter.includes(searchTerm);
      const matchAnimal = !animalVal || dataAnimal.includes(animalVal);
      const matchSize = !sizeVal || dataSize.includes(sizeVal);
      const matchSex = !sexVal || dataSex.includes(sexVal);
      const matchAge = !ageCat || computedAgeCat === ageCat;
      const matchShelter = !shelterVal || dataShelter === shelterVal;

      if (matchSearch && matchAnimal && matchSize && matchSex && matchAge && matchShelter) {
        card.style.display = "";
      } else {
        card.style.display = "none";
      }
    });
  }

  

  // --- 4) Mezclar cards al cargar ---
  shuffleCards();
  function shuffleCards() {
    for (let i = cards.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      container.appendChild(cards[j]);
    }
  }
    
});
