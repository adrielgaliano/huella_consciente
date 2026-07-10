import { collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js";
import { db } from "./config.js";

// Abrir / cerrar modal
window.abrirReporte = () => {
    const modal = document.getElementById("modalReporte");
    if (modal) modal.style.display = "flex";
};

window.cerrarReporte = () => {
    const modal = document.getElementById("modalReporte");
    if (modal) modal.style.display = "none";
};

const formReporte = document.getElementById("formReporte");
if (formReporte) {
    formReporte.onsubmit = async (e) => {
        e.preventDefault();
        const btn = formReporte.querySelector("button[type='submit']");
        const originalText = btn.innerHTML;
        btn.disabled = true;
        btn.textContent = "Enviando...";

        const refugio = document.getElementById("reporteRefugio").value;
        const detalle = document.getElementById("reporteDetalle").value;
        const contacto = document.getElementById("reporteContacto").value;

        try {
            await addDoc(collection(db, "reportes"), {
                refugio: refugio,
                detalle: detalle,
                contactoReportante: contacto || "No proporcionado",
                fecha: serverTimestamp(),
                estado: "pendiente" // pendiente | revisado | resuelto
            });

            alert("Gracias, recibimos tu reporte. Lo vamos a revisar a la brevedad.");
            formReporte.reset();
            cerrarReporte();

        } catch (error) {
            console.error("Error al enviar el reporte:", error);
            alert("Hubo un error al enviar el reporte. Por favor, intentá de nuevo o escribinos por email.");
        } finally {
            btn.disabled = false;
            btn.innerHTML = originalText;
        }
    };
}
