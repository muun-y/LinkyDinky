// JavaScript to dynamically update the breadcrumb based on the URL
document.addEventListener("DOMContentLoaded", () => {
  const breadcrumb = document.getElementById("breadcrumb");
  const path = window.location.pathname.split("/").filter((segment) => segment);

  const allowedPaths = ["/stats", "/upload", "/mypage"];
  if (
    allowedPaths.some((allowedPath) =>
      window.location.pathname.startsWith(allowedPath)
    )
  ) {
    path.forEach((segment, index) => {
      // Capitalize the segment text
      const segmentText = segment.charAt(0).toUpperCase() + segment.slice(1);

      // Create a list item for the breadcrumb
      const listItem = document.createElement("li");
      listItem.classList.add("inline-flex", "items-center");

      if (index !== path.length - 1) {
        // Intermediate breadcrumb segments
        listItem.innerHTML = `
                    <div class="flex items-center">
                        <svg class="rtl:rotate-180 w-3 h-3 text-gray-400 mx-1" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 6 10">
                            <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m1 9 4-4-4-4" />
                        </svg>
                        <a href="/${path
                          .slice(0, index + 1)
                          .join(
                            "/"
                          )}" class="ms-1 text-sm font-medium text-gray-500 md:ms-2 dark:text-gray-400 hover:text-blue-600">${segmentText}</a>
                    </div>
                `;
      } else {
        // Last breadcrumb segment (current page)
        listItem.innerHTML = `
                    <div class="flex items-center">
                        <svg class="rtl:rotate-180 w-3 h-3 text-gray-400 mx-1" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 6 10">
                            <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m1 9 4-4-4-4" />
                        </svg>
                        <span class="ms-1 text-sm font-medium text-gray-500 md:ms-2 dark:text-gray-400">${segmentText}</span>
                    </div>
                `;
      }

      // Append the breadcrumb item
      breadcrumb.appendChild(listItem);
    });
  }

  // active modification
  document.querySelectorAll(".toggle-active").forEach(function (checkbox) {
    checkbox.addEventListener("change", function () {
      const content_id = this.getAttribute("data-id");
      const isActive = this.checked ? 1 : 0;
      const originalColor = checkbox.closest("tr").style.backgroundColor;

      fetch("/update-status", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ content_id: content_id, is_active: isActive }),
      })
        .then((response) => response.json())
        .then((data) => {
          if (data.success) {
            console.log(
              "Status updated successfully for content ID:",
              content_id
            );
            const row = checkbox.closest("tr");
            row.style.backgroundColor = isActive ? "#d4f8d4" : "#f8d4d4";

            setTimeout(() => {
              row.style.backgroundColor = originalColor;
            }, 2000);
          } else {
            alert("Failed to update status.");
          }
        })
        .catch((error) => {
          console.error("Error updating status:", error);
        });
    });
  });

  const editButton = document.querySelectorAll(".edit-button");
  editButton.forEach((button) => {
    button.addEventListener("click", function () {
      const contentId = this.getAttribute("data-id");
      window.location.href = `/edit?content_id=${contentId}`;
    });
  });

  $("#search-button").click(function (e) {
    e.preventDefault();
    let searchText = $("#search").val();
    let type = "text";

    $.ajax({
      url: "/search",
      method: "GET",
      data: { type: type, searchText: searchText },
      success: function (response) {
        let tableBody = $("#stats-table tbody");
        tableBody.empty();

        response.result.forEach(function (item, index) {
          let row = `
            <tr>
              <td class="py-2 px-4 whitespace-nowrap">${index + 1}</td>
              <td class="py-2 px-4 whitespace-nowrap">
                ${
                  item.text.length > 10
                    ? item.text.substring(0, 20) + "..."
                    : item.text
                }
              </td>
              <td class="py-2 px-4 whitespace-nowrap">
                <a href="/info/text/${item.short_url}">${item.short_url}</a>
              </td>
              <td class="py-2 px-4 whitespace-nowrap">${item.hit}</td>
              <td class="py-2 px-4 whitespace-nowrap">
                <input type="checkbox" class="toggle-active" data-id="${
                  item.content_id
                }" ${item.is_active ? "checked" : ""} />
              </td>
              <td class="py-2 px-4 whitespace-nowrap">
                ${new Date(item.created_at).toLocaleString("ko-KR", {
                  year: "numeric",
                  month: "2-digit",
                  day: "2-digit",
                  hour: "2-digit",
                  minute: "2-digit",
                  hour12: false,
                })}
              </td>
              <td class="py-2 px-4 whitespace-nowrap">
                ${
                  item.last_hit_at
                    ? new Date(item.last_hit_at).toLocaleString("ko-KR", {
                        year: "numeric",
                        month: "2-digit",
                        day: "2-digit",
                        hour: "2-digit",
                        minute: "2-digit",
                        hour12: false,
                      })
                    : "-"
                }
              </td>
              <td class="py-2 px-4 whitespace-nowrap">
                <button class="edit-button" data-id="${
                  item.content_id
                }">Edit</button>
              </td>
            </tr>
          `;
          tableBody.append(row);
        });
      },
      error: function (err) {
        console.error("Error:", err);
      },
    });
  });
});

function toggleMenu() {
  const menu = document.getElementById("mobileMenu");
  menu.classList.toggle("hidden");
}

//Upload page
function showForm(formId) {
  document.getElementById("linksForm").classList.add("hidden");
  document.getElementById("imagesForm").classList.add("hidden");
  document.getElementById("textForm").classList.add("hidden");

  document.getElementById(formId).classList.remove("hidden");

  if (formId === "imagesForm") {
    dragAndDrop();
  }
}

function toggleTextInput(option) {
  document.getElementById("selectedOption").value = option;

  if (option === "input") {
    document.getElementById("textInputContainer").classList.remove("hidden");
    document.getElementById("textFileContainer").classList.add("hidden");
  } else if (option === "file") {
    document.getElementById("textFileContainer").classList.remove("hidden");
    document.getElementById("textInputContainer").classList.add("hidden");
  }
}

function dragAndDrop() {
  let dropArea = document.querySelector(".drag-area");
  const dragText = document.querySelector(".header");
  let browse = dropArea.querySelector(".browse");
  let fileUploadInput = dropArea.querySelector("#file-upload");
  const previewArea = document.querySelector("#preview");
  let file;
  browse.onclick = () => {
    fileUploadInput.click();
  };
  // when browse
  fileUploadInput.addEventListener("change", function () {
    file = this.files[0];
    dropArea.classList.add("active");
    displayFile(file, previewArea, dropArea);
  });
  // when file is inside drag area
  dropArea.addEventListener("dragover", (event) => {
    event.preventDefault();
    dropArea.classList.add("active");
    dragText.textContent = "Release to Upload";
    // console.log('File is inside the drag area');
  });
  // when file leave the drag area
  dropArea.addEventListener("dragleave", () => {
    dropArea.classList.remove("active");
    // console.log('File left the drag area');
    dragText.textContent = "Drag & Drop";
  });
  // when file is dropped
  dropArea.addEventListener("drop", (event) => {
    event.preventDefault();
    dragText.textContent = "Drag and drop,";
    browse.textContent = "browse again, to select a different image.";
    // console.log("File is dropped in drag area");
    file = event.dataTransfer.files[0]; // grab single file even of user selects multiple files

    let dataTransfer = new DataTransfer();
    dataTransfer.items.add(file);
    fileUploadInput.files = dataTransfer.files;

    displayFile(file, previewArea, dropArea);
  });
}

function displayFile(file, previewArea, dropArea) {
  let fileType = file.type;
  // console.log(fileType);
  let validExtensions = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/webp",
    "image/gif",
  ];
  if (validExtensions.includes(fileType)) {
    // console.log('This is an image file');
    let fileReader = new FileReader();
    fileReader.onload = () => {
      let fileURL = fileReader.result;
      // console.log(fileURL);
      let imgTag = `<img src="${fileURL}" alt="">`;
      previewArea.innerHTML = imgTag;
    };
    fileReader.readAsDataURL(file);
  } else {
    alert("This is not an Image File");
    dropArea.classList.remove("active");
  }
}

//validate the text input
function validateTextInput() {
  const text = document.getElementById("textInput").value.trim();

  if (!text) {
    showPopup("Please enter some text.");
    return false;
  }
  return true;
}

// validate the URL input
function validateUrl() {
  const url = document.getElementById("url").value.trim();
  const urlRegex = /^(https?:\/\/)?([\w\d\-]+\.)+[\w]{2,}(\/.*)?$/i;

  if (!urlRegex.test(url)) {
    showPopup("Invalid URL. Please enter a valid URL.");
    return false;
  }
  return true;
}

//image upload
function validateImageUpload() {
  const fileInput = document.getElementById("file-upload");

  if (!fileInput.files.length) {
    showPopup("Please upload at least one image.");
    return false;
  }

  return true;
}
