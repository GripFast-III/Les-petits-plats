// Récupère les recettes depuis le fichier recipes.json
async function getRecipes() {
  try {
    const response = await fetch("./../recipes.json");
    if (response.ok) {
      const recipesData = await response.json();
      const recipes = recipesData.recipes; // Appel la fonction qui récupère les ingrédients, appareils et ustensiles
      const [uniqueIngredients, uniqueAppliances, uniqueUstensils] =
        await getUniqueStuff(recipes);
      //console.log("Ingrédients uniques:", uniqueIngredients);
      //console.log("Appareils uniques:", uniqueAppliances);
      //console.log("Ustensils uniques:", uniqueUstensils);

      displayList(uniqueIngredients, "options-list-ingredients");
      displayList(uniqueAppliances, "options-list-appliances");
      displayList(uniqueUstensils, "options-list-ustensils");

      return recipes;
    } else {
      throw new Error("Erreur de la récupération de la donnéee");
    }
  } catch (error) {
    return error;
  }
}

// Fonction qui récupère les ingrédients, appareils et ustensils
async function getUniqueStuff(recipes) {
  const uniqueIngredients = new Set();
  const uniqueAppliances = new Set();
  const uniqueUstensils = new Set();

  // Récupère les ingrédients
  recipes.forEach((recipe) => {
    recipe.ingredients.forEach((ingredient) => {
      uniqueIngredients.add(ingredient.ingredient.toLowerCase()); // Les ingrédients et les ustensils sont stockés sous forme de tableau
    });

    // Récupère les appareils
    uniqueAppliances.add(recipe.appliance.toLowerCase()); // Les appareils sont stockés dans chaque recette comme une chaine de caractères puisqu'il n'y a qu'un seul appareil par recette

    // Récupère les ustensiles
    recipe.ustensils.forEach((ustensil) => {
      uniqueUstensils.add(ustensil.toLowerCase());
    });
  });

  return [uniqueIngredients, uniqueAppliances, uniqueUstensils];
}

// Génère les éléments HTML d'une recette
function createRecipeCard(recipe) {
  const {
    id,
    image,
    name,
    servings,
    ingredients,
    time,
    description,
    appliance,
    ustensils,
  } = recipe;
  const card = document.createElement("article");
  card.classList.add("card");

  let ingredientsHtml = "";
  ingredients.forEach((itemIngredient) => {
    ingredientsHtml += `<li><span class="ingredient-name">${
      itemIngredient.ingredient
    }</span><br/>
     <span class="quantity-number">${
       itemIngredient?.quantity ? itemIngredient.quantity : ""
     }</span>
     <span class="quantity-unit">${
       itemIngredient?.unit ? itemIngredient.unit : ""
     }</span></li>`;
  }); // Dans "itemIngredient?.quantity", le "?" rend optionnelle la présence de la quantité

  let templateCard = `
  <div class="card-content">
    <div class="recipe-time">${time} min</div>
    <div class="img-recipe">
      <img
        src="images/recipes/${image}"
        class="illustration"
        alt="Photo de ${name}"
      />
    </div>
    <div class="recipe-title">
      <h2>${name}</h2>
    </div>
    <div class="recipe-whole">
      <div class="recipe-text">
        <h3>RECETTE</h3>
        <p>${description}</p>
      </div>
      <div class="recipe-ingredients">
        <h3>INGRÉDIENTS</h3>
        <ul>
            ${ingredientsHtml}
        </ul>
      </div>
    </div>
  </div>`;

  card.innerHTML = templateCard;

  return card;
}

// Affiche les recettes sur la page
async function displayRecipes() {
  try {
    const recipes = await getRecipes();
    const recipesContainer = document.querySelector(".recipes-cards");
    const totalRecipesElement = document.getElementById("total-recipes");

    recipesContainer.innerHTML = ""; // Efface tout contenu précédent

    recipes.forEach((recipe) => {
      const card = createRecipeCard(recipe);
      recipesContainer.appendChild(card);
    });

    // Met à jour le nombre total de recettes dans la <div class="recipes-amount" id="total-recipes">
    totalRecipesElement.textContent = `${recipes.length} recettes`;
  } catch (error) {
    //console.error("Erreur lors de l'affichage des recettes:", error);
  }
}

// Appel la fonction pour afficher les recettes
displayRecipes();

// Sélectionne tous les en-têtes de filtres et leurs listes correspondantes
const filterHeaders = document.querySelectorAll(".filter-list");
const filterLists = document.querySelectorAll(".options-list"); // Liste <ul>

let isRotated = false;

// Fonction pour gérer l'ouverture/fermeture de la liste et la rotation du chevron
function toggleList(header, list) {
  const chevronIcon = header.querySelector(".fa-solid.fa-chevron-down");
  const miniSearchBar = header.querySelector(".mini-searchbar");
  let targetHeader = header.querySelector(".selected-option");
  let isOpen = targetHeader.getAttribute("aria-expanded");
  console.log("🚀 ~ file: index.js:148 ~ toggleList ~ isOpen:", typeof isOpen);

  if (isOpen === "false") {
    // ---> Convertir isOpen === "false" en booléen
    targetHeader.setAttribute("aria-expanded", true);
    list.classList.remove("hidden"); // Si la liste est cachée et que l'on clic dessus, rotation du chevron vers le haut
    chevronIcon.classList.remove("rotate-0");
    chevronIcon.classList.add("rotate-180");
    miniSearchBar.style.display = "flex"; // Affiche la barre de recherche dans la liste
  } else {
    targetHeader.setAttribute("aria-expanded", false);
    list.classList.add("hidden"); // Si la liste est visible et que l'on clic dessus, rotation du chevron vers le bas
    chevronIcon.classList.remove("rotate-180");
    chevronIcon.classList.add("rotate-0");
    miniSearchBar.style.display = "none"; // Masque la barre de recherche dans la liste
  }

  // Ajoute un gestionnaire de clic pour fermer la liste si on clique en dehors de la liste
  document.addEventListener("click", (event) => {
    if (event.target.closest(".filter-list") !== header) {
      list.classList.add("hidden"); // Ferme la liste
      // Réinitialise le chevron
      chevronIcon.classList.remove("rotate-180");
      chevronIcon.classList.add("rotate-0");
      miniSearchBar.style.display = "none"; // Masque la barre de recherche
    }
  });
}

// Ajoute un gestionnaire d'événement de clic à chaque en-tête de filtre
filterHeaders.forEach((header, index) => {
  let targetHeader = header.querySelector(".selected-option");
  targetHeader.addEventListener("click", () => {
    const filterList = filterLists[index];
    toggleList(header, filterList);
  });
});

getRecipes()
  .then((data) => {
    //console.log("🚀 ~ file: index.js:20 ~ .then ~ data:", data);
    data.forEach((recipe) => console.log(recipe));
  })
  .catch((err) => {
    console.log("Error", err);
  });

const displayList = (source, target) => {
  let targetHtml = document.getElementById(target);
  let existingItems = Array.from(targetHtml.querySelectorAll("li"));
  /*console.log(
    "🚀 ~ file: index.js:177 ~ displayList ~ targetHtml:",
    targetHtml
  );
  console.log(
    "🚀 ~ file: index.js:179 ~ displayList ~ existingItems:",
    existingItems
  );
  */

  source.forEach((item) => {
    if (!existingItems.some((li) => li.textContent === item)) {
      // Si les éléments dans le li existent déjà, cela évite de créer des doublons
      const liHtml = document.createElement("li");
      liHtml.textContent = item;
      targetHtml.append(liHtml);
    }
  });
};

// Fonction qui permet d'ouvrir/fermer la liste des éléments dans les filtres concernés
// Sélections des barres de recherche Ingrédients, Appareils et Ustensils
const ingredientsSearchInput = document.querySelector(
  ".filter-ingredients .search-input"
);
const ingredientsOptionsList = document.querySelector(
  "#options-list-ingredients"
);

const appliancesSearchInput = document.querySelector(
  ".filter-appliances .search-input"
);
const appliancesOptionsList = document.querySelector(
  "#options-list-appliances"
);

const ustensilsSearchInput = document.querySelector(
  ".filter-ustensils .search-input"
);
const ustensilsOptionsList = document.querySelector("#options-list-ustensils");

// Gestion de l'événement de saisie de texte dans la barre de recherche des Ingrédients
ingredientsSearchInput.addEventListener("input", function () {
  const searchTerm = this.value.toLowerCase();
  const ingredients = [...ingredientsOptionsList.querySelectorAll("li")];

  ingredients.forEach((ingredient) => {
    const text = ingredient.textContent.toLowerCase();
    if (text.includes(searchTerm)) {
      ingredient.style.display = "block";
    } else {
      ingredient.style.display = "none";
    }
  });
});

// Gestion de l'événement de saisie de texte dans la barre de recherche des Appareils
appliancesSearchInput.addEventListener("input", function () {
  const searchTerm = this.value.toLowerCase();
  const appliances = [...appliancesOptionsList.querySelectorAll("li")];

  appliances.forEach((appliance) => {
    const text = appliance.textContent.toLowerCase();
    if (text.includes(searchTerm)) {
      appliance.style.display = "block";
    } else {
      appliance.style.display = "none";
    }
  });
});

// Gestion de l'événement de saisie de texte dans la barre de recherche des Ustensils
ustensilsSearchInput.addEventListener("input", function () {
  const searchTerm = this.value.toLowerCase();
  const ustensils = [...ustensilsOptionsList.querySelectorAll("li")];

  ustensils.forEach((ustensil) => {
    const text = ustensil.textContent.toLowerCase();
    if (text.includes(searchTerm)) {
      ustensil.style.display = "block";
    } else {
      ustensil.style.display = "none";
    }
  });
});

// Affiche l'élément sélectionné dans la barre de recherche pour Ingrédients
const ingredientsOptions = ingredientsOptionsList.querySelectorAll("li");
ingredientsOptions.forEach((ingredient) => {
  ingredient.addEventListener("click", function () {
    const selectedIngredient = this.textContent;
    ingredientsSearchInput.value = selectedIngredient;
    // Masque la liste déroulante après la sélection
    ingredientsOptionsList.classList.add("hidden");
  });
});

// Affiche l'élément sélectionné dans la barre de recherche pour Appareils
const appliancesOptions = appliancesOptionsList.querySelectorAll("li");
appliancesOptions.forEach((appliance) => {
  appliance.addEventListener("click", function () {
    const selectedAppliance = this.textContent;
    appliancesSearchInput.value = selectedAppliance;
    // Masque la liste déroulante après la sélection
    appliancesOptionsList.classList.add("hidden");
  });
});

// Affiche l'élément sélectionné dans la barre de recherche pour Ustensils
const ustensilsOptions = ustensilsOptionsList.querySelectorAll("li");
ustensilsOptions.forEach((ustensil) => {
  ustensil.addEventListener("click", function () {
    const selectedUstensil = this.textContent;
    ustensilsSearchInput.value = selectedUstensil;
    // Masque la liste déroulante après la sélection
    ustensilsOptionsList.classList.add("hidden");
  });
});

// Fait apparaître les tags après une sélection de filtre
// Sélection de la section des tags
const tagsSection = document.querySelector(".tags");

// Sélection des éléments pour les trois listes
const ingredientsList = document.querySelector("#options-list-ingredients");
const appliancesList = document.querySelector("#options-list-appliances");
const ustensilsList = document.querySelector("#options-list-ustensils");

// Sélectionne les éléments de tag dans la section "tags"
const ingredientsTagDiv = document.querySelector(".tag-ingredients");
const appliancesTagDiv = document.querySelector(".tag-appliances");
const ustensilsTagDiv = document.querySelector(".tag-ustensils");

ingredientsList.addEventListener("click", (event) => {
  if (event.target.tagName === "LI") {
    const selectedIngredient = event.target.textContent;
    const capitalizedIngredient = capitalizeFirstLetter(selectedIngredient);
    addTag(ingredientsTagDiv, capitalizedIngredient);

    // Ferme la liste des ingrédients
    ingredientsList.classList.add("hidden");

    // Réinitialise le chevron
    const ingredientsHeader = document.querySelector(
      ".filter-ingredients .selected-option"
    );
    const chevronIcon = ingredientsHeader.querySelector(
      ".fa-solid.fa-chevron-down"
    );
    chevronIcon.classList.remove("rotate-180");
    chevronIcon.classList.add("rotate-0");

    // Masque la barre de recherche des ingrédients
    const miniSearchBar = ingredientsHeader.querySelector(".mini-searchbar");
    miniSearchBar.style.display = "none";
  }
});

appliancesList.addEventListener("click", (event) => {
  if (event.target.tagName === "LI") {
    const selectedAppliance = event.target.textContent;
    const capitalizAppliance = capitalizeFirstLetter(selectedAppliance);

    addTag(appliancesTagDiv, capitalizAppliance);

    // Ferme la liste des appareils
    appliancesList.classList.add("hidden");

    // Réinitialise le chevron des appareils
    const appliancesHeader = document.querySelector(
      ".filter-appliances .selected-option"
    );
    const chevronIcon = appliancesHeader.querySelector(
      ".fa-solid.fa-chevron-down"
    );
    chevronIcon.classList.remove("rotate-180");
    chevronIcon.classList.add("rotate-0");

    // Masque la barre de recherche des appareils
    const miniSearchBar = appliancesHeader.querySelector(".mini-searchbar");
    miniSearchBar.style.display = "none";
  }
});

ustensilsList.addEventListener("click", (event) => {
  if (event.target.tagName === "LI") {
    const selectedUstensil = event.target.textContent;
    const capitalizUstensil = capitalizeFirstLetter(selectedUstensil);
    addTag(ustensilsTagDiv, capitalizUstensil);

    // Ferme la liste des ustensiles
    ustensilsList.classList.add("hidden");

    // Réinitialise le chevron des ustensiles
    const ustensilsHeader = document.querySelector(
      ".filter-ustensils .selected-option"
    );
    const chevronIcon = ustensilsHeader.querySelector(
      ".fa-solid.fa-chevron-down"
    );
    chevronIcon.classList.remove("rotate-180");
    chevronIcon.classList.add("rotate-0");

    // Masque la barre de recherche des ustensiles
    const miniSearchBar = ustensilsHeader.querySelector(".mini-searchbar");
    miniSearchBar.style.display = "none";
  }
});

// Ajout du tag dans la section des tags
function addTag(tagsSection, tagName) {
  const tag = document.createElement("div");
  tag.textContent = tagName;
  tag.classList.add("tag-box");
  tagsSection.appendChild(tag);

  // Ajoute la petite croix
  const closeIcon = document.createElement("span");
  closeIcon.classList.add("tag-close");
  closeIcon.innerHTML = '<i class="fa-solid fa-xmark"></i>';
  tag.appendChild(closeIcon);

  // Ajoute un gestionnaire d'événement pour supprimer le tag lorsqu'on clique sur la croix
  closeIcon.addEventListener("click", () => {
    tagsSection.removeChild(tag);
  });
}

// Fait mettre une lettre majuscule à la première lettre du mot clé
function capitalizeFirstLetter(text) {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

function isTagAlreadyAdded(tagsSection, tagName) {
  const existingTags = tagsSection.querySelectorAll("span");
  return Array.from(existingTags).some(
    (tag) => tag.textContent === tagName && !tag.classList.contains("tag-close")
  );
}
