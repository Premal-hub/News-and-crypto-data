const API_KEY = "d727cc29acda44c3a813a205e5e875ec";
const url = "https://newsapi.org/v2/everything?q=";

async function fetchData(query) {
    try {
        const res = await fetch(`${url}${query}&apiKey=${API_KEY}`);
        if (!res.ok) {
            throw new Error(`Failed to fetch: ${res.status} ${res.statusText}`);
        }
        const data = await res.json();
        return data;
    } catch (error) {
        console.error("Error fetching data:", error);
        return { articles: [] }; // Return empty array to prevent errors
    }
}

// Menu button
let mobilemenu = document.querySelector(".mobile");
let menuBtn = document.querySelector(".menuBtn");
let menuBtnDisplay = true;

menuBtn.addEventListener("click", () => {
    mobilemenu.classList.toggle("hidden");
});

// Render news 
function renderMain(arr) {
    // Sort articles by published date in descending order
    arr.sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt));

    let mainHTML = '';
    for (let i = 0; i < arr.length; i++) {
        if (arr[i].urlToImage) {
            mainHTML += `<div class="card">
                            <a href=${arr[i].url}>
                                <img src=${arr[i].urlToImage} lazy="loading" />
                                <h4>${arr[i].title}</h4>
                                <div class="publishbyDate">
                                    <p>${arr[i].source.name}</p>
                                    <span>•</span>
                                    <p>${new Date(arr[i].publishedAt).toLocaleDateString()}</p>
                                </div>
                                <div class="desc">
                                    ${arr[i].description}
                                </div>
                            </a>
                        </div>`;
        }
    }

    document.querySelector("main").innerHTML = mainHTML;
}

const searchBtn = document.getElementById("searchForm");
const searchBtnMobile = document.getElementById("searchFormMobile");
const searchInputMobile = document.getElementById("searchInputMobile");
const searchInput = document.getElementById("searchInput");

searchBtn.addEventListener("submit", async (e) => {
    e.preventDefault();
    const data = await fetchData(searchInput.value);
    renderMain(data.articles);
});

searchBtnMobile.addEventListener("submit", async (e) => {
    e.preventDefault();
    const data = await fetchData(searchInputMobile.value);
    renderMain(data.articles);
});

async function Search(query) {
    const data = await fetchData(query);
    renderMain(data.articles);
}

// Initial fetch and render
fetchData("all").then(data => renderMain(data.articles));
