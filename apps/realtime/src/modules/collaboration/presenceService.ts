type PresenceUser = {
  connectionId: string;
  userId: string;
  name: string;
};

export class PresenceService {
  private readonly byDocumentId = new Map<string, Map<string, PresenceUser>>();

  addUser(documentId: string, user: PresenceUser): void {
    const map = this.byDocumentId.get(documentId) ?? new Map<string, PresenceUser>();
    map.set(user.connectionId, user);
    this.byDocumentId.set(documentId, map);
  }

  removeUser(documentId: string, connectionId: string): void {
    const map = this.byDocumentId.get(documentId);
    if (!map) {
      return;
    }

    map.delete(connectionId);
    if (map.size === 0) {
      this.byDocumentId.delete(documentId);
    }
  }

  getUsers(documentId: string): PresenceUser[] {
    const map = this.byDocumentId.get(documentId);
    if (!map) {
      return [];
    }
    return Array.from(map.values());
  }
}
