import React from 'react';
import { Button, Dropdown, MenuProps, Tooltip } from 'antd';
import { FilePdfOutlined, FileExcelOutlined, PictureOutlined, DownloadOutlined } from '@ant-design/icons';
import { DocumentGenerator } from '../../utils/DocumentGenerator';

interface ExportOptionsProps {
  elementId?: string; // ID of the DOM element to export for PDF/SVG
  excelData?: any[];  // Data for Excel export
  filenamePrefix?: string;
  showSVG?: boolean; // Whether to show SVG export option (default true if elementId is provided)
}

export const ExportOptions: React.FC<ExportOptionsProps> = ({
  elementId,
  excelData,
  filenamePrefix = 'export',
  showSVG = false
}) => {
  const handleMenuClick: MenuProps['onClick'] = (e) => {
    const timestamp = new Date().toISOString().split('T')[0];
    const filename = `${filenamePrefix}_${timestamp}`;

    switch (e.key) {
      case 'pdf':
        if (elementId) DocumentGenerator.exportToPDF(elementId, `${filename}.pdf`);
        break;
      case 'excel':
        if (excelData) DocumentGenerator.exportToExcel(excelData, `${filename}.xlsx`);
        break;
      case 'svg':
        if (elementId) DocumentGenerator.exportToSVG(elementId, `${filename}.svg`);
        break;
    }
  };

  const items: MenuProps['items'] = [];

  if (elementId) {
    items.push({
      key: 'pdf',
      label: 'Export to PDF',
      icon: <FilePdfOutlined style={{ color: '#f5222d' }} />,
    });
  }

  if (excelData) {
    items.push({
      key: 'excel',
      label: 'Export to Excel',
      icon: <FileExcelOutlined style={{ color: '#52c41a' }} />,
    });
  }

  if (elementId && showSVG) {
    items.push({
      key: 'svg',
      label: 'Export to SVG',
      icon: <PictureOutlined style={{ color: '#1890ff' }} />,
    });
  }

  if (items.length === 0) {
    return null;
  }

  return (
    <Tooltip title="Export Data">
      <Dropdown menu={{ items, onClick: handleMenuClick }} placement="bottomRight">
        <Button icon={<DownloadOutlined />} type="default">
          Export
        </Button>
      </Dropdown>
    </Tooltip>
  );
};
