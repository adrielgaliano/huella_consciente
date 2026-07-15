import { collection, getDocs, updateDoc, doc, increment, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js";
import { db } from "./config.js";

document.addEventListener("DOMContentLoaded", async () => {
    const container = document.getElementById("pet-list");
    if (!container) return;

    container.innerHTML = '<p style="text-align:center; width:100%; padding:20px;">Cargando peluditos...</p>';

    try {
        const snap = await getDocs(collection(db, "mascotas"));
        container.innerHTML = ""; 

        if (snap.empty) { 
            container.innerHTML = "<p style='text-align:center; width:100%;'>No hay animales disponibles por el momento.</p>"; 
            return; 
        }

        // Convertimos a array
        let mascotas = [];
        snap.forEach(d => mascotas.push({ id: d.id, ...d.data() }));

        mascotas.forEach(data => {
            const dId = data.id;
            
            // --- FILTRO IMPORTANTE ---
            // No mostramos adoptados NI eliminados
            // Si está adoptado, eliminado O en tránsito, no lo mostramos en la lista principal
            if (data.estado === "adoptado" || data.estado === "eliminado" || data.estado === "en_transito") return;

            // --- 1. Generar Etiquetas ---
            let tagsHtml = '<div class="tags-container" style="display:flex; flex-wrap:wrap; gap:5px; margin-bottom:8px;">';
            if(data.etiquetas) {
                if(data.etiquetas.castrado) tagsHtml += '<span class="badge">Castrado</span>';
                if(data.etiquetas.vacunado) tagsHtml += '<span class="badge">Vacunado</span>';
                if(data.etiquetas.gatos) tagsHtml += '<span class="badge">Apto Gatos</span>';
                if(data.etiquetas.perros) tagsHtml += '<span class="badge">Apto Perros</span>';
                if(data.etiquetas.ninos) tagsHtml += '<span class="badge">Apto Niños</span>';
                if(data.etiquetas.disca) tagsHtml += '<span class="badge" style="background:#fff3e0; color:#e65100; border-color:#ffe0b2">Cuidados Esp.</span>';
                if(data.etiquetas.transito) tagsHtml += '<span class="badge" style="background:#e3f2fd; color:#1565c0;">Busca Tránsito</span>';
            }
            tagsHtml += '</div>';

            // --- 2. Lógica de Edad ---
            let edadTexto = "Desconocida";
            let ageCategory = "adulto";

            if (data.metodoEdad === "fecha" && data.fechaNacimiento) {
                const birth = new Date(data.fechaNacimiento);
                const now = new Date();
                const ageYears = (now - birth) / (1000 * 60 * 60 * 24 * 365);
                const diffDays = Math.ceil((now - birth) / (1000 * 60 * 60 * 24));

                if (diffDays < 30) edadTexto = `${diffDays} días`;
                else if (diffDays < 365) edadTexto = `${Math.floor(diffDays/30)} meses`;
                else edadTexto = `${Math.floor(ageYears)} años`;

                if (ageYears < 1) ageCategory = "cachorro";
                else if (ageYears > 7) ageCategory = "senior";
            } else if (data.edadCategoria) {
                edadTexto = data.edadCategoria; 
                ageCategory = data.edadCategoria.toLowerCase();
            }

            // --- 3. Lógica de Galería (1 o 2 fotos) ---
            let imageHtml = "";
            const tieneDosFotos = data.fotoUrl2 && data.fotoUrl2.trim() !== "";

            if (tieneDosFotos) {
                imageHtml = `
                    <div class="gallery-wrapper">
                        <span class="multi-photo-badge">📷 1/2</span>
                        <img src="${data.fotoUrl}" class="card-img" id="img-${dId}">
                        <button class="gallery-btn prev" onclick="toggleFoto('${dId}', '${data.fotoUrl}', '${data.fotoUrl2}')">❮</button>
                        <button class="gallery-btn next" onclick="toggleFoto('${dId}', '${data.fotoUrl}', '${data.fotoUrl2}')">❯</button>
                    </div>
                `;
            } else {
                imageHtml = `<img src="${data.fotoUrl}" class="card-img" alt="${data.nombre}">`;
            }
            
            // --- 4. Crear la tarjeta ---
            const card = document.createElement("div");
            card.className = "pet-card";
            
            // Datos para los filtros
            card.dataset.animal = (data.animal || "").toLowerCase();
            card.dataset.size = (data.size || "").toLowerCase();
            card.dataset.sex = (data.sex || "").toLowerCase();
            card.dataset.shelterName = data.refugioNombre || "";
            card.dataset.ageCat = ageCategory;
            card.dataset.name = (data.nombre || "").toLowerCase();

            card.innerHTML = `
                ${imageHtml}
                <div class="pet-info">
                    <h3>${data.nombre}</h3>
                    ${tagsHtml}
                    <ul class="pet-attributes">
                        <li><b>Edad:</b> ${edadTexto}</li>
                        <li><b>Sexo:</b> ${capitalize(data.sex)}</li>
                        <li><b>Tamaño:</b> ${capitalize(data.size)}</li>
                        <li><b>Ubicación:</b> ${data.ubicacion || "Mendoza"}</li>
                        <li><b>Refugio:</b> ${data.refugioNombre}</li>
                    </ul>
                    <p>${data.descripcion}</p>
                </div>
                
                <!-- MODIFICACIÓN APLICADA: Enlace dinámico a la página de la mascota -->
                <a href="mascota.html?id=${dId}" class="btn-adoptar" style="display: block; text-align: center; text-decoration: none; margin-top: 10px;">
                    🐾 Conoceme
                </a>
            `;
            container.appendChild(card);
        });

        // --- 5. Mezclar cards (Shuffle) ---
        const allCards = Array.from(container.children);
        for (let i = allCards.length - 1; i > 0; i--) {
             const j = Math.floor(Math.random() * (i + 1));
             container.appendChild(allCards[j]);
        }

        activarFiltros();

    } catch (error) {
        console.error("Error:", error);
        container.innerHTML = "<p>Hubo un error al cargar. Por favor intenta más tarde.</p>";
    }
});

// ==========================================
// FUNCIONES AUXILIARES (Galería, Filtros)
// ==========================================

window.toggleFoto = (id, img1, img2) => {
    const imgElement = document.getElementById(`img-${id}`);
    const badge = imgElement.parentElement.querySelector(".multi-photo-badge");
    
    if (imgElement.src === img1) {
        imgElement.src = img2;
        if(badge) badge.textContent = "📷 2/2";
    } else {
        imgElement.src = img1;
        if(badge) badge.textContent = "📷 1/2";
    }
};

function activarFiltros() {
    const toggleBtn = document.getElementById("toggleFilters");
    const filtersMenu = document.getElementById("filtersMenu");

    if(toggleBtn && filtersMenu) {
        toggleBtn.onclick = () => filtersMenu.classList.toggle("oculto");
    }

    const shelterSelect = document.getElementById("filterShelter");
    const cards = document.querySelectorAll(".pet-card");
    
    if(shelterSelect) {
        const names = new Set();
        cards.forEach(c => {
            if(c.dataset.shelterName) names.add(c.dataset.shelterName);
        });
        shelterSelect.innerHTML = '<option value="">Refugio</option>';
        names.forEach(n => {
            const opt = document.createElement("option");
            opt.value = n; opt.textContent = n;
            shelterSelect.appendChild(opt);
        });
    }

    const inputs = document.querySelectorAll("#filtersMenu select, #searchInput");
    
    const filtrar = () => {
        const term = document.getElementById("searchInput")?.value.toLowerCase().trim() || "";
        const fAnimal = document.getElementById("filterAnimal")?.value.toLowerCase() || "";
        const fSize = document.getElementById("filterSize")?.value.toLowerCase() || "";
        const fSex = document.getElementById("filterSex")?.value.toLowerCase() || "";
        const fAge = document.getElementById("filterAge")?.value.toLowerCase() || "";
        const fShelter = document.getElementById("filterShelter")?.value || "";

        cards.forEach(card => {
            let visible = true;
            if (term) {
                const name = card.dataset.name;
                const shelter = card.dataset.shelterName.toLowerCase();
                if (!name.includes(term) && !shelter.includes(term)) visible = false;
            }
            if (fAnimal && card.dataset.animal !== fAnimal) visible = false;
            if (fSize && card.dataset.size !== fSize) visible = false;
            if (fSex && card.dataset.sex !== fSex) visible = false;
            if (fAge && card.dataset.ageCat !== fAge) visible = false;
            if (fShelter && card.dataset.shelterName !== fShelter) visible = false;

            card.style.display = visible ? "" : "none";
        });
    };

    inputs.forEach(i => i.addEventListener("input", filtrar));
    
const params = new URLSearchParams(window.location.search);
const refugioPreseleccionado = params.get("refugio");
const animalPreseleccionado = params.get("animal");
const edadPreseleccionada = params.get("age");

if (refugioPreseleccionado && shelterSelect) {
    shelterSelect.value = refugioPreseleccionado;
}
const filterAnimalEl = document.getElementById("filterAnimal");
if (animalPreseleccionado && filterAnimalEl) {
    filterAnimalEl.value = animalPreseleccionado;
}
const filterAgeEl = document.getElementById("filterAge");
if (edadPreseleccionada && filterAgeEl) {
    filterAgeEl.value = edadPreseleccionada;
}
if (refugioPreseleccionado || animalPreseleccionado || edadPreseleccionada) {
    if (filtersMenu) filtersMenu.classList.remove("oculto");
    filtrar();
}
}

function capitalize(s) { 
    if(!s) return "Desconocido";
    if(s === "-") return "Desconocido"; 
    return s.charAt(0).toUpperCase() + s.slice(1); 
}

// ==========================================
// CÓDIGO DEL MODAL Y WHATSAPP (Comentado)
// ==========================================
/*
window.abrirAdopcion = (id, nombre, telefono) => { ... }
window.cerrarModal = () => { ... }
const formAdopcion = document.getElementById("formAdopcion");
if(formAdopcion) { ... }
*/