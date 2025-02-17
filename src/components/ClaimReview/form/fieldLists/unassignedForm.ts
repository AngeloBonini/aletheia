import usersApi from "../../../../api/userApi";
import { Roles } from "../../../../types/enums";
import { createFormField, FormField } from "../../../Form/FormField";

export const fetchUserList = async (name, t) => {
    const userSearchResults = await usersApi.getUsers(
        { searchName: name, filterOutRoles: [Roles.Regular] },
        t
    );
    return userSearchResults.map((user) => ({
        label: user.name,
        value: user._id,
    }));
};

const unassignedForm: FormField[] = [
    createFormField({
        fieldName: "usersId",
        type: "inputSearch",
        i18nKey: "assignUser",
        extraProps: { dataLoader: fetchUserList },
    }),
];

export default unassignedForm;
