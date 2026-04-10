import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback, useMemo, useState } from "react";
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

const EMPTY_MODAL = {
  title: "",
  content: "",
  is_active: true,
};

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
    refetchOnWindowFocus: false,
  });

  const invalidatePolicies = useCallback(async () => {
    await queryClient.invalidateQueries({ queryKey: POLICIES_QUERY_KEY });
  }, [queryClient]);

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

  const saving =
    createPolicyMutation.isPending || updatePolicyMutation.isPending;

  const deleting = deletePolicyMutation.isPending;

  /* ================= PAGINATION ================= */
  const totalPages = useMemo(() => {
    return Math.max(1, Math.ceil(policies.length / ITEMS_PER_PAGE));
  }, [policies.length]);

  const safeCurrentPage = useMemo(() => {
    return Math.min(Math.max(currentPage, 1), totalPages);
  }, [currentPage, totalPages]);

  const currentItems = useMemo(() => {
    const startIndex = (safeCurrentPage - 1) * ITEMS_PER_PAGE;
    return policies.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [policies, safeCurrentPage]);

  const goToPage = useCallback(
    (page) => {
      const clampedPage = Math.min(Math.max(page, 1), totalPages);
      setCurrentPage(clampedPage);
    },
    [totalPages],
  );

  /* ================= HELPERS ================= */
  const closeModal = useCallback(() => {
    setModal(null);
    setErrors({});
  }, []);

  const openCreateModal = useCallback(() => {
    setModal(EMPTY_MODAL);
    setErrors({});
  }, []);

  const openEditModal = useCallback((item) => {
    setModal({ ...item });
    setErrors({});
  }, []);

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
    }));
  }, []);

  /* ================= SAVE ================= */
  const handleSave = useCallback(async () => {
    if (!modal || saving) return;

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
        title: modal.title.trim(),
        content: modal.content.trim(),
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
      console.error("Save policy error:", err);
    }
  }, [modal, saving, updatePolicyMutation, createPolicyMutation, closeModal]);

  /* ================= DELETE ================= */
  const confirmDelete = useCallback(async () => {
    if (!deleteItem?.id || deleting) return;

    try {
      await deletePolicyMutation.mutateAsync(deleteItem.id);

      const remainingItems = policies.length - 1;
      const newTotalPages = Math.max(
        1,
        Math.ceil(remainingItems / ITEMS_PER_PAGE),
      );

      if (currentPage > newTotalPages) {
        setCurrentPage(newTotalPages);
      }

      setDeleteItem(null);
    } catch (err) {
      console.error("Delete policy error:", err);
    }
  }, [
    deleteItem,
    deleting,
    deletePolicyMutation,
    policies.length,
    currentPage,
  ]);

  /* ================= RENDER ================= */
  return (
    <AdminLayout>
      <div className="policies-page">
        <div className="policies-header">
          <h1>Policies Management</h1>

          <button className="btn-primary" onClick={openCreateModal}>
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
              ))}
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
              <h2>{modal.id ? "Edit Policy" : "Add Policy"}</h2>

              <input
                placeholder="Title"
                value={modal.title}
                onChange={(e) => handleFieldChange("title", e.target.value)}
              />

              {errors.title && (
                <span className="form-error">{errors.title}</span>
              )}

              <textarea
                placeholder="Content"
                value={modal.content}
                onChange={(e) => handleFieldChange("content", e.target.value)}
              />

              {errors.content && (
                <span className="form-error">{errors.content}</span>
              )}

              <label className="policy-toggle">
                <input
                  type="checkbox"
                  checked={Boolean(modal.is_active)}
                  onChange={(e) =>
                    handleFieldChange("is_active", e.target.checked)
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

        {deleteItem && (
          <div
            className="modal-overlay"
            onClick={() => !deleting && setDeleteItem(null)}
          >
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
