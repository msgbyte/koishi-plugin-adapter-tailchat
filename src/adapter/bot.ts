import { Bot, Fragment, Logger, Schema, SendOptions } from "@satorijs/satori";
import { TailchatMessenger } from "./message";
import { TailchatClient } from "tailchat-client-sdk";
import { Quester } from "koishi";

const logger = new Logger("adapter-tailchat");

export class TailchatBot extends Bot<TailchatBot.Config> {
  client: TailchatClient;

  async start() {
    this.client = new TailchatClient(
      this.config.endpoint,
      this.config.appId,
      this.config.appSecret
    );

    this.ctx.router.post("/tailchat/message/callback", (ctx) => {
      const body = ctx.request.body;

      // TODO
    });
  }

  async stop() {
    logger.debug("http server stopped");
  }

  async sendMessage(
    channelId: string,
    content: Fragment,
    guildId?: string,
    options?: SendOptions
  ) {
    return await new TailchatMessenger(this, channelId, guildId, options).send(
      content
    );
  }

  async sendPrivateMessage(
    userId: string,
    content: Fragment,
    options?: SendOptions
  ) {
    return await this.sendMessage(`private:${userId}`, content, null, options);
  }
}

export namespace TailchatBot {
  export interface Config extends Bot.Config, Quester.Config {
    name: string;
    appId: string;
    appSecret: string;
  }

  export const Config = Schema.intersect([
    Schema.object({
      appId: Schema.string().required().description("机器人的应用 ID"),
      appSecret: Schema.string()
        .role("secret")
        .required()
        .description("机器人的应用密钥"),
    }),

    Quester.createConfig("https://tailchat-nightly.moonrailgun.com/"),
  ]);
}

TailchatBot.prototype.platform = "mail";
