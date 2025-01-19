$(document).ready(function () {
    // Variable to store the dynamically fetched IP address
    let ipAddress = null;

    // Function to fetch the external IP address from the JSON file
    function fetchIP() {
        return fetch('/data/get_ip.json') // Updated to use dynamic data route
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(data => {
                ipAddress = data.ip_address;
                return ipAddress;
            })
            .catch(error => {
                console.error('Error fetching IP address:', error);
                return null;
            });
    }

    // Handle click for small screens and hover for larger screens
    function handleImageModalBehavior() {
        const isSmallScreen = window.innerWidth <= 768; // Define small screen as width <= 768px

        if (isSmallScreen) {
            $('#cardsTable img').off('mouseenter mouseleave'); // Remove hover event
            $('#cardsTable img').on('click', function () {
                const imgSrc = $(this).data('image');
                $('#modalImage').attr('src', imgSrc).css('width', '50%');
                $('#imageModal').modal('show');
            });
        } else {
            $('#cardsTable img').on('mouseenter', function () {
                const imgSrc = $(this).data('image');
                $('#modalImage').attr('src', imgSrc).css('width', '50%');
                $('#imageModal').modal('show');
            }).on('mouseleave', function () {
                $('#imageModal').modal('hide');
            });
            $('#cardsTable img').off('click'); // Remove click event
        }
    }

    // Re-evaluate on window resize
    $(window).on('resize', handleImageModalBehavior);

    // Load IP address and then load data
    fetchIP().then(ip => {
        if (ip) {
            setInterval(() => {
                // Periodic data loading logic can be added here
            }, 60000); // Refresh data every minute
        }
    });

    // Show/hide .navbar-brand based on scroll position of specific element
    function toggleNavbarBrand() {
        const targetElement = $('#section1 .card-text');
        if (targetElement.length === 0) return; // Exit if element is not found

        const targetBottom = targetElement.offset().top + targetElement.outerHeight();
        const scrollPos = $(window).scrollTop();

        const navbarBrand = $('.navbar-brand');
        if (scrollPos >= targetBottom) {
            navbarBrand.addClass('visible').removeClass('invisible'); // Show .navbar-brand
        } else {
            navbarBrand.addClass('invisible').removeClass('visible'); // Hide .navbar-brand
        }
    }

    // Call toggleNavbarBrand on page load and when scrolling
    toggleNavbarBrand();
    $(window).on('scroll', toggleNavbarBrand);

    // Select the footer and section1
    const footer = document.querySelector('.footer');
    const section1 = document.querySelector('#section1');

    // Create an intersection observer
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            footer.style.display = entry.isIntersecting ? 'block' : 'none';
        });
    }, {
        threshold: 0.1
    });
    observer.observe(section1);

    // Handle Slack form submission
    document.getElementById('slackForm').addEventListener('submit', function (event) {
        event.preventDefault();

        const formData = new FormData(this);
        const name = formData.get('name');
        const email = formData.get('email');
        const message = formData.get('message');

        if (ipAddress) {
            fetch(`https://geekinc2slack.geekinc.co/webhook`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email, message })
            })
                .then(response => response.json())
                .then(data => {
                    this.style.display = 'none';
                    const responseMessage = document.getElementById('responseMessage');
                    if (data.status === 'success') {
                        responseMessage.innerHTML = '<div class="alert alert-success">Message sent successfully!</div>';
                    } else {
                        responseMessage.innerHTML = '<div class="alert alert-danger">Error: ' + data.message + '</div>';
                    }
                    responseMessage.style.display = 'block';
                })
                .catch(error => {
                    const responseMessage = document.getElementById('responseMessage');
                    responseMessage.innerHTML = '<div class="alert alert-danger">An error occurred: ' + error.message + '</div>';
                    responseMessage.style.display = 'block';
                });
        } else {
            console.error('IP address is not available');
        }
    });

    // Initialize tooltips
    const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    tooltipTriggerList.forEach(el => new bootstrap.Tooltip(el));
});
