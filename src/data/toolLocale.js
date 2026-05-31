const toolLocaleMap = {
  'image-compress': {
    en: {
      name: 'Compress Image',
      category: 'Image',
      tagline: 'Shrink posters, report screenshots, and attachments before sending.',
      description: 'Batch compress multiple images locally with no server upload.'
    }
  },
  'image-resize': {
    en: {
      name: 'Resize Image',
      category: 'Image',
      tagline: 'Resize cover images, ID photos, and campaign assets in one click.',
      description: 'Apply presets or custom width and height with ratio control.'
    }
  },
  'image-convert': {
    en: {
      name: 'Convert Image',
      category: 'Image',
      tagline: 'Convert PNG, JPG, and WebP quickly without heavy software.',
      description: 'Choose a target format and convert with transparency options.'
    }
  },
  'image-to-pdf': {
    en: {
      name: 'Image to PDF',
      category: 'Image',
      tagline: 'Combine screenshots, scans, and receipts into one PDF.',
      description: 'Merge multiple images into a single PDF in the right order.'
    }
  },
  'image-ocr': {
    en: {
      name: 'Image to Text (OCR)',
      category: 'Image',
      tagline: 'Extract text from screenshots, posters, and scanned files.',
      description: 'Upload one image and extract text automatically.'
    }
  },
  'pdf-to-word': {
    en: {
      name: 'PDF to Word',
      category: 'Document',
      tagline: 'Turn PDFs into editable documents for quick updates.',
      description: 'Convert one PDF file into an editable Word document.'
    }
  },
  'word-to-pdf': {
    en: {
      name: 'Word to PDF',
      category: 'Document',
      tagline: 'Export final docs as stable PDFs for sharing or printing.',
      description: 'Convert one Word file into a layout-stable PDF.'
    }
  },
  'pdf-merge': {
    en: {
      name: 'Merge PDF',
      category: 'Document',
      tagline: 'Merge contracts, materials, and approvals into one file.',
      description: 'Upload multiple PDFs and merge them by order.'
    }
  },
  'pdf-split': {
    en: {
      name: 'Split PDF',
      category: 'Document',
      tagline: 'Split only the pages you need and share faster.',
      description: 'Upload a PDF and export selected page ranges.'
    }
  },
  'pdf-to-image': {
    en: {
      name: 'PDF to Image',
      category: 'Document',
      tagline: 'Export PDF pages as PNG/JPG for quick sharing.',
      description: 'Upload a PDF and export each page as an image.'
    }
  },
  'pdf-watermark': {
    en: {
      name: 'PDF Watermark',
      category: 'Document',
      tagline: 'Add watermark labels to internal or draft files.',
      description: 'Upload one PDF and export with text watermark.'
    }
  },
  'excel-to-csv': {
    en: {
      name: 'Excel to CSV',
      category: 'Sheet & Text',
      tagline: 'Convert Excel to CSV for imports and data exchange.',
      description: 'Upload one Excel file and export a standard CSV.'
    }
  },
  'csv-to-excel': {
    en: {
      name: 'CSV to Excel',
      category: 'Sheet & Text',
      tagline: 'Convert raw CSV data back to Excel for easy editing.',
      description: 'Upload one CSV file and convert it to Excel.'
    }
  },
  'text-dedup': {
    en: {
      name: 'Text Deduplication',
      category: 'Sheet & Text',
      tagline: 'Remove duplicates from lists and keyword sets quickly.',
      description: 'Paste multiple lines and deduplicate while keeping order.'
    }
  },
  'qr-generator': {
    en: {
      name: 'QR Code',
      category: 'Daily Productivity',
      tagline: 'Create QR codes for links, docs, forms, and events.',
      description: 'Enter text or URL and instantly generate a downloadable QR code.'
    }
  },
  'timestamp-convert': {
    en: {
      name: 'Timestamp Converter',
      category: 'Daily Productivity',
      tagline: 'Convert timestamps and datetimes when debugging logs/APIs.',
      description: 'Batch convert between timestamps and dates in seconds.'
    }
  }
};

export function localizeTool(tool, locale = 'zh') {
  if (!tool) {
    return tool;
  }

  if (locale !== 'en') {
    return tool;
  }

  const localized = toolLocaleMap[tool.id]?.en;
  if (!localized) {
    return tool;
  }

  return {
    ...tool,
    ...localized
  };
}
