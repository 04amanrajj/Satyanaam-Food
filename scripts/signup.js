import { baseURL } from "../utils/utils.js";

const form = document.getElementById("signupForm");
const errorMessage = document.getElementById("error-message");

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  // Get input values
  const name = document.getElementById("name").value.trim();
  const email = document.getElementById("email").value.trim();
  const role = document.getElementById("role").value;
  const password = document.getElementById("password").value;

  try {
    // Send a POST request to the backend
    const response = await axios.post(`${baseURL}/user/register`, {
      name,
      email,
      role,
      password,
    });
    console.log(response);
    // On success, redirect to the login page
    alert("Signup successful! Please log in.");
    window.location.href = "./login.html";
  } catch (error) {
    // Display error message
    console.log(error);
    const message =
      error.response?.data?.message || "Signup failed. Try again.";
    errorMessage.textContent = message;
    errorMessage.style.display = "block";
  }
});
