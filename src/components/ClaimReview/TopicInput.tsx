import { Button, Col } from "antd";
import React, { useState, useEffect } from "react";
import topicApi from "../../api/topicsApi";
import sentenceApi from "../../api/sentenceApi";
import AutoComplete from "../Form/Autocomplete";
import { useTranslation } from "next-i18next";
import colors from "../../styles/colors";
import { EditFilled, PlusOutlined } from "@ant-design/icons";
import AletheiaButton from "../Button";
import TagsList from "./TagsList";
import { useAtom } from "jotai";
import { isUserLoggedIn } from "../../atoms/currentUser";

const TopicInput = ({ data_hash, topics }) => {
    const { t } = useTranslation();
    const [isLoggedIn] = useAtom(isUserLoggedIn);
    const [showTopicsInput, setShowTopicsInput] = useState<boolean>(false);
    const [topicsArray, setTopicsArray] = useState<string[]>(topics);
    const [inputValue, setInputValue] = useState<string[]>([]);
    const [currentInputValue, setCurrentInputValue] = useState<string[]>([]);
    const [showErrorMessage, setShowErrorMessage] = useState<boolean>(false);
    const [showTopicErrorMessage, setShowTopicErrorMessage] =
        useState<boolean>(false);
    const [tags, setTags] = useState<string[]>([]);
    const [duplicatedErrorMessage, setDuplicatedErrorMessage] = useState("");

    const fetchTopicList = async (topic) => {
        const topicSearchResults = await topicApi.getTopics(topic, t);
        return topicSearchResults.map((topic) => ({
            value: topic.name,
        }));
    };

    const handleClose = async (removedTopic: string) => {
        const newTopics = topicsArray.filter((topic) => topic !== removedTopic);
        setTopicsArray(newTopics);
        sentenceApi.deleteSentenceTopic(newTopics, data_hash);
    };

    const getDuplicated = (array1, array2) => {
        return array1.filter((object1) => {
            return array2.some((object2) => {
                return object1 === object2;
            });
        });
    };

    const duplicated = getDuplicated(inputValue, topicsArray);

    const handleEdit = () => {
        if (duplicated.length > 0) {
            setShowTopicErrorMessage(!showTopicErrorMessage);
        } else if (inputValue.length) {
            setTopicsArray(tags);
            setCurrentInputValue([]);
            topicApi.createTopics({ topics: tags, data_hash }, t);
        } else {
            setShowErrorMessage(!showErrorMessage);
        }
    };

    useEffect(() => {
        duplicated.length > 0
            ? setDuplicatedErrorMessage(duplicated.join(", "))
            : setShowTopicErrorMessage(false);
        const filterValues = inputValue.filter(
            (value) => !topicsArray.includes(value)
        );
        setTags(topicsArray?.concat(filterValues) || []);
    }, [inputValue, topicsArray]);

    return (
        <>
            <Col
                style={{
                    marginBottom: 12,
                    display: "flex",
                    alignItems: "center",
                }}
            >
                <TagsList
                    tags={tags}
                    editable={isLoggedIn}
                    handleClose={handleClose}
                />

                {isLoggedIn && (
                    <Button
                        onClick={() => {
                            setShowTopicsInput(!showTopicsInput);
                            setShowErrorMessage(false);
                        }}
                        style={{
                            padding: "5px",
                            background: "none",
                            border: "none",
                            fontSize: 16,
                            color: colors.bluePrimary,
                        }}
                    >
                        {tags.length ? <EditFilled /> : <PlusOutlined />}
                    </Button>
                )}
            </Col>
            <Col>
                {showTopicsInput && (
                    <>
                        <Col style={{ display: "flex" }}>
                            <AutoComplete
                                placeholder={t("topics:placeholder")}
                                dataCy="testSearchTopics"
                                onChange={(value) => {
                                    setInputValue(value);
                                    setCurrentInputValue(value);
                                }}
                                mode="tags"
                                dataLoader={fetchTopicList}
                                style={{
                                    borderTopLeftRadius: 4,
                                    borderBottomLeftRadius: 4,
                                }}
                                value={currentInputValue}
                            />
                            <AletheiaButton
                                style={{
                                    height: 32,
                                    borderRadius: 0,
                                    borderTopRightRadius: 4,
                                    borderBottomRightRadius: 4,
                                    padding: "0 5px",
                                    fontSize: 12,
                                }}
                                onClick={() => handleEdit()}
                            >
                                {t("topics:addTopicsButton")}
                            </AletheiaButton>
                        </Col>
                        <Col>
                            {showErrorMessage && (
                                <span
                                    style={{
                                        width: "100%",
                                        marginLeft: 20,
                                        color: "#ff4d4f",
                                    }}
                                >
                                    {t("topics:inputRule")}
                                </span>
                            )}
                            {showTopicErrorMessage && (
                                <span
                                    style={{
                                        width: "100%",
                                        marginLeft: 20,
                                        color: "#ff4d4f",
                                    }}
                                >
                                    {t("topics:duplicatedTopicError", {
                                        duplicatedTopics:
                                            duplicatedErrorMessage,
                                    })}
                                </span>
                            )}
                        </Col>
                    </>
                )}
            </Col>
        </>
    );
};

export default TopicInput;
