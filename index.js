var express = require("express");
var bodyParser = require('body-parser')
var jsonParser = bodyParser.json()
var app = express();
var port = 3000;

//Data Array
var tasks = []

//Counter
var counterId = 1;
var auxi = 0;

//Invoke servidor
app.get("/", (req, res, next) => {
    res.send("Servidor is running");
});

//List all of Tasks
app.get("/tasks", (req, res, next) => {
    res.json(tasks);
});

//Get task by id
app.get("/tasks/:id", (req, res, next) => {
    var id = parseInt(req.params.id);
    var index = tasks.findIndex( aux => aux.id === id);
    if (index >= 0) {
        res.json(tasks[index]);
    }
});

//Create Task
app.post("/tasks", jsonParser, (req, res, next) => {
    req.body.id = counterId ++;
    req.body.status = "PENDING";
    tasks.push(req.body);
    auxi = counterId - 1;
    res.status(200).json({
        message: "Task #" + auxi + " created Successfuly"
    });
});

//Delete Task
app.delete("/tasks/:id", jsonParser, (req, res, next) => {
    var id = parseInt(req.params.id);
    var index = tasks.findIndex(aux => aux.id === id);
    if (index >= 0) {
        tasks.splice(index, 1);
        auxi = index + 1;
        res.status(200).json({
            message: "Task #" + auxi + " has been deleted Successfuly"
        });
    }
});

//Status change and Update
app.put('/tasks/:id', jsonParser, (req, res, next) => {
    const status = req.query.status;
    var id = parseInt(req.params.id);

    var index = tasks.findIndex(auxi => auxi.id === id)
    if (status) {
        if (index >= 0) {
            tasks[index].status = status;
            res.status(200).json({
                message: "Status' Task #" + auxi + " has been changed Successfuly, the new status is: " + status
            });
        }
    } else {
        if (index >= 0) {
            tasks[index].title = req.body.title;
            tasks[index].detail = req.body.detail;
            auxi = index + 1;
            res.status(200).json({
                message: "Task #" + auxi + " has been deleted Successfuly"
            });
        }
    }
});

//Servidor Listening
app.listen(port, () => {
    console.log("HTTP Servidor is check");
});