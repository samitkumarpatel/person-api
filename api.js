const express = require('express')
const cors = require('cors')
const app = express()
const port = 3000

//middleware
app.use(express.json()) //json
app.use(express.raw()) // ?
app.use(express.text()) //text
app.use(express.urlencoded({ extended: true })) //form data or url-encoded
app.use(cors())

//db
const mongoose = require('mongoose')

mongoose.connect("mongodb://127.0.0.1:27017", { dbName: "person", user: "root", pass: "example", connectTimeoutMS: 1000, socketTimeoutMS: 1000})
    .then(() => console.log('Connected to MongoDB...'))
    .catch(err => console.error('Could not connect to MongoDB...', err))

const personSchema = new mongoose.Schema({
    name: String,
    age: Number
});

const Person = mongoose.model('person', personSchema)

app.get('/person', (req, res) => {
    Person.find()
        .then(data => res.json(data))
        .catch(err => res.status(500).json({message: err.message}))
})

app.get('/person/:id', (req, res) => {
    const id = req.params.id

    Person.findById(id)
    .then(data => {
        if(data) {
            res.json(data)
        } else {
            res.status(404).json({message: "Person not found"})
        }
    })
    .catch(err => res.status(500).json({message: err.message}))
})

app.post('/person', (req, res) => {
    const { name, age } = req.body
    if(name && age) {
        const newPerson = new Person(
            { 
                name: name, 
                age: age 
            }
        )
        newPerson.save()
            .then(data => res.json(data))
            .catch(err => res.status(500).json({message: err.message}))
    } else {
        res.status(400).json({message: "Not a valid request"})
    }
    
})

app.put('/person/:id', (req, res) => {
    const { name, age } = req.body
    const id = req.params.id

    Person.findByIdAndUpdate(id, { name: name, age: age }, { new: true })
        .then(data => {
            if(data) {
                res.json(data)
            } else {
                res.status(404).json({message: "Person not found"})
            }
        })
        .catch(err => res.status(500).json({message: err.message}))

})

app.delete('/person/:id', (req, res) => {
    const id = req.params.id

    Person.findByIdAndDelete(id, { new: true })
        .then(data =>data ? res.json({message: "Person deleted"}) : res.status(404).json({message: "Person not found"}))
        .catch(err => res.status(500).json({message: err.message}))
})

app.get('/find/person', (req, res) => {
    const { name, age } = req.query
    Person.find({ name: {$regex: `${name}`}})
        .then(data => {
            if(data)
                res.json(data)
            else
                res.status(404).json({message: "Person not found with the given criteria"})
        })
        .catch(err => res.status(500).json({message: err.message}))
})

app.listen(port, () => {
  console.log(`person-api is listening on port ${port}`)
})