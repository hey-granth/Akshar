import { Server } from "@hocuspocus/server";
import * as Y from "yjs";
import { Buffer } from "node:buffer";
import { logger } from "../../plugins/logger";
import type { SnapshotService } from "../document/snapshotService";
import type { PresenceService } from "./presenceService";

type HocuspocusServiceOptions = {
  port: number;
  snapshotService: SnapshotService;
  presenceService: PresenceService;
};

export function createHocuspocusService(options: HocuspocusServiceOptions): Server {
  return new Server({
    port: options.port,
    async onLoadDocument(data) {
      const ownerId = resolveOwnerId(data.context.userId);
      logger.info({ documentName: data.documentName, ownerId }, "collaboration.load.input");

      const snapshot = await options.snapshotService.load(data.documentName);
      const yDoc = new Y.Doc();

      if (snapshot?.yjsStateBase64) {
        const update = Buffer.from(snapshot.yjsStateBase64, "base64");
        Y.applyUpdate(yDoc, update);
      }

      logger.info({ documentName: data.documentName }, "collaboration.load.output");
      return yDoc;
    },
    async onStoreDocument(data) {
      const ownerId = resolveOwnerId(data.context.userId);
      logger.info({ documentName: data.documentName, ownerId }, "collaboration.store.input");
      await options.snapshotService.saveYDoc(data.documentName, data.document, ownerId);
      logger.info({ documentName: data.documentName }, "collaboration.store.output");
    },
    async onConnect(data) {
      const userId = resolveOwnerId(data.requestParameters.get("userId") ?? undefined);
      const userName = data.requestParameters.get("name") ?? "Anonymous";

      options.presenceService.addUser(data.documentName, {
        connectionId: data.socketId,
        userId,
        name: userName
      });

      logger.info(
        {
          documentName: data.documentName,
          userId,
          users: options.presenceService.getUsers(data.documentName)
        },
        "collaboration.connect"
      );
    },
    async onDisconnect(data) {
      options.presenceService.removeUser(data.documentName, data.socketId);
      logger.info(
        {
          documentName: data.documentName,
          users: options.presenceService.getUsers(data.documentName)
        },
        "collaboration.disconnect"
      );
    },
  });
}

function resolveOwnerId(userId: string | undefined): string {
  return userId && userId.length > 0 ? userId : "system";
}
