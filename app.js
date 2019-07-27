const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')
const mysql = require('mysql')

const sequelize = require('./sequelize')

const con = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'password'
})

const app = express()
const corsOptions = {
  origin: 'http://localhost:4200',
  optionsSuccessStatus: 200
}

app.use(bodyParser.json())
app.use(cors(corsOptions))

//new
app.use(bodyParser.urlencoded({extended: false}))

//new
app.post('/post1', (req, res) => {

  
  const ord_num = req.body.ord_num
  const com_name = req.body.com_name
  const parts_num = req.body.parts_num
  
  console.log("Receive:")
  console.log("Order Number:"+ ord_num + "  Company Name:"+ com_name+"  How many parts:"+ parts_num)
  
  res.send("Order Number:"+ ord_num + "  Company Name:"+ com_name+"  How many parts:"+ parts_num)
  
  res.end()

})

app.get("/", (req, res) => {
	res.send("Worder resp")
	
})

app.listen(process.argv[2] === 'xinc' ? 8000 : process.argv[2] === 'yinc' ? 8001 : process.argv[2] === 'zinc' ? 8002 : 8000 , () => {
  console.log(process.argv[2] === 'xinc' ? 8000 : process.argv[2] === 'yinc' ? 8001 : process.argv[2] === 'zinc' ? 8002 : 8000)
  console.log('Server started!')
})

app.route('/api/order').post(async (req, res) => {
  try {
    console.log(req.body)
    const company = process.argv[2]
    const order = req.body
    const parts = []
    if (!order.orderNumber || !order.companyName || !order.numberOfParts || order.parts.length === 0) {
      res.json({status: 'fail'})
    } else { 
      for (let i = 0; i < order.parts.length; i++) {
        if (order.parts[i].companyName.toLowerCase() === company) {
          parts.push(order.parts[i])
        }
      }
      if (parts.length > 0) {
        const result = await sequelize.orderTransaction(company, parts, order.orderNumber)
        if (result) {
          res.json({status: 'success', result})
        } else {
          res.json({status: 'fail'})
        }
      }
    }
  } catch (err) {
    res.json({status: 'fail'})
  }
})

app.route('/api/commit').post(async (req, res) => {
  try {
    await sequelize.commitTransaction(req.body.xid)
    res.json({status: 'success'})
  } catch (err) {
    res.json({status: 'fail'})
  }
})

app.route('/api/rollback').post(async (req, res) => {
  try {
    await sequelize.rollbackTransaction(req.body.xid)
    res.json({status: 'success'})
  } catch (err) {
    res.json({status: 'fail'})
  }
})
