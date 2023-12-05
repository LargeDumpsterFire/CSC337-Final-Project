//this code section is for the left navbar resizing by user
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
/* Optional: Add active class to the current button (highlight it) */
let container = document.getElementById("buttonContainer")
let btns = container.getElementsByClassName("btn");
for (let i = 0; i < btns.length; i++) {
    btns[i].addEventListener("click", function () {
  let current = document.getElementsByClassName("active");
      current[0].className = current[0].className.replace(" active", "");
      this.className += " active";
  });
}
//end of left navbar resizing code section

//start of project cards section
document.addEventListener("DOMContentLoaded", function () {
  // Get the userId from the URL query parameters
  const urlParams = new URLSearchParams(window.location.search);
  const userId = urlParams.get('userId');

  // Function to fetch user projects data from MongoDB
  async function fetchUserProjects(userId) {
    try {
      const response = await fetch(`/home/${userId}/projects`);
      if (response.ok) {
        const projectsData = await response.json();
        return projectsData;
      } else {
        console.error('Failed to fetch user projects');
        return [];
      }
    } catch (error) {
      console.error('Error fetching user projects:', error);
      return [];
    }
  }

  // Function to populate project cards based on user projects data
  async function populateProjectCards(userId) {
    const gridContainer = document.getElementById('wrapper');

    // Fetch user projects data
    const userProjects = await fetchUserProjects(userId);

    // Check if projects data is available
    if (userProjects.length > 0) {
      userProjects.forEach(project => {
        const card = createProjectCard(project); 
        gridContainer.appendChild(card);
      });
    } else {
      // Handle scenario when no projects are available
      console.log('No projects found for the user');
    }
  }

  // Fetch and populate project cards upon successful login or home page load
  populateProjectCards(userId); 

  // Function to create project cards
  function createProjectCard(project) {
    const card = document.createElement("div");
    card.className = "outside-image-box";

    const projectImage = document.createElement("div");
    projectImage.className = "project-image";
    projectImage.innerHTML = `<img src="${project.imageUrl}" alt="Project Image">`;
    const textContainer = document.createElement("div");
    textContainer.className = "image-box-text";

    const projectName = document.createElement("t");
    projectName.id = "projectName";
    projectName.innerText = project.name;

    const lastUpdated = document.createElement("t");
    lastUpdated.innerText = "Last Edit:";

    const date = document.createElement("t");
    date.id = "date";
    date.innerText = project.date;

    textContainer.appendChild(projectName);
    textContainer.appendChild(lastUpdated);
    textContainer.appendChild(date);

    card.appendChild(projectImage);
    card.appendChild(textContainer);

    return card;
  }

  // Populate the grid container with project cards
  const gridContainer = document.getElementById("wrapper");
  userProjects.forEach(project => {
    const card = createProjectCard(project);
    card.addEventListener('click', function() {
      // Redirect the user to the canvas page with the project ID as a query parameter
      window.location.href = `/canvas?projectId=${projectId}`;
  });
    gridContainer.appendChild(card);
  });

  const wrapper = document.getElementById("wrapper");

  // Event listener for List and Grid view buttons
  document.addEventListener("click", function (event) {
    if (event.target.matches(".btn.list")) {
      // List view
      event.preventDefault();
      // console.log("List view");
      wrapper.classList.add("list");
    } else if (event.target.matches(".btn.grid")) {
      // Grid view
      event.preventDefault();
      // console.log("Grid view");
      wrapper.classList.remove("list");
    }
  });
});
document.addEventListener("DOMContentLoaded", function () {
  const dropdowns = document.querySelectorAll('.dropdown');
  let activeIcon = null;

  function toggleDropdown(dropdown) {
    const dropdownContent = dropdown.querySelector('.dropdown-content');
    if (dropdownContent) {
      dropdownContent.classList.toggle('show');
      console.log('Dropdown content toggled');
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
          //console.log('Dropdown content hidden');
        }

        if (icon) {
          //console.log('Resetting icon:', icon.className);
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
          // console.log('Previous dropdown content hidden');
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
        }

        // Set the clicked icon as the active icon
        activeIcon = icon;
      }
    });
  });
});