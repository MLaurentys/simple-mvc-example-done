// pull in our models. This will automatically load the index.js from that folder
const { Cat, Dog } = require('../models');

// default fake data so that we have something to work with until we make a real Cat
const defaultData = {
  name: 'unknown',
  bedsOwned: 0,
};

// object for us to keep track of the last Cat we made and dynamically update it sometimes
let lastAdded = new Cat(defaultData);

// Function to handle rendering the index page.
const hostIndex = (req, res) => {
  /* res.render will render the given view from the views folder. In this case, index.
     We pass it a number of variables to populate the page.
  */
  res.render('index', {
    currentName: lastAdded.name,
    title: 'Home',
    pageName: 'Home Page',
  });
};
const hostPage1 = async (req, res) => {
  try {
    const docs = await Cat.find({}).lean().exec();
    return res.render('page1', { cats: docs });
  } catch (err) {
    return res.status(500).json({ error: 'failed to find cats' });
  }
};

const hostPage2 = (req, res) => {
  res.render('page2');
};

const hostPage3 = (req, res) => {
  res.render('page3');
};

const hostPage4 = async (req, res) => {
  try {
    const docs = await Dog.find({}).lean().exec();
    return res.render('page4', { dogs: docs });
  } catch (err) {
    return res.status(500).json({ error: 'failed to find cats' });
  }
};

const getName = (req, res) => res.json({ name: lastAdded.name });

const setName = async (req, res) => {
  if (!req.body.firstname || !req.body.lastname || !req.body.beds) {
    // If they are missing data, send back an error.
    return res
      .status(400)
      .json({ error: 'firstname, lastname and beds are all required' });
  }
  const catData = {
    name: `${req.body.firstname} ${req.body.lastname}`,
    bedsOwned: req.body.beds,
  };
  const newCat = new Cat(catData);
  try {
    await newCat.save();
    lastAdded = newCat;
    return res.json({
      name: lastAdded.name,
      beds: lastAdded.bedsOwned,
    });
  } catch (err) {
    return res.status(500).json({ error: 'failed to create cat' });
  }
};

// Creates a new dog in the database
const createDog = async (req, res) => {
  if (
    !req.body.name
    || !req.body.breed
    || (!req.body.age && req.body.age !== 0)
  ) {
    return res
      .status(400)
      .json({ error: 'Name, breed and age are all required' });
  }
  const dogData = {
    name: req.body.name,
    breed: req.body.breed,
    age: req.body.age,
  };
  try {
    const newDog = new Dog(dogData);
    await newDog.save();
    return res.json({
      name: dogData.name,
      breed: dogData.breed,
      age: dogData.age,
    });
  } catch (err) {
    return res
      .status(500)
      .json({ id: 'mongooseErrorAddDog', message: 'failed to create cat' });
  }
};

// Returns dog and increments age
const findDogByName = async (req, res) => {
  if (!req.query.name) {
    return res
      .status(400)
      .json({ error: 'Name is required to perform a search' });
  }
  try {
    const doc = await Dog.findOne({ name: req.query.name }).exec();

    // If we do not find something that matches our search, doc will be empty.
    if (!doc) {
      return res.json({ error: 'No dog with that name found' });
    }

    Dog.updateOne({ name: req.query.name }, { age: doc.age + 1 }).exec();

    // Otherwise, we got a result and will send it back to the user.
    return res.json({ name: doc.name, breed: doc.breed, age: doc.age + 1 });
  } catch (err) {
    // If there is an error, log it and send the user an error message.
    return res.status(500).json({ error: 'Something went wrong' });
  }
};

const searchName = async (req, res) => {
  if (!req.query.name) {
    return res
      .status(400)
      .json({ error: 'Name is required to perform a search' });
  }
  try {
    const doc = await Cat.findOne({ name: req.query.name }).exec();

    // If we do not find something that matches our search, doc will be empty.
    if (!doc) {
      return res.json({ error: 'No cats found' });
    }

    // Otherwise, we got a result and will send it back to the user.
    return res.json({ name: doc.name, beds: doc.bedsOwned });
  } catch (err) {
    // If there is an error, log it and send the user an error message.
    return res.status(500).json({ error: 'Something went wrong' });
  }
};

const updateLast = (req, res) => {
  lastAdded.bedsOwned++;
  const savePromise = lastAdded.save();

  savePromise.then(() => res.json({
    name: lastAdded.name,
    beds: lastAdded.bedsOwned,
  }));

  savePromise.catch(() => res.status(500).json({ error: 'Something went wrong' }));
};

// A function to send back the 404 page.
const notFound = (req, res) => {
  res.status(404).render('notFound', {
    page: req.url,
  });
};

// export the relevant public controller functions
module.exports = {
  index: hostIndex,
  page1: hostPage1,
  page2: hostPage2,
  page3: hostPage3,
  page4: hostPage4,
  getName,
  setName,
  createDog,
  updateLast,
  searchName,
  notFound,
  findDogByName,
};
