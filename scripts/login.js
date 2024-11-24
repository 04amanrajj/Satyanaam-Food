import { baseURL } from "../utils/utils.js";
const form = document.getElementById("loginForm");
const errorMessage = document.getElementById("error-message");

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  // Get input values
  const input = document.getElementById("emailOrPhone").value.trim();
  const password = document.getElementById("password").value.trim();

  // Regular expressions for email and phone number
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; // Basic email regex
  const phoneRegex = /^\d{10}$/; // Matches exactly 10-digit phone numbers

  let requestData = {};

  if (emailRegex.test(input)) {
    requestData = { email: input, password };
  } else if (phoneRegex.test(input)) {
    requestData = { phone: input, password };
  } else {
    errorMessage.textContent = "Please enter a valid email or phone number.";
    return;
  }

  // Disable submit button and show loading state
  const submitButton = form.querySelector("button[type='submit']");
  submitButton.disabled = true;
  submitButton.textContent = "Logging in...";

  try {
    const response = await axios.post(`${baseURL}/user/login`, requestData);

    // Store token and user data
    localStorage.setItem("token", response.data.token);
    localStorage.setItem("user", JSON.stringify(response.data.user));

    // Redirect to homepage
    window.location.href = "../index.html";
  } catch (error) {
    console.error(error);
    errorMessage.textContent =
      error.response?.data?.message ||
      "Something went wrong. Please try again.";
  } finally {
    // Re-enable the submit button
    submitButton.disabled = false;
    submitButton.textContent = "Login";
  }
});
