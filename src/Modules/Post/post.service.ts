import { Request, Response } from "express";

class PostService {
    constructor() {}

    async createPost (req:Request, res:Response):Promise<Response> {
        return res.status(201).json({message:"Post created."})
    }
}

export default new PostService();
