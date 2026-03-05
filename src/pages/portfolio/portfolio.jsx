import { useEffect, useState } from "react";
import AdminLayout from "../../components/layout/adminLayout";

import {
  createPortfolio,
  deletePortfolio,
  getAllPortfolio,
  updatePortfolio,
} from "../../services/BACKEND/adminPortfolioApi";

import "../../styles/portfolio.css";

const ITEMS_PER_PAGE = 6;

const Portfolio = () => {
  const [portfolio, setPortfolio] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);
  const [saving, setSaving] = useState(false);
  const [previewImages, setPreviewImages] = useState([]);

  const [currentPage, setCurrentPage] = useState(1);

  const [deleteItem, setDeleteItem] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [preview, setPreview] = useState(null);

  /* ================= FETCH ================= */
  const fetchData = async () => {
    try {
      setLoading(true);
      const data = await getAllPortfolio();
      const list = data.data || data;

      setPortfolio(list);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  /* ================= PAGINATION ================= */

  const totalPages = Math.ceil(portfolio.length / ITEMS_PER_PAGE);

  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const currentItems = portfolio.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const goToPage = (page) => {
    setCurrentPage(page);
  };

  /* ================= SAVE ================= */
  const handleSave = async () => {
    try {
      setSaving(true);

      const formData = new FormData();
      formData.append("title", modal.title);
      formData.append("description", modal.description);

      if (modal.images) {
        modal.images.forEach((img) => {
          formData.append("images", img);
        });
      }

      if (modal.id) {
        await updatePortfolio(modal.id, formData);
      } else {
        await createPortfolio(formData);
      }

      closeModal();
      fetchData();
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  /* ================= DELETE ================= */
  const confirmDelete = async () => {
    try {
      setDeleting(true);

      await deletePortfolio(deleteItem.id);

      setDeleteItem(null);
      fetchData();
    } catch (err) {
      console.error(err);
    } finally {
      setDeleting(false);
    }
  };

  const closeModal = () => {
    setModal(null);
    setPreviewImages([]);
  };

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

        {loading ? (
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
                        onClick={() =>
                          setModal({
                            ...item,
                            images: [],
                          })
                        }
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
                disabled={currentPage === 1}
                onClick={() => goToPage(currentPage - 1)}
              >
                Prev
              </button>

              {[...Array(totalPages)].map((_, index) => {
                const page = index + 1;

                return (
                  <button
                    key={page}
                    className={page === currentPage ? "active-page" : ""}
                    onClick={() => goToPage(page)}
                  >
                    {page}
                  </button>
                );
              })}

              <button
                disabled={currentPage === totalPages}
                onClick={() => goToPage(currentPage + 1)}
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
                  const files = Array.from(e.target.files).slice(0, 3);

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
