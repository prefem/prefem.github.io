import { loadLayout } from '/script/layout.js';

document.addEventListener('DOMContentLoaded', async () => {
  await loadLayout(); 

  const stats = [
    '135 Femicide Cases Recorded in 2024',
    '14 Femicide Cases Recorded in January',
    '11 Femicide Cases Recorded in February'
  ];

  const statsText = document.getElementById('stats-text');
  let currentStat = 0;

  if (statsText) {
    setInterval(() => {
      // Fade out
      statsText.style.opacity = 0;

      setTimeout(() => {
        currentStat = (currentStat + 1) % stats.length;
        statsText.textContent = stats[currentStat];
  
        statsText.style.opacity = 1;
      }, 1000); 
    }, 5000);
  }

  let currentIndex = 0;
  const slides = document.querySelector(".slides");
  const slideItems = document.querySelectorAll(".slide");
  const dots = document.querySelectorAll(".dot");

  if (!slides || slideItems.length === 0) return;

  function showSlide(index) {
    if (index < 0) index = slideItems.length - 1;
    if (index >= slideItems.length) index = 0;

    slides.style.transform = `translateX(${-index * 100}%)`;

    dots.forEach((dot, i) => {
      dot.classList.toggle("active", i === index);
    });

    slideItems.forEach((slide, i) => {
      slide.setAttribute("aria-hidden", i !== index);
    });

    currentIndex = index;
  }

  let autoSlideInterval = setInterval(() => showSlide(currentIndex + 1), 5000);

  const sliderContainer = document.querySelector(".hero-slider");
  if (sliderContainer) {
    sliderContainer.addEventListener("mouseenter", () => clearInterval(autoSlideInterval));
    sliderContainer.addEventListener("mouseleave", () => {
      autoSlideInterval = setInterval(() => showSlide(currentIndex + 1), 5000);
    });

    // Touch gestures
    let touchStartX = 0;
    let touchEndX = 0;

    sliderContainer.addEventListener("touchstart", (e) => {
      touchStartX = e.touches[0].clientX;
    });

    sliderContainer.addEventListener("touchmove", (e) => {
      touchEndX = e.touches[0].clientX;
    });

    sliderContainer.addEventListener("touchend", () => {
      const diff = touchStartX - touchEndX;
      if (diff > 50) showSlide(currentIndex + 1); // swipe left
      else if (diff < -50) showSlide(currentIndex - 1); // swipe right
    });
  }

  // Dot navigation
  dots.forEach((dot, i) => {
    dot.addEventListener("click", () => showSlide(i));
  });

  // Init first slide
  showSlide(currentIndex);
});
