import { useEffect, useState } from "react";
import AdminLayout from "../../components/layout/adminLayout";

import {
  createAnnouncement,
  deleteAnnouncement,
  getAllAnnouncements,
  updateAnnouncement,
} from "../../services/BACKEND/adminAnnouncementApi";

import "../../styles/announcement.css";

const ITEMS_PER_PAGE = 6;

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

  const fetchData = async () => {
    try {
      setLoading(true);

      const data = await getAllAnnouncements();
      const list = data.data || data;

      setAnnouncements(list);
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

  const totalPages = Math.ceil(announcements.length / ITEMS_PER_PAGE);

  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;

  const currentItems = announcements.slice(
    startIndex,
    startIndex + ITEMS_PER_PAGE,
  );

  const goToPage = (page) => setCurrentPage(page);

  /* ================= SAVE ================= */
  const handleSave = async () => {
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

    // check if end date is earlier than start date
    if (modal.start_date && modal.end_date) {
      const start = new Date(modal.start_date);
      const end = new Date(modal.end_date);

      if (end < start) {
        newErrors.end_date = "End date cannot be earlier than start date";
      }
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      setSaving(true);

      const formData = new FormData();

      formData.append("title", modal.title);
      formData.append("content", modal.content);
      formData.append("start_date", modal.start_date);
      formData.append("end_date", modal.end_date);

      if (modal.images) {
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

      await deleteAnnouncement(deleteItem.id);

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
    setErrors({});
  };

  /* ================= RENDER ================= */

  return (
    <AdminLayout>
      <div className="announcement-page">
        <div className="announcement-header">
          <h1>Announcement Management</h1>

          <button
            className="btn-primary"
            onClick={() =>
              setModal({
                title: "",
                content: "",
                start_date: "",
                end_date: "",
                images: [],
              })
            }
          >
            + Add Announcement
          </button>
        </div>

        {loading ? (
          <div>Loading...</div>
        ) : (
          <>
            {/* GRID */}

            <div className="announcement-grid">
              {currentItems.map((item) => (
                <div key={item.id} className="announcement-card">
                  <div className="announcement-images">
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

            {/* PAGINATION */}

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

        {/* MODAL */}

        {modal && (
          <div className="modal-overlay" onClick={closeModal}>
            <div className="premium-modal" onClick={(e) => e.stopPropagation()}>
              <h2>{modal.id ? "Edit Announcement" : "Add Announcement"}</h2>

              <input
                placeholder="Title"
                value={modal.title}
                onChange={(e) => {
                  setModal({ ...modal, title: e.target.value });
                  setErrors({ ...errors, title: null });
                }}
              />

              {errors.title && (
                <span className="form-error">{errors.title}</span>
              )}

              <textarea
                placeholder="Content"
                value={modal.content}
                onChange={(e) => {
                  setModal({ ...modal, content: e.target.value });
                  setErrors({ ...errors, content: null });
                }}
              />

              {errors.content && (
                <span className="form-error">{errors.content}</span>
              )}
              <label>Start Date</label>
              <input
                type="date"
                value={modal.start_date || ""}
                onChange={(e) => {
                  setModal({ ...modal, start_date: e.target.value });
                  setErrors({ ...errors, start_date: null, end_date: null });
                }}
              />

              {errors.start_date && (
                <span className="form-error">{errors.start_date}</span>
              )}

              <label>End Date</label>
              <input
                type="date"
                value={modal.end_date || ""}
                onChange={(e) => {
                  setModal({ ...modal, end_date: e.target.value });
                  setErrors({ ...errors, end_date: null });
                }}
              />

              {errors.end_date && (
                <span className="form-error">{errors.end_date}</span>
              )}
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={(e) => {
                  const files = Array.from(e.target.files).slice(0, 5);

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

              <div className="announcement-preview">
                {previewImages.map((img, i) => (
                  <img key={i} src={img} />
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

        {/* DELETE MODAL */}

        {deleteItem && (
          <div className="modal-overlay">
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

        {/* IMAGE PREVIEW */}

        {preview && (
          <div className="image-preview-overlay">
            <button className="preview-close" onClick={() => setPreview(null)}>
              ✕
            </button>

            <img
              src={preview.images[preview.index]}
              className="preview-image"
            />
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default Announcements;
