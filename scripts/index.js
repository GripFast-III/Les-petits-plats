// Copie la liste complète de recettes
let allRecipes = [];

let query = {
  inputValue: "",
  ingredients: [],
  appliances: [],
  ustensils: [],
};

//
const formatWordRecipe = (nbRecipe) =>
  `${nbRecipe} ${nbRecipe > 1 ? "recettes" : "recette"}`;

// Récupère les recettes depuis le fichier recipes.json
async function getRecipes() {
  try {
    const response = await fetch("./../recipes.json");
    if (response.ok) {
      const recipesData = await response.json();
      const recipes = recipesData.recipes; // Appel la fonction qui récupère les ingrédients, appareils et ustensiles
      const [uniqueIngredients, uniqueAppliances, uniqueUstensils] =
        await getUniqueStuff(recipes);

      displayList(uniqueIngredients, "options-list-ingredients");
      displayList(uniqueAppliances, "options-list-appliances");
      displayList(uniqueUstensils, "options-list-ustensils");

      allRecipes = recipesData.recipes; // Stock toutes les recettes dans "allRecipes"

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

  /*let ingredientsHtml = "";
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
  }); // Dans "itemIngredient?.quantity", le "?" rend optionnelle la présence de la quantité*/

  let ingredientsHtml = ingredients
    .map(
      (itemIngredient) => `
      <li>
        <span class="ingredient-name">${itemIngredient.ingredient}</span><br/>
        <span class="quantity-number">${itemIngredient?.quantity || ""}</span>
        <span class="quantity-unit">${itemIngredient?.unit || ""}</span>
      </li>`
    )
    .join("");

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
    totalRecipesElement.textContent = formatWordRecipe(recipes.length);
  } catch (error) {
    console.error("Erreur lors de l'affichage des recettes:", error);
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

  isOpen = JSON.parse(isOpen); // Convertit "isOpen" en booléen

  if (!isOpen) {
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
      targetHeader.setAttribute("aria-expanded", false); // Met à jour aria-expanded lors de la fermeture
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

// Affiche les contenus des listes <ul> dans des <li>
const displayList = (source, target) => {
  let targetHtml = document.getElementById(target);
  let existingItems = Array.from(targetHtml.querySelectorAll("li"));

  source.forEach((item) => {
    if (!existingItems.some((li) => li.textContent === item)) {
      // Si les éléments dans le li existent déjà, cela évite de créer des doublons
      const liHtml = document.createElement("li");
      liHtml.dataset.itemSelect = `${target} ${item}`;
      liHtml.innerHTML = `${item} <span class="selected-cross"><i class="fa-solid fa-xmark"></i></span>`;

      targetHtml.append(liHtml);
    }
  });
};

// Fonctions qui permettent d'ouvrir/fermer la liste des éléments dans les filtres concernés
// Sélections de la barres de recherche des Ingrédients
const ingredientsSearchInput = document.querySelector(
  ".filter-ingredients .search-input"
);
// Sélection de la liste des Ingrédients
const ingredientsOptionsList = document.querySelector(
  "#options-list-ingredients"
);

// Sélections de la barres de recherche des Appareils
const appliancesSearchInput = document.querySelector(
  ".filter-appliances .search-input"
);
// Sélection de la liste des Appareils
const appliancesOptionsList = document.querySelector(
  "#options-list-appliances"
);

// Sélections de la barres de recherche des Ustensils
const ustensilsSearchInput = document.querySelector(
  ".filter-ustensils .search-input"
);
// Sélection de la liste des Ustensiles
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
const ingredientsTagDiv = document.querySelector(".tags");
const appliancesTagDiv = document.querySelector(".tags");
const ustensilsTagDiv = document.querySelector(".tags");

// Création de l'objet global pour stocker les informations du tag
let tagData = {
  type: "",
  value: "",
};

// Fonction qui ajoute le tag dans la section des tags
function addTag(tagName, type) {
  // Met à jour les informations de l'objet global
  tagData.type = type;
  tagData.value = tagName;

  // Créer le tag dans la section des tags
  const tag = document.createElement("div");
  tag.textContent = tagName;
  tag.classList.add("tag-box");

  tagsSection.appendChild(tag);

  // Ajoute la petite croix sur les tags
  const closeIcon = document.createElement("span");
  closeIcon.dataset.type = type;
  closeIcon.dataset.content = tagName;
  closeIcon.classList.add("tag-close");
  closeIcon.innerHTML = '<i class="fa-solid fa-xmark"></i>';
  tag.appendChild(closeIcon);

  console.log("🚀 ~ file: index.js:364 ~ addTag ~ type:", type);

  const index = query[type].findIndex((item) => item === tagName);
  if (index !== -1) {
    let liToRemove = document.querySelector(
      `li[data-item-select="options-list-${type} ${tagName}"]`
    );
    console.log("🚀 ~ file: index.js:372 ~ addTag ~ liToRemove:", liToRemove);
    query[type].splice(index, 1);
  } else {
    query[type].push(tagName);
  }
  console.log(
    "🚀 ~ file: index.js:370 ~ closeIcon.addEventListener ~ query[type]:",
    query[type]
  );

  // Ajoute un gestionnaire d'événement pour supprimer le tag lorsqu'on clique sur la croix
  closeIcon.addEventListener("click", () => {
    let type = closeIcon.dataset.type;
    let content = closeIcon.dataset.content;
    let formatedContent = content.toLocaleLowerCase().trim();
    /*"trim" enlève les espaces avant et après le mot*/

    // Met à jour la variable globale pour refléter la suppression
    // Si c'est un tag "Ingrédients", met à jour la variable globale "allRecipes"
    const index = query[type].findIndex((item) => item === content);
    if (index !== -1) {
      let liToRemove = document.querySelector(
        `li[data-item-select="options-list-${type} ${formatedContent}"]`
      );
      liToRemove.classList.remove("highlighted");
      query[type].splice(index, 1);
    } else {
      query[type].push(content);
    }

    // Supprime le tag du DOM
    tagsSection.removeChild(tag);

    // Réinitialise les informations de l'objet global si le tag est supprimé
    if (tagData.type === type && tagData.value === content) {
      tagData.type = "";
      tagData.value = "";
    }

    // Affiche les informations du tag supprimé dans la console
    console.log("Tag supprimé - Type:", type, "Valeur:", content);
  });

  // Affiche les informations du tag ajouté dans la console
  console.log("Tag ajouté - Type:", type, "Valeur:", tagName);

  updateDisplayRecipes();
}

// Fonction qui supprime le tag dans la section des tags
function removeTag(tagsSection, tagName) {
  const tags = tagsSection.querySelectorAll(".tag-box");
  for (const tag of tags) {
    if (tag.textContent === tagName) {
      tagsSection.removeChild(tag);
    }
  }
}

ingredientsList.addEventListener("click", (event) => {
  if (event.target.tagName === "LI") {
    const selectedIngredient = event.target.textContent;
    const capitalizedIngredient = capitalizeFirstLetter(selectedIngredient);

    // Vérifie si l'élément est déjà en surbrillance
    if (event.target.classList.contains("highlighted")) {
      // Retire la surbrillance jaune
      event.target.classList.remove("highlighted");
      // Retire l'élément de la section des tags
      removeTag(ingredientsTagDiv, capitalizedIngredient);
    } else {
      // Ajoute la surbrillance jaune
      event.target.classList.add("highlighted");
      // Ajoute l'élément à la section des tags
      addTag(capitalizedIngredient, "ingredients");
    }
  }
});

appliancesList.addEventListener("click", (event) => {
  if (event.target.tagName === "LI") {
    const selectedAppliance = event.target.textContent;
    const capitalizedAppliance = capitalizeFirstLetter(selectedAppliance); // Met une majsucule à la première lettre
    // Vérifie si l'élément est déjà en surbrillance
    if (event.target.classList.contains("highlighted")) {
      // Retire la surbrillance jaune
      event.target.classList.remove("highlighted");
      // Retire l'élément de la section des tags
      removeTag(appliancesTagDiv, capitalizedAppliance);
    } else {
      // Ajoute la surbrillance jaune
      event.target.classList.add("highlighted");
      // Ajoute l'élément à la section des tags
      addTag(capitalizedAppliance, "appliances");
    }
  }
});

ustensilsList.addEventListener("click", (event) => {
  if (event.target.tagName === "LI") {
    const selectedUstensil = event.target.textContent;
    const capitalizedUstensil = capitalizeFirstLetter(selectedUstensil); // Met une majsucule à la première lettre

    // Vérifie si l'élément est déjà en surbrillance
    if (event.target.classList.contains("highlighted")) {
      // Retire la surbrillance jaune
      event.target.classList.remove("highlighted");
      // Retire l'élément de la section des tags
      removeTag(ustensilsTagDiv, capitalizedUstensil);
    } else {
      // Ajoute la surbrillance jaune
      event.target.classList.add("highlighted");
      // Ajoute l'élément à la section des tags
      addTag(capitalizedUstensil, "ustensils");
    }
  }
});

// Fait mettre une lettre majuscule à la première lettre de chaque mot clé
function capitalizeFirstLetter(text) {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

// Vérifie si un tag avec le même nom figure déjà dans la liste des tags et évite la création de doublon
function isTagAlreadyAdded(tagsSection, tagName) {
  const existingTags = tagsSection.querySelectorAll("span");
  return Array.from(existingTags).some(
    (tag) => tag.textContent === tagName && !tag.classList.contains("tag-close")
  );
}

// Sélectionnez tous les éléments fa-circle-xmark
const circleXmarks = document.querySelectorAll(".fa-circle-xmark");

// Ajoutez un gestionnaire d'événements clic à chaque icône fa-circle-xmark
circleXmarks.forEach((circleXmark) => {
  circleXmark.addEventListener("click", function () {
    // Trouvez l'élément parent li en utilisant closest
    const listItem = circleXmark.closest("li");
    if (listItem) {
      // Retirez la classe "highlighted" de l'élément li
      listItem.classList.remove("highlighted");
    }
  });
});

// ------------------------- Filtrage des recettes dans l'input de recherche
// Mise à jour de la query lors des changements de l'input de recherche
const searchInput = document.querySelector(".search-input");

searchInput.addEventListener("input", function () {
  const searchTerm = this.value.trim().toLowerCase();

  if (searchTerm.length < 3) {
    console.log("3 caractères minimum"); // Remplacer par un message d'erreur comme dans Game On
    query.inputValue = "";
    updateDisplayRecipes();
  } else if (searchTerm.length >= 3) {
    query.inputValue = searchTerm;
    updateDisplayRecipes();
  }
});

// Fonction qui donne l'état de la query
function displayQueryState() {
  console.log("État de la query globale :", query);
}

// Fonction qui met à jour la variable "query" lors des changements de la barre de recherche
function updateDisplayRecipes() {
  const filteredRecipes = filterRecipesByNameOrTag();
  console.log(
    "🚀 ~ file: index.js:551 ~ updateDisplayRecipes ~ filteredRecipes:",
    filteredRecipes
  );
  displayFilteredRecipes(filteredRecipes);

  displayQueryState(); // Affiche l'état de la query

  console.log("Query mise à jour :", query);
}

// Fonction de filtrage des recettes par nom
function filterRecipesByNameOrTag() {
  let listRecipesFiltered = [];
  // Tri correspondant au nom pour voir ce qui colle avec l'input de recherche
  /*listRecipesFiltered = allRecipes.filter(
    (recipe) =>
      recipe.name.toLowerCase().includes(query.inputValue) ||
      recipe.description.toLowerCase().includes(query.inputValue)
  );*/

  // Compare l'ingrédient sélectionné avec tous les autres de la liste
  query.ingredients.forEach((item) => {
    console.log(item);
    allRecipes.forEach((currentRecipe) => {
      currentRecipe.ingredients.forEach((currentIngredient) => {
        if (currentIngredient.ingredient.trim() === item.trim()) {
          console.log("Trouvé (ingrédient)!", currentRecipe);
          listRecipesFiltered.push(currentRecipe);
        }
      });
    });
  });

  // Même chose pour appareils
  query.appliances.forEach((item) => {
    console.log(item);
    allRecipes.forEach((currentRecipe) => {
      // Vérifier si la propriété "appliances" existe et est un tableau
      if (currentRecipe.appliances && Array.isArray(currentRecipe.appliances)) {
        currentRecipe.appliances.forEach((currentAppliance) => {
          if (currentAppliance.appliance.trim() === item.trim()) {
            console.log("Trouvé (appareil)!", currentRecipe);
            listRecipesFiltered.push(currentRecipe);
          }
        });
      }
    });
  });

  // Même chose pour ustensils
  query.ustensils.forEach((item) => {
    console.log(item);
    allRecipes.forEach((currentRecipe) => {
      // Vérifier si la propriété "ustensils" existe et est un tableau
      if (currentRecipe.ustensils && Array.isArray(currentRecipe.ustensils)) {
        currentRecipe.ustensils.forEach((currentUstensil) => {
          console.log(
            "🚀 ~ file: index.js:608 ~ currentRecipe.ustensils.forEach ~ currentUstensil:",
            currentUstensil
          );
          if (currentUstensil.trim() === item.trim()) {
            console.log("Trouvé (ustensiles)!", currentRecipe);
            listRecipesFiltered.push(currentRecipe);
          }
        });
      }
    });
  });

  return listRecipesFiltered;
}

// Fonction qui affiche les recettes filtrées sur la page
function displayFilteredRecipes(recipes) {
  const recipesContainer = document.querySelector(".recipes-cards");
  recipesContainer.innerHTML = ""; // Efface tout contenu précédent

  recipes.forEach((recipe) => {
    const card = createRecipeCard(recipe);
    recipesContainer.appendChild(card);
  });

  const totalRecipesElement = document.getElementById("total-recipes");
  totalRecipesElement.textContent = formatWordRecipe(recipes.length);
}

displayQueryState();
