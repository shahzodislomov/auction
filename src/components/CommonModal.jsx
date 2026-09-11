import React from "react";
import PropTypes from "prop-types";
import { Close } from "@mui/icons-material";

const CommonModal = ({ children, title, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999]">
      <div className="bg-white max-w-sm rounded-2xl border border-slate-200 shadow-[0_18px_60px_rgba(15,23,42,0.18)] md:w-2/3 p-6">
        {/* Modal Header */}
        <div className="flex justify-between items-center border-b pb-3">
          <h3 className="text-lg font-semibold text-[var(--dark)]">{title}</h3>
          <button
            className="text-slate-500 hover:text-slate-800"
            onClick={onClose}
          >
            {/* &times; */}
            <Close/>
          </button>
        </div>

        {/* Modal Content */}
        <div className="mt-4">{children}</div>
      </div>
    </div>
  );
};

// Prop Types Validation
CommonModal.propTypes = {
  children: PropTypes.node.isRequired,
  title: PropTypes.string.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default CommonModal;
