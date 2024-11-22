import { baseURL } from "../utils/utils.js";

const text = document.querySelector(".details-container");

async function load() {
  try {
    const urlParams = new URLSearchParams(window.location.search);

    // Convert the URLSearchParams object to a plain object
    const params = {};
    urlParams.forEach((value, key) => {
      params[key] = value;
    });

    const response = await axios.get(`${baseURL}/menu`, { params });
    const data = await response;
    text.textContent = JSON.stringify(data.data.data);
    console.log(data);
  } catch (error) {
    console.log(error.message);
  }
}
// load();
