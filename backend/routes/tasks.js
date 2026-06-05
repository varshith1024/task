const router = require('express').Router();
const Task = require('../models/Task');
const auth = require('../middleware/auth');

// GET all tasks for logged-in user
router.get('/', auth, async (req, res) => {
  try {
    const { status, search, page = 1, limit = 10 } = req.query;

    const query = {
      userId: req.user.id,
    };

    if (status) {
      query.status = status;
    }

    if (search) {
      query.title = {
        $regex: search,
        $options: 'i',
      };
    }

    const tasks = await Task.find(query)
      .sort({ createdAt: -1 })
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit));

    const total = await Task.countDocuments(query);

    res.json({
      tasks,
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
});

// CREATE TASK
router.post('/', auth, async (req, res) => {
  try {
    const { title, description, category } = req.body;

    console.log('Incoming Task:', req.body);

    if (!title) {
      return res.status(400).json({
        msg: 'Title is required',
      });
    }

    const task = await Task.create({
      title,
      description,
      category: category || 'Other',
      userId: req.user.id,
    });

    res.status(201).json(task);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
});

// UPDATE TASK
router.put('/:id', auth, async (req, res) => {
  try {
    const task = await Task.findOne({
      _id: req.params.id,
      userId: req.user.id,
    });

    if (!task) {
      return res.status(404).json({
        msg: 'Task not found',
      });
    }

    const { title, description, status, category } = req.body;

    if (title !== undefined) task.title = title;
    if (description !== undefined) task.description = description;
    if (status !== undefined) task.status = status;
    if (category !== undefined) task.category = category;

    await task.save();

    res.json(task);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
});

// DELETE TASK
router.delete('/:id', auth, async (req, res) => {
  try {
    const task = await Task.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.id,
    });

    if (!task) {
      return res.status(404).json({
        msg: 'Task not found',
      });
    }

    res.json({
      msg: 'Task deleted successfully',
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
});

module.exports = router;