const express = require("express");
const cors = require("cors");
const app = express();
require('dotenv');
const mysqlConnection = require("./database");
const port = 3000;

// Your github page origin has to be written EXACTLY like this! https://behu-kea.github.io
const URL_FOR_FRONTEND = "YOUR_GITHUB_PAGE_ORIGIN_HERE";

let users = require("./data"); // users array imported from data.js

app.use(express.json()); //Used to parse JSON bodies
app.use(express.urlencoded({ extended: true })); //Parse URL-encoded bodies

// If the application is running localhost allow all requests,
// otherwise add cors for specific website
// Remember to add the NODE_ENV="prod" on server!
const cors_url = process.env.NODE_ENV === "prod" ? URL_FOR_FRONTEND : "*";
app.use(
    cors({
        origin: cors_url
    })
);

app.get('/api/wishes', (req, res) => {
    const query = "SELECT * FROM wishlist.wish;";
    mysqlConnection.query(
        query,
        (err, results, fields) => {
            if (!err) {
                res.json(results);
            } else {
                console.log(err);
            }
        }
    );
})

// create user
app.post('/api/wishes', (req, res) => {
        const text = req.body.text;
        const price = req.body.price;
        const description = req.body.description;

        mysqlConnection.query('INSERT INTO wish(text, price, description) values (?, ?, ?)', [text, price, description],
            (err, results, fields) => {
                if (!err) {
                    res.json('success');
                } else {
                    console.log(err);
                    res.json('error');
                }
            }
        )

    }
);

// This is the correct way to handle user input
app.get('/database-user-input', (req, res) => {
    const query = "SELECT * FROM wishlist.wish where description = ?;";
    const description = `asd`;
    mysqlConnection.query(
        query,
        [description],
        (err, results, fields) => {
            if (!err) {
                res.json(results);
            } else {
                console.log(err);
            }
        }
    );
})

// THE FOLLOWING CODE IS VULNERABLE AND SHOULD NOT BE USED!!!
// IT DELETES THE USERS TABLE IF YOU HAVE A TABLE CALLED USERS IN YOUR DATABASE
// To run this endpoint with sql injection go to the following page:
// http://localhost:3000/database-sql-injection/'; DROP TABLE users;--
// Read more about it here: https://planetscale.com/blog/how-to-prevent-sql-injection-attacks-in-node-js
app.get('/database-sql-injection/:description', (req, res) => {
    // THIS WILL DO AN SQL INJECTION: VERY BAD!!!!!
    const hackQuery = `SELECT * FROM wishlist.wish where description = '${req.params.description}';`;
    mysqlConnection.query(
        hackQuery,
        (err, results, fields) => {
            if (!err) {
                res.json(results);
            } else {
                console.log(err);
            }
        }
    );
})

// DO NOT MAKE YOUR CODE VULNERABLE TO SQL INJECTION!!!


app.get("/", (req, res) => {
    res.send("Hello World!");
});

// READ: read all users from users
app.get("/users", (req, res) => {
    return res.json(users);
});

// READ: get user by id
app.get("/users/:id", (req, res) => {
    const id = req.params.id;
    const user = users.find(item => item.id == id);
    return res.json(user);
});

// CREATE: create new user and add to users
app.post("/users", (req, res) => {
    let newUser = req.body;
    const timestamp = Date.now(); // dummy generated user id
    newUser.id = timestamp;
    users.push(newUser);
    return res.json(users);
});

// UPDATE: update existing user
app.put("/users/:id", (req, res) => {
    const id = req.params.id;
    const userData = req.body;
    let user = users.find(item => item.id == id);
    user.name = userData.name;
    user.title = userData.title;
    user.mail = userData.mail;
    user.image = userData.image;
    return res.json(users);
});

// DELETE: delete user
app.delete("/users/:id", (req, res) => {
    const id = req.params.id;
    users = users.filter(item => item.id != id);
    return res.json(users);
});

app.listen(port, () => {
    console.log(`Node.js REST API listening at http://localhost:${port}`);
});

