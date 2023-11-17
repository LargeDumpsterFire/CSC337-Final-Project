// Sample user projects
const userProjects = [
    //{ name: "Project 1", description: "Description for Project 1", date: "2023-11-13", imageUrl: "./img/TeamLogo.png" },
    // Add more projects as needed
    { name: "Project 2", description: "Description for Project 2", date: "2023-11-14", imageUrl: "./img/TeamLogo.png" },
    { name: "Project 3", description: "Description for Project 3", date: "2023-11-15", imageUrl: "./img/TeamLogo.png" },
    { name: "Project 4", description: "Description for Project 4", date: "2023-11-16", imageUrl: "./img/TeamLogo.png" },
    { name: "Project 5", description: "Description for Project 5", date: "2023-11-17", imageUrl: "./img/TeamLogo.png" },
    { name: "Project 6", description: "Description for Project 6", date: "2023-11-18", imageUrl: "./img/TeamLogo.png" },
    { name: "Project 7", description: "Description for Project 7", date: "2023-11-19", imageUrl: "./img/TeamLogo.png" },
    //{ name: "Project 8", description: "Description for Project 8", date: "2023-11-12", imageUrl: "./img/TeamLogo.png" },
    { name: "Project 9", description: "Description for Project 9", date: "2023-11-18", imageUrl: "./img/TeamLogo.png" },
];

// Function to create project cards
function createProjectCard(project) {
    const card = document.createElement("div");
    card.className = "grid-item";

    const projectImage = document.createElement("div");
    projectImage.className = "project-image";
    projectImage.innerHTML = `<img src="${project.imageUrl}" alt="Project Image">`;
    
    const textContainer = document.createElement("div");
    textContainer.className = "text-container";

    const projectName = document.createElement("t");
    projectName.id = "project-name";
    projectName.innerText = project.name;

    const lastUpdated = document.createElement("t");
    lastUpdated.innerText = "Last updated";

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
const gridContainer = document.getElementById("grid");
userProjects.forEach(project => {
    const card = createProjectCard(project);
    gridContainer.appendChild(card);

    
});
var wrapper = document.getElementById("wrapper");

document.addEventListener("click", function (event) {
  if (!event.target.matches(".list")) return;

  // List view
  event.preventDefault();
  wrapper.classList.add("list");
});

document.addEventListener("click", function (event) {
  if (!event.target.matches(".grid")) return;

  // List view
  event.preventDefault();
  wrapper.classList.remove("list");
});
