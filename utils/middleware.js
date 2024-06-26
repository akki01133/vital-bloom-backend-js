import jwt from "jsonwebtoken";
import asyncHandler from "express-async-handler";
import { User } from "../user/user.model.js";
import mongoose from "mongoose";
/**
 * Error Middlewares
 */

const notFound = (req, res, next) => {
    const error = new Error(`Not Found - ${req.method} ${req.originalUrl}`);
    res.status(404);
    next(error);
}

const errorHandler = (err, req, res, next) => {
    const statusCode = res.statusCode == 200 ? 500 : res.statusCode;
    res.status(statusCode);
    res.json({
        statusCode: statusCode,
        message: err.message,
        stack: process.env.NODE_ENV == "production" ? null : err.stack
    });
}

/**
 * Auth Middlewares
 */

function parseCookies(cookieHeader) {
    const list = {};
    if (!cookieHeader) return list;

    cookieHeader.split(`;`).forEach(function (cookie) {
        let [name, ...rest] = cookie.split(`=`);
        name = name?.trim();
        if (!name) return;
        const value = rest.join(`=`).trim();
        if (!value) return;
        list[name] = decodeURIComponent(value);
    });

    return list;
}

const protect = asyncHandler(async (req, res, next) => {
    console.log(req.headers)
    const token = parseCookies(req.headers.cookie).userId;
    if (token) {
        try {
            console.log(token);

            if (!mongoose.Types.ObjectId.isValid(token)) {
                res.status(400);
                throw new Error("Invalid user id");
            }
            //decode token id
            req.user = await User.findById(token).select("-password");
            console.log(req.user);
            if (!req.user) {
                print("User not found");
            }
            next();
        } catch (error) {
            res.status(401);
            throw new Error("Not Authorized");
        }
    } else {
        res.status(401);
        throw new Error("Not Authorized");
    }
});

export { notFound, errorHandler, protect, parseCookies };
