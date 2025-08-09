import html2canvas from "html2canvas"
import jsPDF from "jspdf"

export const generatePdf = async (elementId: string, filename: string) => {
  const input = document.getElementById(elementId)
  if (!input) {
    console.error(`Element with ID ${elementId} not found.`)
    return
  }

  // Temporarily apply a white background if the element has none, for better PDF rendering
  const originalBackgroundColor = input.style.backgroundColor
  if (
    !originalBackgroundColor ||
    originalBackgroundColor === "transparent" ||
    originalBackgroundColor === "rgba(0, 0, 0, 0)"
  ) {
    input.style.backgroundColor = "white"
  }

  const canvas = await html2canvas(input, { scale: 2 }) // Scale for better quality
  const imgData = canvas.toDataURL("image/png")
  const pdf = new jsPDF("p", "mm", "a4")
  const imgWidth = 210 // A4 width in mm
  const pageHeight = 297 // A4 height in mm
  const imgHeight = (canvas.height * imgWidth) / canvas.width
  let heightLeft = imgHeight
  let position = 0

  pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight)
  heightLeft -= pageHeight

  while (heightLeft >= 0) {
    position = heightLeft - imgHeight
    pdf.addPage()
    pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight)
    heightLeft -= pageHeight
  }

  pdf.save(`${filename}.pdf`)

  // Restore original background color
  input.style.backgroundColor = originalBackgroundColor
}
