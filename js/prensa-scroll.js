// js/prensa-scroll.js
// Controla las flechas de scroll horizontal de la sección "Lo que dice la prensa" en mobile

document.addEventListener("DOMContentLoaded", () => {
    const track = document.getElementById("prensaScroll");
    const btnPrev = document.getElementById("prensaPrev");
    const btnNext = document.getElementById("prensaNext");
    if (!track || !btnPrev || !btnNext) return;

    const scrollByCard = (direction) => {
        const card = track.querySelector(".prensa-card");
        const gap = 18;
        const distancia = card ? card.offsetWidth + gap : 250;
        track.scrollBy({ left: distancia * direction, behavior: "smooth" });
    };

    btnPrev.addEventListener("click", () => scrollByCard(-1));
    btnNext.addEventListener("click", () => scrollByCard(1));
});
