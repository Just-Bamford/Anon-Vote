import { prisma } from "../prisma/client";
import { hashIdentifier, generateToken, hashToken } from "../utils/crypto";
import { writeRecord } from "./stellarService";
import { badRequest, notFound } from "../utils/errors";

/**
 * Issue a one-time anonymous voter token.
 * Privacy guarantee: no link is stored between the voter identifier and the token.
 * Stellar write is required — token issuance is rolled back if Stellar write fails.
 */
export async function issueToken(
  ballotId: string,
  voterIdentifier: string,
): Promise<{ token: string; stellarTxId: string; weight: number }> {
  // Get ballot with eligibility list
  const ballot = await prisma.ballot.findUnique({
    where: { id: ballotId },
    include: { eligibilityList: true },
  });

  // Don't reveal whether ballot exists if identifier not eligible
  const identifierHash = hashIdentifier(voterIdentifier);
  console.log("[issueToken] ballotId:", ballotId);
  console.log(
    "[issueToken] voterIdentifier (raw):",
    JSON.stringify(voterIdentifier),
  );
  console.log("[issueToken] identifierHash:", identifierHash);
  console.log(
    "[issueToken] ballot found:",
    !!ballot,
    "status:",
    ballot?.status,
  );

  if (!ballot || ballot.status === "CLOSED") {
    // Generic error — don't reveal ballot existence
    throw badRequest(
      "Unable to issue token. Please check your ballot link and identifier.",
    );
  }

  const entry = await prisma.eligibilityEntry.findUnique({
    where: {
      eligibilityListId_identifierHash: {
        eligibilityListId: ballot.eligibilityListId,
        identifierHash,
      },
    },
  });

  console.log("[issueToken] eligibilityListId:", ballot.eligibilityListId);
  console.log(
    "[issueToken] entry found:",
    !!entry,
    "tokenIssued:",
    entry?.tokenIssued,
  );

  if (!entry) {
    // Generic error — don't reveal whether identifier was not found
    throw badRequest(
      "The identifier you entered is not in the eligibility list. Please check your email or contact your administrator.",
    );
  }

  if (entry.tokenIssued) {
    // Record duplicate attempt in audit log (no identifier stored)
    await prisma.auditEvent.create({
      data: { ballotId, eventType: "DUPLICATE_TOKEN_ATTEMPT" },
    });
    throw badRequest(
      "A token has already been issued for this identifier on this ballot.",
    );
  }

  // Generate raw token — only hash is stored
  const rawToken = generateToken();
  const tokenHash = hashToken(rawToken);

  const result = await prisma.$transaction(async (tx) => {
    // Store token hash only
    await tx.voterToken.create({
      data: { tokenHash, ballotId },
    });

    // Mark identifier as token-issued
    await tx.eligibilityEntry.update({
      where: { id: entry.id },
      data: { tokenIssued: true },
    });

    // Audit event — no voter identifier stored
    const auditEvent = await tx.auditEvent.create({
      data: { ballotId, eventType: "TOKEN_ISSUED" },
    });

    return { auditEventId: auditEvent.id, weight: (entry as any).weight };
  });

  // Write to Stellar — non-blocking, token is issued regardless
  const stellarTxId = await writeRecord({
    type: "TOKEN_ISSUED",
    ballotId,
    auditEventId: result.auditEventId,
  });

  if (stellarTxId) {
    // Update audit event with Stellar transaction ID if write succeeded
    await prisma.auditEvent.update({
      where: { id: result.auditEventId },
      data: { stellarTxId },
    });
  } else {
    console.warn(
      `[Stellar] TOKEN_ISSUED write failed for auditEvent ${result.auditEventId} — token still issued`,
    );
  }

  return {
    token: rawToken,
    stellarTxId: stellarTxId || "",
    weight: result.weight,
  };
}

/**
 * Reset all token issuance flags for a ballot's eligibility list.
 * Admin function — allows voters to request tokens again.
 * WARNING: Does not revoke already-issued tokens, only resets the issued flag.
 */
export async function resetBallotTokens(
  ballotId: string,
): Promise<{ resetCount: number }> {
  const ballot = await prisma.ballot.findUnique({
    where: { id: ballotId },
    select: { eligibilityListId: true },
  });

  if (!ballot) {
    throw notFound("Ballot not found");
  }

  const result = await prisma.eligibilityEntry.updateMany({
    where: {
      eligibilityListId: ballot.eligibilityListId,
      tokenIssued: true,
    },
    data: { tokenIssued: false },
  });

  console.log(
    `[resetBallotTokens] Reset ${result.count} entries for ballot ${ballotId}`,
  );

  return { resetCount: result.count };
}
