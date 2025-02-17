import React, { useEffect } from "react";
import { InferGetServerSidePropsType, NextPage } from "next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { GetLocale } from "../utils/GetLocale";
import AdminView from "../components/adminArea/AdminView";
import UserEditDrawer from "../components/adminArea/UserEditDrawer";
import { useAtom } from "jotai";
import { atomUserList } from "../atoms/userEdit";
import { atomBadgesList } from "../atoms/badges";
import BadgesApi from "../api/badgesApi";

const Admin: NextPage<{ data: string }> = ({
    users,
}: InferGetServerSidePropsType<typeof getServerSideProps>) => {
    const [userList, setUserList] = useAtom(atomUserList);
    const [, setBadgesList] = useAtom(atomBadgesList);

    useEffect(() => {
        if (userList.length === 0) {
            setUserList(users);
        }
        BadgesApi.getBadges().then((badges) => {
            setBadgesList(badges);
        });
    });

    return (
        <>
            <AdminView />
            <UserEditDrawer />
        </>
    );
};

export async function getServerSideProps({ query, locale, locales, req }) {
    locale = GetLocale(req, locale, locales);
    return {
        props: {
            ...(await serverSideTranslations(locale)),
            users: JSON.parse(JSON.stringify(query?.users)),
        },
    };
}

export default Admin;
