import React, { useState, useEffect, useRef } from "react";
import { useIntl } from "react-intl";
import { Toast } from "primereact/toast";
import ApiService from "../../services/api.js";
import { useNavigate } from "react-router-dom";
import { API_CONFIG } from "../../services/config.js";
import { useDispatch, useSelector } from "react-redux";
import { fetchApiData } from "../../stores/slicer/apiDataSlicer.js";

const CategoryScreen = () => {
  const intl = useIntl();
  const [categories, setCategories] = useState([]);
  const [agencies, setAgencies] = useState([]);
  const [creators, setCreators] = useState([]);
  const [filters, setFilters] = useState({
    search: "",
    agency_id: "",
    created_by: "",
  });
  const [pagination, setPagination] = useState({
    current_page: 1,
    last_page: 1,
    total: 0,
    from: 0,
    to: 0,
  });
  const [deleteModal, setDeleteModal] = useState({
    show: false,
    categoryId: null,
  });
  const toast = useRef(null);

  const navigate = useNavigate();

  const dispatch = useDispatch();
  const { data, loading } = useSelector((state) => state.apiData);

  useEffect(() => {
    loadCategories();
  }, []);

  useEffect(() => {
    if (data.categories) {
      setCategories(data.categories.categories.data || []);

      setAgencies(data.categories.agencies || []);
      setCreators(data.categories.creators || []);

      setPagination({
        current_page: data.categories.categories.current_page,
        last_page: data.categories.categories.last_page,
        total: data.categories.categories.total,
        from: data.categories.categories.from,
        to: data.categories.categories.to,
      });
    }
  }, [data]);

  async function loadCategories(page = 1) {
    try {
      const params = { page, ...filters };
      dispatch(
        fetchApiData({
          url: API_CONFIG.ENDPOINTS.CATEGORIES,
          itemKey: "categories",
          params,
        })
      );
    } catch (error) {
      showToast("error", error.message);
    }
  }

  const handleFilterChange = (name, value) => {
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleSearch = (e) => {
    e.preventDefault();
    loadCategories(1);
  };

  const handleReset = () => {
    setFilters({ search: "", agency_id: "", created_by: "" });
    setTimeout(() => loadCategories(1), 0);
  };

  const handleDeleteCategory = async (categoryId) => {
    try {
      const response = await ApiService.delete(`/api/categories/${categoryId}`);
      if (response.success) {
        showToast("success", intl.formatMessage({id: "category.categoryDeleted"}));
        loadCategories(pagination.current_page);
      } else {
        showToast("error", response.message || intl.formatMessage({id: "category.deleteError"}));
      }
    } catch (error) {
      showToast("error", error.message);
    }
    setDeleteModal({ show: false, categoryId: null });
  };

  const showToast = (severity, detail) => {
    toast.current?.show({
      severity,
      summary: severity === "error" ? intl.formatMessage({id: "category.error"}) : intl.formatMessage({id: "category.success"}),
      detail,
      life: 3000,
    });
  };

  const formatDate = (date) => new Date(date).toLocaleDateString("fr-FR");

  const truncateText = (text, maxLength = 50) => {
    if (!text) return "";
    return text.length > maxLength
      ? text.substring(0, maxLength) + "..."
      : text;
  };

  const Pagination = () => {
    if (pagination.last_page <= 1) return null;

    const getVisiblePages = () => {
      const current = pagination.current_page;
      const last = pagination.last_page;
      const pages = [];

      if (last <= 7) {
        return Array.from({ length: last }, (_, i) => i + 1);
      }

      pages.push(1);
      if (current > 4) pages.push("...");

      const start = Math.max(2, current - 1);
      const end = Math.min(last - 1, current + 1);

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      if (current < last - 3) pages.push("...");
      pages.push(last);

      return pages;
    };

    return (
      <nav>
        <ul className="pagination pagination-sm mb-0">
          <li
            className={`page-item ${
              pagination.current_page === 1 ? "disabled" : ""
            }`}
          >
            <button
              className="page-link"
              onClick={() => loadCategories(pagination.current_page - 1)}
              disabled={pagination.current_page === 1}
            >
              <i className="pi pi-chevron-left"></i>
            </button>
          </li>

          {getVisiblePages().map((page, index) => (
            <li
              key={index}
              className={`page-item ${
                page === pagination.current_page ? "active" : ""
              } ${page === "..." ? "disabled" : ""}`}
            >
              {page === "..." ? (
                <span className="page-link">...</span>
              ) : (
                <button
                  className="page-link"
                  onClick={() => loadCategories(page)}
                >
                  {page}
                </button>
              )}
            </li>
          ))}

          <li
            className={`page-item ${
              pagination.current_page === pagination.last_page ? "disabled" : ""
            }`}
          >
            <button
              className="page-link"
              onClick={() => loadCategories(pagination.current_page + 1)}
              disabled={pagination.current_page === pagination.last_page}
            >
              <i className="pi pi-chevron-right"></i>
            </button>
          </li>
        </ul>
      </nav>
    );
  };

  return (
    <div className="container-fluid">
      <Toast ref={toast} />

      {/* Header */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h2 className="text-primary mb-1">
                <i className="pi pi-tags me-2"></i>{intl.formatMessage({id: "category.title"})}
              </h2>
              <p className="text-muted mb-0">
                {pagination.total} {intl.formatMessage({id: "category.totalCategories"})}
              </p>
            </div>
            <div className="d-flex gap-2">
              <button
                className="btn btn-outline-primary"
                onClick={() => loadCategories(pagination.current_page)}
                disabled={loading}
              >
                <i className="pi pi-refresh me-1"></i>
                {loading ? intl.formatMessage({id: "category.refreshing"}) : intl.formatMessage({id: "category.refresh"})}
              </button>
              <a
                onClick={() => navigate("/categories/create")}
                className="btn btn-primary"
              >
                <i className="pi pi-plus-circle me-1"></i>{intl.formatMessage({id: "category.newCategory"})}
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="card shadow-sm border-0 mb-4">
        <div className="card-header bg-light">
          <h6 className="mb-0">
            <i className="pi pi-filter me-2"></i>{intl.formatMessage({id: "category.searchFilters"})}
          </h6>
        </div>
        <div className="card-body">
          <form onSubmit={handleSearch} className="row g-3">
            <div className="col-md-4">
              <label className="form-label">{intl.formatMessage({id: "category.search"})}</label>
              <div className="input-group">
                <span className="input-group-text">
                  <i className="pi pi-search"></i>
                </span>
                <input
                  type="text"
                  className="form-control"
                  placeholder={intl.formatMessage({id: "category.searchPlaceholder"})}
                  value={filters.search}
                  onChange={(e) => handleFilterChange("search", e.target.value)}
                />
              </div>
            </div>

            <div className="col-md-3">
              <label className="form-label">{intl.formatMessage({id: "category.agency"})}</label>
              <select
                className="form-select"
                value={filters.agency_id}
                onChange={(e) =>
                  handleFilterChange("agency_id", e.target.value)
                }
              >
                <option value="">{intl.formatMessage({id: "category.all"})}</option>
                {agencies.map((agency) => (
                  <option key={agency.id} value={agency.id}>
                    {agency.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="col-md-3">
              <label className="form-label">{intl.formatMessage({id: "category.createdBy"})}</label>
              <select
                className="form-select"
                value={filters.created_by}
                onChange={(e) =>
                  handleFilterChange("created_by", e.target.value)
                }
              >
                <option value="">{intl.formatMessage({id: "category.all"})}</option>
                {creators.map((creator) => (
                  <option key={creator.id} value={creator.id}>
                    {creator.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="col-md-2 d-flex align-items-end gap-2">
              <button
                type="submit"
                className="btn btn-primary"
                disabled={loading}
              >
                <i className="pi pi-search me-1"></i>{intl.formatMessage({id: "category.searchBtn"})}
              </button>
              <button
                type="button"
                className="btn btn-outline-secondary"
                onClick={handleReset}
              >
                <i className="pi pi-refresh me-1"></i>{intl.formatMessage({id: "category.reset"})}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Categories Table */}
      <div className="card shadow-sm border-0">
        <div className="card-header bg-white d-flex justify-content-between align-items-center">
          <h5 className="mb-0">
            <i className="pi pi-list me-2"></i>{intl.formatMessage({id: "category.categoriesList"})}
          </h5>
        </div>
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="bg-light">
                <tr>
                  <th className="border-0 px-4 py-3">{intl.formatMessage({id: "category.name"})}</th>
                  <th className="border-0 px-4 py-3">{intl.formatMessage({id: "category.description"})}</th>
                  <th className="border-0 px-4 py-3">{intl.formatMessage({id: "category.agency"})}</th>
                  <th className="border-0 px-4 py-3">{intl.formatMessage({id: "category.createdBy"})}</th>
                  <th className="border-0 px-4 py-3">{intl.formatMessage({id: "category.createdOn"})}</th>
                  <th className="border-0 px-4 py-3">{intl.formatMessage({id: "category.actions"})}</th>
                </tr>
              </thead>
              <tbody>
                {categories.length === 0 && loading   ? (
                  <tr>
                    <td colSpan="6" className="text-center py-5">
                      <div
                        className="spinner-border text-primary"
                        role="status"
                      >
                        <span className="visually-hidden">{intl.formatMessage({id: "category.loading"})}</span>
                      </div>
                    </td>
                  </tr>
                ) :  data.products == undefined && categories.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="text-center py-5">
                      <div className="text-muted">
                        <i className="pi pi-inbox display-4 d-block mb-3"></i>
                        <h5>{intl.formatMessage({id: "category.noCategoriesFound"})}</h5>
                        <p className="mb-0">
                          {intl.formatMessage({id: "category.tryModifyingCriteria"})}
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  categories.map((category) => (
                    <tr key={category.id}>
                      <td className="px-4">
                        <div className="d-flex align-items-center">
                          <div className="bg-primary bg-opacity-10 p-2 rounded me-3">
                            <i className="pi pi-tag text-primary"></i>
                          </div>
                          <strong className="text-primary">
                            {category.name}
                          </strong>
                        </div>
                      </td>
                      <td className="px-4">
                        {category.description ? (
                          <span title={category.description}>
                            {truncateText(category.description, 50)}
                          </span>
                        ) : (
                          <span className="text-muted">{intl.formatMessage({id: "category.noDescription"})}</span>
                        )}
                      </td>
                      <td className="px-4">
                        {category.agency ? (
                          <div className="d-flex align-items-center">
                            <i className="pi pi-building text-info me-2"></i>
                            {category.agency.name}
                          </div>
                        ) : (
                          <span className="text-muted">{intl.formatMessage({id: "category.notAssigned"})}</span>
                        )}
                      </td>
                      <td className="px-4">
                        <div className="d-flex align-items-center">
                          <i className="pi pi-user-check text-success me-2"></i>
                          {category.created_by?.full_name ||
                            category.created_by?.name ||
                            "N/A"}
                        </div>
                      </td>
                      <td className="px-4">
                        <div>
                          <strong>{formatDate(category.created_at)}</strong>
                          <br />
                          <small className="text-muted">
                            {new Date(category.created_at).toLocaleTimeString(
                              "fr-FR",
                              {
                                hour: "2-digit",
                                minute: "2-digit",
                              }
                            )}
                          </small>
                        </div>
                      </td>
                      <td className="px-4">
                        <div className="btn-group" role="group">
                          <a
                            onClick={() => navigate(`/categories/${category.id}/edit`)}
                            className="btn btn-sm btn-outline-warning"
                            title={intl.formatMessage({id: "category.edit"})}
                          >
                            <i className="pi pi-pencil"></i>
                          </a>
                          <button
                            type="button"
                            className="btn btn-sm btn-outline-danger"
                            title={intl.formatMessage({id: "category.delete"})}
                            onClick={() =>
                              setDeleteModal({
                                show: true,
                                categoryId: category.id,
                              })
                            }
                          >
                            <i className="pi pi-trash"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination */}
        {pagination.last_page > 1 && (
          <div className="card-footer bg-transparent border-0">
            <div className="d-flex justify-content-between align-items-center">
              <div className="text-muted small">
                {intl.formatMessage({id: "category.showing"})} {pagination.from} {intl.formatMessage({id: "category.to"})} {pagination.to} {intl.formatMessage({id: "category.on"})}{" "}
                {pagination.total} {intl.formatMessage({id: "category.results"})}
              </div>
              <Pagination />
            </div>
          </div>
        )}
      </div>

      {/* Delete Modal */}
      {deleteModal.show && (
        <>
          <div className="modal show d-block" tabIndex="-1">
            <div className="modal-dialog">
              <div className="modal-content">
                <div className="modal-header bg-danger text-white">
                  <h5 className="modal-title">
                    <i className="pi pi-exclamation-triangle me-2"></i>{intl.formatMessage({id: "category.confirmDelete"})}
                  </h5>
                  <button
                    type="button"
                    className="btn-close btn-close-white"
                    onClick={() =>
                      setDeleteModal({ show: false, categoryId: null })
                    }
                  ></button>
                </div>
                <div className="modal-body">
                  <p>
                    {intl.formatMessage({id: "category.deleteMessage"})}
                  </p>
                  <div className="alert alert-warning mt-3">
                    <i className="pi pi-info-circle me-2"></i>
                    <strong>{intl.formatMessage({id: "category.deleteWarning"})}</strong> {intl.formatMessage({id: "category.deleteWarningMessage"})}
                  </div>
                </div>
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() =>
                      setDeleteModal({ show: false, categoryId: null })
                    }
                  >
                    {intl.formatMessage({id: "category.cancel"})}
                  </button>
                  <button
                    type="button"
                    className="btn btn-danger"
                    onClick={() => handleDeleteCategory(deleteModal.categoryId)}
                  >
                    <i className="pi pi-trash me-1"></i>{intl.formatMessage({id: "category.delete"})}
                  </button>
                </div>
              </div>
            </div>
          </div>
          <div
            className="modal-backdrop show"
            onClick={() => setDeleteModal({ show: false, categoryId: null })}
          ></div>
        </>
      )}
    </div>
  );
};

export default CategoryScreen;