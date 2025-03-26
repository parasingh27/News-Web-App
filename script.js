const API_KEY = "24ecc0bc5202412c9ff97e7d6feda1fb";
const url = "https://api.allorigins.win/raw?url=";

// Theme toggle functionality
const themeToggle = document.getElementById('theme-toggle');
const themeIcon = themeToggle.querySelector('.theme-icon');

// Bookmark functionality
let bookmarks = JSON.parse(localStorage.getItem('bookmarks')) || [];

// Check for saved theme preference
const savedTheme = localStorage.getItem('theme');
if (savedTheme) {
    document.documentElement.setAttribute('data-theme', savedTheme);
    updateThemeIcon(savedTheme);
}

themeToggle.addEventListener('click', () => {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    updateThemeIcon(newTheme);
});

function updateThemeIcon(theme) {
    themeIcon.textContent = theme === 'dark' ? '☀️' : '🌙';
}

function toggleBookmark(article, button) {
    const isBookmarked = bookmarks.some(bookmark => bookmark.url === article.url);
    
    if (isBookmarked) {
        bookmarks = bookmarks.filter(bookmark => bookmark.url !== article.url);
        button.classList.remove('bookmarked');
    } else {
        bookmarks.push(article);
        button.classList.add('bookmarked');
    }
    
    localStorage.setItem('bookmarks', JSON.stringify(bookmarks));
}

function showBookmarks() {
    const cardsContainer = document.getElementById('cards-container');
    const navItems = document.querySelectorAll('.nav-item');
    
    navItems.forEach(item => item.classList.remove('active'));
    document.getElementById('bookmarks').classList.add('active');
    
    if (bookmarks.length === 0) {
        cardsContainer.innerHTML = '<div class="error">No bookmarked articles yet.</div>';
        return;
    }
    
    bindData(bookmarks);
}

console.log("running")
window.addEventListener('load', () => fetchNews("India"));

function reload() {
   window.location.reload();
}

async function fetchNews (query) {
   try {
      const cardsContainer = document.getElementById('cards-container');
      cardsContainer.innerHTML = '<div class="loading">Loading news... Please wait while we fetch the latest news.</div>';
      
      // Get filter values
      const fromDate = document.getElementById('from-date').value;
      const toDate = document.getElementById('to-date').value;
      const sortBy = document.getElementById('sort-by').value;
      const language = document.getElementById('language').value;
      const source = document.getElementById('source').value;
      
      // Build query parameters
      let params = new URLSearchParams({
         q: query,
         sortBy: sortBy,
         language: language,
         apiKey: API_KEY
      });
      
      // Add optional parameters if they have values
      if (fromDate) params.append('from', fromDate);
      if (toDate) params.append('to', toDate);
      if (source) params.append('sources', source);
      
      const newsUrl = `https://newsapi.org/v2/everything?${params.toString()}`;
      const res = await fetch(url + encodeURIComponent(newsUrl));
      
      if (!res.ok) {
         throw new Error(`HTTP error! status: ${res.status}`);
      }
      
      const data = await res.json();
      console.log('API Response:', data); // Debug log
      
      if (data.status === 'error') {
         throw new Error(data.message || 'API Error');
      }
      
      if (!data.articles || data.articles.length === 0) {
         cardsContainer.innerHTML = '<div class="error">No news found for this topic.</div>';
         return;
      }
      
      bindData(data.articles);
   } catch (error) {
      console.error('Error fetching news:', error);
      const cardsContainer = document.getElementById('cards-container');
      cardsContainer.innerHTML = `<div class="error">Failed to load news: ${error.message}. Please try again later.</div>`;
   }
}

function bindData(articles){
   const cardsContainer = document.getElementById('cards-container');
   const newsCardTemplate = document.getElementById('template-news-card');

   cardsContainer.innerHTML = '';

   articles.forEach(article => {
     if(!article.urlToImage) return; 
     const cardClone = newsCardTemplate.content.cloneNode(true);
     fillDataInCard(cardClone, article);
     cardsContainer.appendChild(cardClone);
   });
}

function fillDataInCard(cardClone, article) {
   const newsImg = cardClone.querySelector('#news-img');
   const newsTitle = cardClone.querySelector('#news-title');
   const newsSource = cardClone.querySelector('#news-source');
   const newsDesc = cardClone.querySelector('#news-desc');
   const bookmarkBtn = cardClone.querySelector('#bookmark-btn');

   newsImg.src = article.urlToImage;
   newsTitle.innerHTML = article.title;
   newsDesc.innerHTML = article.description;

   const date=new Date(article.publishedAt).toLocaleString("en-Us",{
      timeZone: "Asia/Jakarta"
   });

   newsSource.innerHTML = `${article.source.name} . ${article.source.name} . ${date}`;

   // Set bookmark state
   const isBookmarked = bookmarks.some(bookmark => bookmark.url === article.url);
   if (isBookmarked) {
       bookmarkBtn.classList.add('bookmarked');
   }

   // Add bookmark click handler
   bookmarkBtn.addEventListener('click', (e) => {
       e.stopPropagation();
       toggleBookmark(article, bookmarkBtn);
   });

   cardClone.firstElementChild.addEventListener("click", () => {
      window.open(article.url, "_blank");
   });
}

let curSelectedNav = null;
function onNavItemClick(id) {
   fetchNews(id);
   const navItem = document.getElementById(id);
   curSelectedNav?.classList.remove('active');
   curSelectedNav = navItem;
   curSelectedNav.classList.add('active');
}

const searchButton = document.getElementById('search-button');
const searchText = document.getElementById('search-text');

searchButton.addEventListener("click", () => {
   const query = searchText.value;
   if (!query) return;
   fetchNews(query);
   curSelectedNav?.classList.remove("active");
   curSelectedNav = null;
});

// Add event listeners for filter changes
document.getElementById('sort-by').addEventListener('change', () => {
   const query = searchText.value || 'India';
   fetchNews(query);
});

document.getElementById('language').addEventListener('change', () => {
   const query = searchText.value || 'India';
   fetchNews(query);
});

document.getElementById('source').addEventListener('change', () => {
   const query = searchText.value || 'India';
   fetchNews(query);
});

document.getElementById('from-date').addEventListener('change', () => {
   const query = searchText.value || 'India';
   fetchNews(query);
});

document.getElementById('to-date').addEventListener('change', () => {
   const query = searchText.value || 'India';
   fetchNews(query);
});

// Trending topics
const trendingTopics = [
    'Technology', 'Sports', 'Entertainment', 'Business', 'Science',
    'Health', 'Politics', 'World', 'Education', 'Environment'
];

function initializeTrendingTopics() {
    const trendingList = document.getElementById('trending-topics');
    trendingTopics.forEach(topic => {
        const topicElement = document.createElement('div');
        topicElement.className = 'trending-topic';
        topicElement.textContent = topic;
        topicElement.addEventListener('click', () => {
            // Remove active class from all topics
            document.querySelectorAll('.trending-topic').forEach(t => t.classList.remove('active'));
            // Add active class to clicked topic
            topicElement.classList.add('active');
            // Fetch news for the selected topic
            fetchNews(topic);
            // Clear any active nav items
            curSelectedNav?.classList.remove('active');
            curSelectedNav = null;
        });
        trendingList.appendChild(topicElement);
    });
}

// Initialize trending topics when the page loads
window.addEventListener('load', () => {
    fetchNews("India");
    initializeTrendingTopics();
});