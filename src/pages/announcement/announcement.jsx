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
            <div className="premium-modal" onClick={(e) => e.stopPropagation()}>
              <h2>{modal.id ? "Edit Announcement" : "Add Announcement"}</h2>

              <input
                placeholder="Title"
                value={modal.title}
                onChange={(e) => handleFieldChange("title", e.target.value)}
              />
              {errors.title && <span className="form-error">{errors.title}</span>}

              <textarea
                placeholder="Content"
                value={modal.content}
                onChange={(e) => handleFieldChange("content", e.target.value)}
              />
              {errors.content && (
                <span className="form-error">{errors.content}</span>
              )}

              <label>Start Date</label>
              <input
                type="date"
                value={modal.start_date || ""}
                onChange={(e) => handleFieldChange("start_date", e.target.value)}
              />
              {errors.start_date && (
                <span className="form-error">{errors.start_date}</span>
              )}

              <label>End Date</label>
              <input
                type="date"
                value={modal.end_date || ""}
                onChange={(e) => handleFieldChange("end_date", e.target.value)}
              />
              {errors.end_date && (
                <span className="form-error">{errors.end_date}</span>
              )}

              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleFileChange}
              />

              <div className="announcement-preview">
                {previewImages.map((img, i) => (
                  <img key={`${img}-${i}`} src={img} alt="preview" />
                ))}
              </div>

              <button onClick={handleSave} disabled={saving}>
                {saving
                  ? "Saving..."
                  : modal.id
                    ? "Update Announcement"
                    : "Create Announcement"}
              </button>
            </div>
          </div>
        )}

        {deleteItem && (
          <div className="modal-overlay" onClick={() => !deleting && setDeleteItem(null)}>
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
            <button className="preview-close" onClick={closePreview}>
              ✕
            </button>

            <img
              src={preview.images[preview.index]}
              className="preview-image"
              alt="Announcement preview"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default Announcements;