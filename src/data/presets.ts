import { PhysicsBranch, GradeLevel, TeachingMethod, LectureDuration } from "../types";

export interface PhysicsPreset {
  id: string;
  title: string;
  topic: string;
  subTopic: string;
  branch: PhysicsBranch;
  gradeLevel: GradeLevel;
  duration: LectureDuration;
  method: TeachingMethod;
  description: string;
  iconName: string;
  tags: string[];
}

export const PRESET_TOPICS: PhysicsPreset[] = [
  {
    id: "preset_newton2",
    title: "Định luật II Newton & Động lực học",
    topic: "Định luật II Newton và phương trình chuyển động",
    subTopic: "Mối liên hệ giữa Lực, Khối lượng và Gia tốc",
    branch: "mechanics",
    gradeLevel: "lop10",
    duration: "45min",
    method: "5e_model",
    description: "Khám phá bản chất của lực, quán tính và mối liên hệ F = m.a qua thí nghiệm xe trượt.",
    iconName: "Activity",
    tags: ["Cơ học", "Lớp 10", "Newton", "Lực"]
  },
  {
    id: "preset_projectile",
    title: "Chuyển động ném xiên & Ném ngang",
    topic: "Chuyển động ném xiên trong trọng trường",
    subTopic: "Tầm xa, độ cao cực đại và phương trình quỹ đạo",
    branch: "mechanics",
    gradeLevel: "lop10",
    duration: "45min",
    method: "interactive_discovery",
    description: "Phân tích chuyển động trên hai phương Ox, Oy và mô phỏng quỹ đạo parabol trực quan.",
    iconName: "Target",
    tags: ["Cơ học", "Quỹ đạo", "Trọng trường"]
  },
  {
    id: "preset_pendulum",
    title: "Dao động điều hòa - Con lắc đơn & Lò xo",
    topic: "Dao động điều hòa và Sự bảo toàn cơ năng",
    subTopic: "Chu kỳ dao động, phương trình ly độ và vận tốc",
    branch: "waves_oscillations",
    gradeLevel: "lop11",
    duration: "45min",
    method: "5e_model",
    description: "Tìm hiểu phương trình x = A cos(omega.t + phi) và sự chuyển hóa giữa động năng - thế năng.",
    iconName: "RefreshCw",
    tags: ["Dao động", "Lớp 11", "Con lắc", "Cơ năng"]
  },
  {
    id: "preset_snell",
    title: "Khúc xạ ánh sáng & Phản xạ toàn phần",
    topic: "Định luật khúc xạ ánh sáng và Ứng dụng sợi quang",
    subTopic: "Chiết suất môi trường và góc khúc xạ giới hạn",
    branch: "optics",
    gradeLevel: "lop11",
    duration: "45min",
    method: "stem_hands_on",
    description: "Thí nghiệm tia sáng truyền qua lăng kính, nước, thủy tinh và hiện tượng phản xạ toàn phần.",
    iconName: "Sun",
    tags: ["Quang học", "Lớp 11", "Khúc xạ", "Cáp quang"]
  },
  {
    id: "preset_ohm",
    title: "Định luật Ôm cho đoạn mạch & Toàn mạch",
    topic: "Định luật Ôm và Ghép nối tiếp, song song",
    subTopic: "Cường độ dòng điện, hiệu điện thế và công suất toả nhiệt Joule-Lenz",
    branch: "electromagnetism",
    gradeLevel: "lop11",
    duration: "45min",
    method: "standard_theory",
    description: "Mô phỏng dòng electron chạy trong mạch điện, đồng hồ đo Vôn kế và Ampe kế tương tác.",
    iconName: "Zap",
    tags: ["Điện học", "Lớp 11", "Định luật Ôm", "Mạch điện"]
  },
  {
    id: "preset_photoelectric",
    title: "Hiện tượng Quang điện & Thuyết lượng tử ánh sáng",
    topic: "Hiện tượng quang điện ngoài và Lượng tử năng lượng Planck - Einstein",
    subTopic: "Giới hạn quang điện và phương trình Einstein",
    branch: "quantum_nuclear",
    gradeLevel: "lop12",
    duration: "90min",
    method: "interactive_discovery",
    description: "Khám phá bản chất lưỡng tính sóng - hạt của ánh sáng và pin mặt trời.",
    iconName: "Atom",
    tags: ["Lượng tử", "Lớp 12", "Photon", "Einstein"]
  },
  {
    id: "preset_gravity",
    title: "Định luật vạn vật hấp dẫn & Chuyển động vệ tinh",
    topic: "Định luật vạn vật hấp dẫn của Newton và Vũ trụ học",
    subTopic: "Vận tốc vũ trụ cấp I, cấp II và quỹ đạo vệ tinh nhân tạo",
    branch: "astrophysics",
    gradeLevel: "lop10",
    duration: "45min",
    method: "5e_model",
    description: "Giải thích quỹ đạo Mặt Trăng quay quanh Trái Đất và lực hấp dẫn chi phối vũ trụ.",
    iconName: "Globe",
    tags: ["Thiên văn", "Trọng lực", "Vệ tinh"]
  },
  {
    id: "preset_thermo",
    title: "Nguyên lý I & II Nhiệt động lực học",
    topic: "Nhiệt lượng, Nội năng và Động cơ nhiệt",
    subTopic: "Hiệu suất động cơ Carnot và biến thiên entropy",
    branch: "thermodynamics",
    gradeLevel: "lop12",
    duration: "45min",
    method: "standard_theory",
    description: "Nguyên lý hoạt động của động cơ đốt trong và tủ lạnh dân dụng.",
    iconName: "Flame",
    tags: ["Nhiệt học", "Lớp 12", "Động cơ nhiệt"]
  }
];

export const BRANCH_LABELS: Record<PhysicsBranch, { name: string; color: string }> = {
  mechanics: { name: "Cơ học (Mechanics)", color: "text-blue-400 bg-blue-500/10 border-blue-500/30" },
  thermodynamics: { name: "Nhiệt học (Thermodynamics)", color: "text-orange-400 bg-orange-500/10 border-orange-500/30" },
  electromagnetism: { name: "Điện & Từ học (Electromagnetism)", color: "text-yellow-400 bg-yellow-500/10 border-yellow-500/30" },
  optics: { name: "Quang học (Optics)", color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/30" },
  waves_oscillations: { name: "Dao động & Sóng (Waves)", color: "text-purple-400 bg-purple-500/10 border-purple-500/30" },
  quantum_nuclear: { name: "Lượng tử & Hạt nhân (Quantum)", color: "text-pink-400 bg-pink-500/10 border-pink-500/30" },
  astrophysics: { name: "Thiên văn & Vũ trụ (Astrophysics)", color: "text-cyan-400 bg-cyan-500/10 border-cyan-500/30" }
};
