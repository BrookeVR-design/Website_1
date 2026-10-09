const dropBtn = document.getElementById("dropBtn");
        const dropMenu = document.getElementById("dropMenu");
        const restaurantGrid = document.getElementById("restaurantGrid");
        const restaurantStatus = document.getElementById("restaurantStatus");
        const pageLoader = document.getElementById("pageLoader");
        const slider = document.getElementById("starRating");
        const ratingOutput = document.getElementById("starRatingValue");
        let restaurants = [];
        let selectedCuisine = "all";

        function setOpen(isOpen) {
            dropMenu.classList.toggle("open", isOpen);
            dropBtn.setAttribute("aria-expanded", String(isOpen));
        }

        function renderRestaurants() {
            let visibleRestaurants = restaurants.filter((restaurant) => {
                if (selectedCuisine === "all") return true;

                const cuisineName = (restaurant.Cuisine || "").toLowerCase();
                const selectedCuisineName = selectedCuisine.replaceAll("-", " ");
                return cuisineName === selectedCuisineName;
            });
            visibleRestaurants = visibleRestaurants.filter((restaurant) => {
                return Number(restaurant.Rating) >= Number(slider.value);
            });
            restaurantGrid.replaceChildren();

            visibleRestaurants.forEach((restaurant) => {
                const card = document.createElement("a");
                card.className = "restaurant-card";
                const destination = restaurant.link || "#";
                card.href = /^https?:\/\//i.test(destination) ? destination : `https://${destination}`;
                card.target = "_blank";
                card.rel = "noopener noreferrer";
                card.setAttribute("aria-label", `Visit ${restaurant.Name || "restaurant"} website`);

                const image = document.createElement("img");
                image.src = restaurant.path;
                image.alt = restaurant.alttext || restaurant.Name;
                image.loading = "lazy";

                const copy = document.createElement("div");
                copy.className = "restaurant-card-copy";

                const name = document.createElement("h3");
                name.textContent = restaurant.Name;

                const cuisine = document.createElement("p");
                cuisine.textContent = restaurant.Cuisine;

                const rating = document.createElement("p");
                rating.textContent = `Rating: ${Number(restaurant.Rating).toFixed(1)} / 5`;

                copy.append(name, cuisine, rating);
                card.append(image, copy);
                restaurantGrid.append(card);
            });

            restaurantStatus.textContent = `${visibleRestaurants.length} restaurants`;
        }

        dropBtn.addEventListener("click", (event) => {
            event.stopPropagation();
            setOpen(!dropMenu.classList.contains("open"));
        });

        dropMenu.addEventListener("click", (event) => {
            const option = event.target.closest("button[data-value]");
            if (!option) return;

            dropBtn.textContent = `${option.textContent} ▾`;
            selectedCuisine = option.dataset.value;
            renderRestaurants();
            setOpen(false);
        });

        document.addEventListener("click", () => setOpen(false));
        document.addEventListener("keydown", (event) => {
            if (event.key === "Escape") {
                setOpen(false);
            }
        });

        function updateFill() {
            const min = Number(slider.min);
            const max = Number(slider.max);
            const value = Number(slider.value);
            const percentage = ((value - min) / (max - min)) * 100;
            slider.style.setProperty("--fill", `${percentage}%`);
            ratingOutput.textContent = value.toFixed(1);
            renderRestaurants();
        }

        slider.addEventListener("input", updateFill);
        updateFill();

        fetch("restuarants.json")
            .then((response) => {
                if (!response.ok) throw new Error(`Could not load restaurant data (${response.status})`);
                return response.json();
            })
            .then((data) => {
                restaurants = data;
                renderRestaurants();
                pageLoader.hidden = true;
            })
            .catch((error) => {
                restaurantStatus.textContent = "Restaurant images could not be loaded.";
                pageLoader.hidden = true;
                console.error(error);
            });