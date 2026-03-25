import express from "express";
import {
  addPortfolioItem,
  editPortfolioItem,
  fetchAllPortfolio,
  fetchPortfolioById,
  removePortfolioItem,
} from "../../controllers/portfolio_Feature/portfolioController.js";
import { verifyAdmin } from "../../middlewares/Authentication/authMiddleware.js";
import portfolioImageUpload from "../../middlewares/uploads/portfolioUpload.js";

const router = express.Router();

// PUBLIC ROUTES
router.get("/", fetchAllPortfolio);
router.get("/:id", fetchPortfolioById);

// ADMIN ROUTES
router.post(
  "/",
  verifyAdmin,
  portfolioImageUpload.array("images", 3),
  addPortfolioItem,
);

router.put(
  "/:id",
  verifyAdmin,
  portfolioImageUpload.array("images", 3),
  editPortfolioItem,
);

router.delete("/:id", verifyAdmin, removePortfolioItem);

export default router;
