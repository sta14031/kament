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
app.post('/getComments', (req, res) => {
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

  console.log("Title: " + title)
  console.log("Content: " + content)
  console.log("Is Link: " + isLink)
  console.log("User ID: " + userID)

  pool.query('INSERT INTO Posts (Title, Body, IsLink, Poster) VALUES ($1, $2, $3, $4)',
  [title, content, isLink, userID],
  (err, qres) => {
    if (err) throw err;
    res.redirect('/view_comments?postid=' + qres[0].postid) // Go to the page
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

  bcrypt.hash(password, 10, (err, hash) => {
    if (err) throw err;
    pool.query(
      'INSERT INTO Users (Username, Password) VALUES ($1, $2)',
      [username, hash],
      (err, qres) => {
        if (err) throw err;

        // Log in the user (save a session variable)
//      req.session.userID = qres.rows[0].id
//      req.session.username = qres.rows[0].username
        res.redirect('/')
      }
    )
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
      if (qres.rowCount == 0) {
        // No user exists with that name
        res.redirect('/?err=baduname')
      } else {
        bcrypt.compare(password, qres.rows[0].password).then((valid) => {
          if (valid)
          {
            // Log in the user!
            req.session.userID = qres.rows[0].userid
            req.session.username = qres.rows[0].username
            res.redirect('/')
          }
          else
          {
            // Bad password
            res.redirect('/?err=badpw')
          }
        })
      }
    }
  )
})

app.listen(PORT, () => console.log(`Listening on ${ PORT }!!!`))
