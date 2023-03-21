import { readFile } from "fs/promises";

import { IEcosystemConfig } from "./types";

class ConfigService {
  private _initialized = false;
  private _config: IEcosystemConfig | null = null;

  async initialize(path: string) {
    if (this._initialized) return;

    const data = await readFile(path, "utf-8");
    this._config = JSON.parse(data) as IEcosystemConfig;

    // необходимо установить энвы для призмы
    process.env.API_DATABASE_URL = this.config?.api.databaseUrl;
    process.env.SKILLRANK_DATABASE_URL = this.config?.skillrank.databaseUrl;

    this._initialized = true;
  }

  get config(): IEcosystemConfig | null {
    return this._config;
  }
}

export const configService = new ConfigService();
