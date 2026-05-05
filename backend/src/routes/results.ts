import { Router, Request, Response, NextFunction } from "express";
import { getResult, tallyBallot } from "../services/resultEngine";
import { requireAuth } from "../middleware/auth";
import { prisma } from "../prisma/client";
import { notFound, badRequest } from "../utils/errors";

const router = Router();

// GET /api/results/:ballotId — Get published result (public)
router.get(
  "/:ballotId",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await getResult(req.params.ballotId);
      if (!result) throw notFound("No published result found for this ballot");
      res.status(200).json({ data: result });
    } catch (err) {
      next(err);
    }
  },
);

// POST /api/results/:ballotId/tally — Manually close and tally a ballot (admin only)
router.post(
  "/:ballotId/tally",
  requireAuth,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { ballotId } = req.params;

      const ballot = await prisma.ballot.findUnique({
        where: { id: ballotId },
      });

      if (!ballot) throw notFound("Ballot not found");
      if (ballot.organizationId !== req.organization!.id)
        throw badRequest("You can only tally your own ballots");

      // Close ballot if still open
      if (ballot.status === "OPEN") {
        await prisma.ballot.update({
          where: { id: ballotId },
          data: { status: "CLOSED" },
        });
        console.log(`[Results] Manually closed ballot ${ballotId}`);
      }

      const result = await tallyBallot(ballotId);
      console.log(`[Results] Manually tallied ballot ${ballotId}`);
      res.status(200).json({ data: result });
    } catch (err) {
      next(err);
    }
  },
);

export default router;
