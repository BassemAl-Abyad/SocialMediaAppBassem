import { HUserDocument } from "../../DB/Models/user.model";
import { CustomJwtPayLoad } from "../services/token";

declare module "express-serve-static-core" {
    interface Request {
        user: HUserDocument;
        decoded: CustomJwtPayLoad;
    }
}