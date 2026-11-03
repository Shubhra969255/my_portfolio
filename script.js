(function () {
    "use strict";

    var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    var isFinePointer = window.matchMedia("(pointer: fine)").matches;

    /* ---------------------------------------------------------
       SCROLL PROGRESS BAR
    --------------------------------------------------------- */

    var progressBar = document.getElementById("scrollProgress");

    function updateProgress() {
        var scrollTop = window.scrollY;
        var docHeight = document.documentElement.scrollHeight - window.innerHeight;
        var pct = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
        if (progressBar) progressBar.style.width = pct + "%";
    }

    /* ---------------------------------------------------------
       NAVBAR: hide on scroll down, show on scroll up
    --------------------------------------------------------- */

    var navbar = document.getElementById("navbar");
    var lastScroll = window.scrollY;

    function updateNavbar() {
        var current = window.scrollY;

        if (navbar) {
            navbar.classList.toggle("scrolled", current > 12);

            if (current > lastScroll && current > 140) {
                navbar.classList.add("hide-nav");
            } else {
                navbar.classList.remove("hide-nav");
            }
        }

        lastScroll = current;
    }

    var ticking = false;
    window.addEventListener("scroll", function () {
        if (!ticking) {
            window.requestAnimationFrame(function () {
                updateProgress();
                updateNavbar();
                ticking = false;
            });
            ticking = true;
        }
    }, { passive: true });

    updateProgress();

    /* ---------------------------------------------------------
       MOBILE MENU
    --------------------------------------------------------- */

    var menuBtn = document.getElementById("menuBtn");
    var navMenu = document.getElementById("navMenu");

    if (menuBtn && navMenu) {
        menuBtn.addEventListener("click", function () {
            var open = navMenu.classList.toggle("open");
            menuBtn.innerHTML = open
                ? '<i class="fa-solid fa-xmark"></i>'
                : '<i class="fa-solid fa-bars"></i>';
        });

        navMenu.querySelectorAll("a").forEach(function (link) {
            link.addEventListener("click", function () {
                navMenu.classList.remove("open");
                menuBtn.innerHTML = '<i class="fa-solid fa-bars"></i>';
            });
        });
    }

    /* ---------------------------------------------------------
       CURSOR GLOW + DOT
    --------------------------------------------------------- */

    var glow = document.querySelector(".cursor-glow");
    var dot = document.getElementById("cursorDot");

    if (isFinePointer && glow && dot && !reduceMotion) {
        var glowX = 0, glowY = 0, curX = 0, curY = 0;

        window.addEventListener("mousemove", function (e) {
            glowX = e.clientX;
            glowY = e.clientY;
            curX = e.clientX;
            curY = e.clientY;

            glow.classList.add("active");
            dot.classList.add("active");

            dot.style.transform = "translate(" + curX + "px," + curY + "px) translate(-50%,-50%)";
        });

        window.addEventListener("mouseleave", function () {
            glow.classList.remove("active");
            dot.classList.remove("active");
        });

        (function animateGlow() {
            // simple direct positioning; smoothing kept minimal for responsiveness
            glow.style.transform = "translate(" + glowX + "px," + glowY + "px) translate(-50%,-50%)";
            requestAnimationFrame(animateGlow);
        })();

        var hoverTargets = "a, button, .skill, .chip, .training-card, .project-tech span, .contact-item";

        document.querySelectorAll(hoverTargets).forEach(function (el) {
            el.addEventListener("mouseenter", function () { dot.classList.add("grow"); });
            el.addEventListener("mouseleave", function () { dot.classList.remove("grow"); });
        });
    } else if (glow) {
        glow.style.display = "none";
        if (dot) dot.style.display = "none";
    }

    /* ---------------------------------------------------------
       SCROLL REVEALS
    --------------------------------------------------------- */

    var revealEls = document.querySelectorAll(".reveal, .reveal-up");

    if ("IntersectionObserver" in window && revealEls.length) {
        var observer = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    entry.target.classList.add("in-view");
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.15, rootMargin: "0px 0px -60px 0px" });

        revealEls.forEach(function (el) { observer.observe(el); });
    } else {
        revealEls.forEach(function (el) { el.classList.add("in-view"); });
    }

    /* ---------------------------------------------------------
       STAT COUNT-UP
    --------------------------------------------------------- */

    var statEls = document.querySelectorAll(".stat strong[data-count]");

    function animateCount(el) {
        var target = parseFloat(el.getAttribute("data-count"));
        var suffix = el.getAttribute("data-suffix") || "";
        var isDecimal = String(target).indexOf(".") !== -1;
        var duration = 1400;
        var start = null;

        function step(ts) {
            if (start === null) start = ts;
            var progress = Math.min((ts - start) / duration, 1);
            var eased = 1 - Math.pow(1 - progress, 3);
            var value = target * eased;

            el.textContent = (isDecimal ? value.toFixed(2) : Math.round(value)) + suffix;

            if (progress < 1) {
                requestAnimationFrame(step);
            } else {
                el.textContent = (isDecimal ? target.toFixed(2) : target) + suffix;
            }
        }

        requestAnimationFrame(step);
    }

    if ("IntersectionObserver" in window && statEls.length) {
        var statObserver = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    animateCount(entry.target);
                    statObserver.unobserve(entry.target);
                }
            });
        }, { threshold: 0.6 });

        statEls.forEach(function (el) { statObserver.observe(el); });
    } else {
        statEls.forEach(function (el) {
            el.textContent = el.getAttribute("data-count") + (el.getAttribute("data-suffix") || "");
        });
    }

    /* ---------------------------------------------------------
       HERO ROLE TYPEWRITER (Python Developer / Data Analyst)
    --------------------------------------------------------- */

    var roleEl = document.getElementById("roleText");
    var roles = ["Python Developer", "Data Analyst"];

    if (roleEl) {
        if (reduceMotion) {
            roleEl.textContent = roles[0];
        } else {
            var roleIndex = 0;
            var charIndex = roles[0].length;
            var deleting = false;

            function tickRole() {
                var current = roles[roleIndex];
                var typeSpeed = deleting ? 45 : 85;

                if (!deleting) {
                    charIndex++;
                    if (charIndex >= current.length) {
                        charIndex = current.length;
                        roleEl.textContent = current;
                        deleting = true;
                        typeSpeed = 1600;
                    } else {
                        roleEl.textContent = current.slice(0, charIndex);
                    }
                } else {
                    charIndex--;
                    if (charIndex <= 0) {
                        charIndex = 0;
                        deleting = false;
                        roleIndex = (roleIndex + 1) % roles.length;
                        typeSpeed = 400;
                    } else {
                        roleEl.textContent = current.slice(0, charIndex);
                    }
                }

                setTimeout(tickRole, typeSpeed);
            }

            // hold on the first, fully-typed role before the loop starts deleting
            roleEl.textContent = roles[0];
            setTimeout(function () {
                deleting = true;
                tickRole();
            }, 1800);
        }
    }

    /* ---------------------------------------------------------
       TERMINAL 3D TILT (follows pointer within the card)
    --------------------------------------------------------- */

    var terminal = document.getElementById("terminal");

    if (terminal && isFinePointer && !reduceMotion) {
        terminal.addEventListener("mousemove", function (e) {
            var rect = terminal.getBoundingClientRect();
            var px = (e.clientX - rect.left) / rect.width - 0.5;
            var py = (e.clientY - rect.top) / rect.height - 0.5;

            terminal.style.transform =
                "perspective(1000px) rotateY(" + (px * 8) + "deg) rotateX(" + (py * -8) + "deg)";
        });

        terminal.addEventListener("mouseleave", function () {
            terminal.style.transform = "perspective(1000px) rotateY(-4deg) rotateX(2deg)";
        });
    }

})();