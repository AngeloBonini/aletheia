import React, { useState } from "react";
import { ArrowDownOutlined, ArrowUpOutlined } from "@ant-design/icons";
import { useTranslation } from "next-i18next";
import AletheiaButton, { ButtonType } from "../Button";
import ReviewProgress from "./ReviewProgress";
import AletheiaTitle from "../AletheiaTitle";

const ReviewStats = (props) => {
    const { t } = useTranslation();
    const [showAllReviews, setShowAllReviews] = useState<boolean>(false);
    const { reviews } = props?.stats || {};

    return (
        <>
            {reviews && <ReviewProgress reviews={reviews} statsProps={props} />}
            {reviews && showAllReviews && (
                <ReviewProgress reviews={reviews} statsProps={props} />
            )}
            {reviews && reviews?.length > 3 && props.type === "line" && (
                <div
                    style={{
                        display: "flex",
                        justifyContent: "center",
                    }}
                >
                    {!showAllReviews && (
                        <AletheiaButton
                            style={{
                                marginTop: "24px",
                                paddingBottom: 0,
                            }}
                            type={ButtonType.blue}
                            onClick={() => setShowAllReviews(true)}
                        >
                            <AletheiaTitle level={4}>
                                {t(`personality:seeAllMetricsOverviews`)}
                            </AletheiaTitle>
                            <ArrowDownOutlined
                                style={{ marginLeft: 5, fontSize: 14 }}
                            />
                        </AletheiaButton>
                    )}
                    {showAllReviews && (
                        <AletheiaButton
                            style={{
                                marginTop: "24px",
                                paddingBottom: 0,
                            }}
                            type={ButtonType.blue}
                            onClick={() => setShowAllReviews(false)}
                        >
                            <AletheiaTitle level={4}>
                                {t(`personality:seeLessMetricsOverviews`)}
                            </AletheiaTitle>
                            <ArrowUpOutlined
                                style={{ marginLeft: 5, fontSize: 14 }}
                            />
                        </AletheiaButton>
                    )}
                </div>
            )}
        </>
    );
};

export default ReviewStats;
