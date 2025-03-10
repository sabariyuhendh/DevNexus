const express = require("express");
const cloudinary = require("cloudinary").v2;
const profileRouter = express.Router();
const { userAuth } = require("../middlewares/auth");
const { validateEditProfileData } = require("../utils/validation");
const e = require("express");
profileRouter.get("/view", userAuth, async (req, res) => {
	try {
		const user = req.user;
		res.status(200).send(user);
	} catch (err) {
		res.status(400).send(`Unauthorized request ${err.message}`);
	}
});
profileRouter.patch("/edit", userAuth, async (req, res) => {
	try {
		if (!validateEditProfileData(req)) {
			throw new Error("Invalid Edit Request");
		}

		const loggedInUser = req.user;

		const fieldsToUpdate = [
			"firstName",
			"lastName",
			"photoUrl",
			"age",
			"gender",
			"about",
			"skills",
			"badges",
			"events",
			"projects",
		];

		fieldsToUpdate.forEach((key) => {
			if (req.body[key]) {
				loggedInUser[key] = req.body[key];
			}
		});

		await loggedInUser.save();

		res.json({
			message: `${loggedInUser.firstName}, Your profile updated successfully`,
			data: loggedInUser,
		});
	} catch (err) {
		res.status(400).send(`Validation Error: ${err.message}`);
	}
});

profileRouter.post("/avatar", userAuth, async (req, res) => {
	try {
		const { content, image } = req.body;
		const user = req.user;
		if (image) {
			const imgResult = await cloudinary.uploader.upload(image);
			user.photoUrl = imgResult.secure_url;
		}
		await user.save();
		res.status(201).json({ message: "Success", data: user });
	} catch (error) {
		console.error("Error in createPost controller:", error);
		res.status(500).json({ message: "Server error" });
	}
});

module.exports = profileRouter;
