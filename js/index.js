import { collection, getDocs, limit, query, orderBy, where } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js";
import { db } from "./config.js";

const container = document.getElementById("featured-pets");

async function cargarDestacados() {
    if(!container) return;
    
    // 1. Traemos las últimas 10 (traemos de más por si alguna está eliminada)
    try {
        const q = query(
            collection(db, "mascotas"), 
            orderBy("creadoEn", "desc"), 
            limit(10) 
        );
        const snap = await getDocs(q);
        
        container.innerHTML = "";
        
        if(snap.empty) {
            container.innerHTML = "<p>Pronto verás novedades aquí.</p>";
            return;
        }

        // 2. FILTRADO INTELIGENTE
        // Convertimos a array y filtramos lo que NO queremos ver en el inicio
        let validos = [];
        snap.forEach(doc => {
            const data = doc.data();
            // Si NO está adoptado, NI eliminado, NI en tránsito... sirve.
            if (data.estado !== "adoptado" && 
                data.estado !== "eliminado" && 
                data.estado !== "en_transito") {
                
                validos.push({ id: doc.id, ...data });
            }
        });

        // 3. Tomamos solo los 3 primeros válidos
        const destacados = validos.slice(0, 3);

        if(destacados.length === 0) {
            container.innerHTML = "<p>Pronto verás novedades aquí.</p>";
            return;
        }

        // 4. Renderizamos las tarjetas
        destacados.forEach(data => {
            const card = document.createElement("div");
            card.className = "pet-card"; 
            
            // Etiquetas
            let tagsHtml = '<div class="tags-container" style="display:flex; flex-wrap:wrap; gap:5px; margin-bottom:8px; justify-content:center;">';
            if(data.etiquetas) {
                if(data.etiquetas.castrado) tagsHtml += '<span class="badge">Castrado</span>';
                if(data.etiquetas.vacunado) tagsHtml += '<span class="badge">Vacunado</span>';
            }
            tagsHtml += '</div>';

            // Link WhatsApp
            const link = data.contacto ? `https://wa.me/${data.contacto}` : "contacto.html";

            card.innerHTML = `
                <img src="${data.fotoUrl}" class="card-img" alt="${data.nombre}">
                <div class="pet-info">
                    <h3>${data.nombre}</h3>
                    ${tagsHtml}
                    <p style="font-size:14px; color:#666;">Refugio: ${data.refugioNombre}</p>
                </div>
                <a href="adoptar.html" class="btn-adoptar">
                    Ver más detalles
                </a>
            `;
            container.appendChild(card);
        });

        // Inyectar el botón de póster si existe el script
        if(window.addCameraBtn) {
            document.querySelectorAll(".pet-card").forEach(c => window.addCameraBtn(c));
        }

    } catch (e) {
        console.error("Error cargando destacados:", e);
        container.innerHTML = "<p><a href='adoptar.html'>Ver todos los animales</a></p>";
    }
}

cargarDestacados();



// =========================
// Animación Sección Impacto
// =========================

document.addEventListener("DOMContentLoaded", () => {
    const seccionImpacto = document.getElementById("impacto");
    const tarjetas = document.querySelectorAll(".impacto-card");
    const contadores = document.querySelectorAll(".contador");
    let animacionIniciada = false; // Para que no se repita al hacer scroll arriba/abajo

    // Función para animar el conteo de números
    const animarContadores = () => {
        contadores.forEach(contador => {
            const target = +contador.getAttribute("data-target"); // Valor final
            const prefijo = contador.getAttribute("data-prefijo") || "";
            const sufijo = target >= 1000000 ? "M" : ""; // Sufijo 'M' para millones
            
            let count = 0;
            // Cuanto más pequeño el incremento, más suave y lenta la animación
            const incremento = target / 100; // Dividimos en 100 pasos

            const updateCount = () => {
                count += incremento;
                
                // Formateo del número para mostrar
                let numeroMostrado;
                if (target >= 1000000) {
                    // Para millones, mostramos sin decimales si es entero grande
                    numeroMostrado = Math.floor(count / 1000000);
                } else {
                    numeroMostrado = Math.ceil(count);
                }

                if (count < target) {
                    contador.innerText = `${prefijo}${numeroMostrado}${sufijo}`;
                    setTimeout(updateCount, 20); // Velocidad de actualización
                } else {
                    // Asegurar que termine en el valor exacto
                    let valorFinal = target >= 1000000 ? target / 1000000 : target;
                    contador.innerText = `${prefijo}${valorFinal}${sufijo}`;
                }
            };
            
            updateCount();
        });
    };

    // Configurar el Intersection Observer
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            // Si la sección es visible y no se ha animado aún
            if (entry.isIntersecting && !animacionIniciada) {
                // 1. Animar entrada de tarjetas
                tarjetas.forEach(card => card.classList.add("visible"));
                
                // 2. Iniciar conteo de números
                animarContadores();
                
                animacionIniciada = true; // Marcar como animado
                observer.unobserve(entry.target); // Dejar de observar una vez hecho
            }
        });
    }, { threshold: 0.5 }); // Se activa cuando el 50% de la sección es visible

    if (seccionImpacto) {
        observer.observe(seccionImpacto);
    }
});













// Efecto Sticky Navbar
window.addEventListener("scroll", function() {
    const navbar = document.querySelector(".navbar");
    // Si bajamos más de 50px, agregamos la clase 'scrolled'
    if (window.scrollY > 50) {
        navbar.classList.add("scrolled");
    } else {
        navbar.classList.remove("scrolled");
    }
});

// Menú Hamburguesa (Si no lo tenías ya)
const hamburger = document.querySelector(".hamburger");
const navLinks = document.querySelector(".nav-links");

if(hamburger) {
    hamburger.addEventListener("click", () => {
        navLinks.classList.toggle("active");
    });
}