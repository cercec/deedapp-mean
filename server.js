const fs = require("fs");
const express = require("express");
const bodyParser = require("body-parser");
const mongodb = require("mongodb");
const path = require("path");

var ObjectID = mongodb.ObjectID;

// Db Collection and URI
const deedsCollection = "Deeds";
const notesCollection = "Notes";

// App Init
const app = express();
app.use(bodyParser.json());

// Enable CORS
app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  next();
});

// Point static path to dist
app.use(express.static(path.join(__dirname, "dist")));

// Create a db const to reuse the connection
var db;

// Connection to the database
mongodb.MongoClient.connect(
  process.env.MONGODB_ADDON_URI || "mongodb://localhost:27017/test",
  { useNewUrlParser: true },
  (err, client) => {
    if (err) {
      console.log("the connection with the database is impossible: " + err);
      process.exit(1);
    }

    // Save database object from the callback for reuse.
    db = client.db(process.env.MONGODB_ADDON_DB);
    console.log("Database connection ready");

    db.collection(deedsCollection).createIndex({
      "$**": "text",
    });

    // Initialize the app.
    var server = app.listen(process.env.PORT || 8080, () => {
      console.log("App now running on port", process.env.PORT);
    });
  }
);

// DEEDS API ROUTES BELOW

// Generic error handler used by all endpoints.
function handleError(res, reason, message, code) {
  console.log("ERROR: " + reason);
  res.status(code || 500).json({
    error: message,
  });
}

// Recursive function in nested JSON
function recursiveGetProperty(obj, lookup, callback) {
  for (property in obj) {
    if (property == lookup) {
      callback(obj[property]);
    } else if (obj[property] instanceof Object) {
      recursiveGetProperty(obj[property], lookup, callback);
    }
  }
}

// Redirect / to /api/deeds
app.get("/", (req, res) => {
  res.send("Please use /api/deeds");
});

/*  '/api/deeds'
 *    GET: finds all deeds
 *    POST: creates a new deed
 */

app.get("/api/deeds", (req, res) => {
  db.collection(deedsCollection)
    .find({})
    .sort({
      _id: -1,
    })
    .toArray((err, docs) => {
      if (err) {
        handleError(res, err.message, "Failed to get deeds.");
      } else {
        res.status(200).json(docs);
      }
    });
});

app.post("/api/deeds", (req, res) => {
  var newDeed = req.body;

  if (!req.body.deedRef) {
    handleError(
      res,
      "Invalid deed input. You must at least provide a Deed Reference",
      400
    );
  }

  db.collection(deedsCollection).insertOne(newDeed, (err, doc) => {
    if (err) {
      handleError(res, err.message, "Failed to create new deed.");
    } else {
      res.status(201).json(doc.ops[0]);
    }
  });
});

/*  '/api/deed/:id'
 *    GET: find deed by id
 *    PUT: update deed by id
 *    DELETE: deletes deed by id
 */

app.get("/api/deeds/:id", (req, res) => {
  db.collection(deedsCollection).findOne(
    {
      _id: new ObjectID(req.params.id),
    },
    (err, doc) => {
      if (err) {
        handleError(res, err.message, "Failed to get deed");
      } else {
        res.status(200).json(doc);
      }
    }
  );
});

app.put("/api/deeds/:id", (req, res) => {
  let updatedDoc = req.body;
  updatedDoc._id = new ObjectID(req.params.id);
  db.collection(deedsCollection).findOneAndReplace(
    {
      _id: updatedDoc._id,
    },
    updatedDoc,
    (err, doc) => {
      if (err) {
        handleError(res, err.message, "Failed to update deed");
      } else {
        res.status(200).json(updatedDoc);
      }
    }
  );
});

app.delete("/api/deeds/:id", (req, res) => {
  db.collection(deedsCollection).deleteOne(
    {
      _id: new ObjectID(req.params.id),
    },
    (err, result) => {
      if (err) {
        handleError(res, err.message, "Failed to delete contact");
      } else {
        res.status(200).json(req.params.id);
      }
    }
  );
});

// Get the last Document inserted

app.get("/api/lastdeed", (req, res) => {
  db.collection(deedsCollection)
    .find({})
    .limit(1)
    .sort({
      $natural: -1,
    })
    .toArray((err, doc) => {
      if (err) {
        handleError(res, err.message, "Failed to get the last deed");
      } else {
        res.status(200).json(doc);
      }
    });
});

// Load JSON schema file

app.get("/api/schema", (req, res) => {
  let jsonFile = fs.readFileSync("./deed-schema copie.json", {
    encoding: "utf8",
  });
  let jsonSchema = JSON.parse(jsonFile);
  res.status(200).json(jsonSchema);
});

/*  '/api/notes'
 *    GET: finds all notes
 *    POST: creates a new note
 */

app.get("/api/notes", (req, res) => {
  db.collection(notesCollection)
    .find({})
    .toArray((err, doc) => {
      if (err) {
        handleError(res, err.message, "Failed to get notes.");
      } else {
        res.status(200).json(doc);
      }
    });
});

app.post("/api/notes", (req, res) => {
  var newNote = req.body;

  db.collection(notesCollection).insertOne(newNote, (err, doc) => {
    if (err) {
      handleError(res, err.message, "Failed to create new note.");
    } else {
      res.status(201).json(doc.ops[0]);
    }
  });
});

/*  '/api/note/:id'
 *    GET: find note by id
 *    PUT: update note by id
 *    DELETE: deletes note by id
 */

app.get("/api/notes/:id", (req, res) => {
  db.collection(notesCollection).findOne(
    {
      _id: new ObjectID(req.params.id),
    },
    (err, doc) => {
      if (err) {
        handleError(res, err.message, "Failed to get note");
      } else {
        res.status(200).json(doc);
      }
    }
  );
});

app.put("/api/notes/:id", (req, res) => {
  let updatedNote = req.body;
  updatedNote._id = new ObjectID(req.params.id);

  db.collection(notesCollection).findOneAndReplace(
    {
      _id: new ObjectID(req.params.id),
    },
    updatedNote,
    (err, doc) => {
      if (err) {
        handleError(res, err.message, "Failed to update deed");
      } else {
        res.status(200).json(updatedNote);
      }
    }
  );
});

app.delete("/api/notes/:id", (req, res) => {
  db.collection(notesCollection).deleteOne(
    {
      _id: new ObjectID(req.params.id),
    },
    (err, result) => {
      if (err) {
        handleError(res, err.message, "Failed to delete note");
      } else {
        res.status(200).json(req.params.id);
      }
    }
  );
});

/*  '/api/search'
 *    GET: search the db
 *
 */

app.get("/api/search", (req, res) => {
  let arrayBody = [];
  db.collection(deedsCollection)
    .find({})
    .toArray((err, docs) => {
      if (err) {
        handleError(res, err.message, "Failed to get deeds.");
      } else {
        res.status(200).json(arrayBody);
      }
    });
});

app.get("/api/search/:term", (req, res) => {
  let term = req.params.term;
  db.collection(deedsCollection)
    .find({
      $text: {
        $search: term,
      },
    })
    .toArray((err, docs) => {
      if (err) {
        handleError(res, err.message, "Failed to get deeds.");
      } else {
        res.status(200).json(docs);
      }
    });
});

/*  '/api/schema-version'
 *    GET: update the database for schema version
 *
 */
app.get("/api/update-schema", (req, res) => {
  db.collection(deedsCollection).updateMany(
    {},
    {
      $set: {
        schemaVersion: 1,
      },
      $unset: {
        "schema-version": "",
      },
    },
    (err, activity) => {
      if (err) {
        handleError(res, err.message, "Failed to update the database");
      } else {
        res.status(200).json("Database updated with success");
      }
    }
  );
});

/*  '/api/firstnames/'
 *    POST: update the firstnames
 *
 */
app.post("/api/firstnames/", (req, res) => {
  const updateFirstname = req.body;
  const reponse = [];
  updateFirstname.forEach((element1) => {
    element1.info.idsAndFields.forEach((element2) => {
      const placeholder = {};
      reponse.push(
        "Le champ " +
          element2.field +
          " du document " +
          element2.id +
          " a bien été mis à jour."
      );
      placeholder[element2.field] = element1.newName;
      db.collection(deedsCollection).updateOne(
        {
          _id: new ObjectID(element2.id),
        },
        {
          $set: placeholder,
        },
        (err, doc) => {
          if (err) {
            handleError(res, err.message, "Failed to update deed");
          } else {
            res.status(200).json(reponse);
          }
        }
      );
    });
  });
});

app.post("/api/new-firstnames/", (req, res) => {
  const newNamesList = req.body;
  const bulkOps = newNamesList.map(function (element) {
    return {
      updateOne: {
        filter: {
          _id: new ObjectID(element.id),
        },
        update: {
          $set: element.placeholder,
        },
      },
    };
  });

  db.collection(deedsCollection).bulkWrite(
    bulkOps,
    {
      ordered: true,
      w: 1,
    },
    (err, result) => {
      if (err) {
        handleError(res, err.message, "Failed to update deed");
      } else {
        res.status(200).json(result.modifiedCount);
      }
    }
  );
});

app.get("*", function (req, res) {
  res.sendFile(path.join(__dirname + "/dist/index.html"));
});
