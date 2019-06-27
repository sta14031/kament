const express = require('express')
const app = express()
require('dotenv').config();

const connectionString = process.env.DATABASE_URL || process.env.DATABASE_URL
const { Pool } = require('pg')

const pool = new Pool({connectionString: connectionString});
const path = require('path')
const PORT = process.env.PORT || 5000

app.use(express.static(path.join(__dirname, 'public')))
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'ejs')
app.get('/', (req, res) => res.render('pages/index'))
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
app.listen(PORT, () => console.log(`Listening on ${ PORT }`))
