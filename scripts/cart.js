import {
  baseURL,
  cart_counter,
  navbar,
  page_footer,
  tostTopEnd,
} from "../utils/utils.js";
const token = localStorage.getItem("token");

async function fetchCart() {
  try {
    const response = await axios.get(`${baseURL}/cart`, {
      headers: { Authorization: token },
    });
    console.log(response.data);
    return response.data;
  } catch (error) {
    console.error(error);
    throw new Error(error.response?.data?.message || "Failed to fetch cart.");
  }
}

function calculateTotal(items, shippingCost) {
  const itemsTotal = items.reduce(
    (total, item) => total + item.quantity * item.item.price,
    0
  );
  return itemsTotal + shippingCost;
}

async function updateItemQuantity(cart, index, change) {
  const item = cart.items[index];
  const newQuantity = item.quantity + change;

  if (newQuantity <= 0) {
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

    // Remove item from cart and DOM
    cart.items.splice(index, 1);
    document.querySelectorAll(".item-row")[index].remove();
  } else {
    // Update quantity if not removing
    cart.items[index].quantity = newQuantity;
    document.querySelectorAll(".quantity")[index].textContent = newQuantity;
  }

  // Update the total price based on cart items
  const deliveryOpt = document.querySelector("#delivery-opt");
  const shippingCost = deliveryOpt ? Number(deliveryOpt.value) : 0;
  const totalPrice = calculateTotal(cart.items, shippingCost);

  // Update DOM for prices and discount
  document.querySelector("#total-price").textContent = `Rs.${(
    totalPrice * 0.8
  ).toFixed(2)}`;
  document.querySelector(".discount").textContent = `- Rs.${(
    totalPrice * 0.2
  ).toFixed(2)}`;
  document.querySelector(".total-price").textContent = `Rs.${totalPrice.toFixed(
    2
  )}`;

  // Save updated cart to localStorage
  cart.totalprice = totalPrice;
  localStorage.setItem("cart", JSON.stringify(cart));
}

async function ordersummary() {
  const cart = JSON.parse(localStorage.getItem("cart"));
  const summary = document.querySelector(".summary");
  if (cart.items) summary.style.display = "block";
  const itemsDiv = document.querySelector(".itemdiv");
  // Render summary
  summary.innerHTML = `
        <div>
          <h5><b>Summary</b></h5>
        </div>
        <form>
          <p>SHIPPING</p>
          <select id="delivery-opt">
            <option value="0" class="text-muted" selected>Self Pickup FREE</option>
            <option value="40" class="text-muted">Home Delivery Rs.40</option>
          </select>
          <p>DISCOUNT CODE</p>
          <input id="code" placeholder="Enter code" disabled/>
        </form>
        <div
          class="row"
          style="border-top: 1px solid rgba(0, 0, 0, 0.1); padding: 2vh 0"
        >
          <div class="row">
            <div class="col">PRICE</div>
            <div class="col text-right total-price">${cart?.totalprice?.toFixed(
              2
            )}</div>
          </div>
          <div class="row">
            <div class="col">DISCOUNT</div>
            <div class="col text-right discount">- Rs.${(
              cart?.totalprice * 0.2
            ).toFixed(2)}</div>
          <div class="row">
            </div>
            <div class="col">TOTAL PRICE</div>
            <div class="col text-right" id="total-price">Rs.${(
              cart.totalprice * 0.8
            ).toFixed(2)}</div>
          </div>
        </div>
        <button class="btn checkout">CHECKOUT</button>
        <button class="btn placeorder hide checkout-button">Place Order</button>`;

  // Render items
  itemsDiv.innerHTML = "";
  cart.items.forEach((item, index) => {
    item = item.item;
    itemsDiv.innerHTML += `
          <div class="row main align-items-center item-row">
            <div class="col">
              <div class="row text-muted item-name">${item.name}</div>
            </div>
            <div class="col item-price original-price" style="text-decoration:line-through;text-align: right; margin-right:10px;">Rs.${item.price.toFixed(
              2
            )}</div>
            <div class="col item-price">Rs.${(item.price * 0.8).toFixed(
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
    const shippingCost = deliveryOpt ? Number(deliveryOpt.value) : 0;
    const totalPrice = calculateTotal(cart.items, shippingCost);
    document.getElementById("total-price").textContent = `Rs.${(
      totalPrice * 0.8
    ).toFixed(2)}`;
    document.querySelector(".discount").textContent = `- Rs.${(
      totalPrice * 0.2
    ).toFixed(2)}`;
    document.querySelector(
      ".total-price"
    ).textContent = `Rs.${totalPrice.toFixed(2)}`;
  });

  const checkout = document.querySelector(".checkout");
  checkout.addEventListener("click", (e) => {
    e.preventDefault();
    document.querySelector(".summary form").innerHTML = `
        <p><strong>DELIVERY ADDRESS</strong></p>
        <textarea id="address" name="address" placeholder="Enter your full delivery address" rows="2" required></textarea>

        <p><strong>CONTACT DETAILS</strong></p>
        <input type="text" id="full-name" name="fullName" placeholder="Full Name" required />
        <input type="tel" id="contact-number" name="contactNumber" placeholder="Contact Number" required />

        <p><strong>CUSTOM MESSAGE</strong> (Optional)</p>
        <textarea id="custom-message" name="customMessage" placeholder="Add instructions or notes for the delivery" rows="2"></textarea>

        <p><strong>PAYMENT METHOD</strong></p>
        <select id="payment-method" name="paymentMethod" required>
          <option value="cod">Cash on Delivery</option>
          <option disabled value="online">Online Payment</option>
        </select>`;

    checkout.classList.add("hide");
    placeOrder.classList.remove("hide");
    console.log(checkout);

    const nextDiv = document.querySelector(".summary");
    console.log(nextDiv);
    nextDiv.scrollIntoView({ behavior: "smooth" });
  });

  const placeOrder = document.querySelector(".placeorder");
  placeOrder.addEventListener("click", async (e) => {
    try {
      const userAddress = document.getElementById("address").value.trim();
      const userName = document.getElementById("full-name").value.trim();
      const userPhone = document.getElementById("contact-number").value.trim();
      const userMSG = document.getElementById("custom-message").value.trim();

      // Validate inputs
      if (!userAddress || !userName || !userPhone) {
        tostTopEnd.fire({
          icon: "warning",
          title: "Please fill in all the required fields.",
        });
        return;
      }

      let confirmOrder = { cart, userName, userPhone, userAddress };
      if (userMSG) confirmOrder.userMSG = userMSG;

      await axios.post(`${baseURL}/order`, confirmOrder, {
        headers: { Authorization: token },
      });

      Swal.fire({
        title: "Order Placed",
        text: "Thank you for ordering! Your food will be arriving shortly.",
      }).then(() => {
        window.location.href = "/pages/profile.html";
        localStorage.removeItem("cart");
      });
    } catch (error) {
      console.error(error);
      tostTopEnd.fire({
        icon: "error",
        title: error.message,
      });
    }
  });

  // Add event listeners for quantity buttons
  addQuantityListeners(cart);
}

function addQuantityListeners(cart) {
  const incrementButtons = document.querySelectorAll(".increment");
  const decrementButtons = document.querySelectorAll(".decrement");

  incrementButtons.forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const index = e.target.getAttribute("data-index");
      updateItemQuantity(cart, index, 1);
    });
  });

  decrementButtons.forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const index = e.target.getAttribute("data-index");
      updateItemQuantity(cart, index, -1);
    });
  });
}

ordersummary();
navbar();
page_footer();
cart_counter();
