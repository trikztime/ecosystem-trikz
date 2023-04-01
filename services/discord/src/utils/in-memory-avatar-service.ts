import { configService } from "@trikztime/ecosystem-shared/config";
import axios from "axios";

class InMemoryAvatarService {
  private userAvatars: Map<string, string> = new Map();

  async getAvatar(authId: string): Promise<string> {
    if (authId.length === 0) {
      return "";
    }

    const avatarUrl = this.userAvatars.get(authId);
    if (avatarUrl && avatarUrl.length !== 0) {
      return avatarUrl;
    }

    const url =
      "http://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/?key=" +
      configService.config?.steamApiKey +
      "&steamids=" +
      authId;

    try {
      const response = await axios.get(url);
      const data = response.data;
      const avatarUrl = data.response.players[0].avatarmedium;
      this.updateAuthAvatar(authId, avatarUrl);

      return avatarUrl;
    } catch (err) {
      return "";
    }
  }

  private updateAuthAvatar(auth: string, avatarUrl: string): void {
    if (this.userAvatars.size > 100) {
      this.userAvatars.clear();
    }

    this.userAvatars.set(auth, avatarUrl);
  }
}

const inMemoryAvatarService = new InMemoryAvatarService();
export default inMemoryAvatarService;
