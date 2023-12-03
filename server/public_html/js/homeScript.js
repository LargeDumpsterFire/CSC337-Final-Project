const mongoose = require('mongoose');

// Define UserProject Schema and Model
const userProjectSchema = new mongoose.Schema({
  name: String,
  description: String,
  date: Date,
  imageUrl: String
});

const UserProject = mongoose.model('UserProject', userProjectSchema);
module.exports = UserProject;

// Sample user projects
const userProjects = [
  { name: "Project 1", description: "Description for Project 1", date: new Date("2023-11-13"), imageUrl: "./img/TeamLogo.png" },
  // Add more projects as needed
  // ...
];

// Function to save user projects to the database
const saveProjectsToDB = async () => {
  for (const project of userProjects) {
    try {
      const newProject = new UserProject(project);
      await newProject.save();
    } catch (error) {
      console.error('Error saving project:', error);
    }
  }
};

// Create a project card element
const createProjectCard = (project) => {
  const card = document.createElement("div");
  card.className = "grid-item";
  card.appendChild(createProjectImage(project.imageUrl));
  card.appendChild(createTextContainer(project));
  return card;
};

// Create project image element
const createProjectImage = (imageUrl) => {
  const projectImage = document.createElement("div");
  projectImage.className = "project-image";
  projectImage.innerHTML = `<img src="${imageUrl}" alt="Project Image">`;
  return projectImage;
};

// Create text container element
const createTextContainer = (project) => {
  const textContainer = document.createElement("div");
  textContainer.className = "text-container";
  textContainer.appendChild(createProjectName(project.name));
  textContainer.appendChild(createLastUpdated());
  textContainer.appendChild(createDate(project.date));
  return textContainer;
};

// Create project name element
const createProjectName = (name) => {
  const projectName = document.createElement("h2");
  projectName.className = "project-name";
  projectName.innerText = name;
  return projectName;
};

// Create last updated element
const createLastUpdated = () => {
  const lastUpdated = document.createElement("p");
  lastUpdated.innerText = "Last updated";
  return lastUpdated;
};

// Create date element
const createDate = (date) => {
  const formattedDate = document.createElement("p");
  formattedDate.className = "date";
  formattedDate.innerText = date.toLocaleDateString();
  return formattedDate;
};
/* this is the code for making the left outside navbar resizable with user input*/

/* end of code for rezising*/
/* document.addEventListener("DOMContentLoaded", function () {
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
  function createProjectCards(project) {
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
  //this function is going to try to add text and break lines to the description
  function textAndLineTest(){
    var date = document.getElementById("date");
    var projectName = document.getElementById("projectName");
    
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
      if (event.target.matches(".list")) {
          // List view
          event.preventDefault();
          wrapper.classList.add("list");
          
      } else if (event.target.matches(".grid")) {
          // Grid view
          event.preventDefault();
          wrapper.classList.remove("list");
      }
  });
});
 */
// Save projects to the database and populate the grid container
const initializeApp = async () => {
  await saveProjectsToDB();
  await populateGridContainer();
};

initializeApp();
