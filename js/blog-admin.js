// js/blog-admin.js
// Panel de administración del Blog — totalmente separado del panel de refugios (admin.html).
// Solo pueden publicar las cuentas que tengan un documento en la colección "blog_admins".

import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-auth.js";
import {
    collection, addDoc, getDocs, doc, updateDoc,
    serverTimestamp, getDoc
} from "https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js";
import { auth, db } from "./config.js";

const IMGBB_API_KEY = "64c4afc1e0fdf4278714e100e512a0a2";

let blogUser = null;
let blogsCache = {};

onAuthStateChanged(auth, async (u) => {
    if (!u) {
        window.location.href = "login-blog.html";
        return;
    }

    // Verificamos que la cuenta tenga permiso de blog (doc en blog_admins/{uid})
    try {
        const permSnap = await getDoc(doc(db, "blog_admins", u.uid));
        if (!permSnap.exists()) {
            document.getElementById("loadingMsg").style.display = "none";
            document.getElementById("accessDenied").style.display = "block";
            return;
        }
    } catch (err) {
        console.error("Error verificando permisos de blog:", err);
        document.getElementById("loadingMsg").style.display = "none";
        document.getElementById("accessDenied").style.display = "block";
        return;
    }

    blogUser = u;
    document.getElementById("userEmailDisplay").textContent = u.email;
    document.getElementById("loadingMsg").style.display = "none";
    document.getElementById("blogAdminPanel").style.display = "block";
    cargarBlogs();
});

document.getElementById("btnLogout")?.addEventListener("click", () => signOut(auth).then(() => window.location.href = "login-blog.html"));
document.getElementById("btnLogoutDenied")?.addEventListener("click", () => signOut(auth).then(() => window.location.href = "login-blog.html"));

// --- SUBIR IMAGEN (mismo servicio que usan las mascotas) ---
async function subirImagenBlog(file) {
    if (!file) return null;
    const formData = new FormData();
    formData.append("image", file);
    try {
        const res = await fetch(`https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`, { method: "POST", body: formData });
        const json = await res.json();
        return json.success ? json.data.url : null;
    } catch (e) { console.error("Error subida imagen blog", e); return null; }
}

// --- GUARDAR / EDITAR ARTÍCULO ---
document.getElementById("addBlogForm")?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const btn = document.getElementById("btnSubmitBlog");
    btn.disabled = true; btn.textContent = "Procesando...";

    try {
        const editId = document.getElementById("blog_editId").value;

        const file = document.getElementById("blog_imagen").files[0];
        let imagenUrl = document.getElementById("blog_existingImagenUrl").value;
        if (file) imagenUrl = await subirImagenBlog(file);

        if (!editId && !imagenUrl) throw new Error("La imagen de portada es obligatoria");

        const data = {
            titulo: document.getElementById("blog_titulo").value,
            categoria: document.getElementById("blog_categoria").value,
            resumen: document.getElementById("blog_resumen").value,
            contenido: document.getElementById("blog_contenido").value,
            autor: document.getElementById("blog_autor").value || "Equipo Huella Consciente",
            imagenUrl: imagenUrl,
            actualizadoEn: serverTimestamp()
        };

        if (editId) {
            await updateDoc(doc(db, "blogs", editId), data);
            alert("¡Artículo actualizado!");
            cancelarEdicionBlog();
        } else {
            data.creadoEn = serverTimestamp();
            data.estado = "publicado";
            data.autorUid = blogUser.uid;
            data.clics = 0;
            await addDoc(collection(db, "blogs"), data);
            alert("¡Artículo publicado!");
            document.getElementById("addBlogForm").reset();
            document.getElementById("blog_existingImagenUrl").value = "";
        }
        cargarBlogs();

    } catch (err) {
        alert("Error: " + err.message);
    } finally {
        btn.disabled = false;
        btn.textContent = document.getElementById("blog_editId").value ? "GUARDAR CAMBIOS" : "PUBLICAR ARTÍCULO";
    }
});

// --- CARGAR LISTA DE ARTÍCULOS ---
async function cargarBlogs() {
    const cont = document.getElementById("blogsList");
    if (!cont) return;
    cont.innerHTML = "<p style='color:#888;'>Cargando artículos...</p>";

    try {
        const snap = await getDocs(collection(db, "blogs"));
        const posts = [];
        snap.forEach(d => {
            const data = d.data();
            if (data.estado === "eliminado") return;
            blogsCache[d.id] = data;
            posts.push({ id: d.id, ...data });
        });

        posts.sort((a, b) => (b.creadoEn?.seconds || 0) - (a.creadoEn?.seconds || 0));

        if (posts.length === 0) {
            cont.innerHTML = "<p style='color:#888;'>Todavía no hay artículos publicados.</p>";
            return;
        }

        cont.innerHTML = posts.map(p => {
            const fecha = p.creadoEn ? new Date(p.creadoEn.seconds * 1000).toLocaleDateString() : "-";
            return `
                <div class="pet-card-admin">
                    <img src="${p.imagenUrl}">
                    <span class="date-info" style="text-transform:capitalize;">${p.categoria}</span>
                    <h3>${p.titulo}</h3>
                    <span class="date-info">Publicado: ${fecha} — ✍️ ${p.autor || "-"}</span>
                    <div class="card-actions">
                        <button style="background:#2196F3" onclick="editarBlog('${p.id}')">✏️ Editar</button>
                        <a href="articulo.html?id=${p.id}" target="_blank" style="display:block; text-align:center; text-decoration:none; background:#4a2b17;">👁️ Ver artículo</a>
                        <button style="background:#d32f2f" onclick="borrarBlog('${p.id}')">🗑️ Eliminar</button>
                    </div>
                </div>`;
        }).join("");

    } catch (err) {
        console.error(err);
        cont.innerHTML = "<p style='color:#b71c1c;'>No se pudieron cargar los artículos.</p>";
    }
}

// --- GLOBALES (usadas desde los botones inline del HTML) ---
window.editarBlog = async (id) => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    window.cambiarTab("tab-blogs-agregar");

    document.getElementById("blogFormTitle").textContent = "✏️ Editando Artículo";
    document.getElementById("btnSubmitBlog").textContent = "GUARDAR CAMBIOS";
    document.getElementById("btnCancelBlogEdit").style.display = "block";

    const snap = await getDoc(doc(db, "blogs", id));
    const d = snap.data();

    document.getElementById("blog_editId").value = id;
    document.getElementById("blog_titulo").value = d.titulo || "";
    document.getElementById("blog_categoria").value = d.categoria || "cuidados";
    document.getElementById("blog_resumen").value = d.resumen || "";
    document.getElementById("blog_contenido").value = d.contenido || "";
    document.getElementById("blog_autor").value = d.autor || "";
    document.getElementById("blog_existingImagenUrl").value = d.imagenUrl || "";
    document.getElementById("blog_imagenHelp").style.display = "block";
};

window.cancelarEdicionBlog = function cancelarEdicionBlog() {
    document.getElementById("addBlogForm").reset();
    document.getElementById("blog_editId").value = "";
    document.getElementById("blog_existingImagenUrl").value = "";
    document.getElementById("blogFormTitle").textContent = "➕ Nuevo Artículo";
    document.getElementById("btnSubmitBlog").textContent = "PUBLICAR ARTÍCULO";
    document.getElementById("btnCancelBlogEdit").style.display = "none";
    document.getElementById("blog_imagenHelp").style.display = "none";
};

document.getElementById("btnCancelBlogEdit")?.addEventListener("click", () => window.cancelarEdicionBlog());

window.borrarBlog = async (id) => {
    if (confirm("¿Eliminar definitivamente este artículo? No se podrá recuperar.")) {
        try {
            await updateDoc(doc(db, "blogs", id), { estado: "eliminado", fechaEliminacion: serverTimestamp() });
            cargarBlogs();
        } catch (e) {
            console.error(e);
            alert("Error al eliminar");
        }
    }
};
