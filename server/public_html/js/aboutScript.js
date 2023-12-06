//this code section is for the left navbar resizing by user 
var resizer = document.querySelector(".resizer"),
  sidebar = document.querySelector(".left-navbar-container"),
  projectCardContainer = document.querySelector(".member-cards-container");

function initResizerFn(resizer, sidebar, projectCardContainer) {

  var x, w;

  function rs_mousedownHandler(e) {

    x = e.clientX;

    var sbWidth = window.getComputedStyle(sidebar).width;
    w = parseInt(sbWidth, 10);

    document.addEventListener("mousemove", rs_mousemoveHandler);
    document.addEventListener("mouseup", rs_mouseupHandler);
  }

  function rs_mousemoveHandler(e) {
    var dx = e.clientX - x;

    var cw = w + dx; // complete width

    if (cw <= 500 && cw >= 250) {
      sidebar.style.width = `${cw}px`;
      projectCardContainer.style.left = `${cw + 30}px`; // Add the width of the .left-navbar-container and any additional spacing
    }
  }

  function rs_mouseupHandler() {
    document.removeEventListener("mouseup", rs_mouseupHandler);
    document.removeEventListener("mousemove", rs_mousemoveHandler);
  }

  resizer.addEventListener("mousedown", rs_mousedownHandler);
}

initResizerFn(resizer, sidebar, projectCardContainer);

//end of left navbar resizing code section
document.addEventListener("DOMContentLoaded", function () {
    const dropdowns = document.querySelectorAll('.dropdown');
    let activeIcon = null;
  
    function toggleDropdown(dropdown) {
      const dropdownContent = dropdown.querySelector('.dropdown-content');
      if (dropdownContent) {
        dropdownContent.classList.toggle('show');
        //console.log('Dropdown content toggled');
      }
    }
  
    function resetIcon(icon) {
      icon.style.transition = 'transform 0.5s ease-in-out';
      icon.style.transform = 'rotate(0) scale(1)';
    }
  
    function animateIcon(icon, transformValue) {
      icon.style.transition = 'transform 0.5s ease-in-out';
      icon.style.transform = icon.style.transform === transformValue ? 'rotate(0) scale(1)' : transformValue;
    }
  
    function handleGlobalClick(event) {
      dropdowns.forEach(function (dropdown) {
        const dropdownContent = dropdown.querySelector('.dropdown-content');
        const icon = dropdown.querySelector('.dropdown i');
  
        // Check if the clicked target is outside the entire dropdown
        if (!dropdown.contains(event.target)) {
          // Close dropdown and reset icon animations
          if (dropdownContent && dropdownContent.classList.contains('show')) {
            dropdownContent.classList.remove('show');
            // console.log('Dropdown content hidden');
          }
  
          if (icon) {
            // console.log('Resetting icon:', icon.className);
            resetIcon(icon);
          }
        }
      });
    }
  
    window.addEventListener('click', handleGlobalClick);
  
    dropdowns.forEach(function (dropdown) {
      dropdown.addEventListener('click', function (event) {
        event.stopPropagation();
        //console.log('Dropdown clicked');
  
        // Reset previous active icon and close its dropdown
        if (activeIcon && activeIcon !== dropdown.querySelector('.dropdown i')) {
          //console.log('Resetting active icon');
          resetIcon(activeIcon);
  
          const prevDropdown = activeIcon.parentElement.parentElement;
          if (prevDropdown) {
            prevDropdown.querySelector('.dropdown-content').classList.remove('show');
            //console.log('Previous dropdown content hidden');
          }
        }
  
        toggleDropdown(this);
  
        const icon = this.querySelector('.dropdown i');
        if (icon) {
          //console.log('Icon clicked:', icon.className);
          // Reset animations for clicked icon
          if (icon.classList.contains('fa-cog')) {
            animateIcon(icon, 'rotate(135deg)');
          } else if (icon.classList.contains('fa-home')) {
            animateIcon(icon, 'scale(1.5)');
          } else if (icon.classList.contains('fa-user')) {
            animateIcon(icon, 'scale(1.5)');
          }
  
          // Set the clicked icon as the active icon
          activeIcon = icon;
        }
      });
    });
  });