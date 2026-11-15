(() => {
  "use strict";

  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));

  const menuToggle = $("#menuToggle");
  const mainNav = $("#mainNav");
  const searchToggle = $("#searchToggle");
  const searchPanel = $("#searchPanel");
  const searchInput = $("#siteSearch");
  const searchGo = $("#searchGo");
  const cartToggle = $("#cartToggle");
  const cartClose = $("#cartClose");
  const cartDrawer = $("#cartDrawer");
  const drawerBackdrop = $("#drawerBackdrop");
  const cartCount = $("#cartCount");
  const cartItems = $("#cartItems");
  const toast = $("#toast");
  const finderForm = $("#finderForm");
  const finderResult = $("#finderResult");
  const productCards = $$(".product-card");
  let cart = [];
  let toastTimer;

  $("#year").textContent = new Date().getFullYear();

  function showToast(message) {
    toast.textContent = message;
    toast.classList.add("show");
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(() => toast.classList.remove("show"), 2600);
  }

  function closeMenu() {
    mainNav.classList.remove("is-open");
    menuToggle.setAttribute("aria-expanded", "false");
    menuToggle.setAttribute("aria-label", "Open navigation");
  }

  menuToggle.addEventListener("click", () => {
    const isOpen = mainNav.classList.toggle("is-open");
    menuToggle.setAttribute("aria-expanded", String(isOpen));
    menuToggle.setAttribute("aria-label", isOpen ? "Close navigation" : "Open navigation");
  });

  $$("#mainNav a").forEach(link => link.addEventListener("click", closeMenu));

  searchToggle.addEventListener("click", () => {
    searchPanel.hidden = !searchPanel.hidden;
    if (!searchPanel.hidden) searchInput.focus();
  });

  document.addEventListener("click", event => {
    if (!searchPanel.hidden && !searchPanel.contains(event.target) && !searchToggle.contains(event.target)) {
      searchPanel.hidden = true;
    }
  });

  function runSearch() {
    const term = searchInput.value.trim().toLowerCase();
    if (!term) {
      showToast("Type something to search for.");
      searchInput.focus();
      return;
    }
    const matches = productCards.filter(card => card.textContent.toLowerCase().includes(term));
    productCards.forEach(card => card.classList.toggle("search-dimmed", matches.length > 0 && !matches.includes(card)));
    searchPanel.hidden = true;
    if (matches.length) {
      $("#productGrid").scrollIntoView({ behavior: "smooth", block: "center" });
      showToast(matches.length + (matches.length === 1 ? " preview found." : " previews found."));
    } else {
      productCards.forEach(card => card.classList.remove("search-dimmed"));
      showToast("No catalogue preview found for “" + term + "”.");
    }
  }

  searchGo.addEventListener("click", runSearch);
  searchInput.addEventListener("keydown", event => {
    if (event.key === "Enter") runSearch();
    if (event.key === "Escape") searchPanel.hidden = true;
  });

  function renderCart() {
    cartCount.textContent = String(cart.length);
    if (!cart.length) {
      cartItems.innerHTML = '<p class="empty-cart">Your bag is waiting for its first good find.</p>';
      return;
    }
    cartItems.innerHTML = "";
    cart.forEach((item, index) => {
      const row = document.createElement("div");
      row.className = "cart-line";
      const name = document.createElement("span");
      name.textContent = item;
      const remove = document.createElement("button");
      remove.type = "button";
      remove.textContent = "REMOVE";
      remove.setAttribute("aria-label", "Remove " + item);
      remove.addEventListener("click", () => {
        cart.splice(index, 1);
        renderCart();
      });
      row.append(name, remove);
      cartItems.append(row);
    });
  }

  function openCart() {
    cartDrawer.classList.add("is-open");
    drawerBackdrop.classList.add("is-open");
    cartDrawer.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
  }

  function closeCart() {
    cartDrawer.classList.remove("is-open");
    drawerBackdrop.classList.remove("is-open");
    cartDrawer.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
  }

  cartToggle.addEventListener("click", openCart);
  cartClose.addEventListener("click", closeCart);
  drawerBackdrop.addEventListener("click", closeCart);
  document.addEventListener("keydown", event => {
    if (event.key === "Escape") {
      closeCart();
      searchPanel.hidden = true;
      closeMenu();
    }
  });

  $$("[data-add]").forEach(button => {
    button.addEventListener("click", () => {
      const productName = button.getAttribute("data-add");
      cart.push(productName);
      renderCart();
      showToast(productName + " added to your preview bag.");
    });
  });

  finderForm.addEventListener("submit", event => {
    event.preventDefault();
    const data = new FormData(finderForm);
    const interest = data.get("interest");
    const suggestions = {
      "Mealtime": "Start with the dog food collection.",
      "Treat time": "The treats and chews collection is a good place to browse.",
      "Playtime": "Explore toys and play essentials.",
      "A bit of everything": "Browse all four PawerUP collections."
    };
    finderResult.textContent = "For your " + data.get("age").toLowerCase() + " " + data.get("size").toLowerCase() + " dog: " + (suggestions[interest] || "browse the collections to get started.");
  });

  $("#newsletterForm").addEventListener("submit", event => {
    event.preventDefault();
    const message = $("#newsletterMessage");
    message.textContent = "Thanks! Newsletter sign-up will be connected when the store backend is ready.";
    $("#newsletterEmail").value = "";
  });

  // The initial build uses sample catalogue cards only; this resets search dimming
  // whenever a visitor follows a regular category link.
  $$("#mainNav a, .category-card, .text-link").forEach(link => {
    link.addEventListener("click", () => productCards.forEach(card => card.classList.remove("search-dimmed")));
  });

  renderCart();
})();