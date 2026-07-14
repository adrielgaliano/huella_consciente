// js/articulo-public.js
// Carga dinámica de un artículo individual del Blog (público) desde Firestore

import { doc, getDoc } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js";
import { db } from "./config.js";

const categoriaLabel = {
    cuidados: "Cuidados",
    noticias: "Noticias",
    historias: "Historias"
};
const badgeClass = {
    cuidados: "badge-cuidados",
    noticias: "badge-noticias",
    historias: "badge-historias"
};

function escapeHtml(str) {
    const div = document.createElement("div");
    div.textContent = str || "";
    return div.innerHTML;
}

// Convierte el texto plano cargado en el panel de admin a HTML simple:
// línea en blanco = nuevo párrafo, "## " = subtítulo, "- " = viñeta, "> " = cita
function contenidoAHtml(texto) {
    const bloques = (texto || "").split(/\n\s*\n/);
    let html = "";

    bloques.forEach(bloque => {
        const lineas = bloque.split("\n").map(l => l.trim()).filter(Boolean);
        if (lineas.length === 0) return;

        if (lineas.every(l => l.startsWith("- "))) {
            html += "<ul>" + lineas.map(l => `<li>${escapeHtml(l.slice(2))}</li>`).join("") + "</ul>";
        } else if (lineas[0].startsWith("## ")) {
            html += `<h2>${escapeHtml(lineas[0].slice(3))}</h2>`;
            const resto = lineas.slice(1).map(escapeHtml).join("<br>");
            if (resto) html += `<p>${resto}</p>`;
        } else if (lineas[0].startsWith("> ")) {
            html += `<blockquote>${lineas.map(l => escapeHtml(l.replace(/^>\s?/, ""))).join("<br>")}</blockquote>`;
        } else {
            html += `<p>${lineas.map(escapeHtml).join("<br>")}</p>`;
        }
    });

    return html;
}

async function cargarArticulo() {
    const params = new URLSearchParams(window.location.search);
    const id = params.get("id");
    const cont = document.getElementById("articuloContainer");
    if (!cont) return;

    if (!id) {
        cont.innerHTML = `<p style="text-align:center; padding:60px 20px;">No se especificó ningún artículo.</p>`;
        return;
    }

    try {
        const snap = await getDoc(doc(db, "blogs", id));
        if (!snap.exists() || snap.data().estado !== "publicado") {
            cont.innerHTML = `<p style="text-align:center; padding:60px 20px;">Este artículo no existe o ya no está disponible.</p>`;
            return;
        }

        const p = snap.data();
        const cat = p.categoria || "noticias";
        const fecha = p.creadoEn ? new Date(p.creadoEn.seconds * 1000).toLocaleDateString('es-AR', { day: 'numeric', month: 'long', year: 'numeric' }) : "";

        document.title = `${p.titulo} - Huella Consciente`;

        document.getElementById("articuloHero").style.backgroundImage =
            `linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.6)), url('${p.imagenUrl}')`;
        document.getElementById("articuloBadge").textContent = categoriaLabel[cat] || cat;
        document.getElementById("articuloBadge").className = `blog-badge ${badgeClass[cat] || 'badge-noticias'}`;
        document.getElementById("articuloTitulo").textContent = p.titulo;
        document.getElementById("articuloFecha").innerHTML = `<i class="far fa-calendar-alt"></i> ${fecha}`;
        document.getElementById("articuloAutor").innerHTML = `<i class="far fa-user"></i> Por ${escapeHtml(p.autor || "Equipo Huella Consciente")}`;
        document.getElementById("articuloCuerpo").innerHTML = contenidoAHtml(p.contenido);

        cont.style.display = "block";

    } catch (err) {
        console.error(err);
        cont.innerHTML = `<p style="text-align:center; padding:60px 20px;">Ocurrió un error al cargar el artículo.</p>`;
    }
}

document.addEventListener("DOMContentLoaded", cargarArticulo);
