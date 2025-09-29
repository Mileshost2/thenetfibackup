const key = "8967d6df52ca4d4ea96078b35bf4dbae"
        const url = `https://newsapi.org/v2/everything?q=crypto&language=en&sortBy=publishedAt&pageSize=40&apiKey=${key}`
        // const url2 = "https://newsapi.org/v1/articles?source=google-news&sortBy=top&apiKey=c55af11f34c64d9e850f33521649b1a3";

        const recievedNews = (newsdata) => {
            const articlesDiv = document.querySelector(".articles")
            newsdata.articles.forEach((article) => {
                    
                    //Here we create and add html elements to our html file
            const div = document.createElement("div")
            div.className = "news"
            div.innerHTML = `
                    <p>${article.title}</p>
                    <img src="${article.urlToImage}"/>
                    <a href="${article.url}">${article.content.slice(0, 100)}</a>`
                    
            articlesDiv.appendChild(div)
                    
            })
        }

        //Fetch sends a request to the API.
        //Promise makes it possible to run this in the background. När vi får APIet då går den vidare och skickar tillbaka JSON.
        fetch(url)
        .then(response => response.json())
        .then(recievedNews)