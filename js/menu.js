function openNav() {
  document.getElementById("myNav").style.width = "100%";
}

function closeNav() {
  document.getElementById("myNav").style.width = "0";
}

// Marca el link del nav (y del menú overlay) que corresponde a la página actual
document.addEventListener("DOMContentLoaded", () => {
  const paginaActual = window.location.pathname.split("/").pop() || "index.html";
  document.querySelectorAll("nav a, .overlay a").forEach(link => {
    const href = link.getAttribute("href");
    if (href === paginaActual) {
      link.classList.add("active");
    }
  });
});