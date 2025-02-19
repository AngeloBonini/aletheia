import { Injectable } from "@nestjs/common";
import {
    Ability,
    AbilityBuilder,
    AbilityClass,
    ExtractSubjectType,
    InferSubjects,
} from "@casl/ability";
import { User } from "../../enities/user.entity";

export enum Action {
    Manage = "manage",
    Create = "create",
    Read = "read",
    Update = "update",
    Delete = "delete",
}

export enum Roles {
    Regular = "regular", //read
    FactChecker = "fact-checker", //read, create, update
    Admin = "admin", //manage
}

export type Subjects = InferSubjects<typeof User> | "all";

export type AppAbility = Ability<[Action, Subjects]>;

@Injectable()
export class AbilityFactory {
    defineAbility(user: User) {
        const { can, cannot, build } = new AbilityBuilder(
            Ability as AbilityClass<AppAbility>
        );

        if (user.role === Roles.Admin) {
            can(Action.Manage, "all");
        } else if (user.role === Roles.FactChecker) {
            can(Action.Read, "all");
            can(Action.Update, "all");
            can(Action.Create, "all");
        } else {
            can(Action.Read, "all");
            cannot(Action.Create, "all").because(
                "special message: only admins!"
            );
        }

        return build({
            detectSubjectType: (item) =>
                item.constructor as ExtractSubjectType<Subjects>,
        });
    }
}
