"use client";

import React, { useState } from "react";
import WorkspaceLayout from "@/components/workspace-layout";
import {
  ChevronDown,
  ChevronUp,
} from "lucide-react";

export default function ResearchCenterPage() {
  const [activeTab, setActiveTab] = useState<"tumors" | "anatomy" | "mri" | "ai_qml">("tumors");
  const [expandedSection, setExpandedSection] = useState<string | null>("glioma");

  const toggleSection = (id: string) => {
    setExpandedSection(expandedSection === id ? null : id);
  };

  return (
    <WorkspaceLayout
      categoryLabel="Academic Compendium"
      title="Research & Methodology"
      subtitle="Comprehensive clinical literature on neuro-oncology histology, radiological physics, deep convolutional architectures, and Quantum Machine Learning."
    >
      <div className="space-y-16">
        {/* Category Navigation Tabs (Dala Text Tabs on Void) */}
        <div className="flex items-center gap-8 text-[13px] uppercase tracking-[0.025em] pb-4 border-b border-[#181818] overflow-x-auto">
          {[
            { id: "tumors", label: "Tumor Histology" },
            { id: "anatomy", label: "Brain Anatomy" },
            { id: "mri", label: "MRI Physics" },
            { id: "ai_qml", label: "AI & Quantum Research" },
          ].map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`transition-colors whitespace-nowrap cursor-pointer pb-2 ${
                  isActive
                    ? "text-[#ffffff] font-semibold border-b-2 border-[#8052ff]"
                    : "text-[#9a9a9a] hover:text-[#ffffff]"
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Tab 1: Tumor Classifications */}
        {activeTab === "tumors" && (
          <div className="space-y-12">
            {/* Glioma Accordion */}
            <div className="border-b border-[#181818] pb-8">
              <button
                onClick={() => toggleSection("glioma")}
                className="w-full text-left flex items-center justify-between cursor-pointer py-3"
              >
                <div className="space-y-1">
                  <span className="text-[12px] font-semibold uppercase tracking-[0.025em] text-[#8052ff] block">
                    Class 0 • Intra-axial
                  </span>
                  <h3 className="text-[28px] sm:text-[36px] font-normal tracking-[-0.48px] text-[#ffffff]">
                    Glioma (Astrocytoma, Oligodendroglioma, Glioblastoma)
                  </h3>
                </div>
                {expandedSection === "glioma" ? (
                  <ChevronUp className="w-5 h-5 text-[#8052ff]" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-[#9a9a9a]" />
                )}
              </button>

              {expandedSection === "glioma" && (
                <div className="pt-6 space-y-6 text-[#bdbdbd] font-extralight text-[16px] leading-relaxed">
                  <p>
                    Gliomas represent approximately 80% of all malignant primary brain neoplasms, originating from glial precursor cells (astrocytes, oligodendrocytes, ependymal cells) within the cerebral parenchyma.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-4">
                    <div className="space-y-1">
                      <span className="text-[12px] uppercase font-semibold text-[#ffffff] block">Infiltration Vector</span>
                      <p className="text-[14px] text-[#9a9a9a]">Microscopic cellular infiltration extends well beyond macroscopic T2-hyperintense margins.</p>
                    </div>
                    <div className="space-y-1">
                      <span className="text-[12px] uppercase font-semibold text-[#ffffff] block">Radiological Signature</span>
                      <p className="text-[14px] text-[#9a9a9a]">Ring-enhancing margins surrounding central hypointense necrotic cavities on T1+C.</p>
                    </div>
                    <div className="space-y-1">
                      <span className="text-[12px] uppercase font-semibold text-[#ffffff] block">Molecular Markers</span>
                      <p className="text-[14px] text-[#9a9a9a]">IDH1/IDH2 mutation status, 1p/19q codeletion, and MGMT promoter methylation.</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Meningioma Accordion */}
            <div className="border-b border-[#181818] pb-8">
              <button
                onClick={() => toggleSection("meningioma")}
                className="w-full text-left flex items-center justify-between cursor-pointer py-3"
              >
                <div className="space-y-1">
                  <span className="text-[12px] font-semibold uppercase tracking-[0.025em] text-[#ffb829] block">
                    Class 1 • Extra-axial
                  </span>
                  <h3 className="text-[28px] sm:text-[36px] font-normal tracking-[-0.48px] text-[#ffffff]">
                    Meningioma (Arachnoid Cap Cell Neoplasm)
                  </h3>
                </div>
                {expandedSection === "meningioma" ? (
                  <ChevronUp className="w-5 h-5 text-[#ffb829]" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-[#9a9a9a]" />
                )}
              </button>

              {expandedSection === "meningioma" && (
                <div className="pt-6 space-y-6 text-[#bdbdbd] font-extralight text-[16px] leading-relaxed">
                  <p>
                    Meningiomas arise from arachnoid cap cells of the meninges. Predominantly slow-growing and benign (WHO Grade I ~80%), they compress adjacent neural parenchyma rather than directly invading brain tissue.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-4">
                    <div className="space-y-1">
                      <span className="text-[12px] uppercase font-semibold text-[#ffffff] block">Dural Tail Sign</span>
                      <p className="text-[14px] text-[#9a9a9a]">Homogeneous, avid post-contrast enhancement with an adjacent tapering dural margin.</p>
                    </div>
                    <div className="space-y-1">
                      <span className="text-[12px] uppercase font-semibold text-[#ffffff] block">CSF Cleft</span>
                      <p className="text-[14px] text-[#9a9a9a]">Thin rim of cerebrospinal fluid separating extra-axial mass from cerebral cortex.</p>
                    </div>
                    <div className="space-y-1">
                      <span className="text-[12px] uppercase font-semibold text-[#ffffff] block">Bone Hyperostosis</span>
                      <p className="text-[14px] text-[#9a9a9a]">Frequent reactive sclerosis or hyperostotic changes of the adjacent calvarium.</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Pituitary Accordion */}
            <div className="border-b border-[#181818] pb-8">
              <button
                onClick={() => toggleSection("pituitary")}
                className="w-full text-left flex items-center justify-between cursor-pointer py-3"
              >
                <div className="space-y-1">
                  <span className="text-[12px] font-semibold uppercase tracking-[0.025em] text-[#15846e] block">
                    Class 2 • Sellar Region
                  </span>
                  <h3 className="text-[28px] sm:text-[36px] font-normal tracking-[-0.48px] text-[#ffffff]">
                    Pituitary Adenoma & Sellar Lesions
                  </h3>
                </div>
                {expandedSection === "pituitary" ? (
                  <ChevronUp className="w-5 h-5 text-[#15846e]" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-[#9a9a9a]" />
                )}
              </button>

              {expandedSection === "pituitary" && (
                <div className="pt-6 space-y-6 text-[#bdbdbd] font-extralight text-[16px] leading-relaxed">
                  <p>
                    Pituitary adenomas originate from neuroendocrine epithelial cells within the anterior adenohypophysis, situated in the sella turcica of the sphenoid bone immediately beneath the optic chiasm.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-4">
                    <div className="space-y-1">
                      <span className="text-[12px] uppercase font-semibold text-[#ffffff] block">Snowman Figure</span>
                      <p className="text-[14px] text-[#9a9a9a]">Waisting by the diaphragma sellae during suprasellar extension into third ventricle.</p>
                    </div>
                    <div className="space-y-1">
                      <span className="text-[12px] uppercase font-semibold text-[#ffffff] block">Chiasmal Compression</span>
                      <p className="text-[14px] text-[#9a9a9a]">Superior displacement of optic chiasm producing bitemporal hemianopsia visual field deficits.</p>
                    </div>
                    <div className="space-y-1">
                      <span className="text-[12px] uppercase font-semibold text-[#ffffff] block">Cavernous Invasion</span>
                      <p className="text-[14px] text-[#9a9a9a]">Lateral extension encasing internal carotid arteries (Knosp radiological criteria).</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab 2: Brain Anatomy */}
        {activeTab === "anatomy" && (
          <div className="space-y-12">
            <div className="space-y-4">
              <span className="text-[12px] font-semibold uppercase tracking-[0.025em] text-[#ffb829] block">
                Neuroanatomy
              </span>
              <h3 className="text-[36px] font-normal tracking-tight text-[#ffffff]">
                Cerebral Architecture & Eloquent Cortex
              </h3>
              <p className="text-[18px] font-extralight text-[#bdbdbd] leading-relaxed max-w-3xl">
                Tumor localization relative to eloquent brain regions directly determines surgical respectability, functional neurological deficit risks, and radiotherapy treatment planning margins.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 pt-4">
              <div className="space-y-3">
                <span className="text-[14px] uppercase font-semibold text-[#ffffff] block">Motor & Sensory Strips</span>
                <p className="text-[16px] font-extralight text-[#9a9a9a] leading-relaxed">
                  The precentral gyrus (primary motor cortex, Brodmann area 4) and postcentral gyrus (primary somatosensory cortex) flank the central sulcus. Mass effect here induces contralateral hemiparesis or sensory deficits.
                </p>
              </div>
              <div className="space-y-3">
                <span className="text-[14px] uppercase font-semibold text-[#ffffff] block">Eloquent Language Centers</span>
                <p className="text-[16px] font-extralight text-[#9a9a9a] leading-relaxed">
                  Broca area (inferior frontal gyrus pars opercularis and triangularis) controls expressive speech; Wernicke area (posterior superior temporal gyrus) governs receptive comprehension. Connected via the arcuate fasciculus.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: MRI Physics */}
        {activeTab === "mri" && (
          <div className="space-y-12">
            <div className="space-y-4">
              <span className="text-[12px] font-semibold uppercase tracking-[0.025em] text-[#ffb829] block">
                Radiological Biophysics
              </span>
              <h3 className="text-[36px] font-normal tracking-tight text-[#ffffff]">
                Nuclear Magnetic Resonance Pulse Sequences
              </h3>
              <p className="text-[18px] font-extralight text-[#bdbdbd] leading-relaxed max-w-3xl">
                MRI utilizes radiofrequency pulses in a superconducting magnetic field ($B_0$) to manipulate hydrogen proton spin vectors, yielding distinct relaxation parameters.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-4">
              <div className="space-y-2">
                <span className="text-[14px] uppercase font-semibold text-[#ffffff] block">T1-Weighted (Spin-Lattice)</span>
                <p className="text-[15px] font-extralight text-[#9a9a9a]">Short TR/TE. Fat is bright, CSF is dark. Optimal for anatomical fidelity and paramagnetic gadolinium contrast enhancement.</p>
              </div>
              <div className="space-y-2">
                <span className="text-[14px] uppercase font-semibold text-[#ffffff] block">T2-Weighted (Spin-Spin)</span>
                <p className="text-[15px] font-extralight text-[#9a9a9a]">Long TR/TE. Free water and CSF appear hyperintense. Highlights pathological cerebral edema and cyst fluid.</p>
              </div>
              <div className="space-y-2">
                <span className="text-[14px] uppercase font-semibold text-[#ffffff] block">FLAIR Sequence</span>
                <p className="text-[15px] font-extralight text-[#9a9a9a]">Fluid-Attenuated Inversion Recovery nulls free ventricular CSF, leaving peritumoral vasogenic edema brightly conspicuous.</p>
              </div>
            </div>
          </div>
        )}

        {/* Tab 4: AI & Quantum */}
        {activeTab === "ai_qml" && (
          <div className="space-y-12">
            <div className="space-y-4">
              <span className="text-[12px] font-semibold uppercase tracking-[0.025em] text-[#ffb829] block">
                Algorithmic Foundations
              </span>
              <h3 className="text-[36px] font-normal tracking-tight text-[#ffffff]">
                Convolutional Networks & Quantum Hilbert Mapping
              </h3>
              <p className="text-[18px] font-extralight text-[#bdbdbd] leading-relaxed max-w-3xl">
                The platform bridges classical compound-scaled neural representations with exploratory quantum circuits that exploit quantum entanglement and superposition.
              </p>
            </div>

            <div className="space-y-8 pt-4">
              <div className="space-y-2">
                <span className="text-[14px] uppercase font-semibold text-[#8052ff] block">EfficientNetB3 Compound Scaling</span>
                <p className="text-[16px] font-extralight text-[#9a9a9a] leading-relaxed">
                  Unlike conventional networks that arbitrarily scale depth, width, or resolution, EfficientNet uniformly scales all three dimensions with fixed compound coefficients $\alpha \cdot \beta^2 \cdot \gamma^2 \approx 2$, yielding state-of-the-art 96.24% test accuracy with 12.2 million parameters.
                </p>
              </div>

              <div className="space-y-2">
                <span className="text-[14px] uppercase font-semibold text-[#ffb829] block">Mathematical Grad-CAM Activations</span>
                <p className="text-[16px] font-extralight text-[#9a9a9a] leading-relaxed">
                  Gradients calculated via TensorFlow GradientTape weight the 10 × 10 × 1536 feature maps of the top_activation layer to pinpoint exact morphological tumor borders.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </WorkspaceLayout>
  );
}
