"use client";

import React, { useState, useEffect } from "react";
import WorkspaceLayout from "@/components/workspace-layout";
import { apiRequest } from "@/lib/api";
import { Patient } from "@/types";
import {
  Search,
  Plus,
  Trash2,
  Edit2,
  Eye,
  X
} from "lucide-react";

export default function PatientsPage() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingPatient, setEditingPatient] = useState<Patient | null>(null);
  const [viewingPatient, setViewingPatient] = useState<Patient | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Form State
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [dob, setDob] = useState("");
  const [gender, setGender] = useState("Female");
  const [bloodGroup, setBloodGroup] = useState("O+");
  const [medicalHistory, setMedicalHistory] = useState("");
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadPatients();
  }, []);

  const loadPatients = async () => {
    setIsLoading(true);
    try {
      const data = await apiRequest<Patient[]>("/patients");
      setPatients(data || []);
    } catch {
      // ignore
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateOrUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      if (editingPatient) {
        const updated = await apiRequest<Patient>(`/patients/${editingPatient.id}`, {
          method: "PUT",
          body: JSON.stringify({
            name,
            age,
            dob,
            gender,
            blood_group: bloodGroup,
            medical_history: medicalHistory,
            notes,
          }),
        });
        setPatients(patients.map((p) => (p.id === updated.id ? updated : p)));
        setEditingPatient(null);
      } else {
        const newP = await apiRequest<Patient>("/patients", {
          method: "POST",
          body: JSON.stringify({
            name,
            age,
            dob,
            gender,
            blood_group: bloodGroup,
            medical_history: medicalHistory,
            notes,
          }),
        });
        setPatients([newP, ...patients]);
        setShowAddModal(false);
      }
      resetForm();
    } catch (err: any) {
      setError(err.message || "Failed to save patient record");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to remove this patient record?")) return;
    try {
      await apiRequest(`/patients/${id}`, { method: "DELETE" });
      setPatients(patients.filter((p) => p.id !== id));
    } catch (err: any) {
      alert("Failed to delete patient: " + err.message);
    }
  };

  const resetForm = () => {
    setName("");
    setAge("");
    setDob("");
    setGender("Female");
    setBloodGroup("O+");
    setMedicalHistory("");
    setNotes("");
    setError(null);
  };

  const openEdit = (p: Patient) => {
    setEditingPatient(p);
    setName(p.name);
    setAge(p.age || "");
    setDob(p.dob || "");
    setGender(p.gender || "Female");
    setBloodGroup(p.blood_group || "O+");
    setMedicalHistory(p.medical_history || "");
    setNotes(p.notes || "");
    setShowAddModal(true);
  };

  const filteredPatients = patients.filter(
    (p) =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.patient_code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <WorkspaceLayout
      categoryLabel="Clinical Directory"
      title="Patient Management"
      subtitle="Radiological subjects, clinical history, and demographic records linked to neural MRI inferences."
    >
      <div className="space-y-12">
        {/* Minimalist Top Control Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-6 border-b border-[#181818]">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#666666]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search patient name or ID..."
              className="w-full pl-10 pr-4 py-2 rounded-[22.5px] bg-[#000000] border border-[#222222] text-[13px] text-[#ffffff] placeholder-[#666666] focus:outline-none focus:border-[#8052ff]"
            />
          </div>

          <button
            onClick={() => {
              resetForm();
              setEditingPatient(null);
              setShowAddModal(true);
            }}
            className="bg-[#8052ff] hover:opacity-90 active:scale-95 text-[#ffffff] text-[14px] font-semibold uppercase tracking-[0.025em] rounded-[22.5px] px-[20px] py-[12px] inline-flex items-center gap-2 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Register Subject</span>
          </button>
        </div>

        {/* Floating Patient Roster (Dala floating card / row aesthetic on pure void) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {isLoading ? (
            <div className="col-span-full py-16 text-center text-[18px] font-extralight text-[#9a9a9a]">
              Loading patient directory...
            </div>
          ) : filteredPatients.length > 0 ? (
            filteredPatients.map((p) => (
              <div
                key={p.id}
                className="space-y-3 p-6 rounded-[24px] border border-[#181818] hover:border-[#333333] transition-colors group bg-[#000000]"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[12px] font-semibold uppercase tracking-[0.025em] text-[#8052ff]">
                    {p.patient_code}
                  </span>
                  <div className="flex items-center gap-2 text-[#666666]">
                    <button
                      onClick={() => openEdit(p)}
                      title="Edit Subject"
                      className="hover:text-white transition-colors cursor-pointer"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(p.id)}
                      title="Remove Record"
                      className="hover:text-red-400 transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div>
                  <h3 className="text-[24px] font-normal text-[#ffffff] tracking-tight group-hover:text-[#8052ff] transition-colors">
                    {p.name}
                  </h3>
                  <p className="text-[14px] font-extralight text-[#9a9a9a] pt-1">
                    {p.age ? `${p.age} Yrs` : "Age Unspecified"} • {p.gender || "Gender Unspecified"} • Blood {p.blood_group || "Unknown"}
                  </p>
                </div>

                {p.medical_history && (
                  <p className="text-[13px] font-extralight text-[#bdbdbd] line-clamp-2 pt-2 border-t border-[#141414]">
                    {p.medical_history}
                  </p>
                )}
              </div>
            ))
          ) : (
            <div className="col-span-full py-16 text-center text-[18px] font-extralight text-[#9a9a9a]">
              No patient records found. Register a subject above.
            </div>
          )}
        </div>

        {/* Modal on Pure Black Void */}
        {showAddModal && (
          <div className="fixed inset-0 z-50 bg-[#000000]/90 backdrop-blur-md flex items-center justify-center p-4">
            <div className="w-full max-w-lg bg-[#000000] border border-[#222222] rounded-[24px] p-8 space-y-6">
              <div className="flex items-center justify-between pb-3 border-b border-[#181818]">
                <div className="space-y-1">
                  <span className="text-[12px] font-semibold uppercase tracking-[0.025em] text-[#ffb829] block">
                    {editingPatient ? "Modify Subject" : "New Registration"}
                  </span>
                  <h3 className="text-[24px] font-normal text-[#ffffff]">
                    {editingPatient ? editingPatient.name : "Register Clinical Subject"}
                  </h3>
                </div>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="text-[#9a9a9a] hover:text-[#ffffff] text-xl cursor-pointer"
                >
                  ✕
                </button>
              </div>

              {error && (
                <div className="p-3 text-[13px] text-red-400 border border-red-500/40">
                  {error}
                </div>
              )}

              <form onSubmit={handleCreateOrUpdate} className="space-y-4 text-[14px]">
                <div>
                  <label className="text-[12px] font-extralight text-[#9a9a9a] block mb-1">
                    Full Name / Anonymous Identifier *
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Eleanor Vance"
                    className="w-full px-4 py-2.5 rounded-[12px] bg-[#000000] border border-[#222222] text-[#ffffff] focus:outline-none focus:border-[#8052ff]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[12px] font-extralight text-[#9a9a9a] block mb-1">Age</label>
                    <input
                      type="text"
                      value={age}
                      onChange={(e) => setAge(e.target.value)}
                      placeholder="e.g. 48"
                      className="w-full px-4 py-2.5 rounded-[12px] bg-[#000000] border border-[#222222] text-[#ffffff] focus:outline-none focus:border-[#8052ff]"
                    />
                  </div>
                  <div>
                    <label className="text-[12px] font-extralight text-[#9a9a9a] block mb-1">Gender</label>
                    <select
                      value={gender}
                      onChange={(e) => setGender(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-[12px] bg-[#000000] border border-[#222222] text-[#ffffff] focus:outline-none focus:border-[#8052ff]"
                    >
                      <option value="Female">Female</option>
                      <option value="Male">Male</option>
                      <option value="Other">Other</option>
                      <option value="Unspecified">Unspecified</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-[12px] font-extralight text-[#9a9a9a] block mb-1">
                    Clinical History & Symptoms
                  </label>
                  <textarea
                    rows={3}
                    value={medicalHistory}
                    onChange={(e) => setMedicalHistory(e.target.value)}
                    placeholder="e.g. Chronic fronto-temporal cephalalgia, blurred vision..."
                    className="w-full px-4 py-2.5 rounded-[12px] bg-[#000000] border border-[#222222] text-[#ffffff] focus:outline-none focus:border-[#8052ff]"
                  />
                </div>

                <div className="pt-4 flex items-center justify-end gap-4">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="text-[13px] uppercase font-semibold text-[#9a9a9a] hover:text-[#ffffff] transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="bg-[#8052ff] hover:opacity-90 active:scale-95 text-[#ffffff] text-[13px] font-semibold uppercase tracking-[0.025em] rounded-[22.5px] px-6 py-2.5 cursor-pointer disabled:opacity-50"
                  >
                    {isSubmitting ? "Saving..." : editingPatient ? "Save Changes" : "Register"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </WorkspaceLayout>
  );
}
