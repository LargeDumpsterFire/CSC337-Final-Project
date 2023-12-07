// This code section is for the left navbar resizing by the user
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
      projectCardContainer.style.left = `${cw + 30}px`;
    }
  }

  function rs_mouseupHandler() {
    document.removeEventListener("mouseup", rs_mouseupHandler);
    document.removeEventListener("mousemove", rs_mousemoveHandler);
  }

  resizer.addEventListener("mousedown", rs_mousedownHandler);
}

initResizerFn(resizer, sidebar, projectCardContainer);

// Optional: Add active class to the current button (highlight it)
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
  const urlParams = new URLSearchParams(window.location.search);
  const username = urlParams.get('user');

  if (username !== null) {
    const gridContainer = document.getElementById("wrapper");
    fetch(`/home.html/${username}`)
      .then(response => response.json())
      .then(projectsData => {
        if (Array.isArray(projectsData)) {
          projectsData.forEach(project => {
            const card = createProjectCard(project);
            gridContainer.appendChild(card);
          });
        } else {
          console.error('Invalid projects data format:', projectsData);
        }
      })
      .catch(error => {
        console.error('Error fetching projects data:', error);
      });
  } else {
    console.error('Username is null. Redirect or handle accordingly.');
  }

  const wrapper = document.getElementById("wrapper");

  // Event listener for List and Grid view buttons
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

  card.addEventListener('click', () => {
    window.location.href = `/canvas.html?projectId=${project.projectId}&username=${username}`;
  });

  return card;
}

// End of project cards section

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
