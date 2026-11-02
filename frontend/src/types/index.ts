export type UserRole = "administrator" | "researcher" | "medical_professional" | "admin" | "doctor" | "patient";

export interface User {
  id: string;
  email: string;
  full_name: string;
  phone_number?: string;
  role: UserRole;
  is_active: boolean;
  created_at: string;
}

export interface AuthResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  user: User;
}

export interface Patient {
  id: string;
  patient_code: string;
  name: string;
  dob?: string;
  age?: string;
  gender?: string;
  blood_group?: string;
  medical_history?: string;
  notes?: string;
  assigned_doctor_id?: string;
  created_at: string;
  scan_count?: number;
}

export interface MRIScan {
  id: string;
  original_filename: string;
  file_path: string;
  file_size: number;
  mime_type: string;
  uploaded_at: string;
  patient_id?: string;
  has_prediction: boolean;
}

export interface ClassProbability {
  class_name: string;
  probability: number;
  percentage: number;
}

export interface Prediction {
  id: string;
  scan_id: string;
  predicted_class: "Glioma Tumor" | "Meningioma Tumor" | "Pituitary Tumor" | string;
  confidence: number;
  confidence_percentage: number;
  probabilities: ClassProbability[];
  inference_time_ms: number;
  heatmap_path?: string;
  pure_heatmap_path?: string;
  model_version: string;
  created_at: string;
  scan_url?: string;
}

export interface ChatMessage {
  id: string;
  sender_role: "user" | "assistant" | "system";
  content: string;
  model_used?: string;
  created_at: string;
}

export interface ChatConversation {
  id: string;
  title: string;
  scan_id?: string;
  created_at: string;
  messages: ChatMessage[];
}

export interface Report {
  id: string;
  prediction_id: string;
  report_code: string;
  pdf_path: string;
  download_url: string;
  generated_at: string;
  predicted_class?: string;
  confidence?: number;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  notification_type: "info" | "success" | "warning" | "error";
  is_read: boolean;
  created_at: string;
}

export interface ClassDistributionItem {
  name: string;
  count: number;
  percentage: number;
}

export interface DailyTrendItem {
  date: string;
  scans: number;
  glioma: number;
  meningioma: number;
  pituitary: number;
}

export interface AnalyticsOverview {
  total_scans: number;
  total_predictions: number;
  average_confidence: number;
  average_inference_time_ms: number;
  class_distribution: ClassDistributionItem[];
  daily_trends: DailyTrendItem[];
  recent_activity_count: number;
}

export interface SystemHealth {
  status: string;
  model_loaded: boolean;
  model_name: string;
  model_backbone: string;
  num_classes: number;
  accuracy_rating: number;
  total_users: number;
  total_scans: number;
  groq_api_status: string;
  storage_used_mb: number;
}

export interface ModelTelemetry {
  model_name: string;
  tagline: string;
  model_filename: string;
  framework: string;
  backbone: string;
  input_shape: number[];
  num_classes: number;
  classes: string[];
  benchmark_accuracy: number;
  is_loaded: boolean;
  load_error: string | null;
  layers_architecture: Array<{
    layer_idx: number;
    name: string;
    type: string;
    shape: string;
  }>;
}

export interface QuantumCircuitSpec {
  name: string;
  qubits: number;
  hilbert_dimension: number;
  encoding_technique: string;
  circuit_depth: number;
  entanglement_topology: string;
  parameter_count: number;
  measurement_basis: string;
  classical_reduction: string;
  benchmark_metrics: {
    simulated_accuracy: number;
    f1_macro: number;
    training_epochs: number;
    quantum_hardware_emulation: string;
  };
  circuit_ascii: string;
}

export interface QuantumResearchData {
  title: string;
  paradigm: string;
  mathematical_foundations: Record<string, string>;
  circuits: QuantumCircuitSpec[];
  quantum_vs_classical_comparison: Array<{
    model: string;
    architecture: string;
    parameters: string;
    test_accuracy: number;
    inference_latency_ms: number;
    deployment_status: string;
  }>;
  quantum_advantage_analysis: string;
}

export interface PerformanceResponse {
  model_telemetry: ModelTelemetry;
  evaluation_benchmark: {
    dataset_name: string;
    test_samples_count: number;
    test_accuracy: number;
    f1_macro: number;
    f1_weighted: number;
    precision_macro: number;
    recall_macro: number;
    confusion_matrix: {
      classes: string[];
      matrix: number[][];
    };
    classification_report: Array<{
      class_name: string;
      precision: number;
      recall: number;
      f1_score: number;
      support: number;
    }>;
    training_metadata: Record<string, any>;
  };
  quantum_research: QuantumResearchData;
}
