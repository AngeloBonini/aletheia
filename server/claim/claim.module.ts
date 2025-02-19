import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { Claim, ClaimSchema } from "./schemas/claim.schema";
import { ClaimService } from "./claim.service";
import { ClaimController } from "./claim.controller";
import { ClaimReviewModule } from "../claim-review/claim-review.module";
import { ParserModule } from "./parser/parser.module";
import { PersonalityModule } from "../personality/personality.module";
import { ConfigModule } from "@nestjs/config";
import { ViewModule } from "../view/view.module";
import { SourceModule } from "../source/source.module";
import { ClaimRevisionModule } from "./claim-revision/claim-revision.module";
import { HistoryModule } from "../history/history.module";
import { CaptchaModule } from "../captcha/captcha.module";
import { ClaimReviewTaskModule } from "../claim-review-task/claim-review-task.module";
import { SentenceModule } from "./types/sentence/sentence.module";
import { StateEventModule } from "../state-event/state-event.module";
import { ImageModule } from "./types/image/image.module";
import { DebateModule } from "./types/debate/debate.module";
import { EditorModule } from "../editor/editor.module";
import { AbilityModule } from "../auth/ability/ability.module";

const ClaimModel = MongooseModule.forFeature([
    {
        name: Claim.name,
        schema: ClaimSchema,
    },
]);

@Module({
    imports: [
        ClaimModel,
        ClaimReviewModule,
        ClaimReviewTaskModule,
        ClaimRevisionModule,
        SentenceModule,
        ParserModule,
        PersonalityModule,
        HistoryModule,
        StateEventModule,
        ConfigModule,
        ViewModule,
        SourceModule,
        CaptchaModule,
        ImageModule,
        DebateModule,
        EditorModule,
        AbilityModule,
    ],
    exports: [ClaimService],
    providers: [ClaimService],
    controllers: [ClaimController],
})
export class ClaimModule {}
