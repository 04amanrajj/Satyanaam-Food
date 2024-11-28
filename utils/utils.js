let baseURL = "http://localhost:4500";
// let baseURL = "https://satyanaam-food-backend.onrender.com";

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
export { baseURL, page_footer, cover_page };
