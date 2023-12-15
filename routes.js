const express = require("express");

const router = express.Router();

const Device = require("./models/Device.js");
const Bridge = require("./models/Bridge.js");
const Program = require("./models/Program.js");
const User = require("./models/User.js");
const auth = require("./middleware/auth.js");
const { ObjectId } = require("mongodb");

const modbusController = require("./Controllers/modbusController.js");
const userController = require("./Controllers/userController.js");
const deviceController = require("./Controllers/deviceController.js");

module.exports = router;

//Users CRUD
router.post("/users/login", async (req, res) => {
  try {
    const data = await userController.login_user(req, res);
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
router.post("/users", async (req, res) => {
  try {
    console.log("creating user");
    const data = await userController.create_user(req, res);
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
router.get("/users", auth, async (req, res) => {
  try {
    const data = await User.find();
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
router.get("/users/:id", auth, async (req, res) => {
  try {
    const data = await User.findById(req.params.id);
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/*** ZONES ***/
router.get("/zones/:id/ManualOverride/:perc", auth, async (req, res) => {
  const command = deviceController.setManualOverride(
    req.params.id,
    req.params.perc
  );
  //res.json(command);
  res.json({ message: "Zona " + req.params.id });
});

//Bridges CRUD
router.get("/bridges/:id", auth, async (req, res) => {
  try {
    const data = await Bridge.findById(req.params.id);
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
router.get("/bridges", auth, async (req, res) => {
  try {
    const data = await Bridge.find();
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
router.post("/bridges", auth, async (req, res) => {
  const data = new Bridge({
    address: req.body.address,
    name: req.body.name,
    ambient: req.body.ambient,
    description: req.body.description,
  });
  try {
    const dataToSave = await data.save();
    res.status(200).json(dataToSave);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});
router.patch("/bridges/:id", auth, async (req, res) => {
  try {
    const id = req.params.id;
    const updatedData = req.body;
    const options = { new: true };

    const result = await Bridge.findByIdAndUpdate(id, updatedData, options);

    res.send(result);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});
router.delete("/bridges/:id", auth, async (req, res) => {
  try {
    const id = req.params.id;
    const data = await Bridge.findByIdAndDelete(id);
    res.send(`Bridge named ${data.name} has been deleted..`);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

//Devices CRUD
router.get("/devices/byParam/:type/:param", auth, async (req, res) => {
  let theType = req.params.type;
  let theParam = req.params.param;
  console.log(theParam);
  if (theParam == "true" || theParam == "false") {
    console.log("it is boolean");
    theParam = theParam === "true";
  }
  console.log(theParam);
  let query = {};
  query[theType] = theParam;
  try {
    // const data = await Device.find(query)

    const data = await Device.aggregate([
      // define some conditions here
      {
        $match: {
          type: "actuator",
        },
      },

      // Join with zone table
      {
        $lookup: {
          from: "zones", // other table name
          localField: "zone", // name on local table field
          foreignField: "_id", // name of foreign table field
          as: "zone", // alias for foreign datas table
        },
      },
      { $unwind: "$zone" }, // $unwind used for getting data in object or for one record only

      // Join with bridge table
      {
        $lookup: {
          from: "bridges",
          localField: "bridge",
          foreignField: "_id",
          as: "bridge",
        },
      },
      { $unwind: "$bridge" },

      // Join with model table
      {
        $lookup: {
          from: "models",
          localField: "model",
          foreignField: "_id",
          as: "model",
        },
      },
      { $unwind: "$model" },

      // define which fields are you wanting to fetch
      {
        $project: {
          _id: 1,
          bridge: "$bridge.name",
          bridgeAddr: "$bridge.address",
          address: 1,
          type: 1,
          model: "$model.name",
          modelDesc: "$model.description",
          name: 1,
          line: 1,
          description: 1,
          master: 1,
          zone: "$zone._id",
          zoneName: "$zone.name",
          zoneDesc: "$zone.description",
          zoneCommand: "$zone.command",
          zoneProgram: "$zone.program",
          zoneState: "$zone.state",
          role: "$user_role.role",
        },
      },
    ]);
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
router.get("/devices/:id", auth, async (req, res) => {
  try {
    const data = await Device.findById(req.params.id);
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
router.get("/devices", auth, async (req, res) => {
  try {
    const data = await Device.find();
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
router.post("/devices", auth, async (req, res) => {
  const data = new Device({
    bridge: req.body.bridge,
    address: req.body.address,
    type: req.body.type,
    model: req.body.model,
    line: req.body.line,
    name: req.body.name,
    ambient: req.body.ambient,
    description: req.body.description,
  });
  try {
    const dataToSave = await data.save();
    res.status(200).json(dataToSave);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});
router.patch("/devices/:id", auth, async (req, res) => {
  try {
    const id = req.params.id;
    const updatedData = req.body;
    const options = { new: true };

    const result = await Device.findByIdAndUpdate(id, updatedData, options);

    res.send(result);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});
router.delete("/devices/:id", auth, async (req, res) => {
  try {
    const id = req.params.id;
    const data = await Device.findByIdAndDelete(id);
    res.send(`Bridge named ${data.name} has been deleted..`);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

//Programs CRUD
router.get("/programs/:id", auth, async (req, res) => {
  try {
    const data = await Program.findById(req.params.id);
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
router.get("/programs", auth, async (req, res) => {
  try {
    const data = await Program.find();
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
router.post("/programs", auth, async (req, res) => {
  const data = new Program({
    name: req.body.name,
    description: req.body.description,
    based: req.body.based,
    pressure: req.body.pressure,
    custom: req.body.custom,
    cooling: req.body.cooling,
    neutral: req.body.neutral,
    heating: req.body.heating,
  });
  try {
    const dataToSave = await data.save();
    res.status(200).json(dataToSave);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});
router.patch("/programs/:id", auth, async (req, res) => {
  //TODO aggiungere il controllo per permettere la modifica dei non custom solo al superadmin
  try {
    const id = req.params.id;
    const updatedData = req.body;
    const options = { new: true };

    const result = await Bridge.findByIdAndUpdate(id, updatedData, options);

    res.send(result);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});
router.delete("/programs/:id", auth, async (req, res) => {
  //TODO aggiungere controllo per non cancellare i due programmi base
  try {
    const id = req.params.id;
    const data = await Program.findByIdAndDelete(id);
    res.send(`Program named ${data.name} has been deleted..`);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

//Read Modbus Datas
router.get("/read/:id", auth, modbusController.readById);
