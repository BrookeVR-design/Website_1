(() => {
  const dropButton = document.getElementById("dropBtn");
  const dropMenu = document.getElementById("dropMenu");
  const restaurantGrid = document.getElementById("restaurantGrid");
  const restaurantStatus = document.getElementById("restaurantStatus");
  const slider = document.getElementById("starRating");
  const ratingOutput = document.getElementById("starRatingValue");

  if (!dropButton || !dropMenu || !restaurantGrid || !restaurantStatus || !slider || !ratingOutput) {
    return;
  }

  let restaurants = [];
  let selectedCuisine = "all";

  function setMenuOpen(isOpen) {
    dropMenu.classList.toggle("open", isOpen);
    dropButton.setAttribute("aria-expanded", String(isOpen));
  }

  function renderRestaurants() {
    const visibleRestaurants = restaurants.filter((restaurant) => {
      return selectedCuisine === "all"
        || (restaurant.Cuisine || "").toLowerCase() === selectedCuisine.replaceAll("-", " ");
    });

    restaurantGrid.replaceChildren();

    visibleRestaurants.forEach((restaurant) => {
      const card = document.createElement("article");
      card.className = "restaurant-card";

      const image = document.createElement("img");
      image.src = restaurant.path || "";
      image.alt = restaurant.alttext || restaurant.Name || "Restaurant image";
      image.loading = "lazy";

      const copy = document.createElement("div");
      copy.className = "restaurant-card-copy";

      const name = document.createElement("h3");
      name.textContent = restaurant.Name || "Restaurant";

      const cuisine = document.createElement("p");
      cuisine.textContent = restaurant.Cuisine || "Cuisine not listed";

      const rating = document.createElement("p");
      rating.textContent = `Rating: ${Number(restaurant.Rating).toFixed(1)} / 5`;

      copy.append(name, cuisine, rating);
      card.append(image, copy);
      restaurantGrid.append(card);
    });

    restaurantStatus.textContent = `${visibleRestaurants.length} restaurants`;
  }

  dropButton.addEventListener("click", (event) => {
    event.stopPropagation();
    setMenuOpen(!dropMenu.classList.contains("open"));
  });

  dropMenu.addEventListener("click", (event) => {
    const option = event.target.closest("button[data-value]");
    if (!option) return;

    selectedCuisine = option.dataset.value;
    dropButton.textContent = `${option.textContent} ▾`;
    renderRestaurants();
    setMenuOpen(false);
  });

  document.addEventListener("click", () => setMenuOpen(false));
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") setMenuOpen(false);
  });

  function updateRatingDisplay() {
    const min = Number(slider.min);
    const max = Number(slider.max);
    const value = Number(slider.value);
    const percentage = ((value - min) / (max - min)) * 100;
    slider.style.setProperty("--fill", `${percentage}%`);
    ratingOutput.textContent = value.toFixed(1);
  }

  slider.addEventListener("input", updateRatingDisplay);
  updateRatingDisplay();

  fetch("restuarants.json")
    .then((response) => {
      if (!response.ok) throw new Error(`Could not load restaurant data (${response.status})`);
      return response.json();
    })
    .then((data) => {
      if (!Array.isArray(data)) throw new TypeError("Restaurant data must be an array.");
      restaurants = data;
      renderRestaurants();
    })
    .catch((error) => {
      restaurantStatus.textContent = "Restaurant images could not be loaded.";
      console.error(error);
    });
})();
