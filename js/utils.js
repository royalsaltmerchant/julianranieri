
// name animation
function namePlay() {
  var nameElem = document.getElementById('name');
  var nameHtml = document.getElementById('name').innerHTML;
  var nameArray = [...nameHtml]
  var html = nameElem.innerHTML = ''
  nameArray.forEach(function(item, index) {
    setTimeout(function() {
      var newHtml = html += item
      nameElem.innerHTML = newHtml
    }, 100 * (index + 1))
  })
}

// slide out sidebar
function SideBar(props) {
  this.props = props

  this.render = function() {
    this.elem = document.getElementById(this.props.id)

    var html =  /* html */`
      <div class="sidebar" id="sidebar">
        <div class="sidebar-items" id="sidebar-items">
          <a href="index.html"><div class="sidebar-items-item">Terminal<img class="icon" src="icons/code-fork-symbol-svgrepo-com.svg"/></i></div></a>
          <hr>
          <a href="https://github.com/royalsaltmerchant"><div class="sidebar-items-item">Github<img class="icon" src="icons/github-svgrepo-com.svg"/></div></a>    
          <hr>
          <a href="resume.pdf"><div class="sidebar-items-item">Resume<img class="icon" src="icons/pdf-svgrepo-com.svg"/></div></a>    
          <hr>
          <a href="blog.html"><div class="sidebar-items-item">Blog<img class="icon" src="icons/blog-writing-svgrepo-com.svg"/></div></a>    
          <hr>
          <a href="links.html"><div class="sidebar-items-item">Links<img class="icon" src="icons/link-svgrepo-com.svg"/></div></a>    
        </div>
      </div>
    `
    this.elem.innerHTML = html

    // get self
    var self = this
    // get items
    this.items = document.getElementById('sidebar-items')
    // get hamburger button and listen to mouse down
    var hamburger = document.getElementById('hamburger')
    hamburger.addEventListener('mousedown', function() {
      event.stopPropagation()
      if(self.isVisible) {
        self.hide()
      } else {
        self.show()
      }
    })
    // hide if click anywhere else
    document.addEventListener('mousedown', function() {
      self.hide()
    })
  }

  // hide sidebar
  this.hide = function() {
    this.isVisible = false
    this.items.style.transform = 'translate(200px, 0px)'
  }
  // show sidebar
  this.show = function() {
    this.isVisible = true
    this.items.style.transform = 'translate(0px, 0px)'
  }

  this.render()
  return this
}

var sidebar = new SideBar({id: 'mobile-menu'})