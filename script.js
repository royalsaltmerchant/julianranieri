// hamburger
function hamburger() {
  var button = document.getElementById("ham-container");
  var content = document.getElementById("ham-container-content");
  var whole = document.getElementById("whole");
  button.classList.toggle("ham-change")
  if (content.style.display !== 'flex') {
      content.style.display = 'flex';
      whole.style.opacity = 0.1;
  } else {
      content.style.display = 'none';
      whole.style.opacity = 1;
  }
}