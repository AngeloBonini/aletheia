import { Inject, Injectable, Logger, Scope } from "@nestjs/common";
import { LeanDocument, Model, Types } from "mongoose";
import {
    ClaimReview,
    ClaimReviewDocument,
} from "./schemas/claim-review.schema";
import { InjectModel } from "@nestjs/mongoose";
import { UtilService } from "../util";
import { HistoryService } from "../history/history.service";
import { HistoryType, TargetModel } from "../history/schema/history.schema";
import { ISoftDeletedModel } from "mongoose-softdelete-typescript";
import { ReportDocument } from "../report/schemas/report.schema";
import { SentenceService } from "../claim/types/sentence/sentence.service";
import { REQUEST } from "@nestjs/core";
import { BaseRequest } from "../types";
import { ImageService } from "../claim/types/image/image.service";
import { ContentModelEnum } from "../types/enums";

@Injectable({ scope: Scope.REQUEST })
export class ClaimReviewService {
    private readonly logger = new Logger("ClaimReviewService");
    constructor(
        @Inject(REQUEST) private req: BaseRequest,
        @InjectModel(ClaimReview.name)
        private ClaimReviewModel: Model<ClaimReviewDocument> &
            ISoftDeletedModel<ClaimReviewDocument>,
        private historyService: HistoryService,
        private util: UtilService,
        private sentenceService: SentenceService,
        private imageService: ImageService
    ) {}

    agreggateClassification(match: any) {
        return this.ClaimReviewModel.aggregate([
            { $match: match },
            {
                $lookup: {
                    from: "reports",
                    localField: "report",
                    foreignField: "_id",
                    as: "report",
                },
            },
            { $group: { _id: "$report.classification", count: { $sum: 1 } } },
            { $sort: { count: -1 } },
        ]);
    }

    count(query: any = {}) {
        return this.ClaimReviewModel.countDocuments().where(query);
    }

    async getReviewStatsByClaimId(claimId) {
        const reviews = await this.ClaimReviewModel.aggregate([
            {
                $match: {
                    claim: claimId,
                    isDeleted: false,
                    isPublished: true,
                    isHidden: false,
                },
            },
            {
                $lookup: {
                    from: "reports",
                    localField: "report",
                    foreignField: "_id",
                    as: "report",
                },
            },
            { $group: { _id: "$report.classification", count: { $sum: 1 } } },
            { $sort: { count: -1 } },
        ]);
        return this.util.formatStats(reviews);
    }

    /**
     * get all personality claim claimIDs
     * @param claimId claim Id
     * @returns
     */
    getReviewsByClaimId(claimId) {
        return this.ClaimReviewModel.aggregate([
            {
                $match: {
                    claim: claimId,
                    isDeleted: false,
                    isPublished: true,
                    isHidden: false,
                },
            },
            {
                $lookup: {
                    from: "reports",
                    localField: "report",
                    foreignField: "_id",
                    as: "report",
                },
            },
            {
                $group: {
                    _id: {
                        data_hash: "$data_hash",
                        classification: "$report.classification",
                    },
                    count: { $sum: 1 },
                },
            },
        ]).option({ serializeFunctions: true });
    }

    /**
     * This function creates a new claim review.
     * Also creates a History Module that tracks creation of claim reviews.
     * @param claimReview ClaimReviewBody received of the client.
     * @returns Return a new claim review object.
     */
    async create(claimReview, data_hash) {
        // This line may cause a false positive in sonarCloud because if we remove the await, we cannot iterate through the results
        const review = await this.getReviewByDataHash(data_hash);

        if (review) {
            throw new Error("This Claim already has a review");
            //TODO: verify if already start a review and isn't published
        } else {
            // Cast ObjectId
            claimReview.personality = Types.ObjectId(claimReview.personality);
            claimReview.claim = Types.ObjectId(claimReview.claim);
            claimReview.usersId = claimReview.report.usersId.map((userId) => {
                return Types.ObjectId(userId);
            });
            claimReview.report = Types.ObjectId(claimReview.report._id);
            claimReview.data_hash = data_hash;
            claimReview.date = new Date();
            const newClaimReview = new this.ClaimReviewModel(claimReview);
            newClaimReview.isPublished = true;
            newClaimReview.isPartialReview = claimReview.isPartialReview;

            const history = this.historyService.getHistoryParams(
                newClaimReview._id,
                TargetModel.ClaimReview,
                claimReview.usersId,
                HistoryType.Create,
                newClaimReview
            );

            this.historyService.createHistory(history);

            return newClaimReview.save();
        }
    }

    getById(claimReviewId) {
        return this.ClaimReviewModel.findById(claimReviewId)
            .populate("claims", "_id title")
            .populate("sources", "_id link classification");
    }

    async getReviewByDataHash(
        data_hash: string
    ): Promise<LeanDocument<ClaimReviewDocument>> {
        return await this.ClaimReviewModel.findOne({ data_hash })
            .populate("report")
            .lean();
    }

    async getReport(match): Promise<LeanDocument<ReportDocument>> {
        const claimReview = await this.ClaimReviewModel.findOne(match)
            .populate("report")
            .lean();
        return claimReview.report;
    }

    /**
     * This function does a soft deletion, doesn't delete claim review in DataBase,
     * but omit its in the front page
     * Also creates a History Module that tracks deletion of claim reviews.
     * @param claimReviewId claimId Claim id which wants to delete
     * @returns Returns the claim review with the param isDeleted equal to true
     */
    async delete(claimReviewId) {
        // This line may cause a false positive in sonarCloud because if we remove the await, we cannot iterate through the results
        const claimReview = await this.getById(claimReviewId);
        const history = this.historyService.getHistoryParams(
            claimReview._id,
            TargetModel.ClaimReview,
            claimReview.usersId,
            HistoryType.Delete,
            null,
            claimReview
        );
        this.historyService.createHistory(history);
        return this.ClaimReviewModel.softDelete({ _id: claimReviewId });
    }

    async getLatestReviews() {
        const claimReviews = await this.ClaimReviewModel.find({
            isDeleted: false,
        })
            .sort({ date: -1 })
            .limit(5)
            .populate({
                path: "personality",
                model: "Personality",
                select: "name description slug avatar",
            })
            .populate({
                path: "claim",
                model: "Claim",
                populate: {
                    path: "latestRevision",
                    select: "date contentModel claimId",
                },
                select: "slug",
            });

        return Promise.all(
            claimReviews.map(async (review) => {
                const { personality, data_hash } = review;

                const claim = {
                    contentModel: review.claim.latestRevision.contentModel,
                    date: review.claim.latestRevision.date,
                };

                const isContentImage =
                    claim.contentModel === ContentModelEnum.Image;
                const isContentDebate =
                    claim.contentModel === ContentModelEnum.Debate;

                const content = isContentImage
                    ? await this.imageService.getByDataHash(data_hash)
                    : await this.sentenceService.getByDataHash(data_hash);

                let reviewHref = personality
                    ? `/personality/${personality?.slug}/claim/${review.claim.slug}`
                    : `/claim/${review.claim.latestRevision.claimId}`;
                reviewHref += isContentImage
                    ? `/image/${data_hash}`
                    : `/sentence/${data_hash}`;
                if (isContentDebate) {
                    reviewHref = `/claim/${review.claim.latestRevision.claimId}/debate`;
                }

                return {
                    content,
                    personality,
                    reviewHref,
                    claim,
                };
            })
        );
    }

    async hideOrUnhideReview(data_hash, hide, description) {
        const review = await this.getReviewByDataHash(data_hash);
        const newReview = {
            ...review,
            ...{
                report: review?.report?._id,
                isHidden: hide,
                description: hide ? description : undefined,
            },
        };

        const before = { isHidden: !hide };
        const after = hide
            ? { isHidden: hide, description }
            : { isHidden: hide };

        const history = this.historyService.getHistoryParams(
            newReview._id,
            TargetModel.ClaimReview,
            this.req?.user,
            hide ? HistoryType.Hide : HistoryType.Unhide,
            after,
            before
        );
        this.historyService.createHistory(history);

        return this.ClaimReviewModel.updateOne({ _id: review._id }, newReview);
    }

    async getDescriptionForHide(review) {
        if (review?.isHidden) {
            const history = await this.historyService.getByTargetIdModelAndType(
                review._id,
                TargetModel.ClaimReview,
                0,
                1,
                "desc",
                HistoryType.Hide
            );

            return history[0]?.details?.after?.description;
        }

        return "";
    }
}
