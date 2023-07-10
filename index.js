var express = require('express');
var md5 = require('md5')
const bcrypt = require('bcrypt')
const { sign } = require("jsonwebtoken");

const {
    v4: uuidv4
} = require('uuid')

var app = express();
var connection = require('./database');


const bodyParser = require("body-parser");
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));


app.get('/',function(req,res){
    res.send("my name");
})




app.post('/api/signup/',async(req,res)=>{
    console.log(req.body);
    const username = req.body.username;
    const email = req.body.email;
    const password = req.body.password;
    const saltRounds=10;
    const hashpassword =  await bcrypt.hash(password,saltRounds);
    // console.log(hashpassword);
    const role = "user";


    connection.query(`INSERT INTO users (username,email,password,role) VALUES (?,?,?,?)`,
    [username,email,hashpassword,role],
    async(err,result) => {
        if(err){
            throw err;
            console.log(err);
        }else{
            // const userId = connection.query("SELECT userId FROM users WHERE email=?",[username]);
            // console.log("userID ", userId);
            console.log(result);
            res.send({
                "status" : "Account successfully created",
                "status_code" : 200,
                "user_id" : 1234
            })
        }
    })
});



app.post("/api/login", async (req, res) => {
    // console.log("body" , req.body);
    
    const username = req.body.username;
    const password = req.body.password;
    connection.query(`SELECT password FROM users WHERE username=?`, [username], async (err, result) => {
      console.log(result);
      if (err) {
        res.send({
          "code": 400,
          "failed": "error occurred",
          "error": err
        })
      } else {
        console.log(result[0]);
        res.send("logined");
        if (result) {
          const comparison = await bcrypt.compareSync(password, result[0].password)
          if (comparison) {
            // results.password = undefined;
            const jsontoken=sign({result:result[0]},"key",
                {
                    expiresIn:"1h"
                }
                )
    
            // const jsontoken = sign({ result: results }, "qwe1234", {
            //   expiresIn: "1h"
            // });
            res.send({
                "status": "Login successful",
                "status_code": 200,
                "user_id": "12345",
                "access_token": jsontoken
            })
          } else {
            res.send({
                "status": "Incorrect username/password provided. Please retry",
                "status_code": 401
            })
            // console.log("Declined");
          }
        }
      }
    })
  })



app.post('/api/books/create',async(req,res)=> {
    const title = req.body.title;
    const author = req.body.author;
    const isbn = req.body.isbn;
    const availability = "false";
    const book_id=uuidv4();
    connection.query(`INSERT INTO books (book_id,title, isbn, author,available) VALUES (?,?,?,?,?)`,[book_id, title, isbn, author,availability],async(err,result)=>{
        if(err){
            throw err;
            console.log(err);
        }else{
            res.send({
                "message": "Book added successfully",
                "book_id": book_id
            })
        }
    })
})


app.get('/api/books?title={search_query}',async(req,res)=>{
    const {title}= req.query;
    connection.query( `SELECT * FROM books WHERE title LIKE ?`,[`%${title}%`],async(err,result)=>{
        if(err){
            throw err;  
            console.log(err);
        }else{
            res.send(result[0]);
        }
    }
)
});



app.get('/api/books/{book_id}/availability',async(req,res)=>{
    const  book_id  = req.params;

    connection.query(`SELECT * FROM  book`)

})













app.listen(3000,function(){
    console.log("App listing on post 3000");
    connection.connect(function(err){
        if(err){
            console.log(err);
        }
        console.log("database connected");
    })
});