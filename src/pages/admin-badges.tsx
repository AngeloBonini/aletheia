import React, { useEffect } from "react";
import { InferGetServerSidePropsType, NextPage } from "next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { GetLocale } from "../utils/GetLocale";
import BadgesView from "../components/badges/BadgesView";
import BadgesFormDrawer from "../components/badges/BadgesFormDrawer";
import { useSetAtom } from "jotai";
import { atomBadgesList } from "../atoms/badges";
import Seo from "../components/Seo";
import { useTranslation } from "next-i18next";
import { atomUserList } from "../atoms/userEdit";

const AdminBadgesPage: NextPage<{ data: string }> = ({
    badges,
    users,
}: InferGetServerSidePropsType<typeof getServerSideProps>) => {
    const setBadgesList = useSetAtom(atomBadgesList);
    const setUserlist = useSetAtom(atomUserList);
    useEffect(() => {
        setBadgesList(badges);
        setUserlist(users);
    }, [badges, setBadgesList, setUserlist, users]);
    const { t } = useTranslation();

    return (
        <>
            <Seo title={t("menu:badgesItem")} description={t("badges:title")} />
            <BadgesView />
            <BadgesFormDrawer />
        </>
    );
};

export async function getServerSideProps({ query, locale, locales, req }) {
    locale = GetLocale(req, locale, locales);
    return {
        props: {
            ...(await serverSideTranslations(locale)),
            badges: JSON.parse(JSON.stringify(query.badges)),
            users: JSON.parse(JSON.stringify(query.users)),
        },
    };
}

export default AdminBadgesPage;
