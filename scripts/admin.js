import {
  baseURL,
  loading,
  navbar,
  page_footer,
  stopLoading,
  tostTopEnd,
} from "../utils/utils.js";
const token = localStorage.getItem("token");

async function getUserInfo() {
  try {
    loading();
    const response = await axios.get(`${baseURL}/user`, {
      headers: { Authorization: token },
    });
    const userinfo = response.data.message;
    stopLoading();

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
    stopLoading();
    console.error(error);
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

    loading();
    const response = await axios.get(url, {
      headers: { Authorization: token },
    });
    stopLoading();
    const orders = response.data;

    const userOrders = document.querySelector(".order-container");
    userOrders.innerHTML = ""; // Clear previous orders
    if (orders.length === 0) {
      userOrders.innerHTML = `<strong>No orders for this stage!</strong>`;
      return;
    }

    let pendingOrdersCount = 0;
    for (const order of orders) {
      await axios.post(
        `${baseURL}/admin/user`,
        { userid: order.userID },
        {
          headers: { Authorization: token },
        }
      );
      let statusClass;
      let grammerfix = "for";
      if (order.status === "Pending") {
        pendingOrdersCount++, (statusClass = "warning");
        grammerfix = "from";
      } else if (order.status === "Preparing") statusClass = "primary";
      else if (order.status === "Rejected") statusClass = "danger";
      else if (order.status === "Cancelled") statusClass = "secondary";
      else statusClass = "success";

      const orderCard = document.createElement("div");
      orderCard.classList.add("order-card");
      orderCard.innerHTML = `
        <h6><span class="badge text-bg-${statusClass}">${
        order.status
      }</span> Order ${grammerfix} ${order.userName || "Unknown User"}</h6>
      <p>ORDER ID: ${order._id}</p>
      <p class="d-inline-flex gap-1">
        <button class="btn btn-primary" type="button" data-bs-toggle="collapse" data-bs-target="#collapseExample" aria-expanded="false" aria-controls="collapseExample">
        More details
        </button>
      </p>
      <div class="collapse" id="collapseExample">
      <div class="card card-body">
            <p>Address: ${order.userAddress}</p>
            ${order.userMSG ? `<p>Custom message: ${order.userMSG}</p>` : ""}
            <a href="tel:+91 ${order.userPhone}">
              <button class="btn btn-success">Call ${order.userPhone}</button>
            </a>
          </div>
        </div>
        <div class="itemtable"></div>
        <div class="order-actions">
        <p class="mb-0 text-black text-primary pt-2">
          <span class="text-black">Total Price </span>
          <strong>Rs.${order.totalprice.toFixed(2)}<strong>
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
      userOrders.innerHTML += "<hr>";
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
    stopLoading();
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
const orderPanel = document.querySelector(".order-ul");
const ordersTab = orderPanel.querySelectorAll(".nav-link");
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
    loading();
    await axios.patch(
      `${baseURL}/admin/order/${orderId}`,
      { status },
      {
        headers: { Authorization: token },
      }
    );
    stopLoading();
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
    stopLoading();
    console.error(error);
    tostTopEnd.fire({
      icon: "error",
      title: error.response?.data?.message || "Failed to update order status",
    });
  }
}

async function getItems(filters = {}) {
  try {
    loading();
    const response = await axios.get(`${baseURL}/menu?q=${filters}`);
    const itemDiv = document.querySelector(".items-container");
    const items = response.data.data;
    stopLoading();
    // Clear existing items (if any)
    itemDiv.innerHTML = `<h5>items [${items.length}]</h5>`;

    items.forEach((element) => {
      const itemcard = document.createElement("div");
      itemcard.classList.add("item");
      itemcard.innerHTML += `
      <div class="item-description">
        <h3 class="item-name">${element.name}</h3>
        <p class="item-og-price">
          __Rs.${element.price.toFixed(2)} on 20% off -
        </p>
        <p class="item-price">
          Rs.${(element.price * 0.8).toFixed(2)}
        </p>
      </div>
      <div class="cart-box">
        <p>Available - ${element.available ? "Yes" : "No"}</p>
        <button 
          class="toggle-button fa fa-toggle-${
            element.available ? "on" : "off"
          }">
        </button>
        <button 
          type="button"
          class="btn btn-primary edit-button fa fa-edit"
          data-bs-toggle="modal"
          data-bs-target="#editModal">
        </button>
        <button 
          class="btn btn-danger remove-button fa fa-trash"
        </button>
      </div>
    `;

      const toggleButton = itemcard.querySelector(".toggle-button");
      toggleButton.addEventListener("click", (e) => {
        toggleItemAvailability(element._id, !element.available, e.target);
      });
      const editButton = itemcard.querySelector(".edit-button");
      editButton.addEventListener("click", (e) => {
        editItem(element);
        // toggleItemAvailability(element._id,)
      });
      const removeButton = itemcard.querySelector(".remove-button");
      removeButton.addEventListener("click", (e) => {
        removeItem(element._id);
        // toggleItemAvailability(element._id,)
      });
      itemDiv.appendChild(itemcard);
      const hr = document.createElement("hr");
      itemDiv.appendChild(hr);
    });
  } catch (error) {
    stopLoading();
    console.error(error);
    tostTopEnd.fire({
      icon: "error",
      title: error.response?.data?.message || "Failed to fetch menu items",
    });
  }
}

document.querySelector(".add-item").addEventListener("click", (e) => {
  console.log(e.target);
  addItem();
});

async function toggleItemAvailability(itemId, newStatus, button) {
  try {
    await axios.patch(
      `${baseURL}/admin/menu/${itemId}`,
      {
        available: newStatus,
      },
      { headers: { Authorization: token } }
    );

    button.classList.remove(`fa-toggle-${newStatus ? "on" : "off"}`);
    getItems();
  } catch (error) {
    console.error("Failed to toggle availability:", error);
    tostTopEnd.fire({
      icon: "error",
      title: error.response?.data?.message || "Failed to toggle availability",
    });
  }
}
async function addItem() {
  const modal = document.querySelector(".modal-body");
  let categories = await axios.get(baseURL);
  categories = categories.data.data.menuCategories;

  modal.innerHTML = `
    <input class="name" type="text" placeholder="Dish name" />
    <input class="description" type="text" placeholder="dish ingrediants" />
    <input class="image" type="text" placeholder="www.image/path/example.jpg" />
    <input class="rating" type="number" placeholder="item-rating 1-5" min="0" max="5"/>
    <input class="price" type="number" placeholder="99" />
    <select class="item-category text-black">
      ${categories
        .map(
          (category) =>
            `<option class="text-black" value="${category}">${category}</option>`
        )
        .join("")}
    </select>
  `;

  const save = document.querySelector(".edit-confirm");
  save.addEventListener("click", async () => {
    const payload = {
      name: modal.querySelector(".name").value.trim(),
      description: modal.querySelector(".description").value.trim(),
      image: modal.querySelector(".image").value.trim(),
      price: modal.querySelector(".price").value.trim(),
      rating: modal.querySelector(".rating").value.trim(),
      category: modal.querySelector(".item-category").value.trim(),
    };

    // Basic Validation
    const isValid = [
      payload.name,
      payload.description,
      payload.image,
      payload.price && !isNaN(payload.price),
      payload.rating && !isNaN(payload.rating),
      payload.category,
    ].every(Boolean);

    if (!isValid) {
      alert("Please fill all fields correctly.");
      return;
    }
    try {
      loading();
      const response = await axios.post(`${baseURL}/admin/menu`, payload, {
        headers: { Authorization: token },
      });
      stopLoading();
      console.log(response);
      tostTopEnd.fire({
        icon: "success",
        title: response?.data?.message || "Dish Added",
      });
      getItems();
    } catch (error) {
      stopLoading();
      console.error(error);
      tostTopEnd.fire({
        icon: "error",
        title: error.response?.data?.message || "Failed to Add",
      });
    }
  });
}
async function editItem(item) {
  const modal = document.querySelector(".modal-body");
  let categories = await axios.get(baseURL);
  categories = categories.data.data.menuCategories;

  modal.innerHTML = `
    <input class="name" type="text" placeholder="${item.name}" />
    <input class="description" type="text" placeholder="${item.description}" />
    <input class="image" type="text" placeholder="${item.image}" />
    <input class="price" type="number" placeholder="${item.price}" />
    <select class="item-category text-black">
      ${categories
        .map(
          (category) =>
            `<option class="text-black" value="${category}" ${
              category === item.category ? "selected" : ""
            }>${category}</option>`
        )
        .join("")}
    </select>
  `;

  const save = document.querySelector(".edit-confirm");
  save.addEventListener("click", async () => {
    const payload = {
      name: modal.querySelector(".name").value || item.name,
      description:
        modal.querySelector(".description").value || item.description,
      image: modal.querySelector(".image").value || item.image,
      price: modal.querySelector(".price").value || item.price,
      category: modal.querySelector(".item-category").value || item.category,
    };

    try {
      loading();
      const response = await axios.patch(
        `${baseURL}/admin/menu/${item._id}`,
        payload,
        { headers: { Authorization: token } }
      );
      stopLoading();
      console.log(response);
      tostTopEnd.fire({
        icon: "success",
        title: response?.data?.message || "Dish updated",
      });
      getItems();
    } catch (error) {
      stopLoading();
      console.error(error);
      tostTopEnd.fire({
        icon: "error",
        title: error.response?.data?.message || "Failed to Update",
      });
    }
  });
}

async function removeItem(id) {
  try {
    const result = await Swal.fire({
      title: "Delete item?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes",
      cancelButtonText: "Cancel",
    });

    if (!result.isConfirmed) return;
    loading();

    const response = await axios.delete(`${baseURL}/admin/menu/${id}`, {
      headers: { Authorization: token },
    });
    stopLoading();
    tostTopEnd.fire({
      icon: "success",
      title: response?.data?.message || "Dish removed",
    });
    getItems();
  } catch (error) {
    stopLoading();
    console.error(error);
    tostTopEnd.fire({
      icon: "error",
      title: error.response?.data?.message || "Failed to delete",
    });
  }
}

const resetMenuButton = document.getElementById("hardrest");
resetMenuButton.addEventListener("click", async () => {
  try {
    const result = await Swal.fire({
      title: "Reset Menu?",
      text: "This can't be undone",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes",
      cancelButtonText: "Cancel",
    });

    if (!result.isConfirmed) return;
    loading();
    const response = await axios.post(
      `${baseURL}/admin/menu/reset`,
      {},
      {
        headers: { Authorization: token },
      }
    );
    stopLoading();
    console.log(response);

    tostTopEnd.fire({
      icon: "success",
      title: response.message || "Menu Rest: OK",
    });
    getItems();
  } catch (error) {
    stopLoading();
    console.error(error);
    tostTopEnd.fire({
      icon: "error",
      title: error.response?.data?.message || "Failed to Rest",
    });
  }
});

const search = document.querySelector("#food-search");
search.addEventListener("input", () => {
  let value = document.querySelector("#food-search").value;
  getItems(value);
});

getOrders("Pending");
getItems();

navbar();
page_footer();
// stopLoading();
