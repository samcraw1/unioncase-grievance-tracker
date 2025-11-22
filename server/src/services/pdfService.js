import PDFDocument from 'pdfkit';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// USPS brand colors
const USPS_BLUE = '#003366';
const USPS_LIGHT_BLUE = '#0066CC';
const GRAY = '#666666';
const LIGHT_GRAY = '#CCCCCC';

// Helper function to format date
const formatDate = (date) => {
  if (!date) return 'N/A';
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

// Helper function to format time
const formatTime = (time) => {
  if (!time) return 'N/A';
  return time;
};

// Helper function to format datetime
const formatDateTime = (datetime) => {
  if (!datetime) return 'N/A';
  return new Date(datetime).toLocaleString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

export const generateGrievancePDF = (grievance, stream) => {
  return new Promise((resolve, reject) => {
    try {
      // Create PDF document
      const doc = new PDFDocument({
        size: 'LETTER',
        margins: {
          top: 50,
          bottom: 50,
          left: 50,
          right: 50
        }
      });

      // Pipe to stream
      doc.pipe(stream);

      let yPosition = 50;

      // Add USPS Logo
      const logoPath = join(__dirname, '../../assets/usps-logo.png');
      if (fs.existsSync(logoPath)) {
        doc.image(logoPath, 50, yPosition, { width: 80 });
      }

      // Header
      doc.fontSize(24)
        .fillColor(USPS_BLUE)
        .font('Helvetica-Bold')
        .text('USPS GRIEVANCE TRACKER', 150, yPosition + 10, { align: 'left' });

      doc.fontSize(11)
        .fillColor(GRAY)
        .font('Helvetica')
        .text('Official Grievance Documentation', 150, yPosition + 40);

      yPosition += 90;

      // Horizontal line
      doc.moveTo(50, yPosition)
        .lineTo(562, yPosition)
        .strokeColor(USPS_BLUE)
        .lineWidth(2)
        .stroke();

      yPosition += 20;

      // Case Number and Filing Date
      doc.fontSize(18)
        .fillColor(USPS_BLUE)
        .font('Helvetica-Bold')
        .text(`Case #${grievance.grievance_number}`, 50, yPosition);

      doc.fontSize(10)
        .fillColor(GRAY)
        .font('Helvetica')
        .text(`Filed: ${formatDate(grievance.created_at)}`, 50, yPosition + 25);

      doc.fontSize(10)
        .fillColor(GRAY)
        .text(`Status: ${grievance.status.toUpperCase()}`, 300, yPosition + 25);

      yPosition += 60;

      // Function to add section header
      const addSectionHeader = (title, y) => {
        doc.fontSize(14)
          .fillColor(USPS_BLUE)
          .font('Helvetica-Bold')
          .text(title, 50, y);

        doc.moveTo(50, y + 20)
          .lineTo(562, y + 20)
          .strokeColor(LIGHT_GRAY)
          .lineWidth(1)
          .stroke();

        return y + 30;
      };

      // Function to add field
      const addField = (label, value, x, y, width = 200) => {
        doc.fontSize(9)
          .fillColor(GRAY)
          .font('Helvetica-Bold')
          .text(label + ':', x, y);

        doc.fontSize(10)
          .fillColor('black')
          .font('Helvetica')
          .text(value || 'N/A', x, y + 12, { width: width });

        return y + 35;
      };

      // GRIEVANT INFORMATION
      yPosition = addSectionHeader('GRIEVANT INFORMATION', yPosition);

      let leftY = yPosition;
      leftY = addField('Name', grievance.grievant_name, 50, leftY, 200);
      leftY = addField('Employee ID', grievance.grievant_employee_id, 50, leftY, 200);

      let rightY = yPosition;
      rightY = addField('Facility', grievance.facility, 300, rightY, 250);
      rightY = addField('Craft', grievance.craft?.toUpperCase(), 300, rightY, 250);

      yPosition = Math.max(leftY, rightY) + 10;

      // INCIDENT DETAILS
      if (yPosition > 650) {
        doc.addPage();
        yPosition = 50;
      }

      yPosition = addSectionHeader('INCIDENT DETAILS', yPosition);

      leftY = yPosition;
      leftY = addField('Incident Date', formatDate(grievance.incident_date), 50, leftY, 200);
      leftY = addField('Incident Time', formatTime(grievance.incident_time), 50, leftY, 200);

      rightY = yPosition;
      rightY = addField('Contract Article', grievance.contract_article, 300, rightY, 250);
      rightY = addField('Violation Type', grievance.violation_type, 300, rightY, 250);

      yPosition = Math.max(leftY, rightY) + 10;

      // Brief Description
      yPosition = addField('Brief Description', grievance.brief_description, 50, yPosition, 500);

      // Detailed Description
      if (yPosition > 600) {
        doc.addPage();
        yPosition = 50;
      }

      doc.fontSize(9)
        .fillColor(GRAY)
        .font('Helvetica-Bold')
        .text('Detailed Description:', 50, yPosition);

      doc.fontSize(10)
        .fillColor('black')
        .font('Helvetica')
        .text(grievance.detailed_description || 'N/A', 50, yPosition + 15, {
          width: 500,
          align: 'justify'
        });

      yPosition += doc.heightOfString(grievance.detailed_description || 'N/A', { width: 500 }) + 30;

      // PARTIES INVOLVED
      if (yPosition > 650) {
        doc.addPage();
        yPosition = 50;
      }

      yPosition = addSectionHeader('PARTIES INVOLVED', yPosition);

      yPosition = addField('Management Representative', grievance.management_representative, 50, yPosition, 500);

      // Witnesses
      if (grievance.witnesses && grievance.witnesses.length > 0) {
        doc.fontSize(9)
          .fillColor(GRAY)
          .font('Helvetica-Bold')
          .text('Witnesses:', 50, yPosition);

        doc.fontSize(10)
          .fillColor('black')
          .font('Helvetica');

        grievance.witnesses.forEach((witness, index) => {
          doc.text(`• ${witness}`, 60, yPosition + 15 + (index * 15), { width: 500 });
        });

        yPosition += 15 + (grievance.witnesses.length * 15) + 20;
      }

      // TIMELINE
      if (yPosition > 600) {
        doc.addPage();
        yPosition = 50;
      }

      yPosition = addSectionHeader('GRIEVANCE TIMELINE', yPosition);

      if (grievance.timeline && grievance.timeline.length > 0) {
        // Timeline table header
        doc.fontSize(9)
          .fillColor('white')
          .font('Helvetica-Bold');

        doc.rect(50, yPosition, 150, 20)
          .fill(USPS_BLUE);
        doc.text('STEP', 55, yPosition + 6);

        doc.rect(200, yPosition, 120, 20)
          .fill(USPS_BLUE);
        doc.text('DATE', 205, yPosition + 6);

        doc.rect(320, yPosition, 242, 20)
          .fill(USPS_BLUE);
        doc.text('NOTES', 325, yPosition + 6);

        yPosition += 20;

        // Timeline entries
        grievance.timeline.forEach((entry, index) => {
          if (yPosition > 700) {
            doc.addPage();
            yPosition = 50;
          }

          const bgColor = index % 2 === 0 ? '#F5F5F5' : 'white';

          doc.rect(50, yPosition, 150, 25)
            .fill(bgColor);

          doc.rect(200, yPosition, 120, 25)
            .fill(bgColor);

          doc.rect(320, yPosition, 242, 25)
            .fill(bgColor);

          doc.fontSize(9)
            .fillColor('black')
            .font('Helvetica')
            .text(entry.step.replace(/_/g, ' ').toUpperCase(), 55, yPosition + 8, { width: 140 });

          doc.text(formatDate(entry.step_date), 205, yPosition + 8, { width: 110 });

          doc.text(entry.notes || '-', 325, yPosition + 8, { width: 232 });

          yPosition += 25;
        });

        yPosition += 15;
      } else {
        doc.fontSize(10)
          .fillColor(GRAY)
          .font('Helvetica-Oblique')
          .text('No timeline entries yet', 50, yPosition);
        yPosition += 30;
      }

      // NOTES & UPDATES
      if (yPosition > 650) {
        doc.addPage();
        yPosition = 50;
      }

      yPosition = addSectionHeader('NOTES & UPDATES', yPosition);

      if (grievance.notes && grievance.notes.length > 0) {
        grievance.notes.forEach((note, index) => {
          if (yPosition > 680) {
            doc.addPage();
            yPosition = 50;
          }

          doc.fontSize(9)
            .fillColor(USPS_BLUE)
            .font('Helvetica-Bold')
            .text(`${note.author_name || 'Unknown'} • ${formatDateTime(note.created_at)}`, 50, yPosition);

          doc.fontSize(10)
            .fillColor('black')
            .font('Helvetica')
            .text(note.note_text, 50, yPosition + 15, { width: 500 });

          const noteHeight = doc.heightOfString(note.note_text, { width: 500 });
          yPosition += noteHeight + 35;

          if (index < grievance.notes.length - 1) {
            doc.moveTo(50, yPosition - 15)
              .lineTo(562, yPosition - 15)
              .strokeColor(LIGHT_GRAY)
              .lineWidth(0.5)
              .stroke();
          }
        });
      } else {
        doc.fontSize(10)
          .fillColor(GRAY)
          .font('Helvetica-Oblique')
          .text('No notes added yet', 50, yPosition);
        yPosition += 30;
      }

      // DEADLINES
      if (yPosition > 650) {
        doc.addPage();
        yPosition = 50;
      }

      yPosition = addSectionHeader('DEADLINES', yPosition);

      if (grievance.deadlines && grievance.deadlines.length > 0) {
        grievance.deadlines.forEach((deadline, index) => {
          if (yPosition > 700) {
            doc.addPage();
            yPosition = 50;
          }

          const status = deadline.is_completed ? 'Completed' : 'Pending';
          const statusColor = deadline.is_completed ? '#28a745' : '#ffc107';

          doc.fontSize(9)
            .fillColor(GRAY)
            .font('Helvetica-Bold')
            .text(deadline.deadline_type.replace(/_/g, ' ').toUpperCase(), 50, yPosition);

          doc.fontSize(9)
            .fillColor(statusColor)
            .text(`[${status}]`, 300, yPosition);

          doc.fontSize(10)
            .fillColor('black')
            .font('Helvetica')
            .text(`Due: ${formatDate(deadline.deadline_date)}`, 50, yPosition + 15);

          doc.text(deadline.description, 50, yPosition + 30, { width: 500 });

          yPosition += 60;
        });
      } else {
        doc.fontSize(10)
          .fillColor(GRAY)
          .font('Helvetica-Oblique')
          .text('No deadlines set', 50, yPosition);
        yPosition += 30;
      }

      // Footer
      const pageCount = doc.bufferedPageRange().count;
      for (let i = 0; i < pageCount; i++) {
        doc.switchToPage(i);

        // Bottom line
        doc.moveTo(50, 742)
          .lineTo(562, 742)
          .strokeColor(LIGHT_GRAY)
          .lineWidth(1)
          .stroke();

        // Generated timestamp
        doc.fontSize(8)
          .fillColor(GRAY)
          .font('Helvetica')
          .text(
            `Generated: ${formatDateTime(new Date())}`,
            50,
            752,
            { width: 300, align: 'left' }
          );

        // Page number
        doc.fontSize(8)
          .fillColor(GRAY)
          .text(
            `Page ${i + 1} of ${pageCount}`,
            0,
            752,
            { width: 562, align: 'right' }
          );

        // Confidential notice
        doc.fontSize(7)
          .fillColor(GRAY)
          .font('Helvetica-Oblique')
          .text(
            'CONFIDENTIAL - For Official Use Only',
            0,
            765,
            { width: 562, align: 'center' }
          );
      }

      // Finalize PDF
      doc.end();

      stream.on('finish', () => resolve());
      stream.on('error', (err) => reject(err));
    } catch (error) {
      reject(error);
    }
  });
};

export default { generateGrievancePDF };
