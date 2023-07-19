require('dotenv').config();
const express = require('express');
const cors = require('cors');


const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

const users = [];
const exercises = [];

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html');
});

app.post("/api/users", function (req, res) {
  const { username } = req.body;
  const newUser = { username, _id: Date.now().toString() };
  users.push(newUser);

  res.json(newUser);
});

app.get("/api/users", function (req, res) {
  res.json(users);
});

app.post('/api/users/:_id/exercises', (req, res) => {
  const { description, duration, date } = req.body;
  const userId = req.params._id;

  const newExercise = {
    userId,
    description,
    duration,
    date: date ? new Date(date) : new Date(),
  };

  exercises.push(newExercise);

  const user = users.find((user) => user._id === userId);
  if (user) {
    res.json({
      username: user.username,
      description: newExercise.description,
      duration: newExercise.duration,
      date: newExercise.date.toDateString(),
      _id: user._id,
    });
  } else {
    res.sendStatus(404);
  }
});

app.get('/api/users/:_id/logs', (req, res) => {
  const { from, to, limit } = req.query;
  const userId = req.params._id;

  let filteredExercises = exercises.filter((exercise) => exercise.userId === userId);

  if (from) {
    filteredExercises = filteredExercises.filter((exercise) => exercise.date >= new Date(from));
  }
  if (to) {
    filteredExercises = filteredExercises.filter((exercise) => exercise.date <= new Date(to));
  }
  if (limit) {
    filteredExercises = filteredExercises.slice(0, parseInt(limit));
  }

  const user = users.find((user) => user._id === userId);

  if (user) {
    res.json({
      username: user.username,
      count: filteredExercises.length,
      _id: user._id,
      log: filteredExercises.map((exercise) => ({
        description: exercise.description,
        duration: +exercise.duration,
        date: exercise.date.toDateString(),
      })),
    });
  } else {
    res.sendStatus(404);
  }
});


const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
