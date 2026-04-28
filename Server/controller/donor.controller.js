import '../model/connection.js';
import url from 'url';
import rs from 'randomstring';
import jwt from 'jsonwebtoken';
import donorSchemaModel from '../model/donor.model.js';
import sendMail from './email.controller.js';


export var save =async(req,res)=>{
    var donorList = await donorSchemaModel.find();
    // console.log(donorList);
    var len = donorList.length;
    
    var _id = (len==0)?1:donorList[len-1]._id+1;

    var donorDetail = req.body;
   // console.log(donorDetail);
    donorDetail ={...donorDetail,"_id":_id,"role":"donor","status":0,"info":Date()};
    //console.log(donorDetail);
    try {
      const donors = await donorSchemaModel.create(donorDetail);
      try {
        await sendMail(donors.email, donors.password);
        res.status(201).json({ "status": "Resourse created successfully" });
      } catch (mailErr) {
        console.log("Mail delivery failed, rolling back donor creation:", mailErr);
        await donorSchemaModel.deleteOne({ _id: donors._id });
        res.status(500).json({ "status": "Email delivery failed. Possibly email address does not exist." });
      }
    } catch (err) {
      console.log(err);
      res.status(500).json({ "status": "Registration failed. Possibly email already exists." });
    }
}
export const fetch = async (req, res) => {
  try {
    const { city, bloodGroup, email } = req.query;
    let condition = {};

    if (email) {
      condition.email = email;
    } else {
      condition.eligible = true;
      if (city) condition.city = new RegExp(`^${city}$`, 'i');
      if (bloodGroup) condition.bloodGroup = bloodGroup;
    }

    const donors = await donorSchemaModel.find(condition).select('-password');
    res.status(200).json(donors);
  } catch (error) {
    res.status(500).json({ result: "Internal Server Error" });
  }
};

// Fetch for admin: all donors
export const fetchAll = async (req, res) => {
  try {
    const donors = await donorSchemaModel.find().select('-password');
    if (donors.length !== 0) {
      return res.status(200).json(donors);
    } else {
      return res.status(404).json({ result: "No donors found." });
    }
  } catch (error) {
    console.error("FetchAll error:", error);
    res.status(500).json({ result: "Internal Server Error" });
  }
};

export const update = async(req,res)=>{
   
     var condition_obj = req.body.condition_obj;
   //console.log(condition_obj);
   var donor = await donorSchemaModel.findOne(condition_obj);
   // console.log(donor);
  if(donor){
          var update_donor = await donorSchemaModel.updateOne(
  req.body.condition_obj,
  { $set: req.body.content_obj }
);
        if(update_donor){
             res.status(200).json({"result":"updated successfully"});
         }
    else{
          res.status(500).json({"result":"not updated successfully"});
          }
 }
    else{
     res.status(404).json({"result":"donor not found in database"});
    }
}
export const deletedonor = async(req,res)=>{
    var donor = await donorSchemaModel.findOne(req.body);
    //console.log(donor);
    if(donor){
        var delete_donor = await donorSchemaModel.deleteOne((req.body));
        if(delete_donor){
            res.status(200).json({"result":"donor  deleted successfully"});
        }
        else{
            res.status(500).json({"result":"donor not deleted successfully"});
        }
        }
    
    else{
         res.status(404).json({"result":"donor not found in database"});
    }
}
export const login = async(req,res)=>{
     //console.log("h");
     var donorDetail  = {...req.body,"status":1};
    // console.log(donorDetail);
     var donorList = await donorSchemaModel.find(donorDetail);
     //console.log(donorList);
     if(donorList.length!=0){
         const payload = {"subject":donorList[0].email};
         const key = rs.generate();
         const token = jwt.sign(payload,key);
         res.status(200).json({"token":token,"donorList":donorList[0]});

     }
     else{
         res.status(500).json({"token":"token error"});
     }
} 
// Admin verifies donor report
// Donor uploads report
export const uploadReport = async (req, res) => {
  try {
    const donorId = req.params.id;
    console.log(`Processing report upload for Donor ID: ${donorId}`);

    if (!req.file) {
      console.log("No file received in request");
      return res.status(400).json({ result: "No file uploaded" });
    }

    console.log("File received:", req.file.filename, "Path:", req.file.path);

    // Normalize path for URL (replace backslashes with forward slashes)
    const normalizedPath = req.file.path.replace(/\\/g, "/");

    // Use Number(donorId) to ensure it matches the schema's Number type
    const donor = await donorSchemaModel.findOneAndUpdate(
      { _id: Number(donorId) },
      { reportUrl: normalizedPath, eligible: false },
      { new: true }
    );

    if (!donor) {
      console.log(`Donor with ID ${donorId} not found in database`);
      return res.status(404).json({ result: "Donor not found" });
    }

    console.log("Report URL successfully updated in DB:", donor.reportUrl);
    res.status(200).json({ result: "Report uploaded successfully", donor });
  } catch (err) {
    console.error("Critical Upload report error:", err);
    res.status(500).json({ result: "Failed to upload report" });
  }
};

// Admin verifies donor eligibility
export const verifyEligibility = async (req, res) => {
  try {
    const donorId = req.params.id;
    const { eligible } = req.body; // Get eligible from request body

    const donor = await donorSchemaModel.findByIdAndUpdate(
      donorId,
      { eligible },
      { new: true }
    );

    res.status(200).json({ result: "Donor eligibility updated", donor });
  } catch (err) {
    console.error(err);
    res.status(500).json({ result: "Failed to update eligibility" });
  }
};
