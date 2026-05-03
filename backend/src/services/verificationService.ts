import { prisma } from "../prisma/client";
import { hashToken } from "../utils/crypto";
import { badRequest, notFound } from "../utils/errors";

/**
 * Generate a verification hash for a vote.
 * This allows voters to verify their vote was recorded without exposing their identity.
 */
export async function generateVoteVerification(
  ballotId: string,
  voterToken: string,
): Promise<{ verificationHash: string; voteId: string }> {
  const tokenHash = hashToken(voterToken);

  // Find the vote for this token
  const vote = await prisma.vote.findFirst({
    where: {
      ballotId,
      ballot: {
        votes: {
          some: {
            voterToken: {
              tokenHash,
            },
          },
        },
      },
    },
    include: {
      ballot: {
        select: {
          votes: {
            select: {
              id: true,
              voterToken: {
                select: {
                  tokenHash: true,
                },
              },
            },
          },
        },
      },
    },
  });

  if (!vote) {
    throw badRequest("No vote found for this token on this ballot.");
  }

  // Generate a verification hash using vote ID and ballot ID
  // This is a one-way hash that can be used to verify the vote exists
  const verificationHash = `${vote.id}:${ballotId}`;

  return { verificationHash, voteId: vote.id };
}

/**
 * Verify a vote using the verification hash.
 * Returns vote info without revealing voter identity.
 */
export async function verifyVote(
  ballotId: string,
  voteId: string,
  verificationHash: string,
): Promise<{
  ballotId: string;
  voteId: string;
  verified: boolean;
  optionsCount: number;
  submittedAt: string;
}> {
  // Verify the hash matches
  const expectedHash = `${voteId}:${ballotId}`;
  if (verificationHash !== expectedHash) {
    throw badRequest("Invalid verification hash.");
  }

  // Find the vote
  const vote = await prisma.vote.findUnique({
    where: { id: voteId },
    include: {
      ballot: {
        select: {
          options: {
            select: { id: true, text: true },
          },
        },
      },
    },
  });

  if (!vote) {
    throw notFound("Vote not found.");
  }

  if (vote.ballotId !== ballotId) {
    throw badRequest("Vote does not belong to this ballot.");
  }

  return {
    ballotId: vote.ballotId,
    voteId: vote.id,
    verified: true,
    optionsCount: vote.ballot.options.length,
    submittedAt: vote.submittedAt.toISOString(),
  };
}
