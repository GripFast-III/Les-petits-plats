// Récupère les recettes depuis le fichier recipes.json
async function getRecipes() {
  try {
    const response = await fetch("./../recipes.json");
    if (response.ok) {
      const recipesData = await response.json();
      const recipes = recipesData.recipes; // Appel la fonction qui récupère les ingrédients, appareils et ustensiles
      const { uniqueIngredients, uniqueAppliances, uniqueUstensils } =
        getUniqueStuff(recipes);
      console.log("Ingrédients uniques:", Array.from(uniqueIngredients));
      console.log("Appareils uniques:", Array.from(uniqueAppliances));
      console.log("Ustensils uniques:", Array.from(uniqueUstensils));
      return recipes;
    } else {
      throw new Error("Erreur de la récupération de la donnéee");
    }
  } catch (error) {
    return error;
  }
}

// Fonction qui récupère les ingrédients appareils et ustensils
function getUniqueStuff(recipes) {
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

  return {
    uniqueIngredients,
    uniqueAppliances,
    uniqueUstensils,
  };
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
function toggleList(document, list) {
  const chevronIcon = document.querySelector(".fa-solid.fa-chevron-down");

  if (!isRotated) {
    list.classList.remove("hidden");
    chevronIcon.classList.remove("rotate-0");
    chevronIcon.classList.add("rotate-180");
  } else {
    list.classList.add("hidden");
    chevronIcon.classList.remove("rotate-180");
    chevronIcon.classList.add("rotate-0");
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

/*
// Ajoute un gestionnaire d'événement de clic à chaque en-tête de filtre
filterHeaders.forEach((header, index) => {
  header.addEventListener("click", () => {
    // Affiche la liste correspondante
    const filterList = filterLists[index];

    // Bascule la classe "hidden" pour montrer ou cacher la liste
    filterList.classList.toggle("hidden");

    // Sélectionne l'icône du chevron
    const chevronIcon = header.querySelector(".fa-chevron-down");

    // Bascule la classe "rotate-180" pour faire pivoter l'icône
    chevronIcon.classList.toggle("rotate-180");
  });
});
*/

getRecipes()
  .then((data) => {
    console.log("🚀 ~ file: index.js:20 ~ .then ~ data:", data);
    data.forEach((recipe) => console.log(recipe));
  })
  .catch((err) => {
    console.log("Error", err);
  });
