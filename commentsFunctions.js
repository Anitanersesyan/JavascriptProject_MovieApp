//* COMMENTS STORAGE

export let allComments = [];

//Add a new comment to storage
export function addCommentToStorage(movieId, title, userName, commentText) {
  const newComment = {
    movieId,
    title,
    userName,
    commentText,
    date: new Date().toLocaleDateString(), //Add current date
  };

  allComments.push(newComment);

  saveComments();
}

//Save the allComments array to local storage of the browser
function saveComments() {
  //Convert allComments, because local storage accepts only strings
  localStorage.setItem("allComments", JSON.stringify(allComments));
}

function loadComments() {
  // Get the stored comments from local storage
  const storedComments = localStorage.getItem("allComments");
  // If comments are found, parse the string and update the allComments array
  if (storedComments) {
    allComments = JSON.parse(storedComments);
  }
}

loadComments();

// To clear localStorage
//! localStorage.clear()
