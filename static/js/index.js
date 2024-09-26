        // Get the button
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

        // When the user clicks on the button, scroll to the top of the document
        upButton.addEventListener("click", function (event) {
            event.preventDefault();
            document.body.scrollTop = 0; // For Safari
            document.documentElement.scrollTop = 0; // For Chrome, Firefox, IE, and Opera
        });