const fileInput = document.getElementById('file-input');
const fileList = document.getElementById('file-list');
const mergeBtn = document.getElementById('merge-btn');
const outputFilenameInput = document.getElementById('output-filename');

let files = [];

// Handle file selection
fileInput.addEventListener('change', (event) => {
  files = Array.from(event.target.files);
  renderFileList();
});

// Render the file list
function renderFileList() {
  fileList.innerHTML = '';
  files.forEach((file, index) => {
    const li = document.createElement('li');
    li.textContent = file.name;
    li.draggable = true;
    li.dataset.index = index;

    // Add drag-and-drop functionality
    li.addEventListener('dragstart', (e) => {
      e.dataTransfer.setData('text/plain', index);
    });

    li.addEventListener('dragover', (e) => {
      e.preventDefault();
    });

    li.addEventListener('drop', (e) => {
      e.preventDefault();
      const draggedIndex = e.dataTransfer.getData('text/plain');
      const droppedIndex = e.target.dataset.index;

      // Reorder the files
      const draggedFile = files.splice(draggedIndex, 1)[0];
      files.splice(droppedIndex, 0, draggedFile);

      renderFileList();
    });

    fileList.appendChild(li);
  });
}

// Merge PDFs
mergeBtn.addEventListener('click', async () => {
  const pdfDoc = await PDFLib.PDFDocument.create();

  for (const file of files) {
    const arrayBuffer = await file.arrayBuffer();
    const donorPdf = await PDFLib.PDFDocument.load(arrayBuffer);
    const pages = await pdfDoc.copyPages(donorPdf, donorPdf.getPageIndices());

    pages.forEach((page) => pdfDoc.addPage(page));
  }

  const mergedPdfBytes = await pdfDoc.save();

  // Get the file name from the input
  const outputFilename = outputFilenameInput.value.trim() || 'merged.pdf';

  // Trigger download
  const blob = new Blob([mergedPdfBytes], { type: 'application/pdf' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = outputFilename.endsWith('.pdf') ? outputFilename : `${outputFilename}.pdf`;
  link.click();
});

