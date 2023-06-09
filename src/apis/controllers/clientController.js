const { Client, Image, Order, Material } = require("../models");
const { errorFormat, idCheck, currentTime } = require("../utils");

/*
 * method: POST
 * path: /api/client/
 */
const create = async (req, res) => {
  const { name, phoneNo, address, state, note, image } = req.body;

  try {
    //check if the phoneNo exist before
    const exist = await Client.findOne({ phoneNo });
    if (exist) {
      return res
        .status(400)
        .json(
          errorFormat(phoneNo, "this phoneNo is used before", "phoneNo", "body")
        );
    }

    //image checks
    let imageDocID;
    if (image) {
      imageDocID = (await Image.create({ data: image }))._id;
    }

    const client = await Client.create({
      name,
      phoneNo,
      address,
      state,
      note,
      image: imageDocID,
    });

    res.status(201).json({ data: client });
  } catch (error) {
    console.log("Error is in: ".bgRed, "client.create".bgYellow);
    if (process.env.PRODUCTION === "false") console.log(error);
  }
};

/*
 * method: GET
 * path: /api/client/
 */
const getAll = async (req, res) => {
  try {
    const clients = await Client.find();
    res.status(200).json({ data: clients });
  } catch (error) {
    console.log("Error is in: ".bgRed, "client.getAll".bgYellow);
    if (process.env.PRODUCTION === "false") console.log(error);
  }
};

/*
 * method: GET
 * path: /api/client/:id
 */
const getByID = async (req, res) => {
  const id = req.params.id;
  try {
    const client = await Client.findById(id).populate("image");

    if (!client) {
      return res
        .status(404)
        .json(errorFormat(id, "No client with this id", "id", "params"));
    }

    res.status(200).json({ data: client });
  } catch (error) {
    console.log("Error is in: ".bgRed, "client.getByID".bgYellow);
    if (process.env.PRODUCTION === "false") console.log(error);
  }
};

/*
 * method: PATCH
 * path: /api/client/:id
 */
const update = async (req, res) => {
  const id = req.params.id;
  const { name, phoneNo, address, state, note, image } = req.body;

  try {
    //keep phoneNo unique
    if (phoneNo) {
      const exist = await Client.findOne({ phoneNo });

      if (exist._id.toString() !== id) {
        return res
          .status(400)
          .json(
            errorFormat(
              phoneNo,
              "this phoneNo is used before",
              "phoneNo",
              "body"
            )
          );
      }
    }

    const client = await Client.findById(id);
    if (!client) {
      return res
        .status(404)
        .json(errorFormat(id, "No client with this id", "id", "params"));
    }

    let imageDocID;
    if (image) {
      const exist = await Image.findById(client.image);
      if (exist) {
        await Image.findByIdAndDelete(client.image);
      }
      imageDocID = (await Image.create({ data: image }))._id;
    }

    await Client.findByIdAndUpdate(id, {
      name,
      phoneNo,
      address,
      state,
      note,
      image: imageDocID,
    });

    res.status(200).json({ msg: "Client updated tmam" });
  } catch (error) {
    console.log("Error is in: ".bgRed, "client.update".bgYellow);
    if (process.env.PRODUCTION === "false") console.log(error);
  }
};

/*
 * method: DELETE
 * path: /api/client/:id
 */
const deleteOne = async (req, res) => {
  const id = req.params.id;
  try {
    const client = await Client.findByIdAndDelete(id);

    if (!client) {
      return res
        .status(404)
        .json(errorFormat(id, "No client with this id", "id", "params"));
    }

    res.status(200).json({ msg: "Client deleted tmam" });
  } catch (error) {
    console.log("Error is in: ".bgRed, "client.deleteOne".bgYellow);
    if (process.env.PRODUCTION === "false") console.log(error);
  }
};

/*
 * method: PATCH
 * path: /api/client/updateMaterials/:id
 */
const updateMaterials = async (req, res) => {
  const id = req.params.id;

  const { order: orderID, clientMaterials } = req.body;

  try {
    const client = await Client.findById(id);
    if (!client) {
      return res
        .status(404)
        .json(errorFormat(id, "No client with this id", "id", "params"));
    }

    if (!idCheck(orderID)) {
      return res
        .status(400)
        .json(errorFormat(orderID, "Invalid order id", "order", "body"));
    }
    const order = await Order.findById(orderID);
    if (!order) {
      return res
        .status(404)
        .json(errorFormat(orderID, "No order with this id", "order", "body"));
    }

    if (order.client.toString() !== client._id.toString()) {
      return res
        .status(400)
        .json(
          errorFormat(
            orderID,
            "This client does not have this order",
            "order",
            "body"
          )
        );
    }

    //checks
    for (let i = 0; i < clientMaterials.length; i++) {
      if (!idCheck(clientMaterials[i].material)) {
        return res
          .status(400)
          .json(
            errorFormat(
              clientMaterials[i].material,
              "Invalid material id",
              `clientMaterials[${i}].material`,
              "body"
            )
          );
      }

      const material = await Material.findById(clientMaterials[i].material);

      if (!material) {
        return res
          .status(404)
          .json(
            clientMaterials[i].material,
            "No material with this id",
            `clientMaterials[${i}].material`,
            "body"
          );
      }
    }

    for (let i = 0; i < clientMaterials.length; i++) {
      const material = await Material.findById(clientMaterials[i].material);
      material.quantity += +clientMaterials[i].quantity;
      material.available += +clientMaterials[i].quantity;

      order.clientMaterial.push({
        material: clientMaterials[i].material,
        quantity: clientMaterials[i].quantity,
        date: currentTime(),
      });

      await material.save();
    }
    await order.save();

    res.status(200).json({ msg: "Client's materials added tmam" });
  } catch (error) {
    console.log("Error is in: ".bgRed, "client.updateMaterials".bgYellow);
    if (process.env.PRODUCTION === "false") console.log(error);
  }
};

module.exports = {
  create,
  getAll,
  getByID,
  update,
  deleteOne,
  updateMaterials,
};
