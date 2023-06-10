import { Injectable } from "@nestjs/common";
import { PrismaService } from "modules/prisma";

@Injectable()
export class PlayersService {
  constructor(private prismaService: PrismaService) {}

  async getPlayersList() {
    return [];
  }

  async getPlayerByAuth(authId: number) {
    return null;
  }
}
