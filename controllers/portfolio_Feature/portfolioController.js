import {
  createPortfolio,
  deletePortfolio,
  getAllPortfolio,
  getPortfolioById,
  updatePortfolio,
} from "../../models/Portfolio_Feature/portfolioModel.js";

import crypto from "crypto";
import supabase from "../../utils/supabaseClient.js";

/* ===== helper: upload image ===== */
const uploadImage = async (file) => {
  const ext = file.originalname.split(".").pop();
  const fileName = `${crypto.randomUUID()}.${ext}`;
  const filePath = `portfolio/${fileName}`; // all images in portfolio folder

  const { error } = await supabase.storage
    .from("portfolio")
    .upload(filePath, file.buffer, {
      contentType: file.mimetype,
    });

  if (error) throw error;

  const { data } = supabase.storage.from("portfolio").getPublicUrl(filePath);
  return data.publicUrl;
};

const getStoragePathFromUrl = (url) => {
  const marker = "/storage/v1/object/public/portfolio/";
  const index = url.indexOf(marker);

  if (index === -1) return null;

  return url.substring(index + marker.length);
};

/* ================= CREATE ================= */
export const addPortfolioItem = async (req, res) => {
  try {
    const { title, description } = req.body;

    if (!req.files || req.files.length < 1) {
      return res.status(400).json({ message: "At least 1 image required" });
    }

    if (req.files.length > 3) {
      return res.status(400).json({ message: "Max 3 images only" });
    }

    const images = [];
    for (const file of req.files) {
      const url = await uploadImage(file);
      images.push(url);
    }

    const data = await createPortfolio({ title, description, images });

    res.status(201).json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/* ================= READ ALL ================= */
export const fetchAllPortfolio = async (req, res) => {
  try {
    const data = await getAllPortfolio();
    res.set("Cache-Control", "no-store");
    res.json(data);
  } catch (err) {
    console.error("[GET /portfolio] error:", err);
    res.status(500).json({ error: err.message });
  }
};

/* ================= READ BY ID ================= */
export const fetchPortfolioById = async (req, res) => {
  try {
    const data = await getPortfolioById(req.params.id);
    if (!data) return res.status(404).json({ error: "Portfolio not found" });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/* ================= UPDATE ================= */
export const editPortfolioItem = async (req, res) => {
  try {
    const portfolio = await getPortfolioById(req.params.id);
    if (!portfolio)
      return res.status(404).json({ error: "Portfolio not found" });

    let images = portfolio.images;

    if (req.files && req.files.length > 0) {
      images = [];
      for (const file of req.files) {
        const url = await uploadImage(file);
        images.push(url);
      }
    }

    const data = await updatePortfolio(req.params.id, {
      title: req.body.title,
      description: req.body.description,
      images,
    });

    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/* ================= DELETE ================= */
export const removePortfolioItem = async (req, res) => {
  try {
    const portfolio = await getPortfolioById(req.params.id);

    if (!portfolio) {
      return res.status(404).json({ error: "Portfolio not found" });
    }

    if (portfolio.images && portfolio.images.length > 0) {
      const filePaths = portfolio.images
        .map((url) => getStoragePathFromUrl(url))
        .filter(Boolean);

      if (filePaths.length > 0) {
        const { error: storageError } = await supabase.storage
          .from("portfolio")
          .remove(filePaths);

        if (storageError) throw storageError;
      }
    }

    await deletePortfolio(req.params.id);

    res.json({ message: "Portfolio deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
