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

// Populate the grid container with projects
const populateGridContainer = async () => {
  try {
    const projects = await UserProject.find().lean();
    const gridContainer = document.getElementById("grid");
    gridContainer.innerHTML = ""; // Clear the grid container

    projects.forEach(project => {
      const card = createProjectCard(project);
      gridContainer.appendChild(card);
    });
  } catch (error) {
    console.error('Error fetching projects:', error);
  }
};

// Save projects to the database and populate the grid container
const initializeApp = async () => {
  await saveProjectsToDB();
  await populateGridContainer();
};

initializeApp();