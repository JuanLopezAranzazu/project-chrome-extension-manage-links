// elements
const nameInput = document.getElementById("name-input");
const urlInput = document.getElementById("url-input");
const linkForm = document.getElementById("link-form");
const linksContainer = document.getElementById("links-container");

// variables
let links = [];

// logic

// Function to create a link element
function createLinkElement(link) {
  const linkElement = document.createElement("div");
  linkElement.classList.add("link");

  const infoElement = document.createElement("div");
  infoElement.classList.add("link-info");

  const nameElement = document.createElement("a");
  nameElement.href = link.url;
  nameElement.target = "_blank";

  const nameText = document.createTextNode(link.name);
  nameElement.appendChild(nameText);

  const urlElement = document.createElement("span");
  const urlText = document.createTextNode(link.url);
  urlElement.appendChild(urlText);

  const dateElement = document.createElement("span");
  const dateText = document.createTextNode(link.currentDate);
  dateElement.appendChild(dateText);

  infoElement.appendChild(nameElement);
  infoElement.appendChild(urlElement);
  infoElement.appendChild(dateElement);

  const actionsElement = document.createElement("div");
  actionsElement.classList.add("link-actions");

  const deleteButton = document.createElement("button");
  deleteButton.textContent = "Delete";
  deleteButton.classList.add("delete-btn");
  deleteButton.addEventListener("click", () => {
    linkElement.remove();
    deleteLink(link.id);
  });

  actionsElement.appendChild(deleteButton);

  linkElement.appendChild(infoElement);
  linkElement.appendChild(actionsElement);

  linksContainer.appendChild(linkElement);
}

// Function to render the links
function renderLinks() {
  linksContainer.innerHTML = "";
  links.forEach((link) => {
    createLinkElement(link);
  });
}

// Function to get the links from the storage
function getLinks() {
  chrome.storage.sync.get(["links"], function (result) {
    if (result.links) {
      links = result.links;
      renderLinks();
    }
  });
}

// Function to save the link
function addLink(e) {
  e.preventDefault();

  // data
  const name = nameInput.value.trim();
  const url = urlInput.value.trim();

  if (name && url) {
    const link = { id: Date.now(), name, url, currentDate: getCurrentDate() };
    links.push(link);
    chrome.storage.sync.set({ links }, function () {
      createLinkElement(link);
      nameInput.value = "";
      urlInput.value = "";
    });
  }
}

// Function to delete a link
function deleteLink(linkId) {
  const updatedLinks = links.filter((link) => link.id !== linkId);
  links = updatedLinks;
  chrome.storage.sync.set({ links });
}

// UTILS
// Function to get the current active tab URL
async function getActiveTabURL() {
  const tabs = await chrome.tabs.query({
    currentWindow: true,
    active: true,
  });

  if (tabs.length > 0) {
    return tabs[0];
  } else {
    return null;
  }
}

// Function to get the current date
function getCurrentDate() {
  const now = new Date();
  const day = String(now.getDate()).padStart(2, "0");
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const year = now.getFullYear();
  const hours = String(now.getHours()).padStart(2, "0");
  const minutes = String(now.getMinutes()).padStart(2, "0");
  const seconds = String(now.getSeconds()).padStart(2, "0");

  return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
}

// events
document.addEventListener("DOMContentLoaded", async function () {
  const tab = await getActiveTabURL();

  if (tab) {
    nameInput.value = tab.title;
    urlInput.value = tab.url;
  }
});

linkForm.addEventListener("submit", addLink);

// init
getLinks();
