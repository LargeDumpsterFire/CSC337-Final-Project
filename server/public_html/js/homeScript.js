//this code section is for the left navbar resizing by user 
var resizer = document.querySelector(".resizer"),
  sidebar = document.querySelector(".left-navbar-container"),
  projectCardContainer = document.querySelector(".project-card-container");

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
var container = document.getElementById("buttonContainer");
var btns = container.getElementsByClassName("btn");
for (var i = 0; i < btns.length; i++) {
  btns[i].addEventListener("click", function () {
    var current = document.getElementsByClassName("active");
    current[0].className = current[0].className.replace(" active", "");
    this.className += " active";
  });
}
//end of left navbar resizing code section
//start of project cards section
document.addEventListener("DOMContentLoaded", function () {
  // Sample user projects
  const userProjects = [
    { name: "Project 1", description: "Description for Project 1", date: "2023-11-13", imageUrl: "./img/TeamLogo.png" },
    { name: "Project 2", description: "Description for Project 2", date: "2023-11-14", imageUrl: "./img/TeamLogo.png" },
    { name: "Project 3", description: "Description for Project 3", date: "2023-11-15", imageUrl: "./img/TeamLogo.png" },
    { name: "Project 4", description: "Description for Project 4", date: "2023-11-16", imageUrl: "./img/TeamLogo.png" },
    { name: "Project 5", description: "Description for Project 5", date: "2023-11-17", imageUrl: "./img/TeamLogo.png" },
    { name: "Project 6", description: "Description for Project 6", date: "2023-11-18", imageUrl: "./img/TeamLogo.png" },
    { name: "Project 7", description: "Description for Project 7", date: "2023-11-19", imageUrl: "./img/TeamLogo.png" },
    { name: "Project 8", description: "Description for Project 8", date: "2023-11-12", imageUrl: "./img/TeamLogo.png" },
    { name: "Project 9", description: "Description for Project 9", date: "2023-11-18", imageUrl: "./img/TeamLogo.png" },
  ];

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
    gridContainer.appendChild(card);
  });

  const wrapper = document.getElementById("wrapper");

  // Event listener for List and Grid view buttons
  document.addEventListener("click", function (event) {
    if (event.target.matches(".btn.list")) {
      // List view
      event.preventDefault();
      console.log("List view");
      wrapper.classList.add("list");
    } else if (event.target.matches(".btn.grid")) {
      // Grid view
      event.preventDefault();
      console.log("Grid view");
      wrapper.classList.remove("list");
    }
  });
});
