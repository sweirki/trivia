import type { DocumentData, QueryDocumentSnapshot } from "firebase/firestore";
import type { Friend, FriendRequest, FriendStatus, SentFriendRequest } from "../types";

type FirestoreValue = string | number | boolean | null | string[] | undefined;

function readString(
  data: Record<string, FirestoreValue>,
  key: string,
  fallback = ""
) {
  const value = data[key];
  return typeof value === "string" && value.trim() ? value : fallback;
}

function readNullableString(data: Record<string, FirestoreValue>, key: string) {
  const value = data[key];
  return typeof value === "string" && value.trim() ? value : null;
}

function readNumber(
  data: Record<string, FirestoreValue>,
  key: string,
  fallback = Date.now()
) {
  const value = data[key];
  return typeof value === "number" ? value : fallback;
}

export function getDocData(doc: QueryDocumentSnapshot<DocumentData>) {
  return doc.data() as Record<string, FirestoreValue>;
}

export function mapIncomingRequest(
  requestDoc: QueryDocumentSnapshot<DocumentData>
): FriendRequest {
  const data = getDocData(requestDoc);

  return {
    id: requestDoc.id,
    from: {
      id: readString(data, "from"),
      username: readString(data, "fromUsername", "Player"),
      friendCode: readNullableString(data, "fromFriendCode"),
      status: "pending" as FriendStatus,
    },
    createdAt: readNumber(data, "createdAt"),
  };
}

export function mapSentRequest(
  requestDoc: QueryDocumentSnapshot<DocumentData>
): SentFriendRequest {
  const data = getDocData(requestDoc);

  return {
    id: requestDoc.id,
    to: {
      id: readString(data, "to"),
      username: readString(data, "toUsername", "Player"),
      friendCode: readNullableString(data, "toFriendCode"),
      status: "pending" as FriendStatus,
    },
    createdAt: readNumber(data, "createdAt"),
  };
}

export function mapFriend(playerDoc: QueryDocumentSnapshot<DocumentData>): Friend {
  const data = getDocData(playerDoc);

  return {
    id: playerDoc.id,
    username:
      readString(data, "username") ||
      readString(data, "displayName") ||
      "Player",
    friendCode: readNullableString(data, "friendCode"),
    status: "accepted" as FriendStatus,
  };
}

export function getFriendIdsFromFriendships(
  friendshipDocs: QueryDocumentSnapshot<DocumentData>[],
  currentUserId: string
) {
  return Array.from(
    new Set(
      friendshipDocs
        .flatMap((friendshipDoc) => {
          const users = getDocData(friendshipDoc).users;
          return Array.isArray(users) ? users.filter((item): item is string => typeof item === "string") : [];
        })
        .filter((uid) => uid && uid !== currentUserId)
    )
  );
}

export function getPlayerDisplayName(data: Record<string, FirestoreValue>) {
  return readString(data, "username") || readString(data, "displayName") || "Player";
}



