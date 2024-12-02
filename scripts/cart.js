import { baseURL, navbar, page_footer, tostTopEnd } from "../utils/utils.js";
const token = localStorage.getItem("token");

async function fetchCart() {
  try {
    const response = await axios.get(`${baseURL}/cart`, {
      headers: { Authorization: token },
    });

    response.data.data.items = response.data.data.items.map((ele) => {
      let matchedItem = response.data.items.find(
        (item) => item._id === ele.itemid
      );
      return {
        ...matchedItem,
        quantity: ele.quantity,
      };
    });

    return response.data;
  } catch (error) {
    console.error(error);
    throw new Error(error.response?.data?.message || "Failed to fetch cart.");
  }
}

async function updateQuantityInBackend(itemId, quantity) {
  try {
    if (quantity === 0) {
      await axios.delete(`${baseURL}/cart/${itemId}`, {
        headers: { Authorization: token },
      });
    } else {
      await axios.put(
        `${baseURL}/cart/${itemId}`,
        { quantity },
        { headers: { Authorization: token } }
      );
    }
  } catch (error) {
    throw new Error(
      error.response?.data?.message || "Failed to update quantity."
    );
  }
}

function addQuantityListeners(cart) {
  const incrementButtons = document.querySelectorAll(".increment");
  const decrementButtons = document.querySelectorAll(".decrement");

  incrementButtons.forEach((btn) => {
    btn.addEventListener("click", async (e) => {
      const index = e.target.getAttribute("data-index");
      await updateItemQuantity(cart, index, 1);
    });
  });

  decrementButtons.forEach((btn) => {
    btn.addEventListener("click", async (e) => {
      const index = e.target.getAttribute("data-index");
      await updateItemQuantity(cart, index, -1);
    });
  });
}

async function updateItemQuantity(cart, index, change) {
  const item = cart.items[index];
  const newQuantity = item.quantity + change;

  if (newQuantity === 0) {
    const result = await Swal.fire({
      title: "Remove item?",
      text: "Do you want to remove this item from your cart?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, remove it!",
      cancelButtonText: "Cancel",
    });

    if (!result.isConfirmed) return;
  }

  try {
    await updateQuantityInBackend(item._id, newQuantity);

    if (newQuantity === 0) {
      cart.items.splice(index, 1);
      document.querySelectorAll(".item-row")[index].remove();
    } else {
      cart.items[index].quantity = newQuantity;
      document.querySelectorAll(".quantity")[index].textContent = newQuantity;
    }

    const shippingCost = Number(document.querySelector("#delivery-opt").value);
    const totalPrice = calculateTotal(cart.items, shippingCost);
    document.querySelector("#total-price").textContent = `Rs.${(
      totalPrice * 0.8
    ).toFixed(2)}`;
    document.querySelector(".discount").textContent = `- Rs.${(
      totalPrice * 0.2
    ).toFixed(2)}`;
    document.querySelector(
      ".total-price"
    ).textContent = `Rs.${totalPrice.toFixed(2)}`;
  } catch (error) {
    tostTopEnd.fire({
      icon: "error",
      title: error.message,
    });
  }
}

async function ordersummary() {
  try {
    const response = await fetchCart();
    const cart = response.data;
    const summary = document.querySelector(".summary");
    const itemsDiv = document.querySelector(".itemdiv");

    // Render summary
    summary.innerHTML = `
        <div>
          <h5><b>Summary</b></h5>
        </div>
        <form>
          <p>SHIPPING</p>
          <select id="delivery-opt">
            <option value="0" class="text-muted">Self Pickup FREE</option>
            <option value="20" class="text-muted">Home Delivery Rs.20</option>
          </select>
          <p>DISCOUNT CODE</p>
          <input id="code" placeholder="Enter code" />
        </form>
        <div
          class="row"
          style="border-top: 1px solid rgba(0, 0, 0, 0.1); padding: 2vh 0"
        >
          <div class="row">
            <div class="col">PRICE ${cart.items.length}</div>
            <div class="col text-right total-price">Rs.${cart.totalprice.toFixed(
              2
            )}</div>
          </div>
          <div class="row">
            <div class="col">DISCOUNT</div>
            <div class="col text-right discount">- Rs.${(
              cart.totalprice * 0.2
            ).toFixed(2)}</div>
          <div class="row">
            </div>
            <div class="col">TOTAL PRICE</div>
            <div class="col text-right" id="total-price">Rs.${(
              cart.totalprice * 0.8
            ).toFixed(2)}</div>
          </div>
        </div>
        <button class="btn">CHECKOUT</button>`;

    // Render items
    itemsDiv.innerHTML = "";
    cart.items.forEach((item, index) => {
      itemsDiv.innerHTML += `
          <div class="row main align-items-center item-row">
            <div class="col">
              <div class="row text-muted item-name">${item.name}</div>
            </div>
            <div class="col item-price" style="text-decoration:line-through;text-align: right; margin-right:10px;">Rs.${item.price.toFixed(
              2
            )}</div>
            <div class="col item-price original-price">Rs.${(item.price * 0.8).toFixed(
              2
            )}</div>
            <div class="col item-quantity">
              <button class="decrement" data-index="${index}">-</button>
              <span class="quantity">${cart.items[index].quantity}</span>
              <button class="increment" data-index="${index}">+</button>
            </div>
          </div>`;
    });

    // Add event listeners for shipping
    const deliveryOpt = document.querySelector("#delivery-opt");
    deliveryOpt.addEventListener("change", () => {
      const shippingCost = Number(deliveryOpt.value);
      const totalPrice = calculateTotal(cart.items, shippingCost);
      document.getElementById("total-price").textContent = `1111`;
      document.querySelector(
        ".total-price"
      ).textContent = `Rs.${totalPrice.toFixed(2)}`;
    });

    // Add event listeners for quantity buttons
    addQuantityListeners(cart);
  } catch (error) {
    console.error(error);
    tostTopEnd.fire({
      icon: "error",
      title: error.message,
    });
  }
}

function calculateTotal(items, shippingCost) {
  const itemsTotal = items.reduce(
    (total, item) => total + item.quantity * item.price,
    0
  );
  return itemsTotal + shippingCost;
}

ordersummary();
navbar();
page_footer();
