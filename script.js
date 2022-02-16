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

// name animation
function namePlay() {
  var nameElem = document.getElementById('name');
  var nameHtml = document.getElementById('name').innerHTML;
  var nameArray = [...nameHtml]
  var html = nameElem.innerHTML = ''
  nameArray.forEach(function(item, index) {
    setTimeout(function() {
      console.log(item)
      var newHtml = html += item
      nameElem.innerHTML = newHtml
    }, 100 * (index + 1))
  })
}

namePlay()