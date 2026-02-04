import { collection, getDocs, query, where, orderBy } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js";
import { db } from "./config.js";

document.addEventListener("DOMContentLoaded", async () => {
    const container = document.getElementById("adopted-list");
    if (!container) return;

    try {
        // Traemos todos los animales
        // (Filtramos en cliente para simplificar índices, o usamos query compuesta si ya existen)
        const snap = await getDocs(collection(db, "mascotas"));
        container.innerHTML = ""; 

        let count = 0;

        snap.forEach(doc => {
            const data = doc.data();
            
            // SOLO mostramos los que tienen estado "adoptado"
            if (data.estado !== "adoptado") return;

            count++;
            const card = document.createElement("div");
            card.className = "pet-card";
            // Le agregamos un estilo extra para diferenciar (opcional)
            card.style.opacity = "0.95"; 
            
            // HTML Simplificado para adoptados (Sin edad detallada, sin botón de contacto)
            card.innerHTML = `
                <div style="position:relative;">
                    <img src="${data.fotoUrl}" class="card-img" alt="${data.nombre}" style="filter: brightness(0.95);">
                    <div style="position:absolute; bottom:10px; right:10px; background:#4CAF50; color:white; padding:5px 12px; border-radius:20px; font-weight:bold; font-size:14px; box-shadow: 0 2px 5px rgba(0,0,0,0.2);">
                        ¡Adoptado! 🏠
                    </div>
                </div>
                <div class="pet-info" style="text-align:center;">
                    <h3 style="color: #4CAF50; margin-bottom: 5px;">${data.nombre}</h3>
                    <p style="font-size:14px; color:#666;">Encontró familia gracias a <br><b>${data.refugioNombre}</b></p>
                </div>
            `;
            container.appendChild(card);
        });

        if (count === 0) {
            container.innerHTML = `
                <div style="grid-column: 1/-1; text-align:center; padding: 40px;">
                    <i class="fas fa-paw" style="font-size: 50px; color: #ccc; margin-bottom: 20px;"></i>
                    <p>Aún no hemos registrado adopciones en el sistema nuevo.</p>
                    <p>¡Sé el primero en adoptar!</p>
                </div>
            `;
        }

    } catch (error) {
        console.error("Error:", error);
        container.innerHTML = "<p>Error al cargar los finales felices.</p>";
    }
});