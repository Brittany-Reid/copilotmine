const fs = require("fs");
console.log("Parsing file to check formatting")
var file = fs.readFileSync("data/snippets-all.json", "utf-8")
var data = JSON.parse(file);
var snippets = undefined;
console.log(`Checking data. 
SAME snippets indicate that a previous query might have been recorded again accidentally.
This might occur if the code not able to be updated to a new query. 
EMPTY indicates no snippets returned, run again for these to confirm as internet issues could have prevented results.`)
for(var d of data){
    if(d.snippets == snippets){
        console.log("SAME: " + d.id)
    }
    if(d.snippets.length === 0){
        console.log("EMPTY: " + d.id);
    }
    snippets = d.snippets;
}