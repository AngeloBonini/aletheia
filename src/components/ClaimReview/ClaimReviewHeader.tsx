import { useSelector } from "@xstate/react";
import { Col, Row } from "antd";
import { useTranslation } from "next-i18next";
import React, { useContext, useEffect, useState } from "react";

import ClaimReviewApi from "../../api/claimReviewApi";
import { ReviewTaskMachineContext } from "../../machines/reviewTask/ReviewTaskMachineProvider";
import { ClassificationEnum, Roles } from "../../types/enums";
import {
    crossCheckingSelector,
    publishedSelector,
    reviewDataSelector,
    reviewNotStartedSelector,
} from "../../machines/reviewTask/selectors";
import { useAppSelector } from "../../store/store";
import colors from "../../styles/colors";
import AletheiaAlert from "../AletheiaAlert";
import HideContentButton from "../HideContentButton";
import HideReviewModal from "../Modal/HideReviewModal";
import UnhideReviewModal from "../Modal/UnhideReviewModal";
import Banner from "../SentenceReport/Banner";
import SentenceReportCard from "../SentenceReport/SentenceReportCard";
import TopicInput from "./TopicInput";
import { Content } from "../../types/Content";
import { useAtom } from "jotai";
import { currentUserRole, isUserLoggedIn } from "../../atoms/currentUser";

interface ClaimReviewHeaderProps {
    personality?: string;
    claim: any;
    content: Content;
    classification?: ClassificationEnum;
    hideDescription: string;
    userIsReviewer: boolean;
    userIsAssignee: boolean;
    userIsNotRegular: boolean;
}

const ClaimReviewHeader = ({
    personality,
    claim,
    content,
    classification,
    hideDescription,
    userIsReviewer,
    userIsAssignee,
    userIsNotRegular,
}: ClaimReviewHeaderProps) => {
    const [isHideModalVisible, setIsHideModalVisible] = useState(false);
    const [isUnhideModalVisible, setIsUnhideModalVisible] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const { t } = useTranslation();
    const { vw } = useAppSelector((state) => state);
    const [isLoggedIn] = useAtom(isUserLoggedIn);
    const [role] = useAtom(currentUserRole);

    const { machineService, publishedReview } = useContext(
        ReviewTaskMachineContext
    );
    const isHidden = publishedReview?.review?.isHidden;
    const [hide, setHide] = useState(isHidden);

    const reviewData = useSelector(machineService, reviewDataSelector);
    const reviewNotStarted = useSelector(
        machineService,
        reviewNotStartedSelector
    );
    const isCrossChecking = useSelector(machineService, crossCheckingSelector);
    const userHasPermission = userIsReviewer || userIsAssignee;
    const isPublished =
        useSelector(machineService, publishedSelector) ||
        publishedReview?.review;
    const isPublishedOrCanSeeHidden =
        isPublished && (!isHidden || userIsNotRegular);
    const userIsAdmin = role === Roles.Admin;

    const alertTypes = {
        hiddenReport: {
            show: true,
            description: hideDescription,
            title: "claimReview:warningAlertTitle",
        },
        crossChecking: {
            show: true,
            description: "",
            title: "claimReviewTask:crossCheckingAlertTitle",
        },
        rejected: {
            show: true,
            description: reviewData.rejectionComment,
            title: "claimReviewTask:rejectionAlertTitle",
        },
        hasStarted: {
            show: true,
            description: "",
            title: "claimReviewTask:hasStartedAlertTitle",
        },
        noAlert: {
            show: false,
            description: "",
            title: "",
        },
    };

    const [alert, setAlert] = useState(alertTypes.noAlert);
    const getAlert = () => {
        if (!isLoggedIn) {
            return alertTypes.noAlert;
        }
        if (hide) {
            return alertTypes.hiddenReport;
        }
        if (!isPublished) {
            if (isCrossChecking && (userIsAdmin || userHasPermission)) {
                return alertTypes.crossChecking;
            }
            if (
                (userIsAdmin || userIsAssignee) &&
                reviewData.rejectionComment
            ) {
                return alertTypes.rejected;
            }
            if (!userHasPermission && !userIsAdmin && !reviewNotStarted) {
                return alertTypes.hasStarted;
            }
        }
        return alertTypes.noAlert;
    };

    const showClassification =
        isPublishedOrCanSeeHidden || (isCrossChecking && userHasPermission);

    useEffect(() => {
        const newAlert = getAlert();
        setAlert(newAlert);
    }, [isCrossChecking, hide, isLoggedIn, reviewData.rejectionComment]);

    useEffect(() => {
        setHide(isHidden);
    }, [isHidden]);

    return (
        <Row>
            <Col offset={3} span={18}>
                {role === Roles.Admin && isPublished && (
                    <Col
                        style={{
                            marginBottom: 8,
                            display: "flex",
                            justifyContent: "flex-end",
                        }}
                    >
                        <div
                            style={{
                                width: "100%",
                                borderBottom: `1px solid ${colors.lightGraySecondary}`,
                            }}
                        ></div>
                        <HideContentButton
                            hide={hide}
                            handleHide={() => {
                                setIsUnhideModalVisible(!isUnhideModalVisible);
                            }}
                            handleUnhide={() =>
                                setIsHideModalVisible(!isHideModalVisible)
                            }
                            style={{
                                borderBottom: `1px solid ${colors.bluePrimary}`,
                                width: 26,
                            }}
                        />
                    </Col>
                )}
                <Row
                    style={{
                        background: isPublished ? "none" : colors.lightGray,
                    }}
                >
                    <Col
                        lg={{
                            order: 1,
                            span: isPublishedOrCanSeeHidden ? 16 : 24,
                        }}
                        md={{ order: 2, span: 24 }}
                        sm={{ order: 2, span: 24 }}
                        xs={{ order: 2, span: 24 }}
                        className="sentence-report-card"
                        style={{
                            paddingRight: vw?.md ? "0" : " 20px",
                        }}
                    >
                        <SentenceReportCard
                            personality={personality}
                            claim={claim}
                            content={content}
                            classification={
                                showClassification ? classification : ""
                            }
                        />
                        <div
                            style={{
                                margin: "16px",
                                width: "calc(100% - 16px)",
                            }}
                        >
                            <TopicInput
                                data_hash={content.data_hash}
                                topics={content.topics}
                            />
                        </div>
                    </Col>
                    {isPublishedOrCanSeeHidden && (
                        <Col
                            lg={{ order: 2, span: 8 }}
                            md={{ order: 1, span: 24 }}
                        >
                            <Banner />
                        </Col>
                    )}
                    {alert.show && (
                        <Col
                            style={{
                                margin: isPublished ? "16px 0" : "16px",
                                width: "100%",
                            }}
                            order={3}
                        >
                            <AletheiaAlert
                                type="warning"
                                message={t(alert.title)}
                                description={alert.description}
                                showIcon={true}
                            />
                        </Col>
                    )}
                </Row>
            </Col>
            <HideReviewModal
                visible={isHideModalVisible}
                isLoading={isLoading}
                handleOk={({ description, recaptcha }) => {
                    setIsLoading(true);
                    ClaimReviewApi.hideReview(
                        content.data_hash,
                        !hide,
                        t,
                        recaptcha,
                        description
                    ).then(() => {
                        setHide(!hide);
                        setIsHideModalVisible(!isHideModalVisible);
                        setAlert({ ...alertTypes.hiddenReport, description });
                        setIsLoading(false);
                    });
                }}
                handleCancel={() => setIsHideModalVisible(false)}
            />

            <UnhideReviewModal
                visible={isUnhideModalVisible}
                isLoading={isLoading}
                handleOk={({ recaptcha }) => {
                    setIsLoading(true);
                    ClaimReviewApi.hideReview(
                        content.data_hash,
                        !hide,
                        t,
                        recaptcha
                    ).then(() => {
                        setHide(!hide);
                        setIsUnhideModalVisible(!isUnhideModalVisible);
                        setIsLoading(false);
                    });
                }}
                handleCancel={() =>
                    setIsUnhideModalVisible(!isUnhideModalVisible)
                }
            />
        </Row>
    );
};

export default ClaimReviewHeader;
