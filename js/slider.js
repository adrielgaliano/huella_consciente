let currentSlide = 0;
const slides = document.querySelectorAll(".hero-slider .slide");

function showSlide(index) {
  slides.forEach((slide, i) => {
    slide.classList.remove("active");
    if (i === index) slide.classList.add("active");
  });
}

function nextSlide() {
  currentSlide = (currentSlide + 1) % slides.length;
  showSlide(currentSlide);
}

setInterval(nextSlide, 5000);

document.addEventListener("DOMContentLoaded", () => {
  function initSlider(selector) {
    const slides = document.querySelectorAll(`${selector} .slide`);
    let current = 0;

    function showSlide(index) {
      slides.forEach((s, i) => s.classList.toggle("active", i === index));
    }

    function nextSlide() {
      current = (current + 1) % slides.length;
      showSlide(current);
    }

    if (slides.length > 0) {
      showSlide(current);
      setInterval(nextSlide, 3000);
    }
  }

  initSlider(".desktop-only");
  initSlider(".mobile-only");
});


// Duplica los ítems para hacer scroll infinito en Refugios
document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll(".refugios-track").forEach(track => {
    const items = Array.from(track.children);
    items.forEach(item => {
      const clone = item.cloneNode(true);
      track.appendChild(clone);
    });
  });
});
