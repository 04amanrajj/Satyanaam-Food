import { baseURL } from "../utils/utils.js";

async function restaurent_info() {
  try {
    const response = await axios.get(baseURL);
    const restaurantDetails = document.querySelector(".details-container");

    const restaurent = response.data.data.restaurantDetails;
    restaurantDetails.innerHTML = `
        <img src="${restaurent.banner || "#"}" alt="banner" />
        <h1 class="restaurent-name">${restaurent.name}</h1>
        <p class="restaurent-tagline">${restaurent.tagline}</p>
        <p class="restaurent-features">Pure Veg - ${
          restaurent.features.pureVeg
        }</p>
        <p class="restaurent-features">Authentic Taste - ${
          restaurent.features.authenticTaste
        }</p>
        <p class="restaurent-features">Home Delivery - ${
          restaurent.features.homeDeliveryAvailable
        }</p>
        Operating Hours
        <p class="restaurent-operating-hours">Monday to Friday - ${
          restaurent.operatingHours.mondayToFriday
        }</p>
        <p class="restaurent-operating-hours">Weekends - ${
          restaurent.operatingHours.weekends
        }</p>
        <p class="restaurent-location">${restaurent.address.line1}</p>
        <p class="restaurent-location">${restaurent.address.city}</p>
        <p class="restaurent-location">${restaurent.address.state}</p>
        <p class="restaurent-location">${restaurent.address.zipcode}</p>
        Contacts
        <p class="restaurent-contact">${restaurent.contact.phone}</p>
        <p class="restaurent-contact">${restaurent.contact.email}</p>
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
          <img src="${!element.image || "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRou4_6sFEozO5Cia09uqGK_AvpoHOlNRMteA&s"}" alt="${element.name}" />
        </div>
        <div class="item-details">
          <h3 class="item-name">${element.name}</h3>
          <p class="item-description">${element.description}</p>
          <p class="item-category">${element.category}</p>
        </div>
        <div class="cart-box">
          <button class="cart-button">Add <span class="item-price">Rs.${
            element.price
          }</span></button>
        </div>
      `;

      // Add event listener to the "Add" button
      const cartButton = itemDiv.querySelector(".cart-button");
      cartButton.addEventListener("click", async () => {
        const token = localStorage.getItem("token");

        if (!token) {
          alert("Please log in to add items to the cart.");
          window.location.href = "../pages/login.html"; // Redirect to login page
          return;
        }

        try {
          const response = await axios.post(
            `${baseURL}/cart`,
            { itemid: element._id, quantity: 1 },
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
