import React from 'react';

// Header reutilizable para mostrar título, usuario y rol
const PageHeader = ({ title, subtitle, userName, roleLabel }) => {
  return (
    <div className="bg-white rounded-xl shadow-lg p-6 md:p-8 mb-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-3xl font-semibold text-gray-800 leading-tight">{title}</h2>
          {subtitle && <p className="text-gray-600 mt-2">{subtitle}</p>}
        </div>
        {(userName || roleLabel) && (
          <div className="flex flex-col items-start md:items-end text-sm text-gray-700">
            {userName && <span className="font-semibold text-gray-900">{userName}</span>}
            {roleLabel && <span className="inline-flex items-center gap-2 mt-1 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100">{roleLabel}</span>}
          </div>
        )}
      </div>
    </div>
  );
};

export default PageHeader;