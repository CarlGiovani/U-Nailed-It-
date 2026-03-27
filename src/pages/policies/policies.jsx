import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {  useState } from "react";
import AdminLayout from "../../components/layout/adminLayout";

import {
  createPolicy,
  deletePolicy,
  getAllPolicies,
  updatePolicy,
} from "../../services/BACKEND/adminPoliciesApi";

import "../../styles/policies.css";

const ITEMS_PER_PAGE = 6;
const POLICIES_QUERY_KEY = ["admin-policies"];

const Policies = () => {
  const queryClient = useQueryClient();

  const [modal, setModal] = useState(null);
  const [deleteItem, setDeleteItem] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [errors, setErrors] = useState({});

  /* ================= CACHED FETCH ================= */
  const { data: policies = [], isLoading } = useQuery({
    queryKey: POLICIES_QUERY_KEY,
    queryFn: async () => {
      const data = await getAllPolicies();
      return data?.data || data || [];
    },
    staleTime: 1000 * 60 * 3,
    gcTime: 1000 * 60 * 10,
  });

  const invalidatePolicies = async () => {
    await queryClient.invalidateQueries({ queryKey: POLICIES_QUERY_KEY });
  };

  /* ================= MUTATIONS ================= */
  const createPolicyMutation = useMutation({
    mutationFn: createPolicy,
    onSuccess: invalidatePolicies,
  });

  const updatePolicyMutation = useMutation({
    mutationFn: ({ id, payload }) => updatePolicy(id, payload),
    onSuccess: invalidatePolicies,
  });

  const deletePolicyMutation = useMutation({
    mutationFn: deletePolicy,
    onSuccess: invalidatePolicies,
  });

  /* ================= PAGINATION ================= */
  const totalPages = Math.max(1, Math.ceil(policies.length / ITEMS_PER_PAGE));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const startIndex = (safeCurrentPage - 1) * ITEMS_PER_PAGE;
  const currentItems = policies.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const goToPage = (page) => {
    const clampedPage = Math.min(Math.max(page, 1), totalPages);
    setCurrentPage(clampedPage);
  };



  /* ================= SAVE ================= */
  const handleSave = async () => {
    if (!modal) return;

    const newErrors = {};

    if (!modal.title?.trim()) {
      newErrors.title = "Title is required";
    }

    if (!modal.content?.trim()) {
      newErrors.content = "Content is required";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      const payload = {
        title: modal.title,
        content: modal.content,
        is_active: modal.is_active ?? true,
      };

      if (modal.id) {
        await updatePolicyMutation.mutateAsync({
          id: modal.id,
          payload,
        });
      } else {
        await createPolicyMutation.mutateAsync(payload);
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
      await deletePolicyMutation.mutateAsync(deleteItem.id);
      setDeleteItem(null);
    } catch (err) {
      console.error(err);
    }
  };

  const closeModal = () => {
    setModal(null);
    setErrors({});
  };

  const saving =
    createPolicyMutation.isPending || updatePolicyMutation.isPending;

  const deleting = deletePolicyMutation.isPending;

  /* ================= RENDER ================= */
  return (
    <AdminLayout>
      <div className="policies-page">
        <div className="policies-header">
          <h1>Policies Management</h1>

          <button
            className="btn-primary"
            onClick={() =>
              setModal({
                title: "",
                content: "",
                is_active: true,
              })
            }
          >
            + Add Policy
          </button>
        </div>

        {isLoading ? (
          <div>Loading...</div>
        ) : (
          <>
            <div className="policies-grid">
              {currentItems.map((item) => (
                <div key={item.id} className="policy-card">
                  <div className="policy-card-header">
                    <h3>{item.title}</h3>

                    {item.is_active ? (
                      <span className="status-active">Active</span>
                    ) : (
                      <span className="status-inactive">Inactive</span>
                    )}
                  </div>

                  <p className="policy-card-content">{item.content}</p>

                  <div className="policy-card-actions">
                    <button
                      className="btn-secondary"
                      onClick={() =>
                        setModal({
                          ...item,
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
              ))}
            </div>

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

        {/* MODAL */}
        {modal && (
          <div className="modal-overlay" onClick={closeModal}>
            <div className="premium-modal" onClick={(e) => e.stopPropagation()}>
              <h2>{modal.id ? "Edit Policy" : "Add Policy"}</h2>

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

              <label className="policy-toggle">
                <input
                  type="checkbox"
                  checked={modal.is_active}
                  onChange={(e) =>
                    setModal({
                      ...modal,
                      is_active: e.target.checked,
                    })
                  }
                />

                <span>Active Policy</span>
              </label>

              <button onClick={handleSave} disabled={saving}>
                {saving
                  ? "Saving..."
                  : modal.id
                    ? "Update Policy"
                    : "Create Policy"}
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
              <h2>Delete Policy</h2>

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
      </div>
    </AdminLayout>
  );
};

export default Policies;
