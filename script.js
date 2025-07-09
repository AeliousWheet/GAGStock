const API_URL = "https://api.joshlei.com/v2/growagarden/stock";
const rarityData = {
  rare: ["tomato","cauliflower","watermelon","pear","raspberry","foxglove","succulent","candy_sunflower","glowshroom","mint","nectarshade","bee_balm","peace_lily","dandelion","delphinium"],
  legendary: ["rafflesia","green_apple","avocado","banana","papaya","lilac","cantaloupe","violet_corn","cranberry","durian","moonflower","starfruit","aloe_vera","lumira"],
  mythical: ["pineapple","kiwi","bell_pepper","prickly_pear","peach","banana","passionfruit","pink_lily","purple_dahlia","parasol_flower","bendboo","cocovine","easter_egg","eggplant","moonglow","blood_banana","moon_melon","celestiberry","nectarine","guanabana","honeysuckle","suncoil","lily_of_the_valley","lemon"],
  divine: ["loquat","feijoa","pitcher_plant","soul_fruit","cursed_fruit","sunflower","rosy_delight","dragon_pepper","candy_blossom","venus_fly_trap","lotus","moon_blossom","moon_mango","hive_fruit","traveler's_fruit","cherry_blossom"],
  prismatic: ["sugar_apple","elephant_ears","ember_lily","beanstalk"]
};

function checkLogin() {
  if (!localStorage.getItem("authenticated")) window.location.href = "login.html";
}

function toggleDarkMode() {
  document.body.classList.toggle("dark");
}

function getRarity(itemId) {
  for (const rarity in rarityData) {
    if (rarityData[rarity].includes(itemId)) return rarity;
  }
  return null;
}

function renderFilters() {
  const filters = document.getElementById("rarity-filters");
  filters.innerHTML = Object.keys(rarityData).map(r => `
    <label><input type="checkbox" value="${r}" checked> ${r}</label><br>
  `).join("");
}

function matchesFilters(item) {
  const search = document.getElementById("search").value.toLowerCase();
  const checked = [...document.querySelectorAll("#rarity-filters input:checked")].map(i => i.value);
  const rarity = getRarity(item.item_id);
  return (!search || item.display_name.toLowerCase().includes(search)) && (!rarity || checked.includes(rarity));
}

function updateCountdowns() {
  document.querySelectorAll(".countdown").forEach(el => {
    const end = parseInt(el.dataset.end);
    const diff = Math.max(0, end - Math.floor(Date.now() / 1000));
    const mins = Math.floor(diff / 60);
    const secs = diff % 60;
    el.textContent = `${mins}m ${secs}s`;
  });
}

async function loadStock() {
  const container = document.getElementById("items");
  container.innerHTML = "Loading...";
  const res = await fetch(API_URL);
  const json = await res.json();
  container.innerHTML = "";

  Object.keys(json).forEach(category => {
    if (!Array.isArray(json[category])) return;
    json[category].forEach(item => {
      if (!matchesFilters(item)) return;
      const rarity = getRarity(item.item_id);
      const div = document.createElement("div");
      div.className = "item";
      div.innerHTML = `
        <div>
          <img src="${item.icon}" alt="${item.display_name}">
          <strong>${item.display_name}</strong> [${item.quantity}]<br>
          <small class="countdown" data-end="${item.end_date_unix}"></small>
        </div>
        <span>${rarity ? rarity : ""}</span>
      `;
      container.appendChild(div);
    });
  });
  updateCountdowns();
}

renderFilters();
document.getElementById("search").addEventListener("input", loadStock);
document.getElementById("rarity-filters").addEventListener("change", loadStock);
setInterval(() => {
  updateCountdowns();
}, 1000);
setInterval(loadStock, 60000);
loadStock();
