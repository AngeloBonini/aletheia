import {Injectable, Logger, OnModuleInit} from "@nestjs/common";
import createServer from "next";
import { NextServer } from "next/dist/server/next";
import {ConfigService} from "@nestjs/config";

@Injectable()
export class ViewService implements OnModuleInit {
    private server: NextServer;
    private readonly logger = new Logger("ViewService");

    constructor(private configService: ConfigService) {}

    async onModuleInit(): Promise<void> {
        try {
            this.server = createServer({
                dev: process.env.ENVIRONMENT === "watch-dev",
                dir: this.configService.get<string>("nextjs.dir") || "./",
            });
            await this.server.prepare();
        } catch (error) {
            this.logger.error("Failed to load NextServer", error);
        }
    }

    getNextServer(): NextServer {
        return this.server;
    }
}
