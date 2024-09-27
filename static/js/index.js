document.addEventListener("DOMContentLoaded", function () {
    // Get the button
    let upButton = document.getElementById("up-button");

    // When the user scrolls down 200px from the top of the document, show the button
    window.onscroll = function () { scrollFunction(); };

    function scrollFunction() {
        if (document.body.scrollTop > 200 || document.documentElement.scrollTop > 200) {
            upButton.style.display = "block";
        } else {
            upButton.style.display = "none";
        }
    }

    // When the user clicks on the button, scroll to the top of the document
    upButton.addEventListener("click", function (event) {
        event.preventDefault();
        document.body.scrollTop = 0; // For Safari
        document.documentElement.scrollTop = 0; // For Chrome, Firefox, IE, and Opera
    });

    // Get the carousel element
    const carousel = document.querySelector('#id_carousel');

    // Get the next and prev control icons only
    const prevIcon = document.querySelector('.carousel-control-prev-icon');
    const nextIcon = document.querySelector('.carousel-control-next-icon');

    // Function to move the carousel to the next slide
    function nextSlide() {
        const bsCarousel = bootstrap.Carousel.getInstance(carousel);
        bsCarousel.next();
    }

    // Function to move the carousel to the previous slide
    function prevSlide() {
        const bsCarousel = bootstrap.Carousel.getInstance(carousel);
        bsCarousel.prev();
    }

    // Add hover events for next and prev icons (not the whole control area)
    nextIcon.addEventListener('mouseenter', nextSlide);
    prevIcon.addEventListener('mouseenter', prevSlide);
});
