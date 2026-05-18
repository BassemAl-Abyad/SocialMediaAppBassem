import { Model } from "mongoose";
import { DatabaseRepository } from "../database.repository";
import { IStory } from "../Models/story.model";

export class StoryRepository extends DatabaseRepository<IStory> {
  constructor(protected override readonly model: Model<IStory>) {
    super(model);
  }
}
