import { Request, Response } from 'express';

class AuthenticationService {
    constructor() {}
    
    signUp = (req: Request, res: Response): Response => {
        return res.status(200).json({ message: "Sign up" });
    }
    login = (req: Request, res: Response): Response => {
        return res.status(200).json({ message: "Login" });
    }
    logout = (req: Request, res: Response): Response => {
        return res.status(200).json({ message: "Logout" });
    }
}


export default new AuthenticationService();