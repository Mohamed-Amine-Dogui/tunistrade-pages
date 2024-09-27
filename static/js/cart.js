document.addEventListener('DOMContentLoaded', function () {
    // -----------------------------------------------
    // 1. Scroll-to-Top Button
    // -----------------------------------------------

    // Get the button for scrolling to top
    let upButton = document.getElementById("up-button");

    // When the user scrolls down 200px from the top of the document, show the button
    window.onscroll = function () { scrollFunction() };

    function scrollFunction() {
        if (document.body.scrollTop > 200 || document.documentElement.scrollTop > 200) {
            upButton.style.display = "block";
        } else {
            upButton.style.display = "none";
        }
    }

    // Scroll to top when button is clicked
    upButton.addEventListener("click", function (event) {
        event.preventDefault();
        document.body.scrollTop = 0;
        document.documentElement.scrollTop = 0;
    });
});
   