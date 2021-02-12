const express = require("express");
const bodyParser = require("body-parser");
const router = express.Router();
const app = express();
const scraper = require("./browser.js");
var links;
var dollAnalysis;
var dollTitle;

app.set('view engine', 'pug');
app.set('views', './views');

//Configuring express to use body-parser as middle-ware
app.use(bodyParser.urlencoded({ extended: true }));

router.get('/', (req, res) => {
    res.render('index');
});

router.get('/search', (req, res) => {
    var doll_name = req.query.dollqry;
    scraper.read(doll_name).then(choices => {
        let arr = [];
        links = choices;
        console.log(links);
        for (let i = 0; i < 3; i++) {
            if (typeof choices[i] === "number") {
                arr[i] = 0;
            } else {
                arr[i] = Object.keys(choices[i]);
            }
        }
        console.log(arr);
        res.render('choices', {
            choices1: arr[0],
            choices2: arr[1],
            choices3: arr[2]
        });
    });
});

router.get('/results', (req, res) => {
    console.log(dollAnalysis);
    res.render('results', {
        dollname: dollTitle,
        analysis: dollAnalysis
    });
});

app.post('/result', (req, res) => {
    console.log('Received:', req.body);
    dollTitle = req.body.one;
    let arrLinks = get_links(links, req.body);
    console.log(arrLinks);
    scraper.getAnalysis(arrLinks).then(analysis => {
        dollAnalysis = analysis;
        res.sendStatus(200);
    });
});

// add router in the Express app.
app.use("/", router);
app.listen(process.env.PORT || 5000);


function get_links(links, choices) {
    let choices1 = choices.one;
    let choices2 = choices.two;
    let choices3 = choices.three;
    let link1 = links[0][choices1];
    let link2 = links[1][choices2];
    let link3 = links[2][choices3];
    return [{"url" : link1}, {"url" : link2},{"url" : link3}]
}
