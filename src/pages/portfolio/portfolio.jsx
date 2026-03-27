import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
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

const Portfolio = () => {
  const queryClient = useQueryClient();

  const [modal, setModal] = useState(null);
  const [previewImages, setPreviewImages] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [deleteItem, setDeleteItem] = useState(null);
  const [preview, setPreview] = useState(null);

  /* ================= CACHED FETCH ================= */
  const { data: portfolio = [], isLoading } = useQuery({
    queryKey: PORTFOLIO_QUERY_KEY,
    queryFn: async () => {
      const data = await getAllPortfolio();
      return data?.data || data || [];
    },
    staleTime: 1000 * 60 * 3,
    gcTime: 1000 * 60 * 10,
  });

  const invalidatePortfolio = async () => {
    await queryClient.invalidateQueries({ queryKey: PORTFOLIO_QUERY_KEY });
  };

  /* ================= MUTATIONS ================= */
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
    onSuccess: invalidatePortfolio,
  });

  /* ================= PAGINATION ================= */
  const totalPages = Math.max(1, Math.ceil(portfolio.length / ITEMS_PER_PAGE));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const startIndex = (safeCurrentPage - 1) * ITEMS_PER_PAGE;
  const currentItems = portfolio.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const goToPage = (page) => {
    const clampedPage = Math.min(Math.max(page, 1), totalPages);
    setCurrentPage(clampedPage);
  };

  /* ================= SAVE ================= */
  const handleSave = async () => {
    if (!modal) return;

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
      console.error(err);
    }
  };

  /* ================= DELETE ================= */
  const confirmDelete = async () => {
    if (!deleteItem?.id) return;

    try {
      await deletePortfolioMutation.mutateAsync(deleteItem.id);
      setDeleteItem(null);
    } catch (err) {
      console.error(err);
    }
  };

  const closeModal = () => {
    setModal(null);
    setPreviewImages([]);
  };

  const saving =
    createPortfolioMutation.isPending || updatePortfolioMutation.isPending;

  const deleting = deletePortfolioMutation.isPending;

  /* ================= RENDER ================= */
  return (
    <AdminLayout>
      <div className="portfolio-page">
        <div className="portfolio-header">
          <h1>Portfolio Management</h1>

          <button
            className="btn-primary"
            onClick={() =>
              setModal({
                title: "",
                description: "",
                images: [],
              })
            }
          >
            + Add Portfolio
          </button>
        </div>

        {isLoading ? (
          <div>Loading...</div>
        ) : (
          <>
            {/* ================= GRID ================= */}
            <div className="portfolio-grid">
              {currentItems.map((item) => (
                <div key={item.id} className="portfolio-card">
                  <div className="portfolio-images">
                    {item.images?.slice(0, 1).map((img, i) => (
                      <img
                        key={i}
                        src={img}
                        alt={item.title}
                        onClick={() =>
                          setPreview({
                            images: item.images,
                            index: i,
                          })
                        }
                      />
                    ))}
                  </div>

                  <div className="portfolio-content">
                    <h3>{item.title}</h3>
                    <p>{item.description}</p>

                    <div className="portfolio-buttons">
                      <button
                        className="btn-secondary"
                        onClick={() => {
                          setModal({
                            ...item,
                            images: [],
                          });
                          setPreviewImages(item.images || []);
                        }}
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
              ))}
            </div>

            {/* ================= PAGINATION ================= */}
            <div className="pagination">
              <button
                disabled={safeCurrentPage === 1}
                onClick={() => goToPage(safeCurrentPage - 1)}
              >
                Prev
              </button>

              {[...Array(totalPages)].map((_, index) => {
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

        {/* ================= MODAL ================= */}
        {modal && (
          <div className="modal-overlay" onClick={closeModal}>
            <div className="premium-modal" onClick={(e) => e.stopPropagation()}>
              <h2>{modal.id ? "Edit Portfolio" : "Add Portfolio"}</h2>

              <input
                placeholder="Title"
                value={modal.title}
                onChange={(e) => setModal({ ...modal, title: e.target.value })}
              />

              <textarea
                placeholder="Description"
                value={modal.description}
                onChange={(e) =>
                  setModal({ ...modal, description: e.target.value })
                }
              />

              <input
                type="file"
                accept="image/*"
                multiple
                onChange={(e) => {
                  const files = Array.from(e.target.files || []).slice(0, 3);

                  setModal({
                    ...modal,
                    images: files,
                  });

                  const previews = files.map((file) =>
                    URL.createObjectURL(file),
                  );

                  setPreviewImages(previews);
                }}
              />

              <div className="portfolio-preview">
                {previewImages.map((img, i) => (
                  <img key={i} src={img} alt="preview" />
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

        {/* ================= DELETE MODAL ================= */}
        {deleteItem && (
          <div className="modal-overlay">
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

            <button
              className="preview-arrow left"
              onClick={() =>
                setPreview((prev) => ({
                  ...prev,
                  index:
                    prev.index === 0 ? prev.images.length - 1 : prev.index - 1,
                }))
              }
            >
              ◀
            </button>

            <img
              src={preview.images[preview.index]}
              className="preview-image"
              alt="Portfolio preview"
            />

            <button
              className="preview-arrow right"
              onClick={() =>
                setPreview((prev) => ({
                  ...prev,
                  index:
                    prev.index === prev.images.length - 1 ? 0 : prev.index + 1,
                }))
              }
            >
              ▶
            </button>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default Portfolio;
