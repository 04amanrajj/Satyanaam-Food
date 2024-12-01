import {
  baseURL,
  page_footer,
  cover_page,
  navbar,
  tostTopEnd,
  tostBottomEnd,
} from "../utils/utils.js";
let filters = {};
async function restaurent_info() {
  try {
    const response = await axios.get(baseURL);
    const restaurantDetails = document.querySelector(".details-container");

    const restaurent = response.data.data.restaurantDetails;
    restaurantDetails.innerHTML = `
<div>
    <p class="restaurant-features operating-hours"><h3>Restaurant Features</h3></p>
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
    }&key=AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU17R8&zoom=19"allowfullscreen>
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

    document
      .querySelector(".category-row > span")
      .classList.add("categoryselected");
    const categories = document.querySelectorAll(".category-item");
    categories.forEach((element) => {
      element.addEventListener("click", () => {
        categories.forEach((el) => el.classList.remove("categoryselected"));
        element.classList.add("categoryselected");
        restaurent_menu(1, { category: element.textContent });
      });
    });

    // filter row
    const sortbyLTH = document.querySelector(".lowtohigh");
    sortbyLTH.addEventListener("click", () => {
      const sortby = document.querySelector(".sortby");
      sortby.classList.add("selected");
      filters = { ...filters, price: 1 };
      restaurent_menu(1, filters);
    });

    const sortbyHTL = document.querySelector(".hightolow");
    sortbyHTL.addEventListener("click", () => {
      const sortby = document.querySelector(".sortby");
      sortby.classList.add("selected");
      filters = { ...filters, price: -1 };
      restaurent_menu(1, filters);
    });

    const ratingFilter = document.querySelector(".ratingFilter");
    ratingFilter.addEventListener("click", () => {
      ratingFilter.classList.add("selected");
      filters = { ...filters, rating: 4.5 };
      restaurent_menu(1, filters);
    });

    const priceBetween = document.querySelector(".pricebetween");
    priceBetween.addEventListener("click", () => {
      priceBetween.classList.add("selected");
      document.querySelector(".pricelessthan").classList.remove("selected");
      filters = { ...filters, minprice: 150, maxprice: 300 };
      restaurent_menu(1, filters);
    });

    const lessThan = document.querySelector(".pricelessthan");
    lessThan.addEventListener("click", () => {
      lessThan.classList.add("selected");
      delete filters.minprice;
      priceBetween.classList.remove("selected");
      filters = { ...filters, maxprice: 150 };
      restaurent_menu(1, filters);
    });

    const resetFilter = document.querySelector(".reset-item");
    resetFilter.addEventListener("click", () => {
      Object.keys(filters).forEach((key) => {
        delete filters[key];
      });
      resetFilter.style.display = "none";
      const filterBox = document.querySelectorAll(".filter-item");
      filterBox.forEach((el) => el.classList.remove("selected"));
      restaurent_menu();
    });
  } catch (error) {
    tostTopEnd.fire({
      icon: "error",
      title: error.message,
    });
  }
}
async function restaurent_menu(pagenumber = 1, params = {}) {
  try {
    if (Object.keys(filters).length != 0) {
      const resetFilter = document.querySelector(".reset-item");
      resetFilter.style.display = "flex";
    }
    const finalFilters = { ...filters, ...params };
    const response = await axios.get(`${baseURL}/menu?page=${pagenumber}`, {
      params: finalFilters,
    });
    if (response.data.data.length == 0) restaurent_menu();
    const menuItems = response.data.data || [];

    const itemsDiv = document.querySelector(".menu-container");
    itemsDiv.innerHTML = ""; // Clear previous menu items

    menuItems.forEach((element) => {
      const itemDiv = document.createElement("div");
      itemDiv.classList.add("item");
      itemDiv.innerHTML = `
        <div class="item-img">
          <img src="${element.image||"https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRou4_6sFEozO5Cia09uqGK_AvpoHOlNRMteA&s"}" alt="${
        element.name
      }" width="300px" height="300px"/>
        </div>
        <div class="item-details">
          <h3 class="item-name">${element.name} 
            <span class="badge rounded-pill text-bg-success">★ ${
              element.rating
            }</span>
          </h3>
          <p class="item-description" data-bs-toggle="tooltip" data-bs-title="Default tooltip"><abbr title="${
            element.description
          }">${
        element.description
      }</abbr></p><p class="item-og-price" style="color: #999;text-decoration: line-through;">Rs.${element.price.toFixed(
        2
      )} <span class="badge rounded-pill text-bg-warning">20% off</span></p>
          <p class="item-price">Rs.${(element.price * 0.8).toFixed(2)}</p>
        </div>
        <div class="cart-box">
        <button class="btn-glow cart-button fa fa-cart-plus"></button>
        </div>
      `;

      // Elements
      const cartButton = itemDiv.querySelector(".cart-button");

      // Add to Cart Button Click
      cartButton.addEventListener("click", async () => {
        const token = localStorage.getItem("token");
        if (!token) {
          tostTopEnd.fire({
            icon: "info",
            title: "Please log in to add items to the cart",
          });

          setTimeout(
            () => (window.location.href = "../pages/login.html"),
            2000
          );
          return;
        }

        try {
          const response = await axios.post(
            `${baseURL}/cart`,
            { itemid: element._id, quantity: 1 },
            { headers: { Authorization: token } }
          );

          tostTopEnd.fire({
            icon: "success",
            title: response.data.message,
          });
          console.log(response.data);
        } catch (error) {
          console.error("Error adding to cart:", error);
          tostTopEnd.fire({
            icon: "error",
            title: error.response?.data?.message,
          });
        }
      });

      itemsDiv.append(itemDiv);
    });

    console.log("Menu Items:", menuItems);

    if (menuItems.length == 0) {
      const categories = document.querySelectorAll(".category-item");
      categories.forEach((el) => el.classList.remove("categoryselected"));
    }
  } catch (error) {
    console.error(error.message);
    tostTopEnd.fire({
      icon: "error",
      title: error.response?.data?.message,
    });
  }
}

const scrollButton = document.querySelector(".browse-menu-button");
scrollButton.addEventListener("click", () => {
  const nextDiv = document.querySelector(".category-row");
  nextDiv.scrollIntoView({ behavior: "smooth" });
});

const search = document.querySelector("#food-search");
search.addEventListener("input", () => {
  let value = document.querySelector("#food-search").value;
  filters = { ...filters, q: value };
  restaurent_menu(1, filters);
});

// Initialize restaurant info and menu
navbar();
cover_page();
restaurent_info();
restaurent_menu();
page_footer();
