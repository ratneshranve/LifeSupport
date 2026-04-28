import '../model/connection.js';
import url from 'url';
import rs from 'randomstring';
import jwt from 'jsonwebtoken';
import hospitalSchemaModel from '../model/hospital.model.js';
import sendMail from './email.controller.js';

// Register / Save Hospital
export var save = async (req, res) => {
  try {
    const hospitalList = await hospitalSchemaModel.find();
    const len = hospitalList.length;
    const _id = len === 0 ? 1 : hospitalList[len - 1]._id + 1;

    const hospitalDetail = { 
      ...req.body, 
      _id, 
      role: 'hospital', 
      status: 0, 
      info: Date() 
    };

    const hospital = await hospitalSchemaModel.create(hospitalDetail);
    // Send email verification similar to donor
    sendMail(hospital.email, hospital.password);

    res.status(201).json({ status: "Resource created successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: "false" });
  }
};

// Fetch hospitals
export const fetch = async (req, res) => {
  try {
    const { city } = url.parse(req.url, true).query;
    const condition = {};
    if (city) condition.city = city.charAt(0).toUpperCase() + city.slice(1).toLowerCase();

    const hospitals = await hospitalSchemaModel.find(condition);

    if (hospitals.length !== 0) {
      res.status(200).json(hospitals);
    } else {
      res.status(404).json({ result: "No matching hospitals found." });
    }
  } catch (err) {
    console.error("Fetch error:", err);
    res.status(500).json({ result: "Internal Server Error" });
  }
};

// Update hospital
export const update = async (req, res) => {
  try {
    const { condition_obj, content_obj } = req.body;
    const hospital = await hospitalSchemaModel.findOne(condition_obj);

    if (!hospital) return res.status(404).json({ result: "Hospital not found" });

    const updated = await hospitalSchemaModel.updateOne(condition_obj, { $set: content_obj });
    if (updated) res.status(200).json({ result: "Updated successfully" });
    else res.status(500).json({ result: "Update failed" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ result: "Internal Server Error" });
  }
};

// Delete hospital
export const deleteHospital = async (req, res) => {
  try {
    const hospital = await hospitalSchemaModel.findOne(req.body);
    if (!hospital) return res.status(404).json({ result: "Hospital not found" });

    const deleted = await hospitalSchemaModel.deleteOne(req.body);
    if (deleted) res.status(200).json({ result: "Hospital deleted successfully" });
    else res.status(500).json({ result: "Deletion failed" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ result: "Internal Server Error" });
  }
};

// Login hospital
export const login = async (req, res) => {
  try {
    const hospitalDetail = { ...req.body, status: 1 };
    const hospitalList = await hospitalSchemaModel.find(hospitalDetail);

    if (hospitalList.length !== 0) {
      const payload = { subject: hospitalList[0].email };
      const key = rs.generate();
      const token = jwt.sign(payload, key);
      res.status(200).json({ token, hospitalList: hospitalList[0] });
    } else {
      res.status(500).json({ token: "token error" });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ token: "token error" });
  }
};
// Fetch nearby hospitals by city
export const fetchNearbyHospitals = async (req, res) => {
  try {
    const { city } = req.params;
    if (!city) return res.status(400).json({ result: "City required" });

    const formattedCity = city.charAt(0).toUpperCase() + city.slice(1).toLowerCase();
    const hospitals = await hospitalSchemaModel.find({ city: formattedCity }).limit(2);

    if (hospitals.length > 0) {
      res.status(200).json(hospitals);
    } else {
      res.status(404).json({ result: "No nearby hospitals found." });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ result: "Internal Server Error" });
  }
};
