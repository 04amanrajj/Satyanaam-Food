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
          <h6 class="mb-2">${
            userinfo.name
          } <span class="badge text-bg-success">${userinfo.role}</span></h6>
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

async function getOrders(statusFilter = null) {
  try {
    const url = statusFilter
      ? `${baseURL}/admin/order?status=${statusFilter}`
      : `${baseURL}/admin/order`;

    const response = await axios.get(url, {
      headers: { Authorization: token },
    });
    const orders = response.data;

    const userOrders = document.querySelector(".order-container");
    userOrders.innerHTML = ""; // Clear previous orders
    console.log(orders);
    if (orders.length === 0) {
      userOrders.innerHTML = `<strong>No orders for this stage!</strong>`;
      return;
    }

    let pendingOrdersCount = 0;
    for (const order of orders) {
      const userResponse = await axios.post(
        `${baseURL}/admin/user`,
        { userid: order.userID },
        {
          headers: { Authorization: token },
        }
      );
      const user = userResponse.data.message[0];

      let statusClass;
      if (order.status === "Pending") {
        pendingOrdersCount++, (statusClass = "warning");
      } else if (order.status === "Preparing") statusClass = "primary";
      else if (order.status === "Rejected") statusClass = "danger";
      else if (order.status === "Cancelled") statusClass = "secondary";
      else statusClass = "success";

      const orderCard = document.createElement("div");
      orderCard.classList.add("order-card");
      orderCard.innerHTML = `
        <h6><span class="badge text-bg-${statusClass}">${
        order.status
      }</span> Order from ${user.name}</h6>
        <p>ORDER ID: ${order._id}</p>
        <div class="itemtable"></div>
        <div class="order-actions">
        <p class="mb-0 text-black text-primary pt-2">
          <span class="text-black">Total Price </span>
          <strong>Rs.${(order.totalprice * 0.8).toFixed(2)}<strong>
        </p>
          ${
            order.status === "Pending"
              ? `<button class="btn btn-success btn-accept" data-id="${order._id}">Accept</button>
                 <button class="btn btn-danger btn-reject" data-id="${order._id}">Reject</button>`
              : order.status === "Preparing"
              ? `<button class="btn btn-success btn-prepared" data-id="${order._id}">Mark as Prepared</button>
                 <button class="btn btn-danger btn-cancel" data-id="${order._id}">Cancel</button>`
              : order.status === "Prepared"
              ? `<button class="btn btn-success btn-done" data-id="${order._id}">Mark as delivered</button>
                 <button class="btn btn-danger btn-cancel" data-id="${order._id}">Cancel</button>`
              : ``
          }
        </div>
      `;

      const itemsTable = orderCard.querySelector(".itemtable");
      const table = document.createElement("table");
      table.classList.add("table", "table-striped");
      table.innerHTML = `
        <thead>
          <tr>
            <th scope="col">#</th>
            <th scope="col">Name</th>
            <th scope="col">Quantity</th>
            <th scope="col">Price</th>
          </tr>
        </thead>
        <tbody></tbody>
      `;

      const tbody = table.querySelector("tbody");
      order.items.forEach((ele, index) => {
        const row = document.createElement("tr");
        row.innerHTML = `
          <th scope="row">${index + 1}</th>
          <td>${ele.item.name}</td>
          <td>${ele.quantity}</td>
          <td>Rs.${(ele.item.price * 0.8).toFixed(2)}</td>
        `;
        tbody.appendChild(row);
      });
      itemsTable.append(table);

      userOrders.append(orderCard);
    }

    const counter = document.querySelector(".counter");
    if (pendingOrdersCount > 0) {
      counter.classList.remove("visually-hidden");
      counter.textContent = pendingOrdersCount;
    }

    // Add dynamic event listeners for buttons
    document.querySelectorAll(".btn-accept").forEach((btn) => {
      btn.addEventListener("click", async (e) => {
        const orderId = e.target.dataset.id;
        await updateOrderStatus(orderId, "Preparing");
      });
    });

    document.querySelectorAll(".btn-reject").forEach((btn) => {
      btn.addEventListener("click", async (e) => {
        const orderId = e.target.dataset.id;
        await updateOrderStatus(orderId, "Rejected");
      });
    });

    document.querySelectorAll(".btn-prepared").forEach((btn) => {
      btn.addEventListener("click", async (e) => {
        const orderId = e.target.dataset.id;
        await updateOrderStatus(orderId, "Prepared");
      });
    });

    document.querySelectorAll(".btn-done").forEach((btn) => {
      btn.addEventListener("click", async (e) => {
        const orderId = e.target.dataset.id;
        await updateOrderStatus(orderId, "Delivered");
      });
    });

    document.querySelectorAll(".btn-cancel").forEach((btn) => {
      btn.addEventListener("click", async (e) => {
        const orderId = e.target.dataset.id;
        await updateOrderStatus(orderId, "Cancelled");
      });
    });
  } catch (error) {
    const userOrders = document.querySelector(".order-container");
    userOrders.innerHTML = `<strong>No orders for this stage!</strong>`;
    console.error(error);
    tostTopEnd.fire({
      icon: "error",
      title: error.response?.data?.message || "An error occurred",
    });
  }
}

// Tab Navigation
const ordersTab = document.querySelectorAll(".nav-link");
ordersTab.forEach((tab) => {
  tab.addEventListener("click", (e) => {
    e.preventDefault();

    ordersTab.forEach((t) => t.classList.remove("active"));
    tab.classList.add("active");

    const stage = tab.getAttribute("data-stage");
    getOrders(stage);
  });
});

// Helper function to update order status
async function updateOrderStatus(orderId, status) {
  try {
    status.toLowerCase();
    await axios.patch(
      `${baseURL}/admin/order/${orderId}`,
      { status },
      {
        headers: { Authorization: token },
      }
    );
    tostTopEnd.fire({
      icon: "success",
      title: `Order ${status.toLowerCase()}`,
    });
    // Refresh orders after status update

    document.querySelector(".active").classList.remove("active");
    const nextdiv = document.querySelector(`[data-stage="${status}"]`);
    if (nextdiv) nextdiv.classList.add("active");
    else {
      document.querySelector(`[data-stage="Pending"]`).classList.add("active");
    }
    getOrders(status);
  } catch (error) {
    console.error(error);
    tostTopEnd.fire({
      icon: "error",
      title: error.response?.data?.message || "Failed to update order status",
    });
  }
}

// Initial call to fetch all orders
getOrders("Pending");

navbar();
page_footer();