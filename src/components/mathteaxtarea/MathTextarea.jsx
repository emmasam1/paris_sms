import React from "react";
import ReactQuill from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";
import katex from "katex";
import "katex/dist/katex.min.css";

// Required for Quill to recognize the formula button
window.katex = katex;

const MathTextarea = ({ value, onChange, placeholder }) => {
  const modules = {
  toolbar: [
    [{ header: [1, 2, false] }],
    ["bold", "italic", "underline", "blockquote"],
    [{ list: "ordered" }, { list: "bullet" }], // This is correct!
    ["formula", "clean"], 
  ],
};

  const formats = [
    "header", "bold", "italic", "underline", "blockquote",
    "list", "bullet", "formula",
  ];

  return (
    <div className="universal-editor">
      <ReactQuill
        theme="snow"
        value={value || ""} 
        onChange={onChange}
        modules={modules}
        formats={formats}
        placeholder={placeholder}
        // Increased height and bottom margin for toolbar spacing
        style={{ height: '180px', marginBottom: '45px' }}
      />
    </div>
  );
};

export default MathTextarea;