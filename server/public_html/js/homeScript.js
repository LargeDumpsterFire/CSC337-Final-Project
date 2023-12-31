/*
Names: Jacob Cohen, Seth Perritt, Hunter Copening, Josh Puhala
project: Final Project CSC 337
purpose: This file contains a function that helps the left navbar resize by user 
a function that populates the grid with the user projects after each save and a function that 
adds the active class to the current button


*/
// This code section is for the left navbar resizing by user 
let resizer = document.querySelector(".resizer"),
  sidebar = document.querySelector(".left-navbar-container"),
  projectCardContainer = document.querySelector(".project-card-container");

function initResizerFn(resizer, sidebar, projectCardContainer) {
  let x, w;

  function rs_mousedownHandler(e) {
    x = e.clientX;
    let sbWidth = window.getComputedStyle(sidebar).width;
    w = parseInt(sbWidth, 10);

    document.addEventListener("mousemove", rs_mousemoveHandler);
    document.addEventListener("mouseup", rs_mouseupHandler);
  }

  function rs_mousemoveHandler(e) {
    let dx = e.clientX - x;
    let cw = w + dx; // complete width

    if (cw <= 700 && cw >= 250) {
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

// added active class to the current button (highlight it)
let container = document.getElementById("buttonContainer");
let btns = container.getElementsByClassName("btn");
for (let i = 0; i < btns.length; i++) {
  btns[i].addEventListener("click", function () {
    let current = document.getElementsByClassName("active");
    current[0].className = current[0].className.replace(" active", "");
    this.className += " active";
  });
}

// Start of project cards section
document.addEventListener("DOMContentLoaded", function () {
  const gridContainer = document.getElementById("wrapper");

  // Fetching projects data for the current user
  const urlParams = new URLSearchParams(window.location.search);
  const username = urlParams.get('username');
  console.log('Username from URL:', username);

  // Fetching projects data for the current user
  if (username !== null) {
    fetch(`/home/${username}`)
      .then(response => response.json())
      .then(data => {
        const projectsData = data.projects; // Access the 'projects' property
        console.log('User Projects Data:', projectsData);

        // Check if the projectsData is an array and not empty
        if (Array.isArray(projectsData) && projectsData.length > 0) {
          console.log(`Number of projects: ${projectsData.length}`);
          projectsData.forEach(canvasData => {
            const card = createProjectCard(canvasData);
            gridContainer.appendChild(card);
          });
        } else {
          console.error('Invalid projects data format or empty array:', projectsData);
          // If the data is not in the expected format or is empty, you can handle it accordingly
        }
      })
      .catch(error => {
        console.error('Error fetching projects data:', error);
        // If there's an error fetching data, resolve it accordingly
      });
  } else {
    console.error('Username is null. Redirect or handle accordingly.');
  }


  // Function to create project cards
  function createProjectCard(project) {
    const card = document.createElement("div");
    card.className = "outside-image-box";

    const projectImage = document.createElement("div");
    projectImage.className = "project-image";
    projectImage.innerHTML = `<img src="./img/TeamLogo.png" alt="Project Image">`;

    const textContainer = document.createElement("div");
    textContainer.className = "image-box-text";

    const projectName = document.createElement("p");
    projectName.innerText = project.imageName;

    const lastEdited = document.createElement("p");
    lastEdited.innerText = `Last Edit: ${formatLastEdited(project.lastEdited)}`;

    textContainer.appendChild(projectName);
    textContainer.appendChild(lastEdited);

    card.appendChild(projectImage);
    card.appendChild(textContainer);

    // Add an event listener to the card
    card.addEventListener('click', () => {
      // Call a function to send the project name to the canvas
      sendProjectNameToCanvas(project.imageName);
    });

    return card;
  }

  // Function to format last edited time
  function formatLastEdited(lastEdited) {
    const date = new Date(lastEdited);
    return date.toLocaleString(); // Adjust the format as needed
  }

  // Function to send project name to the canvas
  function sendProjectNameToCanvas(projectName) {
    // *EVERYONE* You can use projectName to load the corresponding project in the canvas
    console.log('Project Name:', projectName);

    // Example: Redirect to the canvas page with the project name
    window.location.href = `/canvas.html?imageName=${encodeURIComponent(projectName)}`;
  }

  // Event listener for List and Grid view buttons
  const wrapper = document.getElementById("wrapper");
  document.addEventListener("click", function (event) {
    if (event.target.matches(".btn.list")) {
      event.preventDefault();
      wrapper.classList.add("list");
    } else if (event.target.matches(".btn.grid")) {
      event.preventDefault();
      wrapper.classList.remove("list");
    }
  });
});

// End of project cards section
// this code section is for the dropdown menu in the top right corner.
document.addEventListener("DOMContentLoaded", function () {
  const dropdowns = document.querySelectorAll('.dropdown');
  let activeIcon = null;

  function toggleDropdown(dropdown) {
    const dropdownContent = dropdown.querySelector('.dropdown-content');
    if (dropdownContent) {
      dropdownContent.classList.toggle('show');
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

      if (!dropdown.contains(event.target)) {
        if (dropdownContent && dropdownContent.classList.contains('show')) {
          dropdownContent.classList.remove('show');
        }

        if (icon) {
          resetIcon(icon);
        }
      }
    });
  }

  window.addEventListener('click', handleGlobalClick);

  dropdowns.forEach(function (dropdown) {
    dropdown.addEventListener('click', function (event) {
      event.stopPropagation();

      if (activeIcon && activeIcon !== dropdown.querySelector('.dropdown i')) {
        resetIcon(activeIcon);

        const prevDropdown = activeIcon.parentElement.parentElement;
        if (prevDropdown) {
          prevDropdown.querySelector('.dropdown-content').classList.remove('show');
        }
      }

      toggleDropdown(this);

      const icon = this.querySelector('.dropdown i');
      if (icon) {
        if (icon.classList.contains('fa-cog')) {
          animateIcon(icon, 'rotate(135deg)');
        } else if (icon.classList.contains('fa-home')) {
          animateIcon(icon, 'scale(1.5)');
        } else if (icon.classList.contains('fa-user')) {
          animateIcon(icon, 'scale(1.5)');
        }

        activeIcon = icon;
      }
    });
  });
});
