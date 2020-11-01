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

    if (winScroll > 100) {
        header.style.display = 'flex'
    } else {
        header.style.display = 'none'
    }

    if (document.body.scrollTop > 100 || document.documentElement.scrollTop > 300) {
        document.getElementById("magic-text1").className = "slideUp";
    }
    if (document.body.scrollTop > 200 || document.documentElement.scrollTop > 400) {
        document.getElementById("magic-text2").className = "slideUp";
    }
}
