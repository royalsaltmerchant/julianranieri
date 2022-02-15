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

// header
function Header(props) {
  this.props = props

  this.render = function() {
    this.elem = document.getElementById(this.props.id)
    

    var html = /*html*/ `
      <a class="email" href="mailto:jumpingafterrain@gmail.com">Jumpingafterrain@gmail.com</a>
      <div class="ham-container" id="ham-container" onclick="hamburger()">
        <div class="bar1"></div>
        <div class="bar2"></div>
        <div class="bar3"></div>
        <div id="ham-container-content">
          <a class="menu-item" href="index.html">Home</a>
          <hr>
          <a class="menu-item" href="#projects">Projects</a>
          <hr>
          <a class="menu-item" href="./JulianRanieriResumeWeb.pdf">Resume</a>
        </div>
      </div>
    `
    this.elem.innerHTML = html
  }

  this.render()
  return this
}

var header = new Header({
  id: 'header'
})