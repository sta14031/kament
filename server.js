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

// Test the DB query
app.get('/test', (req, res) => {
  pool.query('SELECT * FROM Users', (err, qres) => {
    if (err) throw err;
    res.send(JSON.stringify(qres.rows[0]))
  })
})

// Old code
app.get('/getPerson', (req, res) => {
  let personID = req.query.id

  pool.query(
    'SELECT * FROM Person WHERE Id = $1',
    [personID],
    (err, qres) => {
      if (err) throw err;
      // console.log("User: ", qres.rows[0])
      res.send(JSON.stringify(qres.rows[0]))
      res.end()
    }        
  )
})

// Old code
app.get('/getParents', (req, res) => {
  let personID = req.query.id

  pool.query(
    'SELECT * FROM Person p INNER JOIN Parentage pa ON p.Id = pa.Father OR p.Id = pa.Mother WHERE Child = $1',
    [personID],
    (err, qres) => {
      if (err) throw err;
      res.send(JSON.stringify(qres.rows))
      res.end()
    }
  )
})

// Old code
app.get('/getChildren', (req, res) => {
  let personID = req.query.id

  pool.query(
    'SELECT * FROM Person p INNER JOIN Parentage pa ON p.Id = pa.Child WHERE pa.Father = $1 OR pa.Mother = $1',
    [personID],
    (err, qres) => {
      if (err) throw err;
      res.send(JSON.stringify(qres.rows))
      res.end()
    }
  )
})

app.listen(PORT, () => console.log(`Listening on ${ PORT }!!!`))
