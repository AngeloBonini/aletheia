import { Injectable, Logger } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Roles } from "../auth/ability/ability.factory";
import { Model } from "mongoose";

import OryService from "../auth/ory/ory.service";
import { User, UserDocument } from "./schemas/user.schema";
import { Badge } from "../badge/schemas/badge.schema";

@Injectable()
export class UsersService {
    private readonly logger = new Logger("UserService");
    constructor(
        @InjectModel(User.name) private UserModel: Model<UserDocument>,
        private oryService: OryService
    ) {}

    async findAll(userQuery): Promise<UserDocument[]> {
        const { searchName, filterOutRoles, badges, project } = userQuery;
        return this.UserModel.find({
            name: { $regex: searchName || "", $options: "i" },
            role: { $nin: [...(filterOutRoles || []), null] },
            ...(badges ? { badges } : {}),
        }).select(project || { _id: 1, name: 1 });
    }

    async register(user) {
        const newUser = new this.UserModel(user);
        if (!newUser.oryId) {
            this.logger.log("No user id provided, creating a new ory identity");
            const { data: oryUser } = await this.oryService.createIdentity(
                newUser,
                user.password,
                user.role
            );
            newUser.oryId = oryUser.id;
        } else {
            this.logger.log("User id provided, updating an ory identity");
            await this.oryService.updateIdentity(
                newUser,
                user.password,
                user.role
            );
        }
        return await newUser.save();
    }

    async getById(userId) {
        const user = await this.UserModel.findById(userId).populate("badges");
        this.logger.log(`Found user ${user._id}`);
        return user;
    }

    async registerPasswordChange(userId) {
        const user = await this.getById(userId);
        if (user.firstPasswordChanged === false) {
            user.firstPasswordChanged = true;
            this.logger.log(`User ${user._id} changed first password`);
            user.save();
        }
    }

    async updateUser(userId, updates: { role?: Roles; badges?: Badge[] }) {
        if (updates.role) {
            const user = await this.getById(userId);
            await this.oryService.updateUserRole(user, updates.role);
        }
        const updatedUser = this.UserModel.findByIdAndUpdate(userId, updates, {
            new: true,
        });
        this.logger.log(`Updated user ${userId._id}`);
        return updatedUser;
    }
}
