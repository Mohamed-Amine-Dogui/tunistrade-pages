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

    // -----------------------------------------------
    // 2. Product Filtering
    // -----------------------------------------------

    // Select all filter links
    const filterLinks = document.querySelectorAll('.filter-link');

    // Select all product cards
    const productCards = document.querySelectorAll('.card');

    // Function to filter products
    function filterProducts(category) {
        productCards.forEach(function (card) {
            const cardCategory = card.getAttribute('data-category');

            if (category === 'alle') {
                // Show all products
                card.parentElement.style.display = 'block';
            } else {
                if (cardCategory === category) {
                    card.parentElement.style.display = 'block';
                } else {
                    card.parentElement.style.display = 'none';
                }
            }
        });
    }

    // Add click event listener to each filter link
    filterLinks.forEach(function (link) {
        link.addEventListener('click', function (e) {
            e.preventDefault(); // Prevent default link behavior

            // Remove active class from all links
            filterLinks.forEach(function (lnk) {
                lnk.classList.remove('active');
            });

            // Add active class to clicked link
            this.classList.add('active');

            // Get category from data-category attribute
            const category = this.getAttribute('data-category');

            // Call the filter function
            filterProducts(category);
        });
    });

    // Show all products by default and set 'All Products' link as active
    const allLink = document.querySelector('[data-category="alle"]');
    if (allLink) {
        allLink.classList.add('active');
        filterProducts('alle');
    }

    // -----------------------------------------------
    // 3. Cart Management (Increase, Decrease, and Input Value)
    // -----------------------------------------------

    // Select all decrease and increase buttons
    const decreaseButtons = document.querySelectorAll('.btn-decrease');
    const increaseButtons = document.querySelectorAll('.btn-increase');

    // Select all input fields for count
    const countInputs = document.querySelectorAll('.btn-count');

    // Initialize the cart from localStorage or create an empty object
    let cart = JSON.parse(localStorage.getItem('cart')) || {};

    // Function to update the display of the count input
    function updateDisplay(input, count) {
        input.value = count;
    }

    // Function to save the cart to localStorage
    function saveCart() {
        localStorage.setItem('cart', JSON.stringify(cart));
    }

    // Function to update the cart button display
    function updateCartButton() {
        let totalItems = 0;
        for (let product in cart) {
            let quantity = parseInt(cart[product]);
            if (!isNaN(quantity)) {
                totalItems += quantity;
            }
        }
        const cartButton = document.getElementById('cart_button');
        if (cartButton) {
            const cartCountSpan = cartButton.querySelector('span');
            if (cartCountSpan) {
                cartCountSpan.textContent = `(${totalItems})`;
            }
        }
    }

    // Add event listener for decrease buttons
    decreaseButtons.forEach(function (button) {
        button.addEventListener('click', function (e) {
            e.stopPropagation(); // Prevent modal from opening on button click
            const card = this.closest('.card');
            const productName = card.querySelector('.card-title').textContent;
            const countInput = card.querySelector('.btn-count');

            let count = parseInt(countInput.value) || 0;

            if (count > 0) {
                count--;
                updateDisplay(countInput, count);

                if (count > 0) {
                    cart[productName] = count;
                } else {
                    delete cart[productName];
                }

                saveCart();
                updateCartButton(); // Update cart button display
            }
        });
    });

    // Add event listener for increase buttons
    increaseButtons.forEach(function (button) {
        button.addEventListener('click', function (e) {
            e.stopPropagation(); // Prevent modal from opening on button click
            const card = this.closest('.card');
            const productName = card.querySelector('.card-title').textContent;
            const countInput = card.querySelector('.btn-count');

            let count = parseInt(countInput.value) || 0;

            // Ensure the count does not exceed the max value
            if (count < 999) {
                count++;
                updateDisplay(countInput, count);

                cart[productName] = count;
                saveCart();
                updateCartButton(); // Update cart button display
            }
        });
    });

    // Add event listener for manual input changes
    countInputs.forEach(function (input) {
        input.addEventListener('input', function () {
            const card = this.closest('.card');
            const productName = card.querySelector('.card-title').textContent;

            let count = parseInt(this.value);

            // Prevent negative numbers and limit to max 999
            if (isNaN(count) || count < 0) {
                count = 0;
            } else if (count > 999) {
                count = 999;
            }

            updateDisplay(this, count);

            if (count > 0) {
                cart[productName] = count;
            } else {
                delete cart[productName];
            }

            saveCart();
            updateCartButton(); // Update cart button display
        });
    });

    // Initialize the display based on the saved cart
    Object.keys(cart).forEach(function (product) {
        const card = [...productCards].find(card => card.querySelector('.card-title').textContent === product);
        if (card) {
            const countInput = card.querySelector('.btn-count');
            updateDisplay(countInput, cart[product]);
        }
    });

    // Update cart button on page load
    updateCartButton();

    // -----------------------------------------------
    // 4. Live Search Functionality with Debouncing
    // -----------------------------------------------

    // Select the search input
    const searchInput = document.getElementById('search_input');

    // Function to perform the search
    function performSearch() {
        const searchValue = searchInput.value.toLowerCase().trim();

        // If the search input is empty, show all products
        if (searchValue === '') {
            productCards.forEach(function (card) {
                card.parentElement.style.display = 'block';
            });
            return;
        }

        // Loop through all product cards
        productCards.forEach(function (card) {
            const productName = card.querySelector('.card-title').textContent.toLowerCase();

            if (productName.includes(searchValue)) {
                card.parentElement.style.display = 'block'; // Show the card's parent column
            } else {
                card.parentElement.style.display = 'none'; // Hide the card's parent column
            }
        });
    }

    // Debounce function to limit how often performSearch is called
    function debounce(func, delay) {
        let debounceTimer;
        return function () {
            const context = this;
            const args = arguments;
            clearTimeout(debounceTimer);
            debounceTimer = setTimeout(() => func.apply(context, args), delay);
        };
    }

    // Use debounced version of performSearch
    const debouncedSearch = debounce(performSearch, 300);

    searchInput.addEventListener('input', debouncedSearch);

    const searchButton = document.getElementById('search_button');

    searchButton.addEventListener('click', function (e) {
        e.preventDefault(); // Prevent default action if any
        performSearch();
    });

    searchInput.addEventListener('keydown', function (e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            performSearch();
        }
    });


});

