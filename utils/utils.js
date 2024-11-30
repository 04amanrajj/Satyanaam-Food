let baseURL = "http://localhost:4500";
// let baseURL = "https://satyanaam-food-backend.onrender.com";
let currUser = JSON.parse(localStorage.getItem("user"));
let miniprofile;
async function navbar() {
  try {
    const response = await axios.get(baseURL);
    const restaurent = response.data.data.restaurantDetails;
    const navbar = document.querySelector("header");
    navbar.innerHTML = `
    <nav class="navbar navbar-expand-lg navbar-light fixed-top">
        <div class="container-fluid">
          <!-- Navbar Brand -->
          <a class="navbar-brand" href="/index.html"> ${restaurent.name} </a>
          <div class="one-quarter" id="switch">
  <input type="checkbox" class="checkbox" id="chk" />
  <label class="label" for="chk">
      <i class="fas fa-moon"></i>
      <i class="fas fa-sun"></i>
      <div class="ball"></div>
  </label>
</div>
          <!-- Navbar Toggler -->
          <button
            class="navbar-toggler"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#navbarCollapse"
            aria-controls="navbarCollapse"
            aria-expanded="false"
            aria-label="Toggle navigation"
          >
            <span class="navbar-toggler-icon"></span>
          </button>
          <!-- Navbar Links -->
          <div class="collapse navbar-collapse" id="navbarCollapse">
            <ul class="navbar-nav ms-auto">
              <!-- cart -->
              <li class="nav-item">
                <a class="nav-link cart" href="/pages/cart.html">
                  <i class="fa fa-shopping-cart"></i>
                  Cart
                </a>
              </li>
              <!-- Profile Dropdown -->
              <li class="nav-item dropdown profile-dropdown">
                <a
                  class="nav-link dropdown-toggle user-action"
                  id="userDropdown"
                  role="button"
                  data-bs-toggle="dropdown"
                  aria-expanded="false"
                >
                  Profile
                </a>
                <ul
                  class="dropdown-menu dropdown-menu-end"
                  aria-labelledby="userDropdown"
                >
                  <li>
                    <a class="dropdown-item" href="/pages/login.html">
                      <i class="fas fa-sign-in-alt"></i> Login
                    </a>
                  </li>
                  <li>
                    <a
                      class="dropdown-item logout-button"
                      href="/pages/signup.html"
                    >
                      <i class="fas fa-user-plus"></i> Signup
                    </a>
                  </li>
                </ul>
              </li>
            </ul>
          </div>
        </div>
      </nav>`;
    const toggle = document.getElementById("toggle-theme");
    toggle.addEventListener("change", () => {
      document.body.classList.toggle("dark");
    });

    miniprofile = navbar.querySelector(".profile-dropdown");
    if (currUser?.role == "admin") loadAdmin();
    else if (currUser?.role == "user") loadUser();
  } catch (error) {
    console.log(error.message);
  }
}

function loadAdmin() {
  miniprofile.innerHTML = `
          <a
            class="nav-link dropdown-toggle user-action"
            id="userDropdown"
            role="button"
            data-bs-toggle="dropdown"
            aria-expanded="false"
            >
            <img
            src="https://gravatar.com/avatar/42e15be22a62e8d9f468d69f79fcfd51?s=400&d=monsterid&r=x"
            class="avatar rounded-circle"
            alt="Avatar"
            width="30"
          />
          ${currUser.name
            .split(" ")
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
            .join(" ")}
          </a>
          <ul class="dropdown-menu dropdown-menu-end" aria-labelledby="userDropdown">
            <li>
              <a class="dropdown-item" href="/pages/profile.html"><i class="fa fa-user-o"></i> Profile</a>
            </li>
            <li>
              <a class="dropdown-item" href="#"><i class="fa fa-wrench"></i> Admin Panel</a>
            </li>
            <li>
              <a class="dropdown-item logout-button" href="#"><i class="material-icons">&#xE8AC;</i> Logout</a>
            </li>
            </ul>`;
  const logoutButton = document.querySelector(".logout-button");
  logoutButton.addEventListener("click", logout);
}

function loadUser() {
  miniprofile.innerHTML = `
          <a
            class="nav-link dropdown-toggle user-action"
            id="userDropdown"
            role="button"
            data-bs-toggle="dropdown"
            aria-expanded="false"
            >
            <img
            src="https://www.tutorialrepublic.com/examples/images/avatar/2.jpg"
            class="avatar rounded-circle"
            alt="Avatar"
            width="30"
          />
          ${currUser.name
            .split(" ")
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
            .join(" ")}
          </a>
          <ul class="dropdown-menu dropdown-menu-end" aria-labelledby="userDropdown">
            <li>
              <a class="dropdown-item" href="/pages/profile.html"><i class="fa fa-user-o"></i> Profile</a>
            </li>
            <li>
              <a class="dropdown-item logout-button" href="#"><i class="material-icons">&#xE8AC;</i> Logout</a>
            </li>
            </ul>`;
  const logoutButton = document.querySelector(".logout-button");
  logoutButton.addEventListener("click", logout);
}
async function logout() {
  try {
    const token = localStorage.getItem("token");
    const response = await axios.post(
      `${baseURL}/user/logout`,
      {},
      {
        headers: { Authorization: token },
      }
    );
    alert(response?.data?.message);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    location.reload();
  } catch (error) {
    console.log(error.response?.data?.message);
    alert(error.response?.data?.message);
  }
}

async function cover_page() {
  try {
    const response = await axios.get(baseURL);
    const restaurent = response.data.data.restaurantDetails;
    const coverPage = document.querySelector(".cover-page");
    coverPage.innerHTML += `<h1>${restaurent.name}<span class="restaurant-tagline">${restaurent.tagline}</span></h1>`;
  } catch (error) {
    console.log(error.message);
  }
}

async function page_footer() {
  try {
    const response = await axios.get(baseURL);
    const restaurent = response.data.data.restaurantDetails;
    const footer = document.querySelector("footer");
    footer.innerHTML = `
      <div class="container p-4">
        <div class="row mt-4">
          <div class="col-lg-4 col-md-12 mb-4 mb-md-0">
            <h5 class="text-uppercase mb-4">About restaurent</h5>
            <p>
              We serve a variety of cuisines, including North Indian, Punjabi, and fast food, made with authentic flavors.
              Our meals are prepared with a homemade touch to give you the comfort of home-cooked food.
            </p>
            <p>
              Enjoy your favorite dishes delivered straight to your doorstep with our quick home delivery service.
            </p>
            <div class="mt-4">
              <a href="${
                restaurent.socialMedia.facebook || "#"
              }" type="button" class="btn btn-floating btn-light btn-lg"
                ><i class="fab fa-facebook-f"></i
              ></a>
              <a href="${
                restaurent.socialMedia.twitter || "#"
              }" type="button" class="btn btn-floating btn-light btn-lg"
                ><i class="fab fa-twitter"></i
              ></a>
              <a href="${
                restaurent.socialMedia.instagram || "#"
              }" type="button" class="btn btn-floating btn-light btn-lg"
                ><i class="fab fa-instagram"></i
              ></a>
            </div>
          </div>

          <div class="col-lg-4 col-md-6 mb-4 mb-md-0">
            <ul class="fa-ul" style="margin-left: 1.65em">
              <li class="mb-3">
                <span class="fa-li"><i class="fas fa-home"></i></span
                ><span class="ms-2">${restaurent.address.line1}</span>
              </li>
              <li class="mb-3">
                <span class="fa-li"><i class="fas fa-location-dot"></i></span
                ><span class="ms-2">${restaurent.address.city}</span>
              </li>
              <li class="mb-3">
                <span class="fa-li"><i class="fas fa-map"></i></span
                ><span class="ms-2">${restaurent.address.state}</span>
              </li>
              <li class="mb-3">
                <span class="fa-li"><i class="fas fa-envelope"></i></span
                ><span class="ms-2">${restaurent.contact.email}</span>
              </li>
              <li class="mb-3">
                <span class="fa-li"><i class="fas fa-phone"></i></span
                ><span class="ms-2">${restaurent.contact.phone}</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
      <div class="text-center p-3" style="background-color: rgba(0, 0, 0, 0.2)">
        © 2024 Copyright:
        <a class="text-white" href="#" style="text-decoration:none"
          >${restaurent.name}</a
        >
      </div>`;
  } catch (error) {
    console.error(error.message);
  }
}

export { baseURL, page_footer, cover_page, navbar };
