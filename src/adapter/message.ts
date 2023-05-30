import { Element, Messenger } from "@satorijs/satori";
import { TailchatBot } from "./bot";

const letters = "abcdefghijklmnopqrstuvwxyz";

export function randomId() {
  return Array(8)
    .fill(0)
    .map(() => letters[Math.floor(Math.random() * letters.length)])
    .join("");
}

export class TailchatMessenger extends Messenger<TailchatBot> {
  buffer = "";
  reply: string;
  figure = false;

  async flush() {
    if (!this.buffer) return;

    const messageId = await this.bot.client.sendMessage({
      converseId: this.session.channelId,
      groupId: this.session.guildId,
      content: this.session.content,
    });
    const session = this.bot.session();
    session.messageId = messageId;
    session.timestamp = +new Date();
    session.userId = this.bot.selfId;
    this.results.push(session);
    session.app.emit(session, "send", session);

    this.buffer = "";
    this.reply = undefined;
  }

  async visit(element: Element) {
    const { type, attrs, children } = element;
    if (type === "text") {
      this.buffer += attrs.content;
    } else if (type === "b" || type === "strong") {
      this.buffer += "[b]";
      await this.render(children);
      this.buffer += "[/b]";
    } else if (type === "i" || type === "em") {
      this.buffer += "[i]";
      await this.render(children);
      this.buffer += "[/i]";
    } else if (type === "u" || type === "ins") {
      this.buffer += "[u]";
      await this.render(children);
      this.buffer += "[/u]";
    } else if (type === "s" || type === "del") {
      this.buffer += "[s]";
      await this.render(children);
      this.buffer += "[/s]";
    } else if (type === "code") {
      this.buffer += "[code]";
      await this.render(children);
      this.buffer += "[/code]";
    } else if (type === "a") {
      this.buffer += `[url=${attrs.href}]`;
      await this.render(children);
      this.buffer += `[/url]`;
    } else if (type === "p") {
      await this.render(children);
      this.buffer += `\n`;
    } else if (type === "at") {
      if (attrs.id) {
        this.buffer += `[at=${attrs.id}]@${attrs.id}[/a]`;
      }
    } else if (type === "sharp" && attrs.id) {
      this.buffer += ` #${attrs.id} `;
    } else if (type === "image" && attrs.url) {
      this.buffer += `[img]${attrs.url}[/img]`;
    } else if (type === "quote") {
      this.reply = attrs.id;
    } else if (type === "message") {
      if (this.figure) {
        await this.render(children);
        this.buffer += "\n";
      } else {
        await this.flush();
        await this.render(children, true);
      }
    } else if (type === "figure") {
      this.figure = true;
      await this.render(children);
      this.figure = false;
    } else {
      await this.render(children);
    }
  }
}
