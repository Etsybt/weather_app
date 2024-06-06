const apiKey = '95850547-dcc7-480d-8b48-1d1ab98d3820';
const newsContainer = document.querySelector('.news-articles');

async function fetchNews() {
  try {
    const response = await fetch(`https://content.guardianapis.com/search?q=climat&api-key=${apiKey}&show-fields=thumbnail,headline,trailText,short-url`);
    const data = await response.json();
    displayNews(data.response.results);
  } catch (error) {
    console.error('Error fetching news:', error);
  }
}

function displayNews(articles) {
  newsContainer.innerHTML = '';
  articles.forEach(article => {
    const newsArticle = document.createElement('div');
    newsArticle.classList.add('news-article');
    newsArticle.innerHTML = `
      <img src="${article.fields.thumbnail || 'path-to-your-default-image.jpg'}" alt="News Image">
      <h3>${article.fields.headline}</h3>
      <p>${article.fields.trailText}</p>
      <a href="${article.fields.shortUrl}" target="_blank">Read more</a>
    `;
    newsContainer.appendChild(newsArticle);
  });
}

document.addEventListener('DOMContentLoaded', fetchNews);