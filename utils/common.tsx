import React from 'react';
import { Question, StudentResult } from '../types';

// --- LIBRARY: LATEX MATH GENERATOR CONFIG ---
export const LATEX_MATH_CONFIG = {
  "name": "latex_math_generator",
  "version": "1.0",
  "description": "Sinh ký hiệu toán học – hình học – công thức LaTeX cho hệ thống thi trắc nghiệm và trình hiển thị.",
  
  "output_rules": {
    "format": "latex_only",
    "inline": "\\( ... \\)",
    "display": "\\[ ... \\]",
    "no_explanation_if_not_requested": true
  },

  "symbols": {
    "angle": {
      "angle": "\\angle",
      "right_angle": "90^{\\circ}",
      "degree": "^{\\circ}",
      "angle_ABC": "\\angle ABC"
    },

    "geometry": {
      "triangle": "\\triangle ABC",
      "segment": "\\overline{AB}",
      "vector": "\\vec{AB}",
      "parallel": "\\parallel",
      "perpendicular": "\\perp",
      "congruent": "\\cong",
      "similar": "\\sim"
    },

    "algebra": {
      "fraction": "\\frac{a}{b}",
      "sqrt": "\\sqrt{a}",
      "nth_root": "\\sqrt[n]{a}",
      "power": "a^n",
      "sum": "\\sum_{i=1}^n a_i",
      "product": "\\prod_{i=1}^n"
    },

    "calculus": {
      "limit": "\\lim_{x \\to a}",
      "derivative": "\\frac{dy}{dx}",
      "integral": "\\int_a^b f(x) dx"
    },

    "logic_sets": {
      "forall": "\\forall",
      "exists": "\\exists",
      "in": "\\in",
      "not_in": "\\notin",
      "subset": "\\subset",
      "union": "\\cup",
      "intersection": "\\cap"
    }
  },

  "usage_instructions": {
    "inline_formula": "Dùng template inline: \\( SYMBOL \\)",
    "display_formula": "Dùng template display: \\[ SYMBOL \\]",
    "syntax_note": "Không được tự động thêm text ngoài công thức.",
    "response_examples": {
      "ask: gốc vuông ABC": "output: \\( \\angle ABC = 90^{\\circ} \\)",
      "ask: cho tôi ký hiệu AB song song CD": "output: \\( AB \\parallel CD \\)"
    }
  }
};

// --- External Lib Loading ---
export const loadExternalLibs = async () => {
  if (!(window as any).MathJax) {
    (window as any).MathJax = {
      tex: {
        inlineMath: [['\\(', '\\)'], ['$', '$']],
        displayMath: [['\\[', '\\]'], ['$$', '$$']],
        packages: {'[+]': ['mhchem', 'ams']}
      },
      loader: { load: ['[tex]/mhchem', '[tex]/ams'] },
      startup: { typeset: false }
    };
  }

  const loadScript = (src: string) => new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) { resolve(true); return; }
    const script = document.createElement('script');
    script.src = src;
    script.onload = () => resolve(true);
    script.onerror = reject;
    document.head.appendChild(script);
  });

  try {
    await loadScript('https://cdnjs.cloudflare.com/ajax/libs/mammoth/1.6.0/mammoth.browser.min.js');
    await loadScript('https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js');
    await loadScript('https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-mml-chtml.js');
    await loadScript('https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/prism.min.js');
    await loadScript('https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/plugins/autoloader/prism-autoloader.min.js');
    return true;
  } catch (e) {
    console.error("Lỗi tải thư viện:", e);
    return false;
  }
};

const CodeBlock: React.FC<{ code: string, language: string }> = ({ code, language }) => {
  const codeRef = React.useRef<HTMLElement>(null);

  React.useEffect(() => {
    if ((window as any).Prism && codeRef.current) {
      (window as any).Prism.highlightElement(codeRef.current);
    }
  }, [code, language]);

  const displayLang = language.toUpperCase();
  const prismLang = language.toLowerCase();

  return (
    <div className="my-4 rounded-xl overflow-hidden border border-gray-700 bg-[#1e1e1e] text-[#d4d4d4] font-mono text-sm shadow-xl block w-full text-left relative z-0">
      <div className="flex items-center justify-between px-4 py-2 bg-[#252526] border-b border-gray-700 select-none">
        <div className="flex gap-1.5">
          <div className="w-3 h-3 rounded-full bg-[#ff5f56]"></div>
          <div className="w-3 h-3 rounded-full bg-[#ffbd2e]"></div>
          <div className="w-3 h-3 rounded-full bg-[#27c93f]"></div>
        </div>
        <span className="text-[10px] font-bold text-gray-500 tracking-widest">{displayLang}</span>
      </div>
      <pre className={`p-5 overflow-x-auto m-0 language-${prismLang}`} style={{ backgroundColor: 'transparent' }}>
        <code ref={codeRef} className={`language-${prismLang}`} style={{ whiteSpace: 'pre', display: 'block' }}>{code}</code> 
      </pre>
    </div>
  );
};

const renderInlineMarkdown = (text: string) => {
  if (typeof text !== 'string') return null;
  const parts = text.split(/(`[^`]+`)/g);
  
  return parts.map((part, i) => {
    if (part.startsWith('`') && part.endsWith('`')) {
      const codeContent = part.slice(1, -1);
      return (
        <code key={i} className="font-mono text-xs text-red-500 bg-red-50 px-1.5 py-0.5 rounded border border-red-100 mx-1 align-middle">
          {codeContent}
        </code>
      );
    }
    
    const subParts = part.split(/(\*\*[^\*]+\*\*)/g);
    return (
      <span key={i}>
        {subParts.map((sp, j) => {
          if (sp.startsWith('**') && sp.endsWith('**')) {
            return <strong key={j} className="font-bold text-gray-900">{sp.slice(2, -2)}</strong>;
          }
          return <span key={j}>{sp}</span>;
        })}
      </span>
    );
  });
};

export const MathRenderer: React.FC<{ text: string, allowMarkdown?: boolean }> = ({ text, allowMarkdown = false }) => {
  const containerRef = React.useRef<HTMLSpanElement>(null);

  React.useEffect(() => {
    if (typeof text !== 'string') return;
    if ((window as any).MathJax && (window as any).MathJax.typesetPromise && containerRef.current) {
        (window as any).MathJax.typesetPromise([containerRef.current])
            .catch((err: any) => console.error('MathJax typeset error:', err));
    }
  }, [text]);

  if (typeof text !== 'string') return null;

  if (!allowMarkdown) {
      return <span ref={containerRef}>{text}</span>;
  }

  // Regex phát hiện code block multiline
  const codeBlockRegex = /(```[\s\S]*?```)/g;
  const parts = text.split(codeBlockRegex);

  return (
     <span ref={containerRef} className="block w-full math-renderer-content">
        {parts.map((part, i) => {
            if (part.startsWith('```') && part.endsWith('```')) {
                let rawContent = part.slice(3, -3); 
                let language = 'python';
                let code = rawContent;

                const commonLangs = ['python', 'javascript', 'js', 'java', 'cpp', 'csharp', 'html', 'css', 'sql', 'php', 'ruby', 'swift', 'go', 'rust', 'ts', 'typescript', 'c'];
                
                // Thuật toán tách ngôn ngữ thông minh
                const firstLineBreak = rawContent.indexOf('\n');
                if (firstLineBreak > -1) {
                    const firstLine = rawContent.substring(0, firstLineBreak).trim().toLowerCase();
                    if (firstLine && commonLangs.includes(firstLine)) {
                        language = firstLine;
                        code = rawContent.substring(firstLineBreak + 1);
                    }
                } else {
                    // Xử lý khi ngôn ngữ dính liền mã nguồn: ```pythoni = 0
                    for (const lang of commonLangs) {
                        if (rawContent.toLowerCase().startsWith(lang)) {
                            language = lang;
                            code = rawContent.substring(lang.length);
                            break;
                        }
                    }
                }
                
                return <CodeBlock key={i} code={code} language={language} />;
            }
            
            return <React.Fragment key={i}>{renderInlineMarkdown(part)}</React.Fragment>;
        })}
     </span>
  );
};

export const SmartTextRenderer = ({ text }: { text: string }) => {
    if (typeof text !== 'string') return null;
    const codeBlockRegex = /(```[\s\S]*?```)/g;
    const parts = text.split(codeBlockRegex);

    return (
        <div className="space-y-1.5 text-gray-700 leading-relaxed w-full">
            {parts.map((part, pIdx) => {
                // Nếu là code block, render nguyên khối
                if (part.startsWith('```') && part.endsWith('```')) {
                    return <MathRenderer key={pIdx} text={part} allowMarkdown={true} />;
                }

                // Nếu là text thường, xử lý xuống dòng và format khác
                const lines = part.split('\n');
                return lines.map((line, idx) => {
                    const trimmed = line.trim();
                    if (!trimmed) return <div key={`${pIdx}-${idx}`} className="h-2"></div>;

                    if (trimmed.startsWith('### ')) {
                        return <h3 key={`${pIdx}-${idx}`} className="text-md font-bold text-teal-800 mt-2 mb-1 border-b border-teal-50 pb-1">{trimmed.substring(4)}</h3>;
                    }
                    if (trimmed.startsWith('## ')) {
                        return <h2 key={`${pIdx}-${idx}`} className="text-lg font-black text-teal-900 mt-3 mb-2">{trimmed.substring(3)}</h2>;
                    }

                    const isBullet = trimmed.startsWith('- ') || trimmed.startsWith('* ');
                    const isNumber = /^\d+\.\s/.test(trimmed);
                    
                    let content = trimmed;
                    let className = "";

                    if (isBullet) {
                        content = trimmed.substring(2);
                        className = "pl-4 flex items-start gap-2";
                    } else if (isNumber) {
                        className = "pl-4";
                    }

                    return (
                        <div key={`${pIdx}-${idx}`} className={className}>
                            {isBullet && <span className="text-purple-500 mt-1.5 w-1.5 h-1.5 bg-purple-500 rounded-full flex-shrink-0 block"></span>}
                            <div className={isBullet ? "flex-1" : ""}>
                                <MathRenderer text={content} allowMarkdown={true} />
                            </div>
                        </div>
                    );
                });
            })}
        </div>
    );
};

export const generateSecurityCode = () => Math.random().toString(36).substring(2, 8).toUpperCase();

export const copyToClipboard = (text: string) => {
  const textArea = document.createElement("textarea");
  textArea.value = text;
  textArea.style.position = "fixed";
  textArea.style.left = "-9999px";
  document.body.appendChild(textArea);
  textArea.focus();
  textArea.select();
  try { document.execCommand('copy'); alert("Đã copy mã: " + text); } 
  catch (err) { prompt("Copy thủ công:", text); }
  document.body.removeChild(textArea);
};

export function shuffleArray<T>(array: T[]): T[] {
  const newArr = [...array];
  for (let i = newArr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArr[i], newArr[j]] = [newArr[j], newArr[i]];
  }
  return newArr;
}

export const parseWordSmart = (content: string): Question[] => {
  if (typeof content !== 'string') return [];
  const lines = content.split('\n');
  const newQuestions: Question[] = [];
  let currentSection = "";
  let currentQ: Partial<Question> | null = null;
  let lastTarget: 'question' | 'option' | 'subQuestion' = 'question';

  const sectionRegex = /^(PHẦN\s+[IVX]+\.?|PART\s+\d+|PHẦN\s+\d+)/i;
  const qStartRegex = /^(Câu|Question)\s*\d+[:.]/i;
  const optRegex = /^(\*)?([A-D])\.(.*)/; 
  const subQRegex = /^(\*)?([a-d])\)(.*)/;

  lines.forEach(line => {
    const trimmedLine = line.trim();
    if (!trimmedLine && lastTarget !== 'question') return; 

    if (sectionRegex.test(trimmedLine)) { 
        currentSection = trimmedLine; 
        return; 
    }

    if (qStartRegex.test(trimmedLine)) {
       if (currentQ) {
           if ((!currentQ.options || currentQ.options.length === 0) && (!currentQ.subQuestions || currentQ.subQuestions.length === 0)) {
                currentQ.type = 'text';
           }
           newQuestions.push(currentQ as Question);
       }
       const qText = trimmedLine.replace(qStartRegex, "").trim();
       currentQ = { id: Date.now() + Math.random(), section: currentSection, question: qText, type: 'choice', options: [], subQuestions: [], answer: '' };
       lastTarget = 'question';
       return;
    }

    if (currentQ) {
       const optMatch = trimmedLine.match(optRegex);
       const subMatch = trimmedLine.match(subQRegex);

       if (optMatch) {
          currentQ.type = 'choice';
          const isCorrect = !!optMatch[1];
          const text = optMatch[3].trim();
          currentQ.options?.push(text);
          if (isCorrect) currentQ.answer = text;
          lastTarget = 'option';
       } 
       else if (subMatch) {
          currentQ.type = 'group';
          const isTrue = !!subMatch[1];
          const text = subMatch[3].trim();
          currentQ.subQuestions?.push({ id: Math.random().toString(36).substr(2, 9), content: text, correctAnswer: isTrue });
          lastTarget = 'subQuestion';
       } 
       else {
          if (lastTarget === 'question') {
              currentQ.question += (currentQ.question ? "\n" : "") + line;
          } else if (lastTarget === 'option' && currentQ.options && currentQ.options.length > 0) {
              const lastIdx = currentQ.options.length - 1;
              currentQ.options[lastIdx] += "\n" + line;
              if (currentQ.answer && currentQ.options[lastIdx].startsWith(currentQ.answer)) {
                  currentQ.answer = currentQ.options[lastIdx];
              }
          } else if (lastTarget === 'subQuestion' && currentQ.subQuestions && currentQ.subQuestions.length > 0) {
              const lastIdx = currentQ.subQuestions.length - 1;
              currentQ.subQuestions[lastIdx].content += "\n" + line;
          }
       }
    }
  });

  if (currentQ) {
      if ((!currentQ.options || currentQ.options.length === 0) && (!currentQ.subQuestions || currentQ.subQuestions.length === 0)) currentQ.type = 'text';
      newQuestions.push(currentQ as Question);
  }
  return newQuestions;
};

export const parseStudentImport = (text: string) => {
  if (typeof text !== 'string') return [];
  const lines = text.split('\n').filter(l => l.trim());
  return lines.map(line => {
    const parts = line.split(/[\t,]/).map(p => p.trim());
    if (parts.length >= 2) {
      return {
        id: Date.now().toString() + Math.random().toString(36).substr(2,5),
        name: parts[0],
        className: parts[1],
        email: parts[2] || ''
      };
    }
    return null;
  }).filter(Boolean);
};

// --- EXPORT RESULTS TO EXCEL ---
/**
 * Xuất danh sách kết quả học sinh ra file Excel sử dụng thư viện XLSX.
 * @param results Danh sách kết quả cần xuất
 * @param title Tên đề thi để đặt tên file
 */
export const exportResultsToExcel = (results: StudentResult[], title: string) => {
  const XLSX = (window as any).XLSX;
  if (!XLSX) {
    alert("Thư viện Excel chưa tải xong. Vui lòng thử lại sau vài giây.");
    return;
  }

  const data = results.map((res, idx) => ({
    "STT": idx + 1,
    "Họ và Tên": res.name,
    "Lớp": res.className,
    "Điểm": res.score,
    "Tổng điểm": res.total,
    "Số câu đúng": res.counts?.correct || 0,
    "Số câu sai": res.counts?.wrong || 0,
    "Bỏ trống": res.counts?.empty || 0,
    "Thời gian (giây)": res.timeSpent || 0,
    "Vi phạm": res.violations || 0,
    "Ngày thi": res.date || ""
  }));

  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Ket_Qua");
  XLSX.writeFile(wb, `Ket_Qua_${title.replace(/\s+/g, '_')}.xlsx`);
};
