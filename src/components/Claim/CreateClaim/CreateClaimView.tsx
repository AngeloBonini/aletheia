import { Col, Row } from "antd";
import { useAtom } from "jotai";
import React from "react";

import { createClaimMachineAtom } from "../../../machines/createClaim/provider";
import {
    addDebateSelector,
    addImageSelector,
    addSpeechSelector,
    stateSelector,
} from "../../../machines/createClaim/selectors";
import Loading from "../../Loading";
import ClaimCreate from "./ClaimCreate";
import ClaimCreateDebate from "./ClaimCreateDebate";
import ClaimSelectPersonality from "./ClaimSelectPersonality";
import ClaimSelectType from "./ClaimSelectType";
import ClaimUploadImage from "./ClaimUploadImage";
import { CreateClaimHeader } from "./CreateClaimHeader";

const CreateClaimView = () => {
    const [state] = useAtom(createClaimMachineAtom);
    const setupImage = stateSelector(state, "setupImage");
    const notStarted = stateSelector(state, "notStarted");
    const setupSpeech = stateSelector(state, "setupSpeech");
    const setupDebate = stateSelector(state, "setupDebate");
    const addImage = addImageSelector(state);
    const addSpeech = addSpeechSelector(state);
    const addDebate = addDebateSelector(state);
    const showPersonality = addSpeech || addImage || addDebate;
    const { claimData } = state.context;
    const isLoading = !(
        notStarted ||
        setupSpeech ||
        setupImage ||
        setupDebate ||
        addImage ||
        addSpeech ||
        addDebate
    );

    return (
        <Row justify="center">
            <Col span={18}>
                {showPersonality && !!claimData.personalities?.length && (
                    <CreateClaimHeader claimData={claimData} />
                )}
                {notStarted && <ClaimSelectType />}
                {(setupSpeech || setupImage || setupDebate) && (
                    <ClaimSelectPersonality />
                )}
                {addImage && <ClaimUploadImage />}
                {addSpeech && <ClaimCreate />}
                {addDebate && <ClaimCreateDebate />}
                {isLoading && <Loading />}
            </Col>
        </Row>
    );
};

export default CreateClaimView;
