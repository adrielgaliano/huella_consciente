import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-auth.js";
import { collection, addDoc, query, where, getDocs, deleteDoc, doc, updateDoc, serverTimestamp, getDoc, setDoc } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js";
import { auth, db } from "./config.js";

const IMGBB_API_KEY = "64c4afc1e0fdf4278714e100e512a0a2"; // <--- ⚠️ TU API KEY

let user = null;
let mascotasCache = {};

onAuthStateChanged(auth, (u) => {
    if (u) {
        user = u;
        document.getElementById("refugioEmailDisplay").textContent = u.email;
        document.getElementById("loadingMsg").style.display = "none";
        document.getElementById("adminPanel").style.display = "block";
        cargarMascotas(); 
        cargarListaNegra();
        cargarPerfil();
    } else { window.location.href = "login.html"; }
});

document.getElementById("btnLogout").onclick = () => signOut(auth).then(() => window.location.href = "login.html");

// --- FUNCIÓN SUBIR IMAGEN ---
async function subirImagen(file) {
    if (!file) return null;
    const formData = new FormData();
    formData.append("image", file);
    try {
        const res = await fetch(`https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`, { method: "POST", body: formData });
        const json = await res.json();
        return json.success ? json.data.url : null;
    } catch(e) { console.error("Error subida", e); return null; }
}

// --- GUARDAR / EDITAR ---
document.getElementById("addPetForm").onsubmit = async (e) => {
    e.preventDefault();
    const btn = document.getElementById("btnSubmit");
    btn.disabled = true; btn.textContent = "Procesando...";

    try {
        const editId = document.getElementById("editId").value;
        
        // 1. Manejo Fotos
        const f1 = document.getElementById("foto").files[0];
        const f2 = document.getElementById("foto2").files[0];
        let url1 = document.getElementById("existingFotoUrl").value;
        let url2 = document.getElementById("existingFotoUrl2").value;

        if(f1) url1 = await subirImagen(f1);
        if(f2) url2 = await subirImagen(f2);
        
        if(!editId && !url1) throw new Error("La foto principal es obligatoria");

        // 2. Etiquetas
        const etiquetas = {
            castrado: document.getElementById("tag_castrado").checked,
            vacunado: document.getElementById("tag_vacunado").checked,
            desparasitado: document.getElementById("tag_desparasitado").checked,
            gatos: document.getElementById("tag_gatos").checked,
            perros: document.getElementById("tag_perros").checked,
            ninos: document.getElementById("tag_ninos").checked,
            disca: document.getElementById("tag_disca").checked,
            transito: document.getElementById("tag_transito").checked
        };

        const data = {
            nombre: document.getElementById("nombre").value,
            refugioNombre: document.getElementById("refugioSelector").value,
            contacto: document.getElementById("telefonoWsp").value,
            animal: document.getElementById("tipo").value,
            metodoEdad: document.getElementById("metodoEdad").value,
            fechaNacimiento: document.getElementById("fecha").value,
            edadCategoria: document.getElementById("edadCategoria").value,
            sex: document.getElementById("sexo").value,
            size: document.getElementById("tamano").value,
            ubicacion: document.getElementById("ubicacion").value,
            descripcion: document.getElementById("desc").value,
            
            fotoUrl: url1, // Principal para compatibilidad
            fotoUrl2: url2 || "",
            etiquetas: etiquetas,
            uploadedBy: user.uid,
            actualizadoEn: serverTimestamp() // Siempre se actualiza
        };

        // Limpiar undefined
        Object.keys(data).forEach(k => data[k] === undefined && delete data[k]);

        if (editId) {
            await updateDoc(doc(db, "mascotas", editId), data);
            alert("¡Actualizado!");
            cancelarEdicion();
        } else {
            data.creadoEn = serverTimestamp();
            data.clics = 0;
            data.estado = "disponible";
            await addDoc(collection(db, "mascotas"), data);
            alert("¡Publicado!");
            document.getElementById("addPetForm").reset();
            if(window.toggleEdadInput) window.toggleEdadInput();
        }
        cargarMascotas();

    } catch (err) { alert("Error: " + err.message); } 
    finally { btn.disabled = false; btn.textContent = document.getElementById("editId").value ? "GUARDAR" : "PUBLICAR"; }
};

// --- CARGAR LISTA CON ESTADÍSTICAS ---
// ... imports y setup anterior ...

async function cargarMascotas() {
    const listA = document.getElementById("petsList");
    const listB = document.getElementById("adoptedList");
    const q = query(collection(db, "mascotas"), where("uploadedBy", "==", user.uid));
    
    const snap = await getDocs(q);
    listA.innerHTML = ""; listB.innerHTML = "";

    snap.forEach(d => {
        const data = d.data();
        mascotasCache[d.id] = data;

        // Ignoramos los eliminados (para que no salgan en ninguna lista del admin, salvo que quieras verlos)
        if (data.estado === "eliminado") return;

        const esAdoptado = data.estado === "adoptado";
        const esTransito = data.estado === "en_transito";
        
        // Fechas y Clics
        const fechaSubida = data.creadoEn ? new Date(data.creadoEn.seconds*1000).toLocaleDateString() : "-";
        const clics = data.clics || 0;

        // Días esperando (solo tiene sentido si sigue disponible/en tránsito)
        let alertaEspera = "";
        if (!esAdoptado && data.creadoEn) {
            const diasEsperando = Math.floor((Date.now() - data.creadoEn.seconds * 1000) / (1000 * 60 * 60 * 24));
            if (diasEsperando >= 30) {
                alertaEspera = `<div class="waiting-alert">⏳ Hace ${diasEsperando} días esperando familia</div>`;
            }
        }

        // Definimos el color del estado
        let estadoLabel = esAdoptado ? '🏠 Adoptado' : (esTransito ? '🚚 En Tránsito' : '🟢 Disponible');

        const html = `
            <div class="pet-card-admin ${esAdoptado ? 'adoptado-card' : ''}" style="${esTransito ? 'border-color:#ff9800; background:#fff3e0;' : ''}">
                <div class="stats-bar">
                    <span>👆 <b>${clics}</b> Clics</span>
                    <span>${estadoLabel}</span>
                </div>
                <img src="${data.fotoUrl}">
                <h3>${data.nombre}</h3>
                
                <span class="date-info">Subido: ${fechaSubida}</span>
                ${alertaEspera}

                <div class="card-actions">
                    <button style="background:#2196F3" onclick="editar('${d.id}')">✏️ Editar</button>
                    <button style="background:#4a2b17" onclick="compartirDesdeAdmin('${d.id}')">📸 Compartir</button>
                    
                    ${!esAdoptado && !esTransito ? `
                        <button style="background:#4CAF50" onclick="cambiarEstado('${d.id}', 'adoptado')">✅ Ya se adoptó</button>
                        <button style="background:#FF9800" onclick="cambiarEstado('${d.id}', 'en_transito')">🚚 Poner en Tránsito</button>
                    ` : `
                        <button style="background:#777" onclick="cambiarEstado('${d.id}', 'disponible')">↩️ Volver a Disponible</button>
                    `}
                    
                    <button style="background:#d32f2f" onclick="borrar('${d.id}')">🗑️ Eliminar</button>
                </div>
            </div>`;

        // Si es adoptado va a la lista de abajo, si es tránsito o disponible queda arriba
        if(esAdoptado) listB.innerHTML += html; else listA.innerHTML += html;
    });

    calcularYMostrarEstadisticas();
}

// --- GLOBALES ---
window.editar = async (id) => {
    window.scrollTo({top:0, behavior:'smooth'});
    document.getElementById("formTitle").textContent = "✏️ Editando";
    document.getElementById("btnSubmit").textContent = "GUARDAR";
    document.getElementById("btnCancelEdit").style.display = "block";

    const snap = await getDoc(doc(db, "mascotas", id));
    const d = snap.data();
    
    document.getElementById("editId").value = id;
    document.getElementById("nombre").value = d.nombre;
    document.getElementById("refugioSelector").value = d.refugioNombre;
    document.getElementById("telefonoWsp").value = d.contacto;
    document.getElementById("tipo").value = d.animal;
    document.getElementById("sexo").value = d.sex;
    document.getElementById("tamano").value = d.size;
    document.getElementById("ubicacion").value = d.ubicacion;
    document.getElementById("desc").value = d.descripcion;
    
    // Fotos
    document.getElementById("existingFotoUrl").value = d.fotoUrl || "";
    document.getElementById("existingFotoUrl2").value = d.fotoUrl2 || "";
    document.getElementById("fotoHelp").style.display = "block";

    // Edad
    document.getElementById("metodoEdad").value = d.metodoEdad || "fecha";
    document.getElementById("fecha").value = d.fechaNacimiento || "";
    document.getElementById("edadCategoria").value = d.edadCategoria || "Adulto";
    if(window.toggleEdadInput) window.toggleEdadInput();

    // Etiquetas (Checkboxes)
    if(d.etiquetas) {
        document.getElementById("tag_castrado").checked = d.etiquetas.castrado;
        document.getElementById("tag_vacunado").checked = d.etiquetas.vacunado;
        document.getElementById("tag_desparasitado").checked = d.etiquetas.desparasitado;
        document.getElementById("tag_gatos").checked = d.etiquetas.gatos;
        document.getElementById("tag_perros").checked = d.etiquetas.perros;
        document.getElementById("tag_ninos").checked = d.etiquetas.ninos;
        document.getElementById("tag_disca").checked = d.etiquetas.disca;
    }
};

window.compartirDesdeAdmin = (id) => {
    const data = mascotasCache[id];
    if (!data) { alert("No se encontró la info de la mascota."); return; }
    if (!window.mostrarPoster) { alert("No se pudo cargar el generador de stories."); return; }
    window.mostrarPoster(data.nombre, data.fotoUrl, data.refugioNombre, data.descripcion);
};
    document.getElementById("addPetForm").reset();
    document.getElementById("editId").value = "";
    document.getElementById("existingFotoUrl").value = "";
    document.getElementById("existingFotoUrl2").value = "";
    document.getElementById("btnSubmit").textContent = "PUBLICAR";
    document.getElementById("btnCancelEdit").style.display = "none";
    document.getElementById("fotoHelp").style.display = "none";

    // Resetear checkboxes manual si quieres, reset() debería hacerlo.;

window.cambiarEstado = async (id, estado) => {
    if(confirm(`¿Cambiar estado a ${estado}?`)) {
        await updateDoc(doc(db, "mascotas", id), { estado: estado });
        cargarMascotas();
    }
};


window.marcarDisponible = async (id) => {
    if(confirm("¿Volver a poner en adopción?")) {
        await updateDoc(doc(db, "mascotas", id), { estado: "disponible" });
        cargarMascotas();
    }
};

window.borrar = async (id) => {
    if(confirm("¿Desea eliminar definitivamente? Una vez eliminado no se podra recuperar.")) {
        try {
            // "Borrado Lógico": Solo cambiamos el estado a 'eliminado'
            await updateDoc(doc(db, "mascotas", id), { 
                estado: "eliminado",
                fechaEliminacion: serverTimestamp()
            });
            cargarMascotas(); // Recargar lista para que desaparezca
        } catch (e) {
            console.error(e);
            alert("Error al eliminar");
        }
    }
};

// ==========================================
// LISTA NEGRA (compartida entre todos los refugios)
// ==========================================
let listaNegraCache = [];

async function cargarListaNegra() {
    const cont = document.getElementById("listaNegraContainer");
    if (!cont) return;
    cont.innerHTML = "<p style='color:#888;'>Cargando...</p>";

    try {
        const snap = await getDocs(collection(db, "lista_negra"));
        const entradas = [];
        snap.forEach(d => entradas.push({ id: d.id, ...d.data() }));

        // Más recientes primero
        entradas.sort((a, b) => (b.fecha?.seconds || 0) - (a.fecha?.seconds || 0));
        listaNegraCache = entradas;
        renderizarListaNegra(entradas);

    } catch (err) {
        console.error(err);
        cont.innerHTML = "<p style='color:#b71c1c;'>No se pudo cargar la lista (revisá las reglas de Firestore).</p>";
    }
}

function renderizarListaNegra(entradas) {
    const cont = document.getElementById("listaNegraContainer");
    if (!cont) return;

    if (entradas.length === 0) {
        cont.innerHTML = "<p style='color:#888;'>No se encontraron resultados.</p>";
        return;
    }

    cont.innerHTML = entradas.map(e => {
        const fecha = e.fecha ? new Date(e.fecha.seconds * 1000).toLocaleDateString() : "-";
        const puedeBorrar = e.creadoPor === user.uid;
        return `
            <div class="blacklist-entry">
                <h4>🚫 ${e.nombreCompleto}${e.dni ? " — DNI " + e.dni : ""}</h4>
                ${e.telefono ? `<div>📞 ${e.telefono}</div>` : ""}
                <div><strong>Motivo:</strong> ${e.motivo}</div>
                <div class="meta">Reportado por <strong>${e.reportadoPor}</strong> el ${fecha}
                    ${puedeBorrar ? `— <a href="#" onclick="borrarDeListaNegra('${e.id}'); return false;" style="color:#b71c1c;">eliminar</a>` : ""}
                </div>
            </div>`;
    }).join("");
}

document.getElementById("ln_buscador")?.addEventListener("input", (e) => {
    const term = e.target.value.toLowerCase().trim();
    if (!term) { renderizarListaNegra(listaNegraCache); return; }

    const filtradas = listaNegraCache.filter(entry => {
        const nombre = (entry.nombreCompleto || "").toLowerCase();
        const dni = (entry.dni || "").toLowerCase();
        const telefono = (entry.telefono || "").toLowerCase();
        return nombre.includes(term) || dni.includes(term) || telefono.includes(term);
    });
    renderizarListaNegra(filtradas);
});

document.getElementById("formListaNegra")?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const btn = document.getElementById("btnSubmitLista");
    btn.disabled = true; btn.textContent = "Guardando...";

    try {
        await addDoc(collection(db, "lista_negra"), {
            nombreCompleto: document.getElementById("ln_nombre").value,
            dni: document.getElementById("ln_dni").value || "",
            telefono: document.getElementById("ln_telefono").value || "",
            motivo: document.getElementById("ln_motivo").value,
            reportadoPor: document.getElementById("ln_reportadoPor").value,
            creadoPor: user.uid,
            fecha: serverTimestamp()
        });
        document.getElementById("formListaNegra").reset();
        cargarListaNegra();
    } catch (err) {
        console.error(err);
        alert("Error al guardar: " + err.message);
    } finally {
        btn.disabled = false; btn.textContent = "AGREGAR A LA LISTA";
    }
});

window.borrarDeListaNegra = async (id) => {
    if (confirm("¿Eliminar esta entrada de la lista negra?")) {
        await deleteDoc(doc(db, "lista_negra", id));
        cargarListaNegra();
    }
};

// ==========================================
// PERFIL DEL REFUGIO
// ==========================================
async function cargarPerfil() {
    try {
        const snap = await getDoc(doc(db, "perfiles_refugio", user.uid));
        if (snap.exists()) {
            const d = snap.data();
            document.getElementById("pf_refugioNombre").value = d.refugioNombre || "";
            document.getElementById("pf_horario").value = d.horario || "";
            document.getElementById("pf_instagram").value = d.instagram || "";
            document.getElementById("pf_facebook").value = d.facebook || "";
            document.getElementById("pf_whatsappPublico").value = d.whatsappPublico || "";
            document.getElementById("pf_bio").value = d.bio || "";
            if (d.logoUrl) document.getElementById("pf_logoHelp").style.display = "block";
        }
    } catch (err) {
        console.error("Error cargando perfil:", err);
    }
}

document.getElementById("formPerfil")?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const btn = document.getElementById("btnSubmitPerfil");
    btn.disabled = true; btn.textContent = "Guardando...";

    try {
        // Traemos el logo actual (si había) para no perderlo si no suben uno nuevo
        const snapActual = await getDoc(doc(db, "perfiles_refugio", user.uid));
        let logoUrl = snapActual.exists() ? (snapActual.data().logoUrl || "") : "";

        const fileLogo = document.getElementById("pf_logo").files[0];
        if (fileLogo) {
            const nuevaUrl = await subirImagen(fileLogo);
            if (nuevaUrl) logoUrl = nuevaUrl;
        }

        await setDoc(doc(db, "perfiles_refugio", user.uid), {
            refugioNombre: document.getElementById("pf_refugioNombre").value,
            horario: document.getElementById("pf_horario").value,
            instagram: document.getElementById("pf_instagram").value,
            facebook: document.getElementById("pf_facebook").value,
            whatsappPublico: document.getElementById("pf_whatsappPublico").value,
            bio: document.getElementById("pf_bio").value,
            logoUrl: logoUrl,
            actualizadoPor: user.uid,
            actualizadoEn: serverTimestamp()
        }, { merge: true });

        alert("¡Perfil guardado!");
        document.getElementById("pf_logoHelp").style.display = "block";

    } catch (err) {
        console.error(err);
        alert("Error al guardar el perfil: " + err.message);
    } finally {
        btn.disabled = false; btn.textContent = "GUARDAR PERFIL";
    }
});

// ==========================================
// ESTADÍSTICAS
// ==========================================
function calcularYMostrarEstadisticas() {
    const cont = document.getElementById("statsContainer");
    if (!cont) return;

    const todas = Object.values(mascotasCache).filter(d => d.estado !== "eliminado");
    const disponibles = todas.filter(d => d.estado !== "adoptado");
    const adoptadas = todas.filter(d => d.estado === "adoptado");
    const totalClics = todas.reduce((sum, d) => sum + (d.clics || 0), 0);

    const esperando30 = disponibles.filter(d => {
        if (!d.creadoEn) return false;
        const dias = (Date.now() - d.creadoEn.seconds * 1000) / (1000 * 60 * 60 * 24);
        return dias >= 30;
    }).length;

    cont.innerHTML = `
        <div class="stat-card">
            <div class="stat-num">${todas.length}</div>
            <div class="stat-label">Mascotas publicadas (total)</div>
        </div>
        <div class="stat-card" style="border-top-color:#4CAF50;">
            <div class="stat-num">${disponibles.length}</div>
            <div class="stat-label">Disponibles ahora</div>
        </div>
        <div class="stat-card" style="border-top-color:#2196F3;">
            <div class="stat-num">${adoptadas.length}</div>
            <div class="stat-label">Ya adoptadas 🏠</div>
        </div>
        <div class="stat-card" style="border-top-color:#9c27b0;">
            <div class="stat-num">${totalClics}</div>
            <div class="stat-label">Clics acumulados</div>
        </div>
        <div class="stat-card" style="border-top-color:#d32f2f;">
            <div class="stat-num">${esperando30}</div>
            <div class="stat-label">Esperando hace 30+ días</div>
        </div>
    `;
}