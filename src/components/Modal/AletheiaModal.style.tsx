import { Button, Modal } from "antd";
import styled from "styled-components";
import colors from "../../styles/colors";

const AletheiaModal = styled(Modal)`
    background: none;
    box-shadow: none;
    padding: 0;

    .ant-modal-content {
        width: ${(props) => (props.width ? props.width : "300px")};
        margin: 0 auto;
        border-radius: 8px;
        background-color: ${colors.lightGray};
        box-shadow: 0px 0px 15px rgba(0, 0, 0, 0.25);
        padding: 26px 26px;
        max-width: 90vw;
    }

    .ant-modal-body {
        padding: 0;
    }

    .ant-modal-header {
        background: none;
        border-bottom: 0px;
        padding: 0 0 10px 0;
    }

    .ant-modal-title {
        color: ${colors.blackPrimary};
        font-weight: 700;
        font-size: 14px;
        text-align: center;
        text-transform: uppercase;
    }

    svg[data-icon="close"] {
        margin-top: 26px;
        width: 13px;
        height: 13px;
        color: ${colors.blackPrimary};
        margin-right: 20px;
    }
`;

const ModalCancelButton = styled(Button)`
    height: 40px;
    width: 120px;
    color: ${colors.bluePrimary};
    text-align: "center";
    font-weight: 700;
    font-size: 14;
`;

export { AletheiaModal, ModalCancelButton };
