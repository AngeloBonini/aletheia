export type ReviewData = {
    usersId: string[];
    summary: string;
    questions: string[];
    report: string;
    verification: string;
    sources: string[];
    classification: string;
    rejectionComment: string;
    reviewerId: string;
};

export type ClaimReview = {
    personality: string;
    claim: string;
    usersId: string;
    isPartialReview: boolean;
};

export type SaveEvent = {
    type: string;
    reviewData: ReviewData;
    claimReview: ClaimReview;
};

export type ReviewTaskMachineEvents = SaveEvent;
