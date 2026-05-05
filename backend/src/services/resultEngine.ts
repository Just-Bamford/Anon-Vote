import { prisma } from "../prisma/client";
import { decryptVote } from "../utils/crypto";
import { writeRecord } from "./stellarService";
import { config } from "../config";
import { notFound } from "../utils/errors";

export async function tallyBallot(ballotId: string) {
  const ballot = await prisma.ballot.findUnique({
    where: { id: ballotId },
    include: { options: true, votes: true },
  });

  if (!ballot) throw notFound("Ballot not found");

  // Count weighted votes per option by decrypting each payload
  const tally: Record<string, number> = {};
  ballot.options.forEach((o) => {
    tally[o.id] = 0;
  });

  for (const vote of ballot.votes) {
    try {
      const optionId = decryptVote(
        vote.encryptedPayload,
        config.ballotEncryptionKey,
      );
      if (tally[optionId] !== undefined) {
        tally[optionId] += vote.weight;
      }
    } catch (err) {
      console.error(`[ResultEngine] Failed to decrypt vote ${vote.id}:`, err);
    }
  }

  // Calculate total weighted votes
  const totalWeightedVotes = ballot.votes.reduce(
    (sum, vote) => sum + vote.weight,
    0,
  );
  const usedTokenCount = await prisma.voterToken.count({
    where: { ballotId, used: true },
  });

  const isConsistent = totalWeightedVotes === usedTokenCount;

  if (!isConsistent) {
    console.warn(
      `[ResultEngine] Inconsistency detected for ballot ${ballotId}: weightedVotes=${totalWeightedVotes}, usedTokens=${usedTokenCount}`,
    );
  }

  // Create or update result
  const result = await prisma.result.upsert({
    where: { ballotId },
    create: {
      ballotId,
      tallyJson: JSON.stringify(tally),
      totalVotes: totalWeightedVotes,
      isConsistent,
    },
    update: {
      tallyJson: JSON.stringify(tally),
      totalVotes: totalWeightedVotes,
      isConsistent,
    },
  });

  // Audit event
  const auditEvent = await prisma.auditEvent.create({
    data: { ballotId, eventType: "RESULT_PUBLISHED" },
  });

  // Write to Stellar — non-blocking, result is published regardless
  const stellarTxId = await writeRecord({
    type: "RESULT_PUBLISHED",
    ballotId,
    totalVotes: totalWeightedVotes,
    isConsistent,
  });

  if (stellarTxId) {
    await prisma.result.update({
      where: { id: result.id },
      data: { stellarTxId },
    });
    await prisma.auditEvent.update({
      where: { id: auditEvent.id },
      data: { stellarTxId },
    });
  } else {
    console.warn(
      `[Stellar] RESULT_PUBLISHED write failed for ballot ${ballotId} — result still published`,
    );
  }

  return result;
}

export async function getResult(ballotId: string) {
  return prisma.result.findUnique({ where: { ballotId } });
}
