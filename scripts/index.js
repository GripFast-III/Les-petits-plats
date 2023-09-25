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

getRecipes()
  .then((data) => {
    console.log("🚀 ~ file: index.js:20 ~ .then ~ data:", data);
    data.forEach((recipe) => console.log(recipe));
  })
  .catch((err) => {
    console.log("Error", err);
  });
