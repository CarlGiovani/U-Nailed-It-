import { useCallback, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import AdminLayout from "../../components/layout/adminLayout";

import {
  createPortfolio,
  deletePortfolio,
  getAllPortfolio,
  updatePortfolio,
} from "../../services/BACKEND/adminPortfolioApi";

import "../../styles/portfolio.css";

const ITEMS_PER_PAGE = 6;
const PORTFOLIO_QUERY_KEY = ["admin-portfolio"];

const EMPTY_MODAL = {
  title: "",
  description: "",
  images: [],
};

const Portfolio = () => {
  const queryClient = useQueryClient();

  const [modal, setModal] = useState(null);
  const [previewImages, setPreviewImages] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [deleteItem, setDeleteItem] = useState(null);
  const [preview, setPreview] = useState(null);

  const { data: portfolio = [], isLoading } = useQuery({
    queryKey: PORTFOLIO_QUERY_KEY,
    queryFn: async () => {
      const data = await getAllPortfolio();
      return data?.data || data || [];
    },
    staleTime: 1000 * 60 * 3,
    gcTime: 1000 * 60 * 10,
    refetchOnWindowFocus: false,
  });

  const invalidatePortfolio = useCallback(async () => {
    await queryClient.invalidateQueries({ queryKey: PORTFOLIO_QUERY_KEY });
  }, [queryClient]);

  const createPortfolioMutation = useMutation({
    mutationFn: createPortfolio,
    onSuccess: invalidatePortfolio,
  });

  const updatePortfolioMutation = useMutation({
    mutationFn: ({ id, formData }) => updatePortfolio(id, formData),
    onSuccess: invalidatePortfolio,
  });

  const deletePortfolioMutation = useMutation({
    mutationFn: deletePortfolio,
    onSuccess: async () => {
      await invalidatePortfolio();
      setDeleteItem(null);
    },
  });

  const saving =
    createPortfolioMutation.isPending || updatePortfolioMutation.isPending;

  const deleting = deletePortfolioMutation.isPending;

  const totalPages = useMemo(() => {
    return Math.max(1, Math.ceil(portfolio.length / ITEMS_PER_PAGE));
  }, [portfolio.length]);

  const safeCurrentPage = useMemo(() => {
    return Math.min(Math.max(currentPage, 1), totalPages);
  }, [currentPage, totalPages]);

  const currentItems = useMemo(() => {
    const startIndex = (safeCurrentPage - 1) * ITEMS_PER_PAGE;
    return portfolio.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [portfolio, safeCurrentPage]);

  const goToPage = useCallback(
    (page) => {
      setCurrentPage(Math.min(Math.max(page, 1), totalPages));
    },
    [totalPages]
  );

  const closeModal = useCallback(() => {
    previewImages.forEach((url) => {
      if (typeof url === "string" && url.startsWith("blob:")) {
        URL.revokeObjectURL(url);
      }
    });

    setModal(null);
    setPreviewImages([]);
  }, [previewImages]);

  const openCreateModal = useCallback(() => {
    setModal(EMPTY_MODAL);
    setPreviewImages([]);
  }, []);

  const openEditModal = useCallback((item) => {
    setModal({
      ...item,
      images: [],
    });
    setPreviewImages(item.images || []);
  }, []);

  const openImagePreview = useCallback((images, index = 0) => {
    if (!images?.length) return;
    setPreview({ images, index });
  }, []);

  const handleModalChange = useCallback((field, value) => {
    setModal((prev) => {
      if (!prev) return prev;
      return { ...prev, [field]: value };
    });
  }, []);

  const handleFileChange = useCallback(
    (e) => {
      const files = Array.from(e.target.files || []).slice(0, 3);

      const newPreviews = files.map((file) => URL.createObjectURL(file));

      setPreviewImages((prev) => {
        prev.forEach((url) => {
          if (typeof url === "string" && url.startsWith("blob:")) {
            URL.revokeObjectURL(url);
          }
        });
        return newPreviews;
      });

      setModal((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          images: files,
        };
      });
    },
    []
  );

  const handleSave = useCallback(async () => {
    if (!modal || saving) return;

    try {
      const formData = new FormData();
      formData.append("title", modal.title || "");
      formData.append("description", modal.description || "");

      if (modal.images?.length) {
        modal.images.forEach((img) => {
          formData.append("images", img);
        });
      }

      if (modal.id) {
        await updatePortfolioMutation.mutateAsync({
          id: modal.id,
          formData,
        });
      } else {
        await createPortfolioMutation.mutateAsync(formData);
      }

      closeModal();
    } catch (err) {
      console.error("Save portfolio error:", err);
    }
  }, [
    modal,
    saving,
    updatePortfolioMutation,
    createPortfolioMutation,
    closeModal,
  ]);

  const confirmDelete = useCallback(async () => {
    if (!deleteItem?.id || deleting) return;

    try {
      await deletePortfolioMutation.mutateAsync(deleteItem.id);

      const remainingItems = portfolio.length - 1;
      const newTotalPages = Math.max(
        1,
        Math.ceil(remainingItems / ITEMS_PER_PAGE)
      );

      if (currentPage > newTotalPages) {
        setCurrentPage(newTotalPages);
      }
    } catch (err) {
      console.error("Delete portfolio error:", err);
    }
  }, [
    deleteItem,
    deleting,
    deletePortfolioMutation,
    portfolio.length,
    currentPage,
  ]);

  const goToPrevPreview = useCallback(() => {
    setPreview((prev) => {
      if (!prev?.images?.length) return prev;
      return {
        ...prev,
        index: prev.index === 0 ? prev.images.length - 1 : prev.index - 1,
      };
    });
  }, []);

  const goToNextPreview = useCallback(() => {
    setPreview((prev) => {
      if (!prev?.images?.length) return prev;
      return {
        ...prev,
        index: prev.index === prev.images.length - 1 ? 0 : prev.index + 1,
      };
    });
  }, []);

  return (
    <AdminLayout>
      <div className="portfolio-page">
        <div className="portfolio-header">
          <h1>Portfolio Management</h1>

          <button className="btn-primary" onClick={openCreateModal}>
            + Add Portfolio
          </button>
        </div>

        {isLoading ? (
          <div>Loading...</div>
        ) : (
          <>
            <div className="portfolio-grid">
              {currentItems.map((item) => {
                const firstImage = item.images?.[0];

                return (
                  <div key={item.id} className="portfolio-card">
                    <div className="portfolio-images">
                      {firstImage ? (
                        <img
                          src={firstImage}
                          alt={item.title}
                          loading="lazy"
                          onClick={() => openImagePreview(item.images, 0)}
                        />
                      ) : (
                        <div className="portfolio-no-image">No Image</div>
                      )}
                    </div>

                    <div className="portfolio-content">
                      <h3>{item.title}</h3>
                      <p>{item.description}</p>

                      <div className="portfolio-buttons">
                        <button
                          className="btn-secondary"
                          onClick={() => openEditModal(item)}
                        >
                          Edit
                        </button>

                        <button
                          className="btn-danger"
                          onClick={() => setDeleteItem(item)}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="pagination">
              <button
                disabled={safeCurrentPage === 1}
                onClick={() => goToPage(safeCurrentPage - 1)}
              >
                Prev
              </button>

              {Array.from({ length: totalPages }, (_, index) => {
                const page = index + 1;

                return (
                  <button
                    key={page}
                    className={page === safeCurrentPage ? "active-page" : ""}
                    onClick={() => goToPage(page)}
                  >
                    {page}
                  </button>
                );
              })}

              <button
                disabled={safeCurrentPage === totalPages}
                onClick={() => goToPage(safeCurrentPage + 1)}
              >
                Next
              </button>
            </div>
          </>
        )}

        {modal && (
          <div className="modal-overlay" onClick={closeModal}>
            <div className="premium-modal" onClick={(e) => e.stopPropagation()}>
              <h2>{modal.id ? "Edit Portfolio" : "Add Portfolio"}</h2>

              <input
                placeholder="Title"
                value={modal.title}
                onChange={(e) => handleModalChange("title", e.target.value)}
              />

              <textarea
                placeholder="Description"
                value={modal.description}
                onChange={(e) =>
                  handleModalChange("description", e.target.value)
                }
              />

              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleFileChange}
              />

              <div className="portfolio-preview">
                {previewImages.map((img, i) => (
                  <img key={`${img}-${i}`} src={img} alt="preview" />
                ))}
              </div>

              <button onClick={handleSave} disabled={saving}>
                {saving
                  ? "Saving..."
                  : modal.id
                    ? "Update Portfolio"
                    : "Create Portfolio"}
              </button>
            </div>
          </div>
        )}

        {deleteItem && (
          <div className="modal-overlay" onClick={() => setDeleteItem(null)}>
            <div
              className="premium-modal delete-modal"
              onClick={(e) => e.stopPropagation()}
            >
              <h2>Delete Portfolio</h2>

              <p>
                Are you sure you want to delete{" "}
                <strong>{deleteItem.title}</strong>?
              </p>

              <div className="delete-actions">
                <button
                  className="btn-secondary"
                  onClick={() => setDeleteItem(null)}
                  disabled={deleting}
                >
                  Cancel
                </button>

                <button
                  className="btn-danger"
                  onClick={confirmDelete}
                  disabled={deleting}
                >
                  {deleting ? (
                    <>
                      <span className="spinner"></span> Deleting...
                    </>
                  ) : (
                    "Delete"
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {preview && (
          <div className="image-preview-overlay">
            <button className="preview-close" onClick={() => setPreview(null)}>
              ✕
            </button>

            <button className="preview-arrow left" onClick={goToPrevPreview}>
              ◀
            </button>

            <img
              src={preview.images[preview.index]}
              className="preview-image"
              alt="Portfolio preview"
            />

            <button className="preview-arrow right" onClick={goToNextPreview}>
              ▶
            </button>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default Portfolio;