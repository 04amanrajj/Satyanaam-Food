import { baseURL, navbar, page_footer } from "../utils/utils.js";
const token = localStorage.getItem("token");

async function getUserInfo() {
  try {
    const response = await axios.get(`${baseURL}/user`, {
      headers: { Authorization: token },
    });
    const userinfo = response.data.message;

    const userDiv = document.querySelector(".osahan-user-media");
    userDiv.innerHTML = `
        <img
          class="mb-3 rounded-pill shadow-sm mt-1"
          src="https://bootdey.com/img/Content/avatar/avatar1.png"
          alt="${userinfo.name}"
        />
        <div class="osahan-user-media-body">
          <h6 class="mb-2">${userinfo.name}</h6>
          <p class="mb-1">${userinfo.phone || ""}</p>
          <p>${userinfo.email || ""}</p>
        </div>`;
  } catch (error) {
    console.log(error);
  }
}
getUserInfo();

async function appendOrder(orderdetails, itemsArray, containerId) {
  const container = document.getElementById(containerId);
  const orderContainer = document.createElement("div");
  orderContainer.classList.add(
    "bg-white",
    "card",
    "mb-4",
    "order-list",
    "shadow-sm"
  );

  const itemsContainerId = `items-${orderdetails._id}`;
  orderContainer.innerHTML = `
        <div class="gold-members p-4">
          <div class="media">
            <div class="media-body">
              <a>
                <span class="float-right">
                  <span class="badge text-bg-${
                    orderdetails.status == "pending" ? "warning" : "success"
                  }">${
    String(orderdetails.status).charAt(0).toUpperCase() +
    String(orderdetails.status).slice(1)
  }</span>
                </span>
              </a>
              <p class="text-gray mb-3">
                <i class="icofont-list">ORDER #${orderdetails._id}</i><br>
                <i class="icofont-clock-time ml-2"></i> Mon, Nov 12, 6:26 PM
              </p>
              <div id="${itemsContainerId}" class="text-dark items"></div>
              <hr />
              <p class="mb-0 text-black text-primary pt-2">
                <span class="text-black font-weight-bold">${
                  orderdetails.status == "pending"
                    ? "Total Price"
                    : "Total Paid:"
                }</span>
                Rs.${orderdetails.totalprice.toFixed(2)}
              </p>
            </div>
          </div>
        </div>`;
  container.appendChild(orderContainer);

  const itemsContainer = document.getElementById(itemsContainerId);
  itemsArray.forEach((ele) => {
    itemsContainer.innerHTML += `
        <ul class="list-group list-group-horizontal">
          <li class="list-group-item">${ele.quantity}</li>
          <li class="list-group-item">${ele.name}</li>
          <li class="list-group-item">Rs.${(ele.price *= 0.8).toFixed(2)}</li>
        </ul>`;
  });
}

async function getOrders() {
  try {
    const response = await axios.get(`${baseURL}/order`, {
      headers: { Authorization: token },
    });

    const orders = response.data;
    const currentOrderDiv = document.querySelector(".current-order");
    const completedOrderDiv = document.querySelector(".past-order");

    currentOrderDiv.innerHTML = "";
    completedOrderDiv.innerHTML = "";

    for (const orderdetails of orders) {
      let itemsArray = [];
      for (const element of orderdetails.items) {
        const menuItems = await axios.get(`${baseURL}/menu/${element.itemid}`, {
          headers: { Authorization: token },
        });
        itemsArray.push({
          ...menuItems.data.data[0],
          quantity: element.quantity,
        });
      }

      if (orderdetails.status.toLowerCase() === "pending") {
        await appendOrder(orderdetails, itemsArray, "current-order");
      } else {
        await appendOrder(orderdetails, itemsArray, "past-order");
      }
    }

    console.log(orders);
  } catch (error) {
    console.log(error);
  }
}

getOrders();
navbar();
page_footer();
