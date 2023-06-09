const {
  Supplier,
  SupplierCustody,
  SupplierMaterial,
  Image,
} = require("../models");
const { errorFormat, idCheck } = require("../utils");

/*
 * method: POST
 * path: /api/supplier/
 */
const create = async (req, res) => {
  const { name, phoneNo, address, state, note, image } = req.body;

  try {
    const exist = await Supplier.findOne({ phoneNo });
    if (exist) {
      return res
        .status(400)
        .json(
          errorFormat(phoneNo, "This phoneNo is used before", "phoneNo", "body")
        );
    }

    //image checks
    let imageDocID;
    if (image) {
      imageDocID = (await Image.create({ data: image }))._id;
    }

    const supplier = await Supplier.create({
      name,
      phoneNo,
      address,
      state,
      note,
      image: imageDocID,
    });

    res.status(201).json({ data: supplier });
  } catch (error) {
    console.log("Error is in: ".bgRed, "supplier.create".bgYellow);
    if (process.env.PRODUCTION === "false") console.log(error);
  }
};

/*
 * method: GET
 * path: /api/supplier/:id
 */
const getByID = async (req, res) => {
  const id = req.params.id;

  try {
    const supplier = await Supplier.findById(id).populate("image");
    if (!supplier) {
      return res
        .status(404)
        .json(errorFormat(id, "No supplier with this id", "id", "params"));
    }

    res.status(200).json({ data: supplier });
  } catch (error) {
    console.log("Error is in: ".bgRed, "supplier.getByID".bgYellow);
    if (process.env.PRODUCTION === "false") console.log(error);
  }
};

/*
 * method: GET
 * path: /api/supplier/
 */
const getAll = async (req, res) => {
  try {
    const suppliers = await Supplier.find();

    res.status(200).json({ data: suppliers });
  } catch (error) {
    console.log("Error is in: ".bgRed, "supplier.getAll".bgYellow);
    if (process.env.PRODUCTION === "false") console.log(error);
  }
};

/*
 * method: PATCH
 * path: /api/supplier/:id
 */
const update = async (req, res) => {
  const id = req.params.id;
  const { name, phoneNo, address, state, note, image } = req.body;

  try {
    const supplier = await Supplier.findById(id);

    if (!supplier) {
      return res
        .status(404)
        .json(errorFormat(id, "No supplier with this id", "id", "params"));
    }

    if (phoneNo) {
      const exist = await Supplier.findOne({ phoneNo });
      if (exist._id.toString() !== id) {
        return res
          .status(400)
          .json(
            errorFormat(
              phoneNo,
              "This phoneNo is used before",
              "phoneNo",
              "body"
            )
          );
      }
    }

    let imageDocID;
    if (image) {
      const exist = await Image.findById(supplier.image);
      if (exist) {
        await Image.findByIdAndDelete(supplier.image);
      }
      imageDocID = (await Image.create({ data: image }))._id;
    }

    //update the supplier
    await Supplier.findByIdAndUpdate(id, {
      name,
      phoneNo,
      address,
      state,
      note,
      image: imageDocID,
    });

    res.status(200).json({ msg: "Supplier is updated tmam" });
  } catch (error) {
    console.log("Error is in: ".bgRed, "supplier.update".bgYellow);
    if (process.env.PRODUCTION === "false") console.log(error);
  }
};

/*
 * method: DELETE
 * path: /api/supplier/:id
 */
const deleteOne = async (req, res) => {
  const id = req.params.id;
  try {
    const supplier = await Supplier.findByIdAndDelete(id);
    if (!supplier) {
      return res
        .status(400)
        .json(errorFormat(id, "No supplier with this id", "id", "params"));
    }

    res.status(200).json({ msg: "Supplier deleted tmam" });
  } catch (error) {
    console.log("Error is in: ".bgRed, "supplier.deleteOne".bgYellow);
    if (process.env.PRODUCTION === "false") console.log(error);
  }
};

/*
 * method: GET
 * path: /api/supplier/custody/:cid
 */
const getSuppliersByCustody = async (req, res) => {
  const cid = req.params.cid;

  try {
    if (!idCheck(cid)) {
      return res
        .status(400)
        .json(errorFormat(cid, "Not valid custody id", "cid", "params"));
    }

    const suppliers = await SupplierCustody.find({ custody: cid }).populate(
      "supplier",
      "_id name"
    );

    res.status(200).json({ data: suppliers });
  } catch (error) {
    console.log(
      "Error is in: ".bgRed,
      "supplier.getSuppliersByCustody".bgYellow
    );
    if (process.env.PRODUCTION === "false") console.log(error);
  }
};

/*
 * method: GET
 * path: /api/supplier/material/:mid
 */
const getSuppliersByMaterial = async (req, res) => {
  const mid = req.params.mid;

  try {
    if (!idCheck(mid)) {
      return res
        .status(400)
        .json(errorFormat(mid, "Not valid custody id", "mid", "params"));
    }

    const suppliers = await SupplierMaterial.find({ material: mid }).populate(
      "supplier",
      "_id name"
    );

    res.status(200).json({ data: suppliers });
  } catch (error) {
    console.log(
      "Error is in: ".bgRed,
      "supplier.getSuppliersByCustody".bgYellow
    );
    if (process.env.PRODUCTION === "false") console.log(error);
  }
};

module.exports = {
  create,
  getByID,
  getAll,
  update,
  deleteOne,
  getSuppliersByCustody,
  getSuppliersByMaterial,
};
