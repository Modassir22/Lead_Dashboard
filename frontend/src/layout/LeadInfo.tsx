import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "../context/AuthContext";
import { Lead } from "../types";
import UpdateLeadModal from "../component/UpdateLeadModal";
import DeleteLeadModal from "../component/DeleteLeadModal";

const LeadInfo = () => {
  const { user } = useAuth();
  const [data, setData] = useState<Lead[]>([]);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null); 
  const [editingLead, setEditingLead] = useState<Lead | null>(null); 
  const [deleteLeadId, setDeleteLeadId] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);

  // Pagination & Filtering state
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalLeads, setTotalLeads] = useState(0);
  
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [sourceFilter, setSourceFilter] = useState("");
  const [sortField, setSortField] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState("desc");

  const [tempStatusFilter, setTempStatusFilter] = useState("");
  const [tempSourceFilter, setTempSourceFilter] = useState("");

  const handleApplyFilters = () => {
    setStatusFilter(tempStatusFilter);
    setSourceFilter(tempSourceFilter);
    setPage(1);
    setShowFilters(false);
  };

  const API = import.meta.env.VITE_API;

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setPage(1); // Reset to page 1 on search
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const fetchLeads = useCallback(async () => {
    setIsLoading(true);
    try {
      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: "10",
        sort: `${sortField}_${sortOrder}`
      });

      if (debouncedSearch) queryParams.append("search", debouncedSearch);
      if (statusFilter) queryParams.append("status", statusFilter);
      if (sourceFilter) queryParams.append("source", sourceFilter);

      const res = await fetch(`${API}/lead/get-all-lead?${queryParams.toString()}`, {
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${user?.token}`
        },
        method: "GET",
        credentials: "include",
      });

      const result = await res.json();
      if (result.leads) {
        setData(result.leads);
        if (result.metadata) {
          setTotalPages(result.metadata.totalPages);
          setTotalLeads(result.metadata.totalLeads);
        }
      } else {
        setData([]);
      }
    } catch (e) {
      console.error("error fetching leads", e);
    } finally {
      setTimeout(() => {
        setIsLoading(false);
      }, 2000);
    }
  }, [API, page, debouncedSearch, statusFilter, sourceFilter, sortField, sortOrder]);

  useEffect(() => {
    fetchLeads();
  }, [fetchLeads]);

  const handleExportCSV = async () => {
    try {
      const queryParams = new URLSearchParams({
        exportData: "true",
        sort: `${sortField}_${sortOrder}`
      });

      if (debouncedSearch) queryParams.append("search", debouncedSearch);
      if (statusFilter) queryParams.append("status", statusFilter);
      if (sourceFilter) queryParams.append("source", sourceFilter);

      const res = await fetch(`${API}/lead/get-all-lead?${queryParams.toString()}`, {
        headers: { "Authorization": `Bearer ${user?.token}` }
      });
      const result = await res.json();

      if (result.leads && result.leads.length > 0) {
        // Convert to CSV
        const headers = ["Name", "Email", "Status", "Source", "Created At"];
        const rows = result.leads.map((lead: Lead) => [
          `"${lead.name}"`,
          `"${lead.email}"`,
          `"${lead.status}"`,
          `"${lead.source}"`,
          `"${new Date(lead.createdAt).toISOString()}"`
        ]);

        const csvContent = [headers.join(","), ...rows.map((r: any) => r.join(","))].join("\n");
        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", "leads_export.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else {
        alert("No leads available to export.");
      }
    } catch (e) {
      console.error("Error exporting CSV", e);
      alert("Failed to export CSV.");
    }
  };

  const handleDelete = async () => {
    if (!deleteLeadId) return;
    try {
      const res = await fetch(`${API}/lead/delete-lead/${deleteLeadId}`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${user?.token}`
        },
      });
      if (res.ok) {
        setDeleteLeadId(null);
        fetchLeads(); // Refresh list to handle pagination correctly
      } else {
        const data = await res.json();
        alert(data.message || "Failed to delete lead");
        setDeleteLeadId(null);
      }
    } catch (e) {
      console.error("error deleting", e);
      setDeleteLeadId(null);
    }
  };

  const handleUpdateChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    if (editingLead) {
      setEditingLead({ ...editingLead, [e.target.name]: e.target.value } as Lead);
    }
  };

  const handleUpdateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingLead) return;
    setIsUpdating(true);
    try {
      const res = await fetch(`${API}/lead/update-lead/${editingLead._id}`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${user?.token}`
        },
        body: JSON.stringify(editingLead),
      });
      if (res.ok) {
        setData(
          data.map((item: Lead) => (item._id === editingLead._id ? editingLead : item))
        );
        setEditingLead(null);
      } else {
        alert("Failed to update lead");
      }
    } catch (e) {
      console.error("error updating", e);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="w-full pb-10 relative">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
        <h2 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white transition-colors flex items-center gap-3">
          Lead Information
        </h2>
        
        <div className="flex items-center gap-3">
          <input
            type="text"
            placeholder="Search Name or Email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full md:w-64 px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 transition-all"
          />
          <button
            onClick={() => {
              setTempStatusFilter(statusFilter);
              setTempSourceFilter(sourceFilter);
              setShowFilters(true);
            }}
            className="p-2 text-gray-500 transition-colors rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 dark:text-gray-300"
            title="Open Filters"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
          </button>
          <button
            onClick={handleExportCSV}
            className="flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors shadow-sm"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Export CSV
          </button>
        </div>
      </div>

      {/* Filter Modal */}
      {showFilters && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-2xl p-6 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-2xl rounded-2xl animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">Filters & Search</h3>
              <button
                onClick={() => setShowFilters(false)}
                className="text-gray-400 transition-colors hover:text-gray-700 dark:hover:text-white"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Status</label>
                <div className="space-y-3">
                  {[
                    { label: "All Statuses", value: "" },
                    { label: "New", value: "new" },
                    { label: "Contacted", value: "contacted" },
                    { label: "Qualified", value: "qualified" },
                    { label: "Lost", value: "lost" }
                  ].map(opt => (
                    <label key={opt.value} className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="radio"
                        name="statusFilter"
                        value={opt.value}
                        checked={tempStatusFilter === opt.value}
                        onChange={(e) => setTempStatusFilter(e.target.value)}
                        className="w-4 h-4 text-red-600 border-gray-300 focus:ring-red-500 dark:bg-gray-800 dark:border-gray-600"
                      />
                      <span className="text-sm text-gray-700 dark:text-gray-300">{opt.label}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Source</label>
                <div className="space-y-3">
                  {[
                    { label: "All Sources", value: "" },
                    { label: "Website", value: "website" },
                    { label: "Instagram", value: "instagram" },
                    { label: "Referral", value: "referral" }
                  ].map(opt => (
                    <label key={opt.value} className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="radio"
                        name="sourceFilter"
                        value={opt.value}
                        checked={tempSourceFilter === opt.value}
                        onChange={(e) => setTempSourceFilter(e.target.value)}
                        className="w-4 h-4 text-red-600 border-gray-300 focus:ring-red-500 dark:bg-gray-800 dark:border-gray-600"
                      />
                      <span className="text-sm text-gray-700 dark:text-gray-300">{opt.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-800">
              <button
                onClick={handleApplyFilters}
                className="px-5 py-2.5 text-sm font-medium text-white bg-gray-900 dark:bg-gray-800 rounded-lg hover:bg-black dark:hover:bg-gray-700 transition-colors shadow-md"
              >
                Apply & Close
              </button>
            </div>
          </div>
        </div>
      )}


      {isLoading ? (
        <div className="w-full flex justify-center items-center min-h-[400px] bg-white dark:bg-gray-900 shadow-xl rounded-xl transition-colors duration-300">
          <lottie-player 
            src="/lottieflow-countdown-13-10-000000-easey.json" 
            background="transparent" 
            speed="1" 
            style={{ width: '100px', height: '100px' }} 
            className="dark:invert"
            loop 
            autoplay
          ></lottie-player>
        </div>
      ) : (
      <div className="w-full overflow-hidden bg-white dark:bg-gray-900 shadow-xl rounded-xl transition-colors duration-300">
        <div className="overflow-x-auto min-h-[300px]">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-950/50 transition-colors">
                <th className="px-6 py-4 text-sm font-semibold text-gray-600 dark:text-gray-400 w-16">S.No.</th>
                <th 
                  className="px-6 py-4 text-sm font-semibold text-gray-600 dark:text-gray-400 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  onClick={() => { setSortField("name"); setSortOrder(sortField === "name" && sortOrder === "asc" ? "desc" : "asc"); }}
                >
                  Name {sortField === "name" && (sortOrder === "asc" ? "↑" : "↓")}
                </th>
                <th className="px-6 py-4 text-sm font-semibold text-gray-600 dark:text-gray-400">Email</th>
                <th className="px-6 py-4 text-sm font-semibold text-gray-600 dark:text-gray-400">Source</th>
                <th 
                  className="px-6 py-4 text-sm font-semibold text-gray-600 dark:text-gray-400 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  onClick={() => { setSortField("status"); setSortOrder(sortField === "status" && sortOrder === "asc" ? "desc" : "asc"); }}
                >
                  Status {sortField === "status" && (sortOrder === "asc" ? "↑" : "↓")}
                </th>
                <th 
                  className="px-6 py-4 text-sm font-semibold text-gray-600 dark:text-gray-400 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  onClick={() => { setSortField("createdAt"); setSortOrder(sortField === "createdAt" && sortOrder === "asc" ? "desc" : "asc"); }}
                >
                  Created at {sortField === "createdAt" && (sortOrder === "asc" ? "↑" : "↓")}
                </th>
                <th className="px-6 py-4 text-sm font-semibold text-center text-gray-600 dark:text-gray-400">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800 transition-colors relative">
              {data.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-20 text-center text-gray-500 dark:text-gray-400">
                    <p className="text-lg mb-2">No leads found.</p>
                    <p className="text-sm">Try adjusting your filters or search query.</p>
                  </td>
                </tr>
              ) : (
                data.map((item: Lead, index: number) => (
                  <tr key={item._id} className="transition-colors hover:bg-gray-50/80 dark:hover:bg-gray-800/80">
                    <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                      {(page - 1) * 10 + index + 1}
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-gray-100">{item.name}</td>
                    <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">{item.email}</td>
                    <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400 capitalize">{item.source || "-"}</td>
                    <td className="px-6 py-4 text-sm">
                      <span
                        className={`px-3 py-1 text-xs font-medium rounded-full ${
                          item.status === "new"
                            ? "bg-blue-100 text-blue-700"
                            : item.status === "contacted"
                            ? "bg-yellow-100 text-yellow-700"
                            : item.status === "qualified"
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {item.status || "Unknown"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                      {new Date(item.createdAt).toLocaleDateString(undefined, {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </td>
                    <td className="px-6 py-4 text-sm text-center">
                      <div className="flex items-center justify-center space-x-2">
                        <button
                          onClick={() => setSelectedLead(item)}
                          title="View Lead"
                          className="p-1.5 transition-colors rounded-md hover:bg-blue-50 dark:bg-white dark:hover:bg-gray-200 flex items-center justify-center text-blue-600 dark:text-black"
                        >
                          <lord-icon
                            src="https://cdn.lordicon.com/dicvhxpz.json"
                            trigger="hover"
                            stroke="bold"
                            colors="primary:#000000,secondary:#000000"
                            style={{ width: '20px', height: '20px' }}
                          ></lord-icon>
                        </button>
                        
                        <button
                          onClick={() => setEditingLead(item)}
                          title="Edit Lead"
                          className="p-1.5 transition-colors rounded-md hover:bg-green-50 dark:bg-white dark:hover:bg-gray-200 flex items-center justify-center text-green-600 dark:text-black"
                        >
                          <lord-icon
                            src="https://cdn.lordicon.com/exymduqj.json"
                            trigger="hover"
                            stroke="bold"
                            state="hover-line"
                            colors="primary:#000000,secondary:#000000"
                            style={{ width: '20px', height: '20px' }}
                          ></lord-icon>
                        </button>

                        <button
                          onClick={() => setDeleteLeadId(item._id)}
                          title="Delete Lead"
                          className="p-1.5 transition-colors rounded-md hover:bg-red-50 dark:bg-white dark:hover:bg-gray-200 flex items-center justify-center text-red-600 dark:text-black"
                        >
                          <lord-icon
                            src="https://cdn.lordicon.com/jzinekkv.json"
                            trigger="hover"
                            stroke="bold"
                            state="morph-trash-in"
                            colors="primary:#000000,secondary:#000000"
                            style={{ width: '20px', height: '20px' }}
                          ></lord-icon>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination Controls */}
        {!isLoading && data.length > 0 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-950/50">
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Showing <span className="font-medium">{(page - 1) * 10 + 1}</span> to <span className="font-medium">{Math.min(page * 10, totalLeads)}</span> of <span className="font-medium">{totalLeads}</span> results
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-700 transition-colors"
              >
                Previous
              </button>
              <div className="flex items-center px-2 text-sm text-gray-700 dark:text-gray-300">
                Page {page} of {totalPages || 1}
              </div>
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages || totalPages === 0}
                className="px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-700 transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
      )}

      
      {selectedLead && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-md p-6 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-2xl rounded-2xl animate-in zoom-in-95 duration-200">
            <button
              onClick={() => setSelectedLead(null)}
              className="absolute top-4 right-4 text-gray-400 transition-colors hover:text-gray-700 dark:hover:text-white"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
            <h2 className="mb-4 text-2xl font-bold text-gray-800 dark:text-white border-b border-gray-200 dark:border-gray-800 pb-2">Lead Details</h2>
            <div className="space-y-4 pt-2">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Name</p>
                <p className="text-lg text-gray-900 dark:text-gray-100 font-semibold">{(selectedLead as any).name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Email</p>
                <p className="text-lg text-gray-900 dark:text-gray-100">{(selectedLead as any).email}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Status</p>
                  <p className="text-md text-gray-900 dark:text-gray-100 capitalize">{(selectedLead as any).status}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Source</p>
                  <p className="text-md text-gray-900 dark:text-gray-100 capitalize">{(selectedLead as any).source}</p>
                </div>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Date Created</p>
                <p className="text-md text-gray-900 dark:text-gray-100">
                  {new Date((selectedLead as any).createdAt).toLocaleString(undefined, {
                    dateStyle: 'full',
                    timeStyle: 'short'
                  })}
                </p>
              </div>
            </div>
            <div className="mt-8">
              <button
                onClick={() => setSelectedLead(null)}
                className="w-full px-4 py-2.5 text-white font-medium bg-gray-900 dark:bg-gray-800 rounded-lg hover:bg-black dark:hover:bg-gray-700 transition-colors shadow-md"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {editingLead && (
        <UpdateLeadModal
          editingLead={editingLead}
          isUpdating={isUpdating}
          onClose={() => setEditingLead(null)}
          onChange={handleUpdateChange}
          onSubmit={handleUpdateSubmit}
        />
      )}

      {/* Delete Confirmation Modal */}
      {deleteLeadId && (
        <DeleteLeadModal
          onClose={() => setDeleteLeadId(null)}
          onDelete={handleDelete}
        />
      )}
    </div>
  );
};

export default LeadInfo;