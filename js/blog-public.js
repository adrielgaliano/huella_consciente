// js/blog-public.js
// Carga dinámica de los artículos del Blog (público, sin login) desde Firestore

import { collection, getDocs } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js";
import { db } from "./config.js";

const badgeClass = {
    cuidados: "badge-cuidados",
    noticias: "badge-noticias",
    historias: "badge-historias"
};
const categoriaLabel = {
    cuidados: "Cuidados",
    noticias: "Noticias",
    historias: "Historias"
};

function escapeHtml(str) {
    const div = document.createElement("div");
    div.textContent = str || "";
    return div.innerHTML;
}

async function cargarBlogsPublico() {
    const grid = document.getElementById("blogGrid");
    if (!grid) return;

    try {
        const snap = await getDocs(collection(db, "blogs"));
        const posts = [];
        snap.forEach(d => {
            const data = d.data();
            if (data.estado !== "publicado") return;
            posts.push({ id: d.id, ...data });
        });

        posts.sort((a, b) => (b.creadoEn?.seconds || 0) - (a.creadoEn?.seconds || 0));

        if (posts.length === 0) {
            grid.innerHTML = `<p style="grid-column:1/-1; text-align:center; color:#777;">Todavía no hay artículos publicados. ¡Volvé pronto!</p>`;
            return;
        }

        grid.innerHTML = posts.map(p => {
            const fecha = p.creadoEn ? new Date(p.creadoEn.seconds * 1000).toLocaleDateString('es-AR', { day: 'numeric', month: 'long', year: 'numeric' }) : "";
            const cat = p.categoria || "noticias";
            return `
                <article class="blog-card" data-category="${cat}">
                    <div class="blog-img" style="background-image: url('${p.imagenUrl}');"></div>
                    <div class="blog-content">
                        <span class="blog-badge ${badgeClass[cat] || 'badge-noticias'}">${categoriaLabel[cat] || cat}</span>
                        <h3>${escapeHtml(p.titulo)}</h3>
                        <p class="blog-date"><i class="far fa-calendar-alt"></i> ${fecha}</p>
                        <p class="blog-excerpt">${escapeHtml(p.resumen)}</p>
                        <a href="articulo.html?id=${p.id}" class="blog-read-more">Leer artículo <i class="fas fa-arrow-right"></i></a>
                    </div>
                </article>`;
        }).join("");

    } catch (err) {
        console.error(err);
        grid.innerHTML = `<p style="grid-column:1/-1; text-align:center; color:#b71c1c;">No se pudieron cargar los artículos. Intentá recargar la página.</p>`;
    }
}

document.addEventListener("DOMContentLoaded", cargarBlogsPublico);
