import {
  baseURL,
  cart_counter,
  loading,
  navbar,
  page_footer,
  stopLoading,
  tostTopEnd,
} from "../utils/utils.js";
const token = localStorage.getItem("token");

async function fetchCart() {
  try {
    const response = await axios.get(`${baseURL}/cart`, {
      headers: { Authorization: token },
    });
    stopLoading();
    return response.data;
  } catch (error) {
    console.error(error);
    throw new Error(error.response?.data?.message || "Failed to fetch cart.");
  }
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
    await updateQuantityInBackend(item.item._id, newQuantity);

    if (newQuantity === 0) {
      cart.items.splice(index, 1);
      document.querySelectorAll(".item-row")[index].remove();
    } else {
      cart.items[index].quantity = newQuantity;
      document.querySelectorAll(".quantity")[index].textContent = newQuantity;
    }

    const deliveryOpt = document.querySelector("#delivery-opt");
    const shippingCost = deliveryOpt ? Number(deliveryOpt.value) : 0;
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
    console.error(error);
  }
}

async function ordersummary() {
  try {
    const response = await fetchCart();
    const cart = response.data;
    const summary = document.querySelector(".summary");
    summary.style.display = "block";
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
          <input id="code" placeholder="Enter code" disabled/>
        </form>
        <div
          class="row"
          style="border-top: 1px solid rgba(0, 0, 0, 0.1); padding: 2vh 0"
        >
          <div class="row">
            <div class="col">PRICE</div>
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
        const address = document.getElementById("address").value.trim();
        const fullName = document.getElementById("full-name").value.trim();
        const tel = document.getElementById("contact-number").value.trim();

        // Validate inputs
        if (!address || !fullName || !tel) {
          tostTopEnd.fire({
            icon: "warning",
            title: "Please fill in all the required fields.",
          });
          return;
        }

        const response = await axios.post(
          `${baseURL}/order`,
          {
            cartid: cart._id,
          },
          { headers: { Authorization: token } }
        );
        stopLoading();
        console.log(response);
        Swal.fire({
          title: "Order Placed",
          text: "Thank you for ordering! Your food will be arriving shortly.",
        }).then((result) => {
          window.location.href = "/pages/profile.html";
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
  } catch (error) {
    stopLoading();
    console.error(error);
    tostTopEnd.fire({
      icon: "error",
      title: error.message,
    });
  }
}

function calculateTotal(items, shippingCost) {
  const itemsTotal = items.reduce(
    (total, item) => total + item.quantity * item.item.price,
    0
  );
  return itemsTotal + shippingCost;
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

ordersummary();
navbar();
page_footer();
cart_counter();
loading();
