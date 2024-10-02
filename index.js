"use strict";
const PORT = 8090;
const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');

const application = express();
const articles = [];

const newpapers = [
  {
    name: "thetimes",
    address: "https://www.thetimes.com/uk/environment/climate-change",
  },
  {
    name: "guardian",
    address: "https://www.theguardian.com/environment/climate-crisis",
  },
  {
    name: "telegraph",
    address: "https://www.telegraph.co.uk/climate-change/",
  },
];

// Route for the root endpoint, sends a simple welcome message
application.get('/', (req, res) => {
    res.status(200).json('Welcome to my Climate Change News API');
});

// Route for the /news endpoint, fetches data from The Guardian's climate crisis page
application.get('/news', async (req, res) => {
    try {
        // Fetching the HTML content from The Guardian's climate crisis page
        const axiosResponse = await axios.get('https://www.theguardian.com/environment/climate-crisis');
        
        // Load the HTML into Cheerio
        const html = axiosResponse.data;
        const $ = cheerio.load(html);

        // Clear the articles array to avoid duplication on multiple requests
        articles.length = 0;

        // Select the div with the class "dcr-uh1jz3" and find relevant anchor tags
        $('div').each(function () {
            const title = $(this).find('h3.card-headline').text();  // Get the title inside the h3 tag
            const url = $(this).find('a').attr('href');  // Get the href from the anchor tag
            
            // Push the article details into the articles array
            if (title && url) {
                articles.push({
                    title: title.trim(),
                    url: `https://www.theguardian.com${url}`  // Prepend domain if the URL is relative
                });
            }
        });

        // If no articles were found, send a message
        if (articles.length === 0) {
            console.log("No articles found with the current selector.");
        }




        

        // Respond to the client with the fetched articles
        res.status(200).json(articles);
    } catch (error) {
        // If there is an error, log it and respond with a 500 status and error message
        console.error(error);
        res.status(500).json({ message: 'Error fetching news' });
    }
});

// Start the server on the specified port and log a message once it's running
application.listen(PORT, () => console.log(`Server running at Port: ${PORT}`));










// "use strict";
// const PORT = 8090;
// const express = require('express');
// const axios = require('axios');
// const cheerio = require('cheerio');

// const application = express();
// const articles = [];

// const newspapers = [
//   {
//     name: "thetimes",
//     address: "https://www.thetimes.com/uk/environment/climate-change",
//   },
//   {
//     name: "guardian",
//     address: "https://www.theguardian.com/environment/climate-crisis",
//   },
//   {
//     name: "telegraph",
//     address: "https://www.telegraph.co.uk/climate-change/",
//   },
// ];

// // Route for the root endpoint, sends a simple welcome message
// application.get('/', (req, res) => {
//     res.status(200).json('Welcome to my Climate Change News API');
// });

// // Route for the /news endpoint, fetches data from the newspapers
// application.get('/news', async (req, res) => {
//     try {
//         // Clear the articles array to avoid duplication on multiple requests
//         articles.length = 0;

//         // Loop through each newspaper and fetch data
//         for (let newspaper of newspapers) {
//             const { name, address } = newspaper;
//             try {
//                 // Fetch the HTML content from the newspaper's page
//                 const axiosResponse = await axios.get(address);
                
//                 // Load the HTML into Cheerio
//                 const html = axiosResponse.data;
//                 const $ = cheerio.load(html);

//                 // Extract and push articles into the articles array
//                 $('a').each(function () {
//                     const title = $(this).text().trim();  // Get the title text inside the anchor tag
//                     const url = $(this).attr('href');  // Get the href attribute
                    
//                     // If title and URL exist, push to the articles array
//                     if (title && url) {
//                         articles.push({
//                             title,
//                             url: url.startsWith('http') ? url : `${address}${url}`, // Handle relative URLs
//                             source: name,  // Add the source name to identify the newspaper
//                         });
//                     }
//                 });
//             } catch (error) {
//                 console.error(`Error fetching data from ${name}:`, error.message);
//             }
//         }

//         // If no articles were found, send a message
//         if (articles.length === 0) {
//             console.log("No articles found with the current selectors.");
//         }

//         // Respond to the client with the fetched articles
//         res.status(200).json(articles);
//     } catch (error) {
//         // If there is a general error, log it and respond with a 500 status and error message
//         console.error(error);
//         res.status(500).json({ message: 'Error fetching news' });
//     }
// });

// // Start the server on the specified port and log a message once it's running
// application.listen(PORT, () => console.log(`Server running at Port: ${PORT}`));

