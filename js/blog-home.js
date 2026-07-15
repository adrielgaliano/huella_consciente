// js/blog-home.js
// Carga las últimas 3 notas del blog en la home (sección "Últimas del Blog")

import { collection, getDocs } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js";
import { db } from "./config.js";

function escapeHtml(str) {
    const div = document.createElement("div");
    div.textContent = str || "";
    return div.innerHTML;
}

async function cargarUltimasNotas() {
    const grid = document.getElementById("blogHomeGrid");
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
        const ultimas = posts.slice(0, 3);

        if (ultimas.length === 0) {
            grid.innerHTML = `<p style="grid-column:1/-1; color:#888;">Todavía no hay artículos publicados.</p>`;
            return;
        }

        grid.innerHTML = ultimas.map(p => {
            const fecha = p.creadoEn ? new Date(p.creadoEn.seconds * 1000).toLocaleDateString('es-AR', { day: 'numeric', month: 'long', year: 'numeric' }) : "";
            return `
                <a href="articulo.html?id=${p.id}" class="blog-home-card">
                    <div class="blog-home-img" style="background-image: url('${p.imagenUrl}');"></div>
                    <div class="blog-home-body">
                        <small style="color:#f68c1f; font-weight:bold; text-transform:uppercase;">${escapeHtml(p.categoria || "")}</small>
                        <h4>${escapeHtml(p.titulo)}</h4>
                        <p>${fecha}</p>
                    </div>
                </a>`;
        }).join("");

    } catch (err) {
        console.error(err);
        grid.innerHTML = `<p style="grid-column:1/-1; color:#b71c1c;">No se pudieron cargar los artículos.</p>`;
    }
}

document.addEventListener("DOMContentLoaded", cargarUltimasNotas);
