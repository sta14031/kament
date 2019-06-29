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

app.use(express.static(path.join(__dirname, 'public')))
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'ejs')

// The root
app.get('/', (req, res) => res.render('public/index.html'))

// The main page
app.get('/test', (req, res) => {
  res.render('pages/view_posts')
})

// Get all posts utility
app.post('/getPosts', (req, res) => {
  pool.query('SELECT * FROM Posts', (err, qres) => {
    res.send(JSON.stringify(qres.rows))
    res.end()
  })
})

// Some tests
app.get('/good', (req, res) => res.send('<h1>Good</h1>'))
app.get('/bad', (req, res) => res.send('<h1>Bad</h1>'))

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
    'SELECT Password FROM Users WHERE Username ILIKE $1',
    [username],
    (err, qres) => {
      if (err) throw err;
      bcrypt.compare(password, qres.rows[0].password).then((valid) => {
        if (valid)
        {
          // Log in the user!
          res.redirect('/good')
        }
        else
        {
          // Bad password
          res.redirect('/bad')
        }
      })
    }
  )
})

app.listen(PORT, () => console.log(`Listening on ${ PORT }!!!`))
