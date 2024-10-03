"use strict";
const PORT = 8090;
const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');

const application = express();
const articles = [];

const newspapers = [
  {
    name: 'cityam',
    address: 'https://www.cityam.com/london-must-become-a-world-leader-on-climate-change-action/',
    base: ''
},
{
    name: 'thetimes',
    address: 'https://www.thetimes.co.uk/environment/climate-change',
    base: ''
},
{
    name: 'guardian',
    address: 'https://www.theguardian.com/environment/climate-crisis',
    base: '',
},
{
    name: 'telegraph',
    address: 'https://www.telegraph.co.uk/climate-change',
    base: 'https://www.telegraph.co.uk',
},
// {
//     name: 'nyt',
//     address: 'https://www.nytimes.com/international/section/climate',
//     base: '',
// },
// {
//     name: 'latimes',
//     address: 'https://www.latimes.com/environment',
//     base: '',
// },
// {
//     name: 'smh',
//     address: 'https://www.smh.com.au/environment/climate-change',
//     base: 'https://www.smh.com.au',
// },
// {
//     name: 'un',
//     address: 'https://www.un.org/climatechange',
//     base: '',
// },
// {
//     name: 'bbc',
//     address: 'https://www.bbc.co.uk/news/science_and_environment',
//     base: 'https://www.bbc.co.uk',
// },
// {
//     name: 'es',
//     address: 'https://www.standard.co.uk/topic/climate-change',
//     base: 'https://www.standard.co.uk'
// },
// {
//     name: 'sun',
//     address: 'https://www.thesun.co.uk/topic/climate-change-environment/',
//     base: ''
// },
// {
//     name: 'dm',
//     address: 'https://www.dailymail.co.uk/news/climate_change_global_warming/index.html',
//     base: ''
// },
// {
//     name: 'nyp',
//     address: 'https://nypost.com/tag/climate-change/',
//     base: ''
// }
  // {
  //   name: "thetimes",
  //   address: "https://www.thetimes.com/uk/environment/climate-change",
  // },
  // {
  //   name: "guardian",
  //   address: "https://www.theguardian.com/environment/climate-crisis",
  // },
  // {
  //   name: "telegraph",
  //   address: "https://www.telegraph.co.uk/climate-change",
  // },
];

// Route for the root endpoint, sends a simple welcome message
application.get('/', (req, res) => {
    res.status(200).json('Welcome to my Climate Change News API');
});

// Route for the /news endpoint, fetches data from the newspapers
application.get('/news', async (req, res) => {
    try {
        // Clear the articles array to avoid duplication on multiple requests
        articles.length = 0;

        // Loop through each newspaper and fetch data
        for (let newspaper of newspapers) {
            const { name, address } = newspaper;
            try {
                // Fetch the HTML content from the newspaper's page
                const axiosResponse = await axios.get(address);
                
                // Load the HTML into Cheerio
                const html = axiosResponse.data;
                const $ = cheerio.load(html);

                // Conditional logic for different newspaper structures

                if(name === "cityam") {
                   $('div.card__content').each(function () {
                    const title = $(this).find('h3').text()
                    const url = $(this).find('a').attr('href');

                    if( title && url ){
                      articles.push({
                        title,
                        url: url.startsWith('http') ? url : `${address}${url}`,
                        source: name
                      });
                    }
                   })
                } else if(name === "thetimes") {
                    // Special extraction logic for The Times                        
                     $('div.css-6mf806').each(function () {
                              const title = $(this).find('span.css-17x5lw').text()  // Get the title inside the h3 tag
                               const url = $(this).find('a').attr('href');  // Get the href from the anchor tag
                       
                        if (title && url) {
                            articles.push({
                                title,
                                url: url.startsWith('http') ? url : `${address}${url}`, // Handle relative URLs
                                source: name,
                            });
                        }
                    });
                } else if (name === "guardian") {
                    // Extraction logic for The Guardian
                    $('div').each(function () {
                              const title = $(this).find('h3.card-headline').text();  // Get the title inside the h3 tag
                               const url = $(this).find('a').attr('href');  // Get the href from the anchor tag
                        
                        if (title && url) {
                            articles.push({
                                title,
                                url: url.startsWith('http') ? url : `${address}${url}`,
                                source: name,
                            });
                        }
                    });
                } else if (name === "telegraph") {
                    // Extraction logic for The Telegraph
                    $('a.list-headline__link').each(function () {
                        const title = $(this).text().trim();  // Get the title text
                        const url = $(this).attr('href');  // Get the href attribute
                        
                        if (title && url) {
                            articles.push({
                                title,
                                url: url.startsWith('http') ? url : `${address}${url}`,
                                source: name,
                            });
                        }
                    });
                }else if( name === "nyt"){
                  $('div').each(function () {
                    const title = $(this).find('').text();
                    const url  = $(this).find('a').attr('href');

                    if(title && url) {
                      articles.push({
                        title,
                        url: url.startsWith('http') ? url : `${address}${url}`, // Handle relative URLs
                        source: name,
                      })
                    }
                  })
                }
                
                
                else {
                    // Default extraction logic if newspaper isn't handled
                    $('a').each(function () {
                        const title = $(this).text().trim();  // Get the title text
                        const url = $(this).attr('href');  // Get the href attribute
                        
                        if (title && url) {
                            articles.push({
                                title,
                                url: url.startsWith('http') ? url : `${address}${url}`,
                                source: name,
                            });
                        }
                    });
                }
            } catch (error) {
                console.error(`Error fetching data from ${name}:`, error.message);
            }
        }

        // If no articles were found, send a message
        if (articles.length === 0) {
            console.log("No articles found with the current selectors.");
        }

        // Respond to the client with the fetched articles
        res.status(200).json(articles);
    } catch (err) {
        // If there is a general error, log it and respond with a 500 status and error message
        console.error(err);
        res.status(500).json({ message: 'Error fetching news' });
    }
});

// //Route for the /news/newspaperId endpoint, fetches data from a specific newpaper
// application.get('/news/:newspaperId', async(req, res) => {
//   try {
//     const newspaperId = req.params.newspaperId;

//     // Find the newspaper by its name
//     const newspaper = newspapers.find(newspaper => newspaper.name === newspaperId);

//     // If newspaper is not found, return a 404 error
//     if (!newspaper) {
//       return res.status(404).json({ message: `Newspaper not found - ${newspaperId}` });
//     }
    
//     const newspapername = newspaper.name
//     const newspaperAddress = newspaper.address;

//     // console.log(newspaperAddress);

//      // Fetch the HTML content from the newspaper's page
//      const axiosResponse = await axios.get(newspaperAddress);
                
//      // Load the HTML into Cheerio
//      const html = axiosResponse.data;
//      const $ = cheerio.load(html);

//       // Conditional logic for different newspaper structures
//       if (newspapername === "thetimes") {
//         // Special extraction logic for The Times                        
//          $('div.css-6mf806').each(function () {
//                   const title = $(this).find('span.css-17x5lw').text()  // Get the title inside the h3 tag
//                    const url = $(this).find('a').attr('href');  // Get the href from the anchor tag
           
//             // if (title && url) {
//             //     articles.push({
//             //         title,
//             //         url: url.startsWith('http') ? url : `${address}${url}`, // Handle relative URLs
//             //         source: newspapername,
//             //     });
//             // }
//         });
//     } else if (newspapername === "guardian") {
//         // Extraction logic for The Guardian
//         $('div').each(function () {
//                   const title = $(this).find('h3.card-headline').text();  // Get the title inside the h3 tag
//                    const url = $(this).find('a').attr('href');  // Get the href from the anchor tag
            
//             // if (title && url) {
//             //     articles.push({
//             //         title,
//             //         url: url.startsWith('http') ? url : `${address}${url}`,
//             //         source: newspapername,
//             //     });
//             // }
//         });
//     } else if (newspapername === "telegraph") {
//         // Extraction logic for The Telegraph
//         $('a.list-headline__link').each(function () {
//             const title = $(this).text().trim();  // Get the title text
//             const url = $(this).attr('href');  // Get the href attribute
            
//             // if (title && url) {
//             //     articles.push({
//             //         title,
//             //         url: url.startsWith('http') ? url : `${address}${url}`,
//             //         source: newspapername,
//             //     });
//             // }
//         });
//     } else {
//         // Default extraction logic if newspaper isn't handled
//         $('a').each(function () {
//             const title = $(this).text().trim();  // Get the title text
//             const url = $(this).attr('href');  // Get the href attribute
            
//             // if (title && url) {
//             //     articles.push({
//             //         title,
//             //         url: url.startsWith('http') ? url : `${address}${url}`,
//             //         source: name,
//             //     });
//             // }
//         });
//     }

//     if (title && url) {
//       articles.push({
//           title,
//           url: url.startsWith('http') ? url : `${address}${url}`, // Handle relative URLs
//           source: newspapername,
//       });
//   }

//     // You can now fetch data from the newspaper address or return it to the user
//     res.status(200).json({ articles });
//   } catch (err) {
//     console.log(err);
//     res.status(500).json({message: 'Error fetching news Buddy!!'})
//   }
// })

// Route for the /news/:newspaperId endpoint, fetches data from a specific newspaper
application.get('/news/:newspaperId', async (req, res) => {
  try {
    const newspaperId = req.params.newspaperId;

    // Find the newspaper by its name
    const newspaper = newspapers.find(newspaper => newspaper.name === newspaperId);

    // If newspaper is not found, return a 404 error
    if (!newspaper) {
      return res.status(404).json({ message: `Newspaper not found - ${newspaperId}` });
    }
    
    const newspapername = newspaper.name;
    const newspaperAddress = newspaper.address;

    // Initialize an empty array to store the articles
    const articles = [];

    // Fetch the HTML content from the newspaper's page
    const axiosResponse = await axios.get(newspaperAddress);
                
    // Load the HTML into Cheerio
    const html = axiosResponse.data;
    const $ = cheerio.load(html);

    // Conditional logic for different newspaper structures
    if (newspapername === "thetimes") {
      // Special extraction logic for The Times                        
      $('div.css-6mf806').each(function () {
        const title = $(this).find('span.css-17x5lw').text().trim();  // Get the title inside the h3 tag
        const url = $(this).find('a').attr('href');  // Get the href from the anchor tag
        
        if (title && url) {
          articles.push({
            title,
            url: url.startsWith('http') ? url : `${newspaperAddress}${url}`, // Handle relative URLs
            source: newspapername,
          });
        }
      });
    } else if (newspapername === "guardian") {
      // Extraction logic for The Guardian
      $('div').each(function () {
        const title = $(this).find('h3.card-headline').text().trim();  // Get the title inside the h3 tag
        const url = $(this).find('a').attr('href');  // Get the href from the anchor tag
        
        if (title && url) {
          articles.push({
            title,
            url: url.startsWith('http') ? url : `${newspaperAddress}${url}`,
            source: newspapername,
          });
        }
      });
    } else if (newspapername === "telegraph") {
      // Extraction logic for The Telegraph
      $('a.list-headline__link').each(function () {
        const title = $(this).text().trim();  // Get the title text
        const url = $(this).attr('href');  // Get the href attribute
        
        if (title && url) {
          articles.push({
            title,
            url: url.startsWith('http') ? url : `${newspaperAddress}${url}`,
            source: newspapername,
          });
        }
      });
    } else {
      // Default extraction logic if newspaper isn't handled
      $('a').each(function () {
        const title = $(this).text().trim();  // Get the title text
        const url = $(this).attr('href');  // Get the href attribute
        
        if (title && url) {
          articles.push({
            title,
            url: url.startsWith('http') ? url : `${newspaperAddress}${url}`,
            source: newspapername,
          });
        }
      });
    }

    // Send the articles as the response
    res.status(200).json({ articles });

  } catch (err) {
    console.log(err);
    res.status(500).json({ message: 'Error fetching news Buddy!!' });
  }
});


// Start the server on the specified port and log a message once it's running
application.listen(PORT, () => console.log(`Server running at Port: ${PORT}`));


