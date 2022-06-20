const express = require("express");
const { v4: uuidv4 } = require("uuid");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

// ===== MIDDLEWARES =====
function checkIfUserExists(req, res, next) {
  const { username } = req.headers;
  const user = users.find((user) => user.username === username);

  if (!user) {
    return res.status(404).json({ error: "Insert a valid username" });
  }

  req.user = user;

  return next();
}

// ===== COMPLEMENTARY =====
function findTodoByID(req, res, next) {
  const { user } = req;
  const { id } = req.params;

  const updateTodo = user.todos.find((todo) => todo.id === id);
  if (updateTodo) {
    req.updateTodo = updateTodo;
    req.user = user;
    return next();
  }
  return res.status(404).json({ error: "Insert a valid todo!" });
}

// criar usuário
app.post("/users", (req, res) => {
  const { name, username } = req.body;

  const usedUsername = users.some((user) => user.username === username);

  if (usedUsername) {
    return res
      .status(400)
      .json({ error: "Username has already been taken by another user." });
  }

  users.push({
    id: uuidv4(),
    name,
    username,
    todos: [],
  });

  const createdUser = users[users.length - 1];
  return res.status(201).json(createdUser);
});

// ver todos de um usuário
app.get("/todos", checkIfUserExists, (req, res) => {
  const { user } = req;

  return res.status(200).json(user.todos);
});

// criar um todo
app.post("/todos", checkIfUserExists, (req, res) => {
  const { user } = req;
  const { title, deadline } = req.body;

  user.todos.push({
    id: uuidv4(),
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date(),
  });
  const createdTodo = user.todos[user.todos.length - 1];
  return res.status(201).json(createdTodo);
});

// atualizar um todo
app.put("/todos/:id", checkIfUserExists, findTodoByID, (req, res) => {
  const { updateTodo, user } = req;
  const { title, deadline } = req.body;

  updateTodo.title = title;
  updateTodo.deadline = new Date(deadline);

  const i = user.todos.indexOf(updateTodo);
  return res.status(200).json(user.todos[i]);
  return res.status(200).send();
});

// marcar todo como feito/concluído
app.patch("/todos/:id/done", checkIfUserExists, findTodoByID, (req, res) => {
  const { updateTodo, user } = req;

  updateTodo.done = true;
  const i = user.todos.indexOf(updateTodo);
  return res.status(200).json(user.todos[i]);
});

// deletar todo
app.delete("/todos/:id", checkIfUserExists, findTodoByID, (req, res) => {
  const { updateTodo, user } = req;

  const index = user.todos.indexOf(updateTodo);

  user.todos.splice(index, 1);

  return res.status(204).send();
});

module.exports = app;
