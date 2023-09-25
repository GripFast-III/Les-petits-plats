// Récupère les recettes depuis le fichier recipes.json
async function getRecipes() {
  try {
    const response = await fetch("./../recipes.json");
    if (response.ok) {
      const recipesData = await response.json();
      return recipesData.recipes;
    } else {
      throw new Error("Erreur de la récupération de la donnéee");
    }
  } catch (error) {
    return error;
  }
}

// Génère les éléments HTML d'une recette
function createRecipeCard(recipe) {
  const card = document.createElement("article");
  card.classList.add("card");

  const cardContent = document.createElement("div");
  cardContent.classList.add("card-content");

  const imgRecipe = document.createElement("div");
  imgRecipe.classList.add("img-recipe");

  const img = document.createElement("img");
  img.classList.add("illustration");
  img.src = `images/recipes/${recipe.image}`;
  img.alt = recipe.name;

  imgRecipe.appendChild(img);

  const recipeTitle = document.createElement("div");
  recipeTitle.classList.add("recipe-title");
  const h2 = document.createElement("h2");
  h2.textContent = recipe.name;
  recipeTitle.appendChild(h2);

  const recipeWhole = document.createElement("div");
  recipeWhole.classList.add("recipe-whole");

  const recipeText = document.createElement("div");
  recipeText.classList.add("recipe-text");
  const h3Text = document.createElement("h3");
  h3Text.textContent = "RECETTE";
  const pText = document.createElement("p");
  pText.textContent = recipe.description;
  recipeText.appendChild(h3Text);
  recipeText.appendChild(pText);

  const recipeIngredients = document.createElement("div");
  recipeIngredients.classList.add("recipe-ingredients");
  const h3Ingredients = document.createElement("h3");
  h3Ingredients.textContent = "INGRÉDIENTS";

  const ulIngredients = document.createElement("ul");
  recipe.ingredients.forEach((ingredient) => {
    const li = document.createElement("li");
    li.textContent = `${ingredient.ingredient} ${ingredient.quantity || ""} ${
      ingredient.unit || ""
    }`;
    ulIngredients.appendChild(li);
  });

  recipeIngredients.appendChild(h3Ingredients);
  recipeIngredients.appendChild(ulIngredients);

  recipeWhole.appendChild(recipeText);
  recipeWhole.appendChild(recipeIngredients);

  cardContent.appendChild(imgRecipe);
  cardContent.appendChild(recipeTitle);
  cardContent.appendChild(recipeWhole);

  card.appendChild(cardContent);

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
    totalRecipesElement.textContent = `${recipes.length} RECETTES`;
  } catch (error) {
    console.error("Erreur lors de l'affichage des recettes:", error);
  }
}

// Appel la fonction pour afficher les recettes
displayRecipes();

getRecipes()
  .then((data) => {
    console.log("🚀 ~ file: index.js:20 ~ .then ~ data:", data);
    data.forEach((recipe) => console.log(recipe));
  })
  .catch((err) => {
    console.log("Error", err);
  });
