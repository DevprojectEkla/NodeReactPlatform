const articles = require('../data/articles')

//beware that the data for this model, articles.json is an object that returns an array also called articles so to access the methods on the array we have to do articles.articles 

function findAll(req, res) {
    return new Promise((resolve, reject) => 
        resolve(articles)
    )
}
function check_valid_id(id){
 const numericId = parseInt(id, 10); // Convert the passed id to a numeric value 10 is for base 10

    if (isNaN(numericId)) {
      reject(`Invalid ID: ${id}`);
      return;
    }
    else{return numericId}

}
function findById(id){
    const valid_id = check_valid_id(id);
       return new Promise((resolve,reject) =>{
        const article = articles.articles.find((a) => a.id === valid_id )
        console.log(`Found ID: ${article}`)
    resolve(article)
    })
}

module.exports = {findAll, findById}
