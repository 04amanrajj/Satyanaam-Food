import { baseURL, navbar, page_footer, tostTopEnd } from "../utils/utils.js";
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
    tostTopEnd.fire({
      icon: "error",
      title: error.response?.data?.message,
    });
  }
}
getUserInfo();

async function appendOrder(orderdetails, itemsArray, containerId) {
  const container = document.getElementById(containerId);
  const orderContainer = document.createElement("div");
  orderContainer.classList.add("card", "mb-4", "order-list", "shadow-sm");

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
                <i>ORDER #${orderdetails._id}</i><br>
              </p>
              <div id="${itemsContainerId}" class="text-dark items"></div>
              <hr />
              <p class="mb-0 text-black text-primary pt-2">
                <span class="text-black font-weight-bold">${
                  orderdetails.status == "pending"
                    ? "Total Price"
                    : "Total Paid:"
                }</span>
                Rs.${(orderdetails.totalprice * 0.8).toFixed(2)}
              </p>
            </div>
          </div>
        </div>`;
  container.appendChild(orderContainer);

  // Dynamically generate the table for items
  const itemsContainer = document.getElementById(itemsContainerId);
  const table = document.createElement("table");
  table.classList.add("table", "table-striped");

  // Add table headers
  table.innerHTML = `
        <thead>
          <tr>
            <th scope="col">#</th>
            <th scope="col">Name</th>
            <th scope="col">Quantity</th>
            <th scope="col">Price</th>
          </tr>
        </thead>
        <tbody>
        </tbody>`;

  // Populate table rows
  const tbody = table.querySelector("tbody");
  itemsArray.forEach((ele, index) => {
    const row = document.createElement("tr");
    row.innerHTML = `
            <th scope="row">${index + 1}</th>
            <td>${ele.name}</td>
            <td>${ele.quantity}</td>
            <td>Rs.${(ele.price * 0.8).toFixed(2)}</td>`;
    tbody.appendChild(row);
  });

  // Append the table to the items container
  itemsContainer.appendChild(table);
}

async function getOrders() {
  try {
    const response = await axios.get(`${baseURL}/order`, {
      headers: { Authorization: token },
    });

    const orders = response.data;
    const currentOrderDiv = document.querySelector(".current-order");
    const completedOrderDiv = document.querySelector(".past-order");
    if (orders.lenght == 0) {
      currentOrderDiv.innerHTML = `<strong>No orders right now!</strong>`;
      completedOrderDiv.innerHTML = `<strong>No orders right now!</strong>`;
    }
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
    tostTopEnd.fire({
      icon: "error",
      title: error.response?.data?.message,
    });
  }
}

getOrders();
navbar();
page_footer();
