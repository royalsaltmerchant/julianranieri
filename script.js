function hamburger() {
    var button = document.getElementById("container");
    var content = document.getElementById("container-content");
  
    if (button.value === "on") {
      content.style.display = "block";
      button.value = "off";
    }
    else {
      content.style.display = "none";
      button.value = "on";
    }
    }

