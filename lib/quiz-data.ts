export const QUIZ_ID = "carb-ap";

export type Question = {
  id: number;
  text: string;
  choices: string[];
  correct: number;
  timeSec: number;
  image?: string;
  explain: string;
};

export const QUESTIONS: Question[] = [
  {
    id: 1,
    text: "เมื่อ monosaccharide สองโมเลกุลรวมกันเป็น disaccharide เกิดพันธะประเภทใด และมีกระบวนการอะไรเกิดขึ้น?",
    choices: [
      "glycosidic linkage โดยปล่อยโมเลกุลน้ำ 1 โมเลกุล",
      "hydrogen bond โดยดูดซับโมเลกุลน้ำ 1 โมเลกุล",
      "ionic bond โดยแลกอิเล็กตรอนระหว่าง –OH กับ H",
      "phosphodiester bond โดยใช้ ATP",
    ],
    correct: 0,
    timeSec: 25,
    image: "/images/q1.png",
    explain: "dehydration synthesis → สร้าง glycosidic linkage + ปล่อย H₂O",
  },
  {
    id: 2,
    text: "starch กับ cellulose ต่างกันอย่างไร ทั้งที่ประกอบด้วย glucose เป็น monomer เหมือนกัน?",
    choices: [
      "starch เป็น protein ส่วน cellulose เป็น lipid",
      "starch มี α-1,4 linkage (และ α-1,6 ที่แขนง) ส่วน cellulose มี β-1,4",
      "starch มี β-1,4 linkage ส่วน cellulose มี α-1,4",
      "starch พบในพืช ส่วน cellulose พบในสัตว์",
    ],
    correct: 1,
    timeSec: 30,
    image: "/images/q2.png",
    explain: "monomer เดียวกัน แต่ glycosidic linkage ต่างกัน → โครงสร้างและหน้าที่ต่างกัน",
  },
  {
    id: 3,
    text: "Amylopectin ในพืช กับ Glycogen ในสัตว์ มีลักษณะโครงสร้างร่วมกันข้อใดที่สอดคล้องกับหน้าที่ energy storage?",
    choices: [
      "เป็นโซ่ตรงยาวทั้งหมด (เฉพาะ α-1,4) ไม่มีแขนง",
      "ประกอบด้วย amino acid ไม่ใช่ sugar",
      "มี β-1,4 linkages ทำให้แข็งและย่อยยาก",
      "มี branching (α-1,6) ทำให้เก็บ glucose ได้มากและแตกออกเร็วเมื่อต้องการ",
    ],
    correct: 3,
    timeSec: 30,
    image: "/images/q3.png",
    explain: "amylose = linear (α-1,4) · amylopectin/glycogen = branched (α-1,6)",
  },
  {
    id: 4,
    text: "Disaccharide ต่อไปนี้ ข้อใดมี glycosidic linkage ผิด?",
    choices: [
      "maltose → α-1,4",
      "sucrose → α-1,2",
      "lactose → β-1,4",
      "sucrose → α-1,4",
    ],
    correct: 3,
    timeSec: 30,
    image: "/images/q4.png",
    explain: "sucrose ถูกต้องคือ α-1,2 · maltose = α-1,4 · lactose = β-1,4",
  },
  {
    id: 5,
    text: "เมื่อเอนไซม์ย่อย starch ในลำไส้เล็ก กระบวนการที่เกิดขึ้นคืออะไร?",
    choices: [
      "hydrolysis — ใช้ H₂O ตัด glycosidic linkage ได้ glucose",
      "dehydration synthesis — ปล่อย H₂O สร้าง glycosidic linkage ได้ glucose",
      "hydrolysis — ปล่อย H₂O สร้าง hydrogen bond ได้ glucose",
      "dehydration synthesis — ใช้ H₂O ตัด phosphodiester bond ได้ glucose",
    ],
    correct: 0,
    timeSec: 30,
    image: "/images/q5.png",
    explain: "hydrolysis = polymer → monomer (ใช้น้ำ ตัด glycosidic linkage)",
  },
];

export const MAX_SCORE = QUESTIONS.length * 1000;

export function getQuestion(num: number): Question | undefined {
  return QUESTIONS.find((q) => q.id === num);
}
