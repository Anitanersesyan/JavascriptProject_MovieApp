import { allComments, addCommentToStorage } from "./commentsFunctions.js";

/* FETCH MOVIES */ // UPDATED JS3 WK2 (switched to async/await approach)
let movies = null;
const fetchMoviesData = async () => {
  try {
    const response = await fetch(
      "https://raw.githubusercontent.com/Anitanersesyan/Anitanersesyan.github.io/main/movieApp_data/movies.json"
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const moviesData = await response.json();
    movies = moviesData;
    initializeMoviesFunctions();
  } catch (error) {
    console.error("Error loading movies:", error);
    alert("Error loading movies. Please try again later.");
  }
};

/* FILTERS */
// Filters movies by genre
const filterMoviesByGenre = (genre) => {
  const filteredMovies = movies.filter((movie) => movie.genres.includes(genre));
  displayMoviesGrid(filteredMovies);
};

// Genre filters
const setupGenreFilters = () => {
  const genreFiltersContainer = document.getElementById("genreFilters");
  const allGenres = [...new Set(movies.flatMap((movie) => movie.genres))]; // Get unique genres

  // Sorts genres alphabetically
  allGenres.sort((a, b) => a.localeCompare(b));

  allGenres.forEach((genre) => {
    const button = document.createElement("button");
    button.innerText = genre;
    button.onclick = () => filterMoviesByGenre(genre);
    genreFiltersContainer.appendChild(button);
  });
};

// Displays trending movies
const displayTrendingMovies = () => {
  if (!movies) return; // Safety check
  const trendingMovies = movies.filter((movie) => movie.trending);
  if (trendingMovies.length === 0) {
    alert("No trending movies found!");
    return;
  }
  displayMoviesGrid(trendingMovies);
};

// Displays all the movies
const displayAllMovies = () => {
  displayMoviesGrid(movies);
};

// Initialize genre filters - UPDATED JS3 WK2
const initializeMoviesFunctions = () => {
  setupGenreFilters();
  displayMoviesGrid();
  setupDropdown();

  // Event listeners
  document
    .getElementById("allMovies")
    .addEventListener("click", displayAllMovies);
  document
    .getElementById("trendingMovies")
    .addEventListener("click", displayTrendingMovies);

  // Search functionality - UPDATED JS3 WK2
  document.querySelector(".searchText").addEventListener("input", (event) => {
    const searchTerm = event.target.value.trim().toLowerCase();
    if (!searchTerm) {
      displayMoviesGrid(movies);
      return;
    }

    const filteredMovies = movies.filter((movie) => {
      if (movie.title.toLowerCase().includes(searchTerm)) return true;
      if (movie.director.toLowerCase().includes(searchTerm)) return true;
      if (movie.movieYear.toString().includes(searchTerm)) return true;
      if (
        movie.actors &&
        movie.actors.some((actor) => actor.toLowerCase().includes(searchTerm))
      )
        return true;
      if (
        movie.genres &&
        movie.genres.some((genre) => genre.toLowerCase().includes(searchTerm))
      )
        return true;
      return false;
    });

    displayMoviesGrid(filteredMovies);
  });
};

/* DROPDOWN MENU*/
const setupDropdown = () => {
  let dropdownButton = document.querySelector(".dropdownContent");
  let dropdownMenu = document.querySelector(".dropdownMenu");

  dropdownButton.addEventListener("click", () => {
    if (dropdownMenu.style.display === "block") {
      dropdownMenu.style.display = "none"; // Hide the menu
    } else {
      dropdownMenu.style.display = "block"; // Show the menu
    }
  });

  // If the user clicks anywhere outside the dropdown, close the dropdown
  document.addEventListener("click", function (event) {
    if (
      !dropdownButton.contains(event.target) &&
      !dropdownMenu.contains(event.target)
    ) {
      dropdownMenu.style.display = "none";
    }
  });
};

/* MOVIES GRID */
const displayMoviesGrid = (searchedMovies = movies) => {
  const cardContainer = document.getElementById("card-container");
  cardContainer.innerHTML = ""; // Clear the current grid

  // Calculate grid dimensions based on all movies
  const minX = Math.min(...movies.map((m) => m.coordinates.x));
  const maxX = Math.max(...movies.map((m) => m.coordinates.x));
  const minY = Math.min(...movies.map((m) => m.coordinates.y));
  const maxY = Math.max(...movies.map((m) => m.coordinates.y));

  // Set grid size
  const gridWidth = maxX - minX + 1;
  const gridHeight = maxY - minY + 1;

  // Apply CSS Grid to the cardContainer
  cardContainer.style.gridTemplateColumns = `repeat(${gridWidth}, 350px)`;
  cardContainer.style.gridTemplateRows = `repeat(${gridHeight}, 600px)`;

  // Calculate centered positions for filtered/searched movies
  if (searchedMovies.length !== movies.length) {
    // Calculate the center of the grid
    const centerX = Math.floor(gridWidth / 2);
    const centerY = Math.floor(gridHeight / 2);

    // Reposition the filtered/searched movies around the center
    searchedMovies.forEach((movie, index) => {
      const card = document.createElement("div");
      card.className = "card";
      card.innerHTML = `<h2>${movie.title}</h2>
                <p>${movie.description}</p>
                <img src="${movie.poster_url}" alt="${movie.title}">`;

      // Calculate new position relative to the center
      const offsetX = index % 4; // Adjust for a 4-column layout
      const offsetY = Math.floor(index / 4); // Adjust for a 4-row layout

      const gridColumn = centerX - 2 + offsetX; // Center horizontally (subtract 2 to center 4 columns)
      const gridRow = centerY - 1 + offsetY; // Center vertically

      // Assign calculated values to the CSS Grid
      card.style.gridColumn = gridColumn;
      card.style.gridRow = gridRow;

      // Click Listener
      card.addEventListener("click", () => toggleDetails(movie));
      cardContainer.appendChild(card);
    });
  } else {
    // Display all movies in their original positions
    movies.forEach((movie) => {
      const card = document.createElement("div");
      card.className = "card";
      card.innerHTML = `<h2>${movie.title}</h2>
                <p>${movie.description}</p>
                <img src="${movie.poster_url}" alt="${movie.title}">`;

      // Calculate card position on the Grid
      const gridColumn = movie.coordinates.x - minX + 1;
      const gridRow = movie.coordinates.y - minY + 1;

      // Assign calculated values to the CSS Grid
      card.style.gridColumn = gridColumn;
      card.style.gridRow = gridRow;

      // Click Listener
      card.addEventListener("click", () => toggleDetails(movie));
      cardContainer.appendChild(card);
    });
  }
};

/* SCREEN DRAG FUNCTIONS*/
const screenDrag = () => {
  const container = document.getElementById("card-container");
  let isDragging = false;
  let startX, startY; // Position of grab
  let scrollLeft, scrollTop; // How much scrolled

  container.addEventListener("mousedown", (dragEvent) => {
    dragEvent.preventDefault(); // Prevent from selecting text and images  while dragging
    isDragging = true;
    startX = dragEvent.pageX - container.offsetLeft; // Drag start position
    startY = dragEvent.pageY - container.offsetTop;
    scrollLeft = container.scrollLeft; // Current scroll position of the container
    scrollTop = container.scrollTop;
  });

  container.addEventListener("mouseup", () => (isDragging = false)); //Stop dragging if mouse is released
  container.addEventListener("mouseleave", () => (isDragging = false));

  container.addEventListener("mousemove", (dragEvent) => {
    if (!isDragging) return;
    const x = dragEvent.pageX - container.offsetLeft;
    const y = dragEvent.pageY - container.offsetTop;
    const walkX = (x - startX) * 1.5; // Dragging speed + Multiplier
    const walkY = (y - startY) * 1.5; // Dragging speed + Multiplier
    container.scrollLeft = scrollLeft - walkX;
    container.scrollTop = scrollTop - walkY;
  });
};

//! Grouped all the Details functions under movieDetailsPanel()
const movieDetailsPanel = () => {
  const movieDetails = document.getElementById("movie-details");

  /* SLIDING WINDOW */
  const toggleDetails = (movie) => {
    if (movieDetails.classList.contains("show")) {
      closeDetails(); // Close if already open
    } else {
      openDetails(movie, movie.id);
    }
  };

  // Open the sliding window
  const openDetails = (movie, currentMovieId) => {
    movieDetails.classList.add("show");
    document.getElementById("details-title").textContent = movie.title;
    document.getElementById("details-year").textContent = `${movie.movieYear}`;
    document.getElementById(
      "details-genre"
    ).innerHTML = `<span class="bold">Genre:</span> ${
      movie.genres.join(", ") || ""
    }`;
    document.getElementById(
      "details-director"
    ).innerHTML = `<span class="bold">Director:</span> ${movie.director}`;
    document.getElementById(
      "details-cast"
    ).innerHTML = `<span class="bold">Cast:</span> ${
      movie.actors?.join(", ") || ""
    }`;
    document.getElementById("details-description").textContent =
      movie.description;
    document.getElementById("details-poster").src = movie.poster_url;

    //* COMMENTS SECTION
    // Check if comments section already exists, if not create a new one
    let commentsSection = document.getElementById("comments-section");
    if (!commentsSection) {
      commentsSection = document.createElement("div");
      commentsSection.id = "comments-section";
      movieDetails.append(commentsSection);
    }
    // Define the HTML structure for the comments section
    commentsSection.innerHTML = ` <h3 id="comments-title">Leave a comment!</h3>
      <form class="comment-form">
    <input type="text" placeholder="Your name" required>
    <textarea placeholder="Your comment" required></textarea>
    <button type="submit">Post Comment</button>
  </form>
  <div class="comment-display" id="comment-display"></div>`;

    // Get references to the comment form, input fields, and comment display elements
    const commentForm = commentsSection.querySelector(".comment-form");
    const nameInput = commentForm.querySelector('input[type="text"]');
    const commentInput = commentForm.querySelector("textarea");
    const commentDisplay = commentsSection.querySelector("#comment-display");

    // Function to display comments for a given movie ID
    const displayComments = (movieId) => {
      // Filter comments by movie ID and create HTML structure for comments
      const comments = allComments.filter(
        (comment) => comment.movieId === movieId
      );
      const commentHTML = comments
        .map(
          (comment) => `
      <div class="comment">
        <h4>${comment.userName}</h4>
        <p>${comment.commentText}</p>
        <p>${comment.date}</p>
      </div>
    `
        )
        .join("");
      // Update the comment display element with the generated HTML
      commentDisplay.innerHTML = commentHTML;
    };

    // Function to add a new comment
    commentForm.addEventListener("submit", (e) => {
      e.preventDefault();
      // Get the user's name and comment from the input fields
      const name = nameInput.value.trim();
      const comment = commentInput.value.trim();
      if (name && comment) {
        // Add the comment to storage
        addCommentToStorage(movie.id, movie.title, name, comment);
        nameInput.value = "";
        commentInput.value = "";
        // Update the comment display with the new comment
        displayComments(currentMovieId);
      }
    });

    movieDetails.append(commentsSection);

    // Display comments for the current movie ID
    displayComments(currentMovieId);
  };

  /* Close the details window */
  const closeDetails = () => {
    movieDetails.classList.remove("show");
  };

  /* Close details when clicking outside the movie details panel */
  document.addEventListener("click", (event) => {
    const clickedInsideDetails = movieDetails.contains(event.target); // Did the user click inside the details?
    const clickedOnCard = event.target.closest(".card"); // Did the user click a movie card?

    /* If the user clicked outside both, close the details */
    if (!clickedInsideDetails && !clickedOnCard) {
      closeDetails();
    }
  });

  // Return for the movieDetailsPanel()
  return {
    toggleDetails,
    closeDetails,
  };
};

/* STAR RATING */
document.addEventListener("DOMContentLoaded", () => {
  let stars = document.querySelectorAll(".star"); //Get all the star elements
  let selectedRating = 0; // Keeps track of the selected rating

  //Loops through each star to update its appearance based on the selected rating
  const updateStarHighlight = (rating) => {
    stars.forEach((star) => {
      if (star.dataset.value <= rating) {
        star.classList.add("active"); //highlights it
      } else {
        star.classList.remove("active"); // Unhighlight
      }
    });
  };
  stars.forEach((star) => {
    star.addEventListener("click", () => {
      //When a star is clicked, get its rating value
      selectedRating = event.target.dataset.value;
      updateStarHighlight(selectedRating);
    });
  });

  //Reset the star rating for a new movie card
  let cardContainer = document.getElementById("card-container");
  cardContainer.addEventListener("click", (event) => {
    let clickedCard = event.target.closest(".card"); //Check if the clicked element is inside a movie card
    if (clickedCard) {
      selectedRating = 0;
      updateStarHighlight(selectedRating); //Clear the stars’ highlights
    }
  });
});

// In global scope, extracting the functions, assigning them to variables
const { toggleDetails, closeDetails } = movieDetailsPanel();
window.closeDetails = closeDetails;

/* Timers (UPDATED JS2 WK3) */

//Page Timer
let pageTimer = 0;
const pageTimerInterval = setInterval(() => {
  pageTimer++;
  const minutes = Math.floor(pageTimer / 60);
  const seconds = pageTimer % 60;
  document.getElementById("page-time-time").textContent = `${String(
    minutes
  ).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`; // Ensures the minutes and seconds are always displayed as two digits
}, 1000);

// Pick a Movie Timer
let pickTimerSeconds = 0;
let pickTimerInterval;

let timerStatus = "stopped"; // Tracks timer status: 'stopped', 'running', 'paused'

document.getElementById("start-pick-timer").addEventListener("click", () => {
  const timerButton = document.getElementById("start-pick-timer");

  if (timerStatus === "stopped") {
    const minutes = parseInt(
      document.getElementById("pick-a-movie-time-input").value
    );
    if (isNaN(minutes) || minutes < 1) {
      alert("Please enter a valid number of minutes");
      return;
    }

    pickTimerSeconds = minutes * 60;
    clearInterval(pickTimerInterval);

    pickTimerInterval = setInterval(() => {
      if (pickTimerSeconds > 0) {
        pickTimerSeconds--;
        updatePickTimerDisplay();
      } else {
        clearInterval(pickTimerInterval);
        alert("Time is up! Please pick a movie now.");
        document.getElementById("pick-a-movie-time").textContent = "00:00";
        timerStatus = "stopped";
        timerButton.textContent = "Start";
      }
    }, 1000);

    timerButton.textContent = "Pause";
    timerStatus = "running";
  } else if (timerStatus === "running") {
    clearInterval(pickTimerInterval);
    timerButton.textContent = "Reset";
    timerStatus = "paused";
  } else if (timerStatus === "paused") {
    clearInterval(pickTimerInterval);
    pickTimerSeconds = 0;
    updatePickTimerDisplay();
    timerButton.textContent = "Start";
    timerStatus = "stopped";
  }
});

// Updates the display
const updatePickTimerDisplay = () => {
  const minutesLeft = Math.floor(pickTimerSeconds / 60);
  const secondsLeft = pickTimerSeconds % 60;
  document.getElementById("pick-a-movie-time").textContent = `${String(
    minutesLeft
  ).padStart(2, "0")}:${String(secondsLeft).padStart(2, "0")}`;
};

fetchMoviesData(); // UPDATED JS3 WK1
