import { useCallback, useEffect, useMemo, useState } from "react";
import AdminLayout from "../../components/layout/adminLayout";

import {
  createAnnouncement,
  deleteAnnouncement,
  getAllAnnouncements,
  updateAnnouncement,
} from "../../services/BACKEND/adminAnnouncementApi";

import "../../styles/announcement.css";

const ITEMS_PER_PAGE = 6;

const EMPTY_MODAL = {
  title: "",
  content: "",
  start_date: "",
  end_date: "",
  images: [],
};

const Announcements = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);

  const [modal, setModal] = useState(null);
  const [saving, setSaving] = useState(false);
  const [previewImages, setPreviewImages] = useState([]);

  const [currentPage, setCurrentPage] = useState(1);

  const [deleteItem, setDeleteItem] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const [preview, setPreview] = useState(null);
  const [errors, setErrors] = useState({});

  /* ================= FETCH ================= */
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getAllAnnouncements();
      const list = data?.data || data || [];
      setAnnouncements(Array.isArray(list) ? list : []);
    } catch (err) {
      console.error("Fetch announcements error:", err);
      setAnnouncements([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  /* ================= PAGINATION ================= */
  const totalPages = useMemo(() => {
    return Math.max(1, Math.ceil(announcements.length / ITEMS_PER_PAGE));
  }, [announcements.length]);

  const safeCurrentPage = useMemo(() => {
    return Math.min(Math.max(currentPage, 1), totalPages);
  }, [currentPage, totalPages]);

  const currentItems = useMemo(() => {
    const startIndex = (safeCurrentPage - 1) * ITEMS_PER_PAGE;
    return announcements.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [announcements, safeCurrentPage]);

  const goToPage = useCallback(
    (page) => {
      setCurrentPage(Math.min(Math.max(page, 1), totalPages));
    },
    [totalPages]
  );

  /* ================= HELPERS ================= */
  const revokeBlobUrls = useCallback((urls) => {
    urls.forEach((url) => {
      if (typeof url === "string" && url.startsWith("blob:")) {
        URL.revokeObjectURL(url);
      }
    });
  }, []);

  const closeModal = useCallback(() => {
    revokeBlobUrls(previewImages);
    setModal(null);
    setPreviewImages([]);
    setErrors({});
  }, [previewImages, revokeBlobUrls]);

  const openCreateModal = useCallback(() => {
    revokeBlobUrls(previewImages);
    setPreviewImages([]);
    setErrors({});
    setModal(EMPTY_MODAL);
  }, [previewImages, revokeBlobUrls]);

  const openEditModal = useCallback(
    (item) => {
      revokeBlobUrls(previewImages);
      setErrors({});
      setModal({
        ...item,
        images: [],
      });
      setPreviewImages(item.images || []);
    },
    [previewImages, revokeBlobUrls]
  );

  const handleFieldChange = useCallback((field, value) => {
    setModal((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        [field]: value,
      };
    });

    setErrors((prev) => ({
      ...prev,
      [field]: null,
      ...(field === "start_date" ? { end_date: null } : {}),
    }));
  }, []);

  const handleFileChange = useCallback(
    (e) => {
      const files = Array.from(e.target.files || []).slice(0, 5);
      const previews = files.map((file) => URL.createObjectURL(file));

      setModal((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          images: files,
        };
      });

      setPreviewImages((prev) => {
        revokeBlobUrls(prev);
        return previews;
      });
    },
    [revokeBlobUrls]
  );

  useEffect(() => {
    return () => {
      revokeBlobUrls(previewImages);
    };
  }, [previewImages, revokeBlobUrls]);

  const validateModal = useCallback(() => {
    if (!modal) return { valid: false, newErrors: {} };

    const newErrors = {};

    if (!modal.title?.trim()) {
      newErrors.title = "Title is required";
    }

    if (!modal.content?.trim()) {
      newErrors.content = "Content is required";
    }

    if (!modal.start_date) {
      newErrors.start_date = "Start date is required";
    }

    if (!modal.end_date) {
      newErrors.end_date = "End date is required";
    }

    if (modal.start_date && modal.end_date) {
      const start = new Date(modal.start_date);
      const end = new Date(modal.end_date);

      if (end < start) {
        newErrors.end_date = "End date cannot be earlier than start date";
      }
    }

    return {
      valid: Object.keys(newErrors).length === 0,
      newErrors,
    };
  }, [modal]);

  /* ================= SAVE ================= */
  const handleSave = useCallback(async () => {
    if (!modal || saving) return;

    const { valid, newErrors } = validateModal();

    if (!valid) {
      setErrors(newErrors);
      return;
    }

    try {
      setSaving(true);

      const formData = new FormData();
      formData.append("title", modal.title?.trim() || "");
      formData.append("content", modal.content?.trim() || "");
      formData.append("start_date", modal.start_date || "");
      formData.append("end_date", modal.end_date || "");

      if (modal.images?.length) {
        modal.images.forEach((img) => {
          formData.append("images", img);
        });
      }

      if (modal.id) {
        await updateAnnouncement(modal.id, formData);
      } else {
        await createAnnouncement(formData);
      }

      closeModal();
      await fetchData();
    } catch (err) {
      console.error("Save announcement error:", err);
    } finally {
      setSaving(false);
    }
  }, [modal, saving, validateModal, closeModal, fetchData]);

  /* ================= DELETE ================= */
  const confirmDelete = useCallback(async () => {
    if (!deleteItem?.id || deleting) return;

    try {
      setDeleting(true);
      await deleteAnnouncement(deleteItem.id);

      const remainingItems = announcements.length - 1;
      const newTotalPages = Math.max(
        1,
        Math.ceil(remainingItems / ITEMS_PER_PAGE)
      );

      if (currentPage > newTotalPages) {
        setCurrentPage(newTotalPages);
      }

      setDeleteItem(null);
      await fetchData();
    } catch (err) {
      console.error("Delete announcement error:", err);
    } finally {
      setDeleting(false);
    }
  }, [deleteItem, deleting, announcements.length, currentPage, fetchData]);

  const closePreview = useCallback(() => {
    setPreview(null);
  }, []);

  const openPreview = useCallback((images, index = 0) => {
    if (!images?.length) return;
    setPreview({ images, index });
  }, []);

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

  const titleLength = modal?.title?.length || 0;
  const contentLength = modal?.content?.length || 0;
  const modalImageCount = modal?.images?.length || 0;

  useEffect(() => {
    const hasOverlay = Boolean(modal || deleteItem || preview);

    if (!hasOverlay) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        if (preview) {
          setPreview(null);
          return;
        }

        if (deleteItem) {
          setDeleteItem(null);
          return;
        }

        if (modal) {
          closeModal();
        }
      }

      if (preview?.images?.length > 1) {
        if (e.key === "ArrowLeft") goToPrevPreview();
        if (e.key === "ArrowRight") goToNextPreview();
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [
    modal,
    deleteItem,
    preview,
    closeModal,
    goToPrevPreview,
    goToNextPreview,
  ]);

  /* ================= RENDER ================= */
  return (
    <AdminLayout>
      <div className="announcement-page">
        <div className="announcement-header">
          <h1>Announcement Management</h1>

          <button className="btn-primary" onClick={openCreateModal}>
            + Add Announcement
          </button>
        </div>

        {loading ? (
          <div>Loading...</div>
        ) : (
          <>
            <div className="announcement-grid">
              {currentItems.map((item) => {
                const firstImage = item.images?.[0];

                return (
                  <div key={item.id} className="announcement-card">
                    <div className="announcement-images">
                      {firstImage ? (
                        <img
                          src={firstImage}
                          alt={item.title}
                          loading="lazy"
                          onClick={() => openPreview(item.images, 0)}
                        />
                      ) : (
                        <div className="announcement-no-image">No Image</div>
                      )}
                    </div>

                    <div className="announcement-content">
                      <h3>{item.title}</h3>

                      <p>{item.content}</p>

                      <div className="announcement-date">
                        {item.start_date} → {item.end_date || "No End"}
                      </div>

                      <div className="announcement-status">
                        {item.is_active ? (
                          <span className="status-active">Active</span>
                        ) : (
                          <span className="status-inactive">Inactive</span>
                        )}
                      </div>

                      <div className="announcement-buttons">
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
            <div
              className="premium-modal announcement-form-modal"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                className="modal-close-btn"
                onClick={closeModal}
                aria-label="Close modal"
              >
                ✕
              </button>

              <div className="modal-header-block">
                <span className="modal-badge">
                  {modal.id ? "Edit Entry" : "New Entry"}
                </span>

                <h2>{modal.id ? "Edit Announcement" : "Add Announcement"}</h2>

                <p>
                  Create a polished announcement with title, message, schedule,
                  and optional images for better visibility.
                </p>
              </div>

              <div className="modal-form-grid">
                <div className="form-group">
                  <div className="form-label-row">
                    <label htmlFor="announcement-title">Title</label>
                    <span>{titleLength}/100</span>
                  </div>

                  <input
                    id="announcement-title"
                    type="text"
                    placeholder="Ex. Holy Week Schedule Update"
                    value={modal.title}
                    maxLength={100}
                    onChange={(e) => handleFieldChange("title", e.target.value)}
                  />

                  {errors.title && (
                    <span className="form-error">{errors.title}</span>
                  )}
                </div>

                <div className="form-group">
                  <div className="form-label-row">
                    <label htmlFor="announcement-content">Content</label>
                    <span>{contentLength}/500</span>
                  </div>

                  <textarea
                    id="announcement-content"
                    placeholder="Write the full announcement details here..."
                    value={modal.content}
                    maxLength={500}
                    onChange={(e) =>
                      handleFieldChange("content", e.target.value)
                    }
                  />

                  {errors.content && (
                    <span className="form-error">{errors.content}</span>
                  )}
                </div>

                <div className="announcement-date-grid">
                  <div className="form-group">
                    <div className="form-label-row">
                      <label htmlFor="announcement-start-date">Start Date</label>
                    </div>

                    <input
                      id="announcement-start-date"
                      type="date"
                      value={modal.start_date || ""}
                      onChange={(e) =>
                        handleFieldChange("start_date", e.target.value)
                      }
                    />

                    {errors.start_date && (
                      <span className="form-error">{errors.start_date}</span>
                    )}
                  </div>

                  <div className="form-group">
                    <div className="form-label-row">
                      <label htmlFor="announcement-end-date">End Date</label>
                    </div>

                    <input
                      id="announcement-end-date"
                      type="date"
                      value={modal.end_date || ""}
                      min={modal.start_date || ""}
                      onChange={(e) =>
                        handleFieldChange("end_date", e.target.value)
                      }
                    />

                    {errors.end_date && (
                      <span className="form-error">{errors.end_date}</span>
                    )}
                  </div>
                </div>

                <div className="form-group">
                  <div className="form-label-row">
                    <label htmlFor="announcement-images">Announcement Images</label>
                    <span>Maximum 5</span>
                  </div>

                  <label
                    htmlFor="announcement-images"
                    className="custom-file-upload"
                  >
                    <div className="custom-file-upload-left">
                      <span className="upload-icon">🖼️</span>
                      <div>
                        <strong>
                          {modalImageCount > 0
                            ? `${modalImageCount} image${
                                modalImageCount > 1 ? "s" : ""
                              } selected`
                            : previewImages.length > 0
                            ? `${previewImages.length} image${
                                previewImages.length > 1 ? "s" : ""
                              } ready`
                            : "Choose images"}
                        </strong>
                        <small>
                          JPG, PNG, WEBP supported. Up to 5 files.
                        </small>
                      </div>
                    </div>

                    <span className="upload-action">Browse</span>
                  </label>

                  <input
                    id="announcement-images"
                    className="native-file-input"
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleFileChange}
                  />
                </div>

                <div className="form-group">
                  <div className="preview-header-row">
                    <label>Preview</label>
                    <span>{previewImages.length} item(s)</span>
                  </div>

                  {previewImages.length ? (
                    <div className="announcement-preview enhanced-preview">
                      {previewImages.map((img, i) => (
                        <button
                          key={`${img}-${i}`}
                          type="button"
                          className="preview-thumb-card"
                          onClick={() => openPreview(previewImages, i)}
                        >
                          <img src={img} alt={`preview-${i + 1}`} />
                          <span>Image {i + 1}</span>
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="empty-preview-state">
                      <span className="empty-preview-icon">🖼️</span>
                      <p>No images selected yet.</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="modal-action-row">
                <button
                  type="button"
                  className="btn-secondary modal-secondary-btn"
                  onClick={closeModal}
                  disabled={saving}
                >
                  Cancel
                </button>

                <button
                  type="button"
                  className="btn-primary modal-primary-btn"
                  onClick={handleSave}
                  disabled={saving}
                >
                  {saving
                    ? "Saving..."
                    : modal.id
                    ? "Update Announcement"
                    : "Create Announcement"}
                </button>
              </div>
            </div>
          </div>
        )}

        {deleteItem && (
          <div
            className="modal-overlay"
            onClick={() => !deleting && setDeleteItem(null)}
          >
            <div
              className="premium-modal delete-modal"
              onClick={(e) => e.stopPropagation()}
            >
              <h2>Delete Announcement</h2>

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
                  {deleting ? "Deleting..." : "Delete"}
                </button>
              </div>
            </div>
          </div>
        )}

        {preview && (
          <div className="image-preview-overlay" onClick={closePreview}>
            <button
              className="preview-close"
              onClick={closePreview}
              aria-label="Close preview"
            >
              ✕
            </button>

            {preview.images.length > 1 && (
              <button
                className="preview-arrow left"
                onClick={(e) => {
                  e.stopPropagation();
                  goToPrevPreview();
                }}
                aria-label="Previous image"
              >
                ◀
              </button>
            )}

            <div
              className="preview-stage"
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={preview.images[preview.index]}
                className="preview-image"
                alt="Announcement preview"
              />

              <div className="preview-meta">
                <span>
                  Image {preview.index + 1} of {preview.images.length}
                </span>
              </div>
            </div>

            {preview.images.length > 1 && (
              <button
                className="preview-arrow right"
                onClick={(e) => {
                  e.stopPropagation();
                  goToNextPreview();
                }}
                aria-label="Next image"
              >
                ▶
              </button>
            )}
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default Announcements;