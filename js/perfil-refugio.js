import { doc, getDoc, collection, getDocs } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js";
import { db } from "./config.js";

const PLACEHOLDER_LOGO = "images/Isotipo_sin_fondo.png";
const PLACEHOLDER_PET = "images/index_aporte.jpeg";

function capitalize(s) {
    if (!s) return "";
    return s.charAt(0).toUpperCase() + s.slice(1);
}

function calcularEdad(data) {
    let edadTexto = "Desconocida";
    let categoria = "adulto";

    if (data.metodoEdad === "fecha" && data.fechaNacimiento) {
        const birth = new Date(data.fechaNacimiento);
        const now = new Date();
        const ageYears = (now - birth) / (1000 * 60 * 60 * 24 * 365);
        const diffDays = Math.ceil((now - birth) / (1000 * 60 * 60 * 24));

        if (diffDays < 30) edadTexto = `${diffDays} días`;
        else if (diffDays < 365) edadTexto = `${Math.floor(diffDays / 30)} meses`;
        else edadTexto = `${Math.floor(ageYears)} años`;

        if (ageYears < 1) categoria = "Cachorro";
        else if (ageYears > 7) categoria = "Senior";
        else categoria = "Adulto";
    } else if (data.edadCategoria) {
        categoria = capitalize(data.edadCategoria);
        edadTexto = categoria;
    }
    return { edadTexto, categoria };
}

document.addEventListener("DOMContentLoaded", async () => {
    const cont = document.getElementById("perfil-refugio-container");
    const params = new URLSearchParams(window.location.search);
    const refugioId = params.get("refugio");

    if (!refugioId) {
        cont.innerHTML = "<p style='text-align:center; padding:40px;'>No se especificó ningún refugio. Volvé a <a href='refugios.html'>Refugios</a>.</p>";
        return;
    }

    cont.innerHTML = "<p style='text-align:center; padding:40px;'>Cargando refugio...</p>";

    try {
        const snapRefugio = await getDoc(doc(db, "perfiles_refugio", refugioId));
        if (!snapRefugio.exists()) {
            cont.innerHTML = "<p style='text-align:center; padding:40px;'>No encontramos este refugio.</p>";
            return;
        }
        const refugio = snapRefugio.data();
        const nombreRefugio = refugio.refugioNombre || "Refugio";
        document.title = `${nombreRefugio} - Huella Consciente`;

        // Traemos todas las mascotas y filtramos por refugio + disponibles/en tránsito
        const snapMascotas = await getDocs(collection(db, "mascotas"));
        const mascotas = [];
        snapMascotas.forEach(d => {
            const m = d.data();
            if (m.estado === "adoptado" || m.estado === "eliminado") return;
            if ((m.refugioNombre || "") !== nombreRefugio) return;
            mascotas.push({ id: d.id, ...m });
        });

        // --- Redes sociales ---
        let socialsHtml = "";
        if (refugio.instagram) {
            const insta = refugio.instagram.replace("@", "").trim();
            socialsHtml += `<a href="https://www.instagram.com/${insta}" target="_blank" title="Instagram"><i class="fab fa-instagram"></i></a>`;
        }
        if (refugio.facebook) socialsHtml += `<a href="${refugio.facebook}" target="_blank" title="Facebook"><i class="fab fa-facebook"></i></a>`;
        if (refugio.tiktok) {
            const tk = refugio.tiktok.replace("@", "").trim();
            socialsHtml += `<a href="https://www.tiktok.com/@${tk}" target="_blank" title="TikTok"><i class="fab fa-tiktok"></i></a>`;
        }

        const tieneAlias = !!(refugio.aliasPrincipal && refugio.aliasPrincipal.alias);
        const tienePlanes = Array.isArray(refugio.planesDonacion) && refugio.planesDonacion.length > 0;
        const recibeDonaciones = tieneAlias || tienePlanes;

        // --- Grilla de mascotas ---
        let petsHtml = "";
        if (mascotas.length === 0) {
            petsHtml = "<p style='grid-column: 1 / -1; text-align:center; color:#8a7a6d;'>Este refugio no tiene animales publicados en este momento.</p>";
        } else {
            mascotas.forEach(m => {
                const { edadTexto, categoria } = calcularEdad(m);
                const sexoIcono = (m.sex || "").toLowerCase() === "hembra" ? "♀" : "♂";
                petsHtml += `
                    <a class="pm-mini-card" href="mascota.html?id=${m.id}">
                        <img src="${m.fotoUrl || PLACEHOLDER_PET}" alt="${m.nombre}">
                        <div class="pm-mini-body">
                            <h4>${m.nombre} <span>${sexoIcono}</span></h4>
                            <p class="pm-mini-meta">${categoria} • ${capitalize(m.size) || "Tamaño s/d"}</p>
                            <p class="pm-mini-meta">${m.ubicacion || "Mendoza"}</p>
                        </div>
                    </a>
                `;
            });
        }

        cont.innerHTML = `
            <div class="pm-profile-box">
                <div class="pm-profile-side">
                    <img class="pm-profile-logo" src="${refugio.logoUrl || PLACEHOLDER_LOGO}" alt="Logo ${nombreRefugio}">
                    ${recibeDonaciones ? `<span class="pm-profile-badge">♥ Recibe donaciones</span>` : ""}
                    <h1>${nombreRefugio}</h1>
                    <div class="pm-profile-location"><i class="fas fa-map-marker-alt"></i> Mendoza, Argentina</div>
                    ${refugio.bio ? `<p class="pm-profile-bio">${refugio.bio}</p>` : ""}
                    ${socialsHtml ? `<div class="pm-profile-socials">${socialsHtml}</div>` : ""}
                    <div class="pm-profile-count">🐾 ${mascotas.length} mascota${mascotas.length === 1 ? "" : "s"} en adopción</div>
                    ${recibeDonaciones ? `<a class="pm-profile-donar" href="donar-refugio.html?refugio=${encodeURIComponent(nombreRefugio)}">♥ Donar</a>` : ""}
                    <button type="button" id="btnCompartirRefugio" style="margin-top:10px; background:transparent; border:2px solid var(--marron); color:var(--marron); font-weight:600; padding:12px 18px; border-radius:30px; cursor:pointer;">
                        <i class="fas fa-share-nodes"></i> Compartir refugio
                    </button>
                </div>
                <div class="pm-profile-pets">
                    ${petsHtml}
                </div>
            </div>
        `;

        // Botón "Compartir refugio": comparte (o copia) la URL de este perfil
        const btnCompartirRefugio = document.getElementById("btnCompartirRefugio");
        if (btnCompartirRefugio) {
            btnCompartirRefugio.onclick = async () => {
                const url = window.location.href;
                const textoCompartir = `Conocé a ${nombreRefugio} y sus animales en adopción en Huella Consciente 🐾`;

                if (navigator.share) {
                    try {
                        await navigator.share({ title: nombreRefugio, text: textoCompartir, url });
                    } catch (e) {
                        // El usuario canceló el share nativo
                    }
                } else {
                    try {
                        await navigator.clipboard.writeText(url);
                        const original = btnCompartirRefugio.innerHTML;
                        btnCompartirRefugio.innerHTML = "✅ ¡Link copiado!";
                        setTimeout(() => btnCompartirRefugio.innerHTML = original, 1800);
                    } catch (e) {
                        alert("Copiá este link para compartirlo: " + url);
                    }
                }
            };
        }

    } catch (error) {
        console.error("Error cargando el perfil del refugio:", error);
        cont.innerHTML = "<p style='text-align:center; padding:40px;'>Hubo un error al cargar el refugio. Intentá más tarde.</p>";
    }
});