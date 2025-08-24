$(document).ready(function () {
    // Variable to store the dynamically fetched IP address
    let ipAddress = null;

    // Function to fetch the external IP address from the JSON file
    function fetchIP() {
        // Try to fetch the JSON over HTTP(S).
        // If the page is opened via file:// the fetch will fail; in that case provide a local mock IP
        return fetch('/data/get_ip.json')
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
                // If we're running from file:// or fetch fails, fallback to a mock value for local testing
                if (window.location.protocol === 'file:') {
                    console.info('Running from file:// - using mocked IP for local testing');
                    ipAddress = '127.0.0.1';
                    return ipAddress;
                }
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

        // On small screens we want the navbar brand visible immediately so users can access
        // navigation without having to scroll. On larger screens keep the original behavior
        // (show brand after the target element scrolls out of view).
        const navbarBrand = $('.navbar-brand');
        if (window.innerWidth <= 768) {
            navbarBrand.addClass('visible').removeClass('invisible');
            return;
        }

        const targetBottom = targetElement.offset().top + targetElement.outerHeight();
        const scrollPos = $(window).scrollTop();

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

    // Adjust body padding to account for the fixed navbar height so content
    // is not hidden beneath the nav. This measures the actual navbar height
    // (works with your larger brand sizes) and updates on resize.
    function adjustBodyForNavbar() {
        const nav = document.querySelector('.nav-masthead');
        if (!nav) return;
        const navHeight = nav.offsetHeight || 0;
        // Preserve any existing bottom padding (for reserved footer space)
        const bodyStyles = window.getComputedStyle(document.body);
        const currentBottom = bodyStyles.paddingBottom || '0px';
        // Only update if changed to avoid layout thrash
        const currentTop = bodyStyles.paddingTop || '0px';
        const desiredTop = navHeight + 'px';
        if (currentTop !== desiredTop) {
            document.body.style.paddingTop = desiredTop;
        }
        // Reapply bottom padding explicitly in case inline style was cleared elsewhere
        document.body.style.paddingBottom = currentBottom;
    }

    // Run after DOM load and after fonts/rendering are ready
    function runAdjustments() {
        adjustBodyForNavbar();
        // Also call after a short delay to account for late rendering/layout shifts
        setTimeout(adjustBodyForNavbar, 250);
    }

    if (document.readyState === 'complete' || document.readyState === 'interactive') {
        runAdjustments();
    } else {
        document.addEventListener('DOMContentLoaded', runAdjustments);
    }

    // Also run when fonts finish loading to catch changes in brand size
    if (document.fonts && document.fonts.ready) {
        document.fonts.ready.then(runAdjustments).catch(() => {});
    }

    // Observe navbar for size changes (e.g., when window resizes or brand text reflows)
    const navEl = document.querySelector('.nav-masthead');
    if (navEl && window.ResizeObserver) {
        const ro = new ResizeObserver(() => {
            adjustBodyForNavbar();
        });
        ro.observe(navEl);
    }

    // Ensure adjustments run when bootstrap collapse/expand events change navbar height
    document.addEventListener('shown.bs.collapse', adjustBodyForNavbar);
    document.addEventListener('hidden.bs.collapse', adjustBodyForNavbar);

    // Window resize fallback
    window.addEventListener('resize', adjustBodyForNavbar);

    // Contact form logic removed

    // Initialize tooltips
    const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    tooltipTriggerList.forEach(el => new bootstrap.Tooltip(el));
});
