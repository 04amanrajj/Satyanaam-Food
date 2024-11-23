import { baseURL } from "../utils/utils.js";
const form = document.getElementById("loginForm");
const errorMessage = document.getElementById("error-message");

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  // Get input values
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();

  // Disable submit button and show loading state
  const submitButton = form.querySelector("button[type='submit']");
  submitButton.disabled = true;
  submitButton.textContent = "Logging in...";

  try {
    const response = await axios.post(`${baseURL}/user/login`, {
      email,
      password,
    });

    // Store token and user data
    localStorage.setItem("token", response.data.token);
    localStorage.setItem("user", JSON.stringify(response.data.user));

    // Redirect to homepage
    window.location.href = "../index.html";
  } catch (error) {
    console.error(error);
    errorMessage.textContent =
      error.response?.data?.message || "Something went wrong. Please try again.";
  } finally {
    // Re-enable the submit button
    submitButton.disabled = false;
    submitButton.textContent = "Login";
  }
});
