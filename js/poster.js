// ==========================================
// 📸 DICCIONARIO DE LOGOS DE REFUGIOS
// ==========================================
// Aquí configuras qué imagen corresponde a cada nombre exacto del refugio
const LOGOS_REFUGIOS = {
    "El Refugio de Diego": "images/refugios/refugio4.png",
    "Gatitos en adopción Mendoza": "images/refugios/refugio3.jpeg",
    "La Casita de Lula": "images/refugios/refugio1.jpeg",
    "FUNDACION HOGAR ROUSI": "images/refugios/refugio2.jpeg",
    "Adopción Responsable Mendoza": "images/refugios/Adopcion Responsable Mendoza.jpeg",
    "Fundación Jupakki": "images/refugios/Fundacion Jupakki.jpeg",
    "Mua ONG":"images/refugios/Mua.jpeg",
    // Agrega aquí todos los que necesites...
    
    "default": "images/Isotipo_con_fondo.png" // Logo por defecto si no coincide ninguno
};

document.addEventListener("DOMContentLoaded", () => {
    crearModalYTemplate();
    
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((m) => {
            m.addedNodes.forEach((node) => {
                if (node.nodeType === 1) {
                    if (node.classList.contains("pet-card")) addCameraBtn(node);
                    else node.querySelectorAll(".pet-card").forEach(c => addCameraBtn(c));
                }
            });
        });
    });
    observer.observe(document.body, { childList: true, subtree: true });
    document.querySelectorAll(".pet-card").forEach(c => addCameraBtn(c));
});

function crearModalYTemplate() {
    const modal = document.createElement("div");
    modal.className = "poster-modal";
    modal.innerHTML = `
        <div class="poster-content">
            <span class="close-poster">&times;</span>
            <h3>✨ Story lista para compartir</h3>
            <div id="posterCanvasArea"></div>
            <p style="margin-top:10px; font-size:14px; color:#666;">Si no descarga, mantén apretada la imagen.</p>
            <button id="downloadBtn" class="btn-descargar">💾 Descargar Imagen</button>
        </div>
    `;
    document.body.appendChild(modal);
    modal.querySelector(".close-poster").onclick = () => modal.classList.remove("active");
    modal.onclick = (e) => { if(e.target === modal) modal.classList.remove("active"); };

    const template = document.createElement("div");
    template.id = "insta-template";
    template.innerHTML = `
        <div class="header-container">
            <div class="logo-box">
                <img id="tpl-shelter-logo" src="" crossorigin="anonymous">
            </div>
            <h2 id="tpl-shelter">NOMBRE DEL REFUGIO</h2>
        </div>

        <div class="main-photo-frame">
            <div class="photo-inner">
                <img id="tpl-img" src="" crossorigin="anonymous">
            </div>
        </div>
        
        <div class="animal-info">
            <h1 id="tpl-name">NOMBRE</h1>
            <p id="tpl-desc">"Descripción..."</p>
        </div>

        <div class="poster-footer">
            <div class="brand-left">
                <img src="images/Isotipo_sin_fondo.png" crossorigin="anonymous">
                <span>Huella Consciente</span>
            </div>
            <div class="qr-right">
                <div class="qr-text">
                    <span>¡ADOPTAME!</span>
                    <small>Escaneá para ver más</small>
                </div>
                <img src="images/qr.png" class="qr-code-img" crossorigin="anonymous">
            </div>
        </div>
    `;
    document.body.appendChild(template);
}

function addCameraBtn(card) {
    if (card.querySelector(".btn-poster")) return;
    const btn = document.createElement("button");
    btn.className = "btn-poster";
    btn.title = "Compartir";
    btn.innerHTML = '<i class="fas fa-share-nodes"></i>';
    btn.onclick = (e) => { e.preventDefault(); generarPoster(card); };
    card.appendChild(btn);
}
function generarPoster(card) {
    // 1. OBTENER DATOS BÁSICOS
    const nombre = card.querySelector("h3").innerText;
    const imgUrl = card.querySelector("img").src;

    // 2. OBTENER EL REFUGIO
    // Buscamos en la lista de atributos específicamente
    let refugioText = "Refugio Aliado";
    const atributos = card.querySelectorAll("li");
    atributos.forEach(li => {
        if(li.innerText.includes("Refugio:")) {
            // Separamos "Refugio: Nombre" y nos quedamos con "Nombre"
            refugioText = li.innerText.split(":")[1].trim();
        }
    });

    // 3. OBTENER DESCRIPCIÓN
    // Estrategia: La descripción suele ser el último párrafo <p> dentro de .pet-info
    // que NO sea un atributo de lista.
    let descripcionText = "";
    const parrafos = card.querySelectorAll(".pet-info p");

    parrafos.forEach(p => {
        const texto = p.innerText.trim();
        if(texto.length > 0 && !texto.includes("Refugio:") && !texto.includes("Ubicación:")) {
            descripcionText = texto;
        }
    });

    mostrarPoster(nombre, imgUrl, refugioText, descripcionText);
}

// ==========================================
// Función reusable: recibe los datos ya armados
// (la usa tanto generarPoster() de arriba como mascota.html directamente)
// ==========================================
window.mostrarPoster = function(nombre, imgUrl, refugioText, descripcionText) {
    const modal = document.querySelector(".poster-modal");
    const canvasArea = document.getElementById("posterCanvasArea");
    const downloadBtn = document.getElementById("downloadBtn");

    refugioText = refugioText || "Refugio Aliado";

    // Si después de buscar no encontramos nada (o era texto vacío), usamos el default
    if (!descripcionText) {
        descripcionText = "¡Busco un hogar lleno de amor!";
    }

    // Cortamos si es excesivamente larga para que no rompa el diseño (más de 130 caracteres)
    if(descripcionText.length > 130) {
        descripcionText = descripcionText.substring(0, 130) + "...";
    }

    // 4. SELECCIONAR LOGO (Lógica del diccionario)
    let logoUrl = LOGOS_REFUGIOS["default"];
    for (const [key, url] of Object.entries(LOGOS_REFUGIOS)) {
        if (key !== "default" && refugioText.includes(key)) {
            logoUrl = url;
            break;
        }
    }

    // 5. RELLENAR PLANTILLA
    document.getElementById("tpl-shelter").innerText = refugioText.toUpperCase();
    document.getElementById("tpl-name").innerText = nombre.toUpperCase();
    document.getElementById("tpl-desc").innerText = `"${descripcionText}"`;
    document.getElementById("tpl-img").src = imgUrl;
    document.getElementById("tpl-shelter-logo").src = logoUrl;

    // 6. GENERAR IMAGEN
    modal.classList.add("active");
    canvasArea.innerHTML = '<div style="padding:30px; color:#666;">📸 Diseñando story...</div>';

    setTimeout(() => {
        html2canvas(document.getElementById("insta-template"), {
            scale: 2, useCORS: true, backgroundColor: null
        }).then(canvas => {
            canvasArea.innerHTML = "";
            canvas.style.width = "100%";
            canvas.style.height = "auto";
            canvas.className = "polaroid-anim";
            canvasArea.appendChild(canvas);

            downloadBtn.onclick = () => {
                const link = document.createElement('a');
                link.download = `Story-${nombre}.png`;
                link.href = canvas.toDataURL("image/png");
                link.click();
            };
        });
    }, 500);
};