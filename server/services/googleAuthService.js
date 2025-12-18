import { OAuth2Client } from "google-auth-library";
import { GOOGLE_CLIENT_ID } from "../config/constants.js";

const clientId = GOOGLE_CLIENT_ID;

const client = new OAuth2Client({
  clientId,
});

export async function verifyIdToken(idToken) {
  const loginTicket = await client.verifyIdToken({
    idToken,
    audience: clientId,
  });

  const userData = loginTicket.getPayload();
  return userData;
}
