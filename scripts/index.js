import { baseURL } from "../utils/utils.js";

async function restaurent_info() {
  try {
    const response = await axios.get(baseURL);
    const restaurantDetails = document.querySelector(".details-container");

    const restaurent = response.data.data.restaurantDetails;
    restaurantDetails.innerHTML = `
<div>
    <p class="restaurant-tagline">${restaurent.tagline}</p>
  <div class="features">
    <div class="feature-item">
      <p class="restaurant-features">Pure Veg</p>
      <p class="feature-value">${restaurent.features.pureVeg}</p>
    </div>
    <div class="feature-item">
      <p class="restaurant-features">Authentic Taste</p>
      <p class="feature-value">${restaurent.features.authenticTaste}</p>
    </div>
    <div class="feature-item">
      <p class="restaurant-features">Home Delivery</p>
      <p class="feature-value">${
        restaurent.features.homeDeliveryAvailable ? "Available" : "Unavailable"
      }</p>
    </div>
  </div>

  <div class="operating-hours">
    <h3>Operating Hours</h3>
    <p class="restaurant-operating-hours">Monday to Friday - ${
      restaurent.operatingHours.mondayToFriday
    }</p>
    <p class="restaurant-operating-hours">Weekends - ${
      restaurent.operatingHours.weekends
    }</p>
  </div>

  <div class="contacts">
    <h3>Contacts</h3>
    <p class="restaurant-contact">${restaurent.contact.phone}</p>
    <p class="restaurant-contact">${restaurent.contact.email}</p>
  </div>
</div>
<div>
  <div class="map-container">
    <div id="embed-map-display">
      <iframe
        frameborder="0"
        src="https://www.google.com/maps/embed/v1/place?q=${
          restaurent.address.line1
        },${restaurent.address.city},${restaurent.address.state},${
      restaurent.address.zipcode
    }&key=AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU17R8&zoom=15"allowfullscreen>
      </iframe>
    </div>
  </div>
</div>
`;

    // category row
    response.data.data.menuCategories.unshift("All");
    const menuCategories = response.data.data.menuCategories || [];
    const categoryRow = document.querySelector(".category-row");
    categoryRow.innerHTML = menuCategories
      .map((category) => `<span class="category-item">${category}</span>`)
      .join(" ");

    const categories = document.querySelectorAll(".category-item");
    categories.forEach((element) => {
      element.addEventListener("click", () => {
        categories.forEach((el) => el.classList.remove("selected"));
        element.classList.add("selected");
        restaurent_menu(element.textContent);
      });
    });
  } catch (error) {
    console.error(error.message);
  }
}

async function restaurent_menu(name) {
  try {
    const response = await axios.get(`${baseURL}/menu`, {
      params: { category: name || null },
    });
    if (response.data.data.length == 0) restaurent_menu();
    const menuItems = response.data.data || [];

    const itemsDiv = document.querySelector(".menu-container");
    itemsDiv.innerHTML = ""; // Clear previous menu items

    menuItems.forEach((element) => {
      // Create menu item container
      const itemDiv = document.createElement("div");
      itemDiv.classList.add("item");

      // Add item content
      itemDiv.innerHTML = `
        <div class="item-img">
          <img src="${
            !element.image ||
            "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRou4_6sFEozO5Cia09uqGK_AvpoHOlNRMteA&s"
          }" alt="${element.name}" />
        </div>
        <div class="item-details">
          <h3 class="item-name">${
            element.name
          } <span class="badge rounded-pill text-bg-success">★ ${
        element.rating
      }</span></h3>
          <p class="item-description">${element.description}</p>
          <p class="item-category">${element.category}</p>
          <p class="item-price-old">Price Rs.${
            (element.price).toFixed(2)
          } <span class="badge rounded-pill text-bg-primary">-20%</span></p>
          <p class="item-price">Rs.${((element.price -= element.price * 0.2).toFixed(2))}</p>
        </div>
        <div class="cart-box">
            <div class="quantity-selector qty mt-5">
                <button class="minus bg-dark decrease" class="quantity-button">-</button>
                <input type="number" name="quantity" class="count" id="quantity" value="1" min="1" />
                <button class="increase plus bg-dark quantity-button">+</button>
            </div>
            <button class="cart-button">Add to Cart</button>
        </div>
      `;
      itemDiv.querySelector(".increase").addEventListener("click", () => {
        const quantityInput = itemDiv.querySelector(".quantity-selector input");
        quantityInput.value = parseInt(quantityInput.value) + 1;
      });

      itemDiv.querySelector(".decrease").addEventListener("click", () => {
        const quantityInput = itemDiv.querySelector(".quantity-selector input");
        if (quantityInput.value > 1) {
          quantityInput.value = parseInt(quantityInput.value) - 1;
        }
      });

      // Add event listener to the "Add" button
      const cartButton = itemDiv.querySelector(".cart-button");
      cartButton.addEventListener("click", async () => {
        const token = localStorage.getItem("token");

        if (!token) {
          alert("Please log in to add items to the cart.");
          window.location.href = "../pages/login.html"; // Redirect to login page
          return;
        }
        const quantity = itemDiv.querySelector(
          ".quantity-selector input"
        ).value;
        console.log(quantity);
        try {
          const response = await axios.post(
            `${baseURL}/cart`,
            { itemid: element._id, quantity },
            { headers: { Authorization: token } } // Pass token in the header
          );
          alert("Item added to cart!");
          console.log(response.data);
        } catch (error) {
          console.error(error.message);
          alert(
            error.response?.data?.message ||
              "Failed to add item to cart. Try again."
          );
        }
      });

      // Append the item to the container
      itemsDiv.append(itemDiv);
    });

    console.log("Menu Items:", menuItems);
  } catch (error) {
    console.error("Error fetching menu:", error.message);
  }
}

// Initialize restaurant info and menu
restaurent_info();
restaurent_menu();

const scrollButton = document.querySelector(".browse-menu-button");
scrollButton.addEventListener("click", () => {
  const nextDiv = document.querySelector(".category-row");
  nextDiv.scrollIntoView({ behavior: "smooth" });
});
