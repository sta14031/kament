const express = require('express')
const app = express()
require('dotenv').config();

var bodyParser = require('body-parser');
app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies

const bcrypt = require('bcrypt')

const connectionString = process.env.DATABASE_URL
const { Pool } = require('pg')

const pool = new Pool({connectionString: connectionString});
const path = require('path')
const PORT = process.env.PORT || 5000

const session = require('express-session')

app.use(express.static(path.join(__dirname, 'public')))
app.use(session({
  resave: false,
  saveUninitialized: true,
  secret: "The greatest secret string in all of CS313"
}))
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'ejs')

// The root
app.get('/', (req, res) => {
  res.render(
    'pages/view_posts',
    {
      userID: req.session.userID,
      username: req.session.username,
      query: req.query
    })
})

// Get all posts utility
app.post('/getPosts', (req, res) => {
  pool.query('\
SELECT *, (SELECT COUNT(*) AS CommentCount FROM \
  (SELECT * FROM \
    Comments c1 LEFT JOIN Posts p1 ON c1.Post = p1.PostId \
  ) c2 WHERE c2.Post = p2.PostId) \
FROM \
  Posts p2 LEFT JOIN Users u ON p2.Poster = u.UserId \
ORDER BY p2.PostId DESC\
  ', 
  (err, qres) => {
    if (err) throw err;
    res.send(JSON.stringify(qres.rows))
    res.end()
  })
})

// View comments link
app.get('/view_comments', (req, res) => {
  res.render(
    'pages/view_comments',
    {
      userID: req.session.userID,
      username: req.session.username,
      query: req.query
    })
})

// Get all comments on a post utility
/*app.post('/getComments', (req, res) => {
  pool.query('\
SELECT * FROM \
Comments c LEFT JOIN Posts p ON c.Post = p.PostId \
           LEFT JOIN Users u ON c.Poster = u.UserId \
WHERE c.Post = $1\
ORDER BY c.CommentId',
  [req.body.postid], (err, qres) => {
  if (err) throw err;
    res.send(JSON.stringify(qres.rows))
    res.end();
  })
})*/

// Get all comments on a post utility
app.post('/getComments', (req, res) => {
  // Query to get the post information
  pool.query('\
SELECT p.PostId, p.Poster, p.Title, p.Body, p.IsLink, \
       u.UserId, u.Username FROM \
Posts p LEFT JOIN Users u ON p.Poster = u.UserId \
WHERE p.PostId = $1',
    [req.body.postid], (err, qres1) => {
    if (err) throw err;

    // Query to get the comments
    pool.query('\
SELECT c.CommentId, c.Post, c.Poster, c.Content, \
       u.UserId, u.Username FROM \
Comments c LEFT JOIN Users u ON c.Poster = u.UserId \
WHERE c.Post = $1\
ORDER BY c.CommentId',
    [req.body.postid], (err, qres2) => {
    if (err) throw err;
      res.send(JSON.stringify([qres1.rows[0], qres2.rows]))
      res.end();
    })
  })
})
// Create a new text post
app.get('/text_post', (req, res) => {
  if (!req.session.userID){
    res.redirect('/')
  }

  res.render(
    'pages/text_post',
    {
      userID: req.session.userID,
      username: req.session.username,
      query: req.query
    })
})

// Create a new link post
app.get('/link_post', (req, res) => {
  if (!req.session.userID){
    res.redirect('/')
  }

  res.render(
    'pages/link_post',
    {
      userID: req.session.userID,
      username: req.session.username,
      query: req.query
    })
})

// Handle inserting posts to the database
app.post('/createPost', (req, res) => {
  let title = req.body.title
  let content = req.body.content
  let isLink = req.body.isLink

  let userID = req.session.userID

/*console.log("Title: " + title)
  console.log("Content: " + content)
  console.log("Is Link: " + isLink)
  console.log("User ID: " + userID)*/

  pool.query('INSERT INTO Posts (Title, Body, IsLink, Poster) \
  VALUES ($1, $2, $3, $4)',
  [title, content, isLink, userID],
  (err, qres1) => {
    if (err) throw err;
pool.query(
  "SELECT currval(pg_get_serial_sequence('Posts','postid'))",
  (err, qres2) => {
    if (err) throw err;

    console.log(JSON.stringify(qres2))

      res.redirect('/view_comments?postid=' + qres2.rows[0].currval) // Go to the page
    })
  })
})

// Handle inserting comments to the database
app.post('/createComment', (req, res) => {
  let postid = req.body.postid
  let content = req.body.content
  
  let userID = req.session.userID

  pool.query('INSERT INTO Comments (Post, Poster, Content) \
  VALUES ($1, $2, $3)',
  [postid, userID, content],
  (err, qres) => {
    if (err) throw err;
    res.redirect('/view_comments?postid=' + postid) // Go to the page
  })
})

// Let the user log out
app.get('/logout', (req, res) => {
  req.session.destroy()
  res.redirect('/')
})

// Add a new row to Users
app.post('/create_account', (req, res) => {
  let username = req.body.username
  let password = req.body.password

  // Is there already a user with that username?
  pool.query('SELECT Username FROM Users WHERE Username ILIKE $1',
  [username], (err, qres1) => {
    if (err) throw err;
    if (qres1.rowCount > 0) {
      // That name is already in use
      res.status(400).send()
      res.end();
    } else {
      bcrypt.hash(password, 10, (err, hash) => {
        if (err) throw err;
        pool.query(
          'INSERT INTO Users (Username, Password) VALUES ($1, $2)',
          [username, hash],
          (err, qres2) => {
            if (err) throw err;

            // Log in the user (save a session variable)
            // Need to get the value of most recent sequence
            pool.query("\
SELECT Username, UserId FROM Users WHERE UserId = \
(SELECT currval(pg_get_serial_sequence('Users','userid')) AS s)",
            (err, qres3) =>{
              if (err) throw err;

              req.session.userID = qres3.rows[0].userid
              req.session.username = qres3.rows[0].username
              res.status(200).send()
              res.end();
            })
          }
        )
      })
    }
  })
})

// Verify log in
app.post('/log_in', (req, res) => {
  let username = req.body.username
  let password = req.body.password

  pool.query(
    'SELECT * FROM Users WHERE Username ILIKE $1',
    [username],
    (err, qres) => {
      if (err) throw err;
      bcrypt.compare(password, qres.rows[0].password).then((valid) => {
        if (valid) {
          // Log in the user!
          req.session.userID = qres.rows[0].userid
          req.session.username = qres.rows[0].username
          res.redirect('/')
        } else {
          // Bad password
          res.redirect('/?err=badpw')
        }
      })
    }
  )
})

app.listen(PORT, () => console.log(`Listening on ${ PORT }!!!`))
