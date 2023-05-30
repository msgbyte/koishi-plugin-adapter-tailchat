import { TailchatBot } from "./bot";
import * as Tailchat from "./types";

export * from "./bot";

export { Tailchat };

export default TailchatBot;

declare module "@satorijs/core" {
  interface Session {
    tailchat: Tailchat.Internal;
  }
}
