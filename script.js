// hamburger
function hamburger() {
    var button = document.getElementById("container");
    var content = document.getElementById("container-content");
    var whole = document.getElementById("whole");
    button.classList.toggle("change")
    if (content.style.display !== 'flex') {
        content.style.display = 'flex';
        whole.style.opacity = 0.1;
    } else {
        content.style.display = 'none';
        whole.style.opacity = 1;
    }
}
// end hamburger

// scroll function
window.onscroll = () => {
    scrollFunction()
}
function scrollFunction() {
    var winScroll = document.body.scrollTop || document.documentElement.scrollTop;
    var header = document.getElementById('header')

    if (winScroll > 10) {
        header.style.display = 'flex'
    } else {
        header.style.display = 'none'
    }

    if (document.body.scrollTop > 350 || document.documentElement.scrollTop > 350) {
        document.getElementById("first-section").className = "slideUp";
    }
    if (document.body.scrollTop > 450 || document.documentElement.scrollTop > 450) {
        document.getElementById("second-section").className = "slideUp2";
    }
    if (document.body.scrollTop > 100 || document.documentElement.scrollTop > 1000) {
        document.getElementById("projects-div").className = "slideUp3";
    }
}

// scroll from landing to main body
function scrollFromLanding() {
    window.scrollTo({ top: 650, behavior: 'smooth' })
  }