import express from "express";
import portfolioImageUpload from "../../middlewares/uploads/portfolioUpload.js";
import {
  addPortfolioItem,
  fetchAllPortfolio,
  fetchPortfolioById,
  editPortfolioItem,
  removePortfolioItem,
} from "../../controllers/portfolio_Feature/portfolioController.js";
import { verifyAdmin } from "../../middlewares/Authentication/authMiddleware.js";

const router = express.Router();

// PUBLIC ROUTES
router.get("/", fetchAllPortfolio);
router.get("/:id", fetchPortfolioById);

// ADMIN ROUTES
router.post("/", portfolioImageUpload.array("images", 3), verifyAdmin, addPortfolioItem);
router.put("/:id", portfolioImageUpload.array("images", 3), verifyAdmin, editPortfolioItem);
router.delete("/:id", verifyAdmin, removePortfolioItem);

export default router;
