
function scrollToProjects() {
  var element = document.getElementById('projects')
  element.scrollIntoView({
    behavior: 'smooth', // smooth scroll
    block: 'start' // the upper border of the element will be aligned at the top of the visible part of the window of the scrollable area.
  })
}

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
namePlay()

// slide out sidebar
function SideBar(props) {
  this.props = props

  this.render = function() {
    this.elem = document.getElementById(this.props.id)

    var html =  /* html */`
      <div class="sidebar" id="sidebar">
        <div class="sidebar-items" id="sidebar-items">
          <a onclick="scrollToProjects()"><div class="sidebar-items-item">Projects<i class="fa fa-code-fork"></i></div></a>
          <hr>
          <a href="https://github.com/royalsaltmerchant"><div class="sidebar-items-item">Github<i class="fa fa-github"></i></div></a>    
          <hr>
          <a href="resume_compressed.pdf"><div class="sidebar-items-item">Resume<i class="fa fa-file"></i></div></a>    
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