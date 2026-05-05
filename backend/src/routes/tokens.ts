import { Router, Request, Response, NextFunction } from "express";
import { issueToken, resetBallotTokens } from "../services/identityManager";
import { strictRateLimiter } from "../middleware/rateLimiter";
import { requireAuth } from "../middleware/auth";
import { badRequest } from "../utils/errors";

const router = Router();

// POST /api/tokens — Request a voter token
router.post(
  "/",
  strictRateLimiter,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { ballotId, voterIdentifier } = req.body;
      console.log(
        "[Tokens] Request received — ballotId:",
        ballotId,
        "identifier:",
        voterIdentifier,
      );
      if (!ballotId || !voterIdentifier) {
        throw badRequest("ballotId and voterIdentifier are required");
      }
      const result = await issueToken(ballotId, voterIdentifier.trim());
      console.log("[Tokens] Token issued successfully for ballot:", ballotId);
      res
        .status(200)
        .json({ data: { token: result.token, weight: result.weight } });
    } catch (err) {
      next(err);
    }
  },
);

// POST /api/tokens/reset/:ballotId — Reset all tokenIssued flags for a ballot (admin only)
router.post(
  "/reset/:ballotId",
  requireAuth,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { ballotId } = req.params;
      const result = await resetBallotTokens(ballotId);
      res.status(200).json({
        data: {
          message: `Reset ${result.resetCount} token(s) for ballot ${ballotId}`,
          resetCount: result.resetCount,
        },
      });
    } catch (err) {
      next(err);
    }
  },
);

export default router;
