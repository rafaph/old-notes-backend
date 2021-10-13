import { ConnectionString } from "connection-string";
import { Client } from "pg";
import { Sequelize } from "sequelize";
import Umzug from "umzug";
import path from "path";
import { env } from "@app/main/config/env";
import { SequelizeClient } from "@app/infrastructure/shared/persistence/sequelize-client";

export class TestDatabase {
    private readonly database: {
        name: string;
        connectionString: string
    };
    private readonly oldConnectionString: string;

    public constructor() {
        this.oldConnectionString = env.DATABASE_URL;

        const connectionString = new ConnectionString(env.DATABASE_URL);
        const [database] = connectionString.path as string[];
        const databaseName = `${database}_test`;

        connectionString.path = [databaseName];

        this.database = {
            name: databaseName,
            connectionString: connectionString.toString(),
        };
    }

    public async setup(): Promise<void> {
        const sequelize = new Sequelize(this.database.connectionString, {
            logging: false,
        });
        const umzug = new Umzug({
            storage: "sequelize",
            storageOptions: {
                sequelize,
            },
            migrations: {
                params: [
                    sequelize.getQueryInterface(),
                ],
                path: path.join(__dirname, "../../migrations"),
                pattern: /\.ts$/,
            },
        });

        await this.query(`CREATE DATABASE ${this.database.name};`);
        await umzug.up();
        await sequelize.close();

        env.DATABASE_URL = this.database.connectionString;
        process.env.DATABASE_URL = env.DATABASE_URL;
    }

    public async tearDown(): Promise<void> {
        await SequelizeClient.getInstance().close();
        await this.query(`DROP DATABASE ${this.database.name};`);
    }

    public async truncate(): Promise<void> {
        await SequelizeClient.getInstance().truncate();
    }

    private async query(query: string): Promise<void> {
        const pgClient = new Client({
            connectionString: this.oldConnectionString,
        });
        await pgClient.connect();
        await pgClient.query(query);
        await pgClient.end();
    }
}
