// Récupère les recettes depuis le fichier recipes.json
async function getRecipes() {
  try {
    const response = await fetch("./../recipes.json");
    if (response.ok) {
      const recipesData = await response.json();
      const recipes = recipesData.recipes; // Appel la fonction qui récupère les ingrédients, appareils et ustensiles
      const [uniqueIngredients, uniqueAppliances, uniqueUstensils] =
        await getUniqueStuff(recipes);
      console.log("Ingrédients uniques:", uniqueIngredients);
      console.log("Appareils uniques:", uniqueAppliances);
      console.log("Ustensils uniques:", uniqueUstensils);

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
    console.error("Erreur lors de l'affichage des recettes:", error);
  }
}

// Appel la fonction pour afficher les recettes
displayRecipes();

// Sélectionne tous les en-têtes de filtres et leurs listes correspondantes
const filterHeaders = document.querySelectorAll(".filter-list");
const filterLists = document.querySelectorAll(".options-list");

let isRotated = false;

// Fonction pour gérer l'ouverture/fermeture de la liste et la rotation du chevron
function toggleList(header, list) {
  const chevronIcon = header.querySelector(".fa-solid.fa-chevron-down");
  const miniSearchBar = header.querySelector(".mini-searchbar");

  if (!isRotated) {
    list.classList.remove("hidden"); // Si la liste est cachée et que l'on clic dessus, rotation du chevron vers le haut
    chevronIcon.classList.remove("rotate-0");
    chevronIcon.classList.add("rotate-180");
    miniSearchBar.style.display = "flex"; // Affiche la barre de recherche dans la liste
  } else {
    list.classList.add("hidden"); // Si la liste est apparente et que l'on clic dessus, rotation du chevron vers le bas
    chevronIcon.classList.remove("rotate-180");
    chevronIcon.classList.add("rotate-0");
    miniSearchBar.style.display = "none"; // Masque la barre de recherche dans la liste
  }

  isRotated = !isRotated;
}

// Ajoute un gestionnaire d'événement de clic à chaque en-tête de filtre
filterHeaders.forEach((header, index) => {
  header.addEventListener("click", () => {
    const filterList = filterLists[index];
    toggleList(header, filterList);
  });
});

getRecipes()
  .then((data) => {
    console.log("🚀 ~ file: index.js:20 ~ .then ~ data:", data);
    data.forEach((recipe) => console.log(recipe));
  })
  .catch((err) => {
    console.log("Error", err);
  });

const displayList = (source, target) => {
  let targetHtml = document.getElementById(target);
  let existingItems = Array.from(targetHtml.querySelectorAll("li"));
  console.log(
    "🚀 ~ file: index.js:177 ~ displayList ~ targetHtml:",
    targetHtml
  );
  console.log(
    "🚀 ~ file: index.js:179 ~ displayList ~ existingItems:",
    existingItems
  );

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

/*
// Sélectionne les éléments de la liste des ingrédients, appareils & ustensils
const ingredientsFilter = document.querySelector(".filter-ingredients");
const appliancesFilter = document.querySelector(".filter-appliances");
const ustensilsFilter = document.querySelector(".filter-ustensils");
*/

// Faire apparaître les tags après une sélection de filtre
// Code à mettre ici
// Sélectionnez la section des tags
const tagsSection = document.querySelector(".tags");

// Sélectionnez tous les éléments de la liste Ingrédients (les <li>)
const ingredientItems = ingredientsList.querySelectorAll("li");

// Ajoutez un gestionnaire d'événements de clic à chaque élément de la liste Ingrédients
ingredientItems.forEach((ingredientItem) => {
  ingredientItem.addEventListener("click", function (event) {
    // Empêchez la propagation de l'événement de clic pour éviter la fermeture de la liste
    event.stopPropagation();

    // Récupérez le texte de l'élément cliqué (l'ingrédient sélectionné)
    const selectedIngredientText = this.textContent;

    // Créez un élément de tag avec le texte de l'ingrédient
    const tagElement = document.createElement("div");
    tagElement.classList.add("tag");
    tagElement.textContent = selectedIngredientText;

    // Ajoutez le tag à la section des tags
    tagsSection.appendChild(tagElement);

    // Réinitialisez la liste Ingrédients après avoir sélectionné un élément
    ingredientsList.classList.add("hidden");
    isRotated = false;

    // Réinitialisez la rotation du chevron et masquez la mini-searchbar
    const chevronIcon = ingredientsFilterHeader.querySelector(
      ".fa-solid.fa-chevron-down"
    );
    const miniSearchBar =
      ingredientsFilterHeader.querySelector(".mini-searchbar");
    chevronIcon.classList.remove("rotate-180");
    chevronIcon.classList.add("rotate-0");
    miniSearchBar.style.display = "none";
  });
});
