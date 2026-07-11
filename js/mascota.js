import { doc, getDoc, updateDoc, increment, addDoc, collection, serverTimestamp } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js";
import { db } from "./config.js";

document.addEventListener("DOMContentLoaded", async () => {
    const contenedor = document.getElementById("perfil-mascota");
    if (!contenedor) return;

    // 1. Obtener el ID de la URL (ej: mascota.html?id=123abc456)
    const urlParams = new URLSearchParams(window.location.search);
    const mascotaId = urlParams.get('id');

    if (!mascotaId) {
        contenedor.innerHTML = "<h2 style='text-align:center;'>No se encontró a la mascota.</h2> <p style='text-align:center;'><a href='adoptar.html'>Volver a ver todos</a></p>";
        return;
    }

    try {
        // 2. Buscar el documento en Firebase
        const docRef = doc(db, "mascotas", mascotaId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            const data = docSnap.data();
            
            // Reutilizamos tu lógica de etiquetas
            let tagsHtml = '<div style="display:flex; flex-wrap:wrap; gap:10px; justify-content:center; margin: 15px 0;">';
            if(data.etiquetas) {
                if(data.etiquetas.castrado) tagsHtml += '<span class="badge">Castrado</span>';
                if(data.etiquetas.vacunado) tagsHtml += '<span class="badge">Vacunado</span>';
                if(data.etiquetas.gatos) tagsHtml += '<span class="badge">Apto Gatos</span>';
                if(data.etiquetas.perros) tagsHtml += '<span class="badge">Apto Perros</span>';
                if(data.etiquetas.ninos) tagsHtml += '<span class="badge">Apto Niños</span>';
                if(data.etiquetas.disca) tagsHtml += '<span class="badge" style="background:#fff3e0; color:#e65100; border-color:#ffe0b2">Cuidados Esp.</span>';
            }
            tagsHtml += '</div>';

            // 3. Pintar en pantalla
            contenedor.innerHTML = `
                <div style="background: white; border-radius: 15px; padding: 30px; box-shadow: 0 4px 15px rgba(0,0,0,0.1); max-width: 800px; margin: 0 auto;">
                    <div style="text-align: center;">
                        <img src="${data.fotoUrl}" alt="Foto de ${data.nombre}" style="width: 100%; max-width: 500px; border-radius: 15px; object-fit: cover; box-shadow: 0 4px 10px rgba(0,0,0,0.1);">
                        
                        <h1 style="color: #f68c1f; font-size: 2.5rem; margin-top: 20px; text-transform: capitalize;">${data.nombre}</h1>
                        <p style="font-size: 1.1rem; color: #777;">A cargo de: <strong>${data.refugioNombre}</strong></p>
                        
                        ${tagsHtml}
                        
                        <div style="display: flex; justify-content: center; gap: 20px; flex-wrap: wrap; margin-bottom: 20px;">
                            <div style="background: #fff8e1; padding: 10px 20px; border-radius: 10px;"><strong>Sexo:</strong> ${data.sex || "Desconocido"}</div>
                            <div style="background: #fff8e1; padding: 10px 20px; border-radius: 10px;"><strong>Tamaño:</strong> ${data.size || "Desconocido"}</div>
                            <div style="background: #fff8e1; padding: 10px 20px; border-radius: 10px;"><strong>Ubicación:</strong> ${data.ubicacion || "Mendoza"}</div>
                        </div>

                        <p style="font-size: 1.1rem; line-height: 1.8; color: #444; padding: 0 20px;">${data.descripcion}</p>
                        
                        <div style="display:flex; gap:12px; justify-content:center; flex-wrap:wrap; margin-top:25px;">
                            <button class="btn-adoptar" style="font-size: 1.2rem; padding: 15px 40px;" onclick="abrirAdopcion('${mascotaId}', '${data.nombre}', '${data.refugioNombre}')">
                                <i class="fas fa-heart"></i> ¡Quiero Adoptar a ${data.nombre}!
                            </button>
                            <button type="button" id="btnCompartirMascota" style="font-size: 1.1rem; padding: 15px 25px; background:#4a2b17; color:white; border:none; border-radius:8px; cursor:pointer;">
                                <i class="fas fa-share-nodes"></i> Compartir
                            </button>
                        </div>
                    </div>
                </div>
                <div style="text-align:center; margin-top: 20px;">
                    <a href="adoptar.html" style="color: #f68c1f; text-decoration: underline;">← Volver a ver más animales</a>
                </div>
            `;

            // Conectamos el botón de compartir (evita problemas de comillas al no pasar
            // el texto dentro del HTML, sino directo desde el objeto "data")
            const btnCompartir = document.getElementById("btnCompartirMascota");
            if (btnCompartir && window.mostrarPoster) {
                btnCompartir.onclick = () => {
                    window.mostrarPoster(data.nombre, data.fotoUrl, data.refugioNombre, data.descripcion);
                };
            }
        } else {
            contenedor.innerHTML = "<h2 style='text-align:center;'>Lo sentimos, este peludito ya fue adoptado o no existe.</h2><p style='text-align:center;'><a href='adoptar.html'>Volver</a></p>";
        }
    } catch (error) {
        console.error("Error al cargar la mascota:", error);
        contenedor.innerHTML = "<h2 style='text-align:center;'>Hubo un error al cargar los datos.</h2>";
    }
});

// ==========================================
// LÓGICA DEL FORMULARIO Y "BOT" WHATSAPP
// ==========================================

window.abrirAdopcion = (id, nombre, refugio) => {
    const modal = document.getElementById("modalAdopcion");
    if(modal) {
        document.getElementById("modalPetId").value = id;
        document.getElementById("modalPetName").value = nombre;
        document.getElementById("modalPetShelter").value = refugio || "No especificado";
        modal.style.display = "flex";
    }
};

window.cerrarModal = () => {
    const modal = document.getElementById("modalAdopcion");
    if(modal) modal.style.display = "none";
};

const formAdopcion = document.getElementById("formAdopcion");
if(formAdopcion) {
    formAdopcion.onsubmit = async (e) => {
        e.preventDefault();
        const btn = formAdopcion.querySelector("button");
        const originalText = btn.innerHTML;
        btn.disabled = true; btn.textContent = "Procesando...";

        const nombre = document.getElementById("adoptanteNombre").value;
        const tel = document.getElementById("adoptanteTel").value;
        const dni = document.getElementById("adoptanteDNI").value;
        const rrss = document.getElementById("adoptanteRRSS").value || "No especificado";
        const ubicacion = document.getElementById("adoptanteUbicacion").value;
        const vivienda = document.getElementById("adoptanteVivienda").value;
        const otrasMascotas = document.getElementById("adoptanteOtrasMascotas").value;
        const mensaje = document.getElementById("adoptanteMensaje").value;
        const petName = document.getElementById("modalPetName").value;
        const petId = document.getElementById("modalPetId").value;
        const petShelter = document.getElementById("modalPetShelter").value;
        const confirmaAdopcion = document.getElementById("confirmaAdopcion").checked;
        const aceptaTerminos = document.getElementById("aceptaTerminos").checked;

        // Validaciones extra por las dudas (además del "required" de cada campo)
        if (!confirmaAdopcion || !aceptaTerminos) {
            alert("Tenés que confirmar que tu intención es adoptar y aceptar los Términos y Condiciones para continuar.");
            btn.disabled = false; btn.innerHTML = originalText;
            return;
        }

        try {
            await addDoc(collection(db, "solicitudes"), {
                mascota: petName,
                mascotaId: petId,
                refugio: petShelter,
                adoptante: nombre,
                telefono: tel,
                dni: dni,
                rrss: rrss,
                ubicacion: ubicacion,
                vivienda: vivienda,
                otrasMascotas: otrasMascotas,
                motivo: mensaje,
                fecha: serverTimestamp(),
                estado: "pendiente_revision",
                terminosAceptados: true
            });

            updateDoc(doc(db, "mascotas", petId), { clics: increment(1) }).catch(err => console.error(err));

            // Notificación por email al equipo de Huella Consciente
            try {
                await emailjs.send("service_sofyyxc", "template_8bbdulm", {
                    mascota: petName,
                    refugio: petShelter,
                    nombre: nombre,
                    telefono: tel,
                    dni: dni,
                    rrss: rrss,
                    ubicacion: ubicacion,
                    otras_mascotas: otrasMascotas,
                    mensaje: mensaje
                });
            } catch (emailError) {
                // Si el email falla, no bloqueamos la solicitud: ya quedó guardada en Firestore
                console.error("No se pudo enviar el email de notificación:", emailError);
            }

            alert("¡Gracias! Tu solicitud de adopción fue enviada. Nuestro equipo la revisará y, si corresponde, se pondrán en contacto con vos a la brevedad para conectarte con el refugio.");

            formAdopcion.reset();
            cerrarModal();

        } catch (error) {
            console.error("Error al procesar:", error);
            alert("Hubo un error al enviar tu solicitud. Por favor, intentá de nuevo en unos minutos.");
        } finally {
            btn.disabled = false; btn.innerHTML = originalText;
        }
    };
}