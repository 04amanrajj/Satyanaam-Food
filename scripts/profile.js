import {
  baseURL,
  loading,
  navbar,
  page_footer,
  stopLoading,
  tostTopEnd,
} from "../utils/utils.js";
const token = localStorage.getItem("token");
const user = JSON.parse(localStorage.getItem("person"));

async function getUserInfo() {
  try {
    loading();
    const response = await axios.get(`${baseURL}/user`, {
      headers: { Authorization: token },
    });
    stopLoading();
    const userinfo = response.data.message;

    const userDiv = document.querySelector(".osahan-user-media");
    userDiv.innerHTML = `
        <img
          class="mb-3 rounded-pill shadow-sm mt-1"
          src="https://bootdey.com/img/Content/avatar/avatar1.png"
          alt="${userinfo?.name || user?.userName || "Guest"}"
        />
        <div class="osahan-user-media-body">
          <h6 class="mb-2">${userinfo?.name || user?.userName || "Guest"}</h6>
          <p class="mb-1">${userinfo?.phone || user?.userPhone || ""}</p>
          <p>${userinfo?.email || ""}</p>
        </div>`;
  } catch (error) {
    stopLoading();
    const userDiv = document.querySelector(".osahan-user-media");
    userDiv.innerHTML = `
        <img
          class="mb-3 rounded-pill shadow-sm mt-1"
          src="https://bootdey.com/img/Content/avatar/avatar1.png"
          alt="${user?.userName || "Guest"}"
        />
        <div class="osahan-user-media-body">
          <h6 class="mb-2">${user?.userName || "Guest"}</h6>
          <p class="mb-1">${user?.userPhone || ""}</p>
        </div>`;
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

  let statusClass;
  if (orderdetails.status === "Pending") statusClass = "warning";
  else if (orderdetails.status === "Preparing") statusClass = "primary";
  else if (orderdetails.status === "Rejected") statusClass = "danger";
  else if (orderdetails.status === "Cancelled") statusClass = "secondary";
  else statusClass = "success";

  const itemsContainerId = `items-${orderdetails._id}`;
  orderContainer.innerHTML = `
        <div class="gold-members p-4">
          <div class="media">
            <div class="media-body">
              <a>
                <span class="float-right">
                  <span class="badge text-bg-${statusClass}">${
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
                Rs.${orderdetails.totalprice.toFixed(2)}
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
            <td>${ele.quantity} x (${(ele.price * 0.8).toFixed(2)})</td>
            <td>Rs.${(ele.quantity * (ele.price * 0.8)).toFixed(2)}</td>`;
    tbody.appendChild(row);
  });

  // Append the table to the items container
  itemsContainer.appendChild(table);
}

async function getOrders() {
  try {
    loading();
    const response = await axios.post(
      `${baseURL}/order`,
      { userName: user?.userName, userPhone: user?.userPhone },
      {
        headers: { Authorization: token },
      }
    );
    stopLoading();
    const orders = response.data;
    updateOrderTracker(orders[orders.length - 1].status);
    const currentOrderDiv = document.querySelector(".current-order");
    const completedOrderDiv = document.querySelector(".past-order");
    if (orders.length == 0) {
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

      if (
        orderdetails.status.toLowerCase() === "pending" ||
        orderdetails.status.toLowerCase() === "preparing" ||
        orderdetails.status.toLowerCase() === "prepared"
      ) {
        await appendOrder(orderdetails, itemsArray, "current-order");
      } else {
        await appendOrder(orderdetails, itemsArray, "past-order");
      }
    }
  } catch (error) {
    stopLoading();
    console.error(error);
    tostTopEnd.fire({
      icon: "error",
      title: error.response?.data?.message,
    });
  }
}

//
const stages = {
  0: document.querySelector(".track-stage0"),
  1: document.querySelector(".track-stage1"),
  2: document.querySelector(".track-stage2"),
  3: document.querySelector(".track-stage3"),
};

const statusMapping = {
  Pending: [0],
  Preparing: [0, 1],
  Prepared: [0, 1, 2],
  Cancelled: [3],
  Rejected: [3],
};

function updateOrderTracker(status) {
  const activeStages = statusMapping[status];

  if (status === "Cancelled") {
    const cancelledStage = stages[3];
    cancelledStage.classList.remove("tracking-item", "visually-hidden");
    cancelledStage.classList.add("tracking-item");
    return;
  }
  activeStages?.forEach((stageIndex) => {
    const stage = stages[stageIndex];
    stage.classList.add("tracking-item");
    stage.classList.remove("tracking-item-pending");
  });
}

getOrders();
navbar();
page_footer();
