var express = require("express");
var bodyParser = require('body-parser');
var jsonParser = bodyParser.json();
var sha256 = require('js-sha256');
var jwt = require('jsonwebtoken');
var app = express();
var port = 3000;

//Data Array
var tasks = []

//Database
var mysql = require('mysql');


//Headers
app.use((req,res,next)=>{
    res.header('Access-Control-Allow-Origin','*');
    res.header('Access-Control-Allow-Headers','Origin,X-Requested-With,Content-Type,Accept,Authorization');
    if(req.method === 'OPTIONS'){
        res.header('Access-Control-Allow-Methods','PUT,POST,PATCH,DELETE,GET');
        res.status(200).json({});
    }
    next();
});

//Database Conection
var conn = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    port: 3306,
    database: "task_manager"
});

conn.connect(
    function (err) {
        if (err) {
            console.log("Error, fix it ASAP!");
            throw err;
        }
        console.log("¡Database Connected!");
    }
);

//Validate Token
function validateToken(token) {
    try {
        const jwtObject = jwt.verify(token,"11223344");
        return jwtObject;
    } catch(err) {
        return null;
    }
}

// Build a secure Token
function buildToken(userId, username) {
    const payload = {
        sub: userId,
        username: username,
        exp: Math.floor(Date.now() / 1000) + (60 * 60),
    }
    return jwt.sign(payload, "11223344");
}

//Password
function hashPassword(pwd) {
    return(sha256.sha256(sha256.sha256(pwd + "tigre_campeon") + "ucb"))
}

//Create New User
app.post("/user", jsonParser, (req, res, next) => {

    const userData = req.body;
    const passwordHash = hashPassword(userData.password);

    const sql = "INSERT INTO tk_user VALUES (null, '"+ userData.username + "', '"+ passwordHash +"') ";

    conn.query( sql, 
        function (err, result) { 
            if (err) {
                console.log("Error, fix it ASAP!");
            }
            console.log("Result: " + result);
            res.json(result);
        }
    );
});

//Auth
app.post("/auth", jsonParser, (req, res, next) => {

    const userData = req.body;
    const passwordHash = hashPassword(userData.password);

    const sql = " SELECT user_id, username FROM tk_user " +
                " WHERE ( username =  '"+ userData.username + "' AND user_password = '"+ passwordHash +"') ";
    

    conn.query( sql, 
        function (err, result) { 
            if (err) {
                console.log("Error, fix it ASAP!");
            }            
            if(result.length == 1) {
                const token = buildToken(result[0].user_id, result[0].username);
                
                res.json({ token: token });
            } else {
                res.status(401).send();
            }
        }
    );
});

//Invoke servidor
app.get("/", (req, res, next) => {
    res.send("Servidor is running");
});

//List all of Tasks
app.get("/tasks", (req, res, next) => {
    const token = req.headers.authorization;
    const tokenObject = validateToken(token);
    let status_delete = 1;
    let userId = null;
    
    if (tokenObject) {
        userId = tokenObject.sub;
    } else {
        res.sendStatus(403);
        return;
    }

    const sql = "SELECT * FROM tasks WHERE user_id = '"+ userId +"' AND status = '"+ status_delete +"'";
    
    conn.query( sql, 
        function (err, result) { 
            if (err) {
                console.log("Error, fix it ASAP!");
            }
            console.log("Result: " + result);
            res.json(result);
        }
    );
});

//Get task by id
app.get("/tasks/:id", (req, res, next) => {
    const token = req.headers.authorization;
    const tokenObject = validateToken(token);
    var id = parseInt(req.params.id);
    let status_delete = 1;
    let userId = null;
    
    if (tokenObject) {
        userId = tokenObject.sub;
    } else {
        res.sendStatus(403);
        return;
    }

    const sql = "SELECT * FROM tasks WHERE user_id = '"+ userId +"' AND task_id = '"+ id +"' AND status = '"+ status_delete +"'";
    conn.query( sql, 
        function (err, result) { 
            if (err) {
                console.log("Error, fix it ASAP!", err);
            }
            console.log("Result: " + result);
            res.json(result);
        }
    );
});

//Create Task
app.post("/tasks", jsonParser, (req, res, next) => {
    const token = req.headers.authorization;
    const tokenObject = validateToken(token);
    var id = parseInt(req.params.id);
    let userId = null;
    
    if (tokenObject) {
        userId = tokenObject.sub;
    } else {
        res.sendStatus(403);
        return;
    }

    const taskData = req.body;
    
    taskData.task_status = "PENDING";
    taskData.status = 1;

    const sql = "INSERT INTO tasks VALUES (NULL, '"+ taskData.title +"', '"+ taskData.detail +"', '"+ taskData.status +"', '"+ taskData.task_status +"', '"+ userId +"')";
    
    conn.query(sql,
        function (err, result) {
            if (err) {
                console.log("Error, fix it ASAP!", err);
            }
            res.status(200).json({
                message: "Task #" + id + " created Successfuly"
            });
        }
    );
});

//Delete Task
app.delete("/tasks/:id", jsonParser, (req, res, next) => {
    var id = parseInt(req.params.id);
    
    const token = req.headers.authorization;
    const tokenObject = validateToken(token);
    let userId = null;
    
    if (tokenObject) {
        userId = tokenObject.sub;
    } else {
        res.sendStatus(403);
        return;
    }

    const sql = "UPDATE tasks SET status = "+ 0 +" WHERE user_id = '"+ userId +"' AND task_id = '"+ id +"'";
    
    conn.query(sql,
        function (err, result) {
            if (err) {
                console.log("Error, fix it ASAP!");
            }
            res.status(200).json({
                message: "Task #" + id + " has been deleted Successfuly"
            });
        }
    );
});

//Status change and Update
app.put('/tasks/:id', jsonParser, (req, res, next) => {
    const status = req.query.status;
    var id = parseInt(req.params.id);
    
    const token = req.headers.authorization;
    const tokenObject = validateToken(token);
    let userId = null;
    
    if (tokenObject) {
        userId = tokenObject.sub;
    } else {
        res.sendStatus(403);
        return;
    }

    const sql1 = "UPDATE tasks SET task_status = '"+ status +"' WHERE user_id = '"+ userId +"' AND task_id = '"+ id +"'";
    const sql2 = "UPDATE tasks SET title = '"+ req.body.title +"', detail = '"+ req.body.detail +"' WHERE user_id = '"+ userId +"' AND task_id = '"+ id +"'";

    var index = tasks.findIndex(auxi => auxi.id === id)
    if (status) {
        conn.query( sql1, 
            function (err, result) { 
                if (err) {
                    console.log("Error, fix it ASAP!", err);
                }
                res.status(200).json({
                    message: "Status' Task #" + id + " has been changed Successfuly, the new status is: " + status
                });
            }
        );
    } else {
        conn.query( sql2, 
            function (err, result) { 
                if (err) {
                    console.log("Error, fix it ASAP!", err);
                }
                res.status(200).json({
                    message: "Task #" + id + " has been updated Successfuly"
                });
            }
        );
    }

});

//Servidor Listening
app.listen(port, () => {
    console.log("HTTP Servidor is check");
});