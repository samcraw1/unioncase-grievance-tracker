import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft, Calendar, Clock, User, FileText, Building,
  Briefcase, Users, AlertCircle, CheckCircle, MessageSquare,
  Paperclip, Plus, Send, Upload, X, Download, Trash2, Image as ImageIcon, Camera
} from 'lucide-react';
import api from '../services/api';
import { format, formatDistanceToNow } from 'date-fns';
import imageCompression from 'browser-image-compression';

const GrievanceDetailPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);

  const [grievance, setGrievance] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [noteText, setNoteText] = useState('');
  const [addingNote, setAddingNote] = useState(false);
  const [showNoteForm, setShowNoteForm] = useState(false);

  // File upload states
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [uploadingFiles, setUploadingFiles] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const [fileLabel, setFileLabel] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [exportingPDF, setExportingPDF] = useState(false);

  useEffect(() => {
    fetchGrievanceDetail();
  }, [id]);

  const fetchGrievanceDetail = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/grievances/${id}`);
      setGrievance(response.data);
      setError('');
    } catch (err) {
      console.error('Error fetching grievance:', err);
      setError('Failed to load grievance details. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddNote = async (e) => {
    e.preventDefault();
    if (!noteText.trim()) return;

    try {
      setAddingNote(true);
      await api.post(`/grievances/${id}/notes`, { noteText });
      setNoteText('');
      setShowNoteForm(false);
      await fetchGrievanceDetail(); // Refresh to show new note
    } catch (err) {
      console.error('Error adding note:', err);
      alert('Failed to add note. Please try again.');
    } finally {
      setAddingNote(false);
    }
  };

  // File upload handlers
  const validateFile = (file) => {
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
    const maxSize = 10 * 1024 * 1024; // 10MB

    if (!allowedTypes.includes(file.type)) {
      alert(`${file.name}: Only PDF, JPG, JPEG, and PNG files are allowed`);
      return false;
    }

    if (file.size > maxSize) {
      alert(`${file.name}: File size must be less than 10MB`);
      return false;
    }

    return true;
  };

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    handleFiles(files);
  };

  const handleFiles = async (files) => {
    const validFiles = files.filter(validateFile);

    if (validFiles.length === 0) return;

    for (const file of validFiles) {
      // Compress images before uploading
      let fileToUpload = file;
      if (file.type.startsWith('image/')) {
        try {
          const options = {
            maxSizeMB: 2, // Compress to max 2MB
            maxWidthOrHeight: 1920, // Max dimension
            useWebWorker: true,
            fileType: file.type
          };
          fileToUpload = await imageCompression(file, options);
          console.log(`Compressed ${file.name}: ${(file.size / 1024 / 1024).toFixed(2)}MB → ${(fileToUpload.size / 1024 / 1024).toFixed(2)}MB`);
        } catch (err) {
          console.error('Image compression error:', err);
          // If compression fails, use original file
        }
      }
      await uploadFile(fileToUpload);
    }
  };

  const uploadFile = async (file) => {
    const uploadId = Date.now() + Math.random();

    // Add to uploading list
    setUploadingFiles(prev => [...prev, { id: uploadId, name: file.name, progress: 0 }]);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('label', fileLabel || file.name);

      await api.post(`/documents/${id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        onUploadProgress: (progressEvent) => {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadingFiles(prev =>
            prev.map(f => f.id === uploadId ? { ...f, progress } : f)
          );
        }
      });

      // Remove from uploading list
      setUploadingFiles(prev => prev.filter(f => f.id !== uploadId));

      // Reset and refresh
      setFileLabel('');
      setShowUploadForm(false);
      await fetchGrievanceDetail();
    } catch (err) {
      console.error('Error uploading file:', err);
      alert(`Failed to upload ${file.name}. Please try again.`);
      setUploadingFiles(prev => prev.filter(f => f.id !== uploadId));
    }
  };

  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files);
    handleFiles(files);
  };

  const handleDeleteDocument = async (docId) => {
    try {
      await api.delete(`/documents/${docId}`);
      setDeleteConfirm(null);
      await fetchGrievanceDetail();
    } catch (err) {
      console.error('Error deleting document:', err);
      alert('Failed to delete document. Please try again.');
    }
  };

  const getFileIcon = (fileType, fileName) => {
    if (fileType.startsWith('image/')) {
      return ImageIcon;
    }
    return FileText;
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const handleExportPDF = async () => {
    try {
      setExportingPDF(true);

      const response = await api.get(`/grievances/${id}/export-pdf`, {
        responseType: 'blob'
      });

      // Create blob URL and trigger download
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Grievance_${grievance.grievance_number}_${Date.now()}.pdf`;
      document.body.appendChild(link);
      link.click();

      // Cleanup
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Error exporting PDF:', err);
      alert('Failed to export PDF. Please try again.');
    } finally {
      setExportingPDF(false);
    }
  };

  const getStatusBadgeClass = (status) => {
    const classes = {
      active: 'badge badge-filed',
      filed: 'badge badge-filed',
      informal_step_a: 'badge badge-step-a',
      formal_step_a: 'badge badge-step-a',
      step_b: 'badge badge-step-b',
      arbitration: 'badge badge-arbitration',
      resolved: 'badge badge-resolved',
      settled: 'badge badge-settled',
      denied: 'badge bg-red-100 text-red-800'
    };
    return classes[status] || 'badge';
  };

  const formatStatus = (status) => {
    return status?.split('_').map(word =>
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ') || 'Unknown';
  };

  const getStepIndex = (step) => {
    const steps = ['filed', 'informal_step_a', 'formal_step_a', 'step_b', 'arbitration', 'resolved'];
    return steps.indexOf(step);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-500">Loading grievance details...</p>
        </div>
      </div>
    );
  }

  if (error || !grievance) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center space-x-2 text-primary hover:text-primary-dark mb-6"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Dashboard</span>
          </button>
          <div className="card">
            <div className="text-center py-12">
              <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
              <p className="text-gray-700 mb-4">{error || 'Grievance not found'}</p>
              <button onClick={() => navigate('/dashboard')} className="btn-primary">
                Return to Dashboard
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const currentStepIndex = getStepIndex(grievance.current_step);
  const timelineSteps = [
    { key: 'filed', label: 'Filed', icon: FileText },
    { key: 'informal_step_a', label: 'Informal Step A', icon: Users },
    { key: 'formal_step_a', label: 'Formal Step A', icon: FileText },
    { key: 'step_b', label: 'Step B', icon: Building },
    { key: 'arbitration', label: 'Arbitration', icon: Briefcase },
    { key: 'resolved', label: 'Resolved', icon: CheckCircle }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center space-x-2 text-primary hover:text-primary-dark mb-4"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Dashboard</span>
          </button>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {grievance.grievance_number}
              </h1>
              <p className="text-gray-600 mt-1">{grievance.violation_type}</p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={handleExportPDF}
                disabled={exportingPDF}
                className="btn-primary flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Download className="h-4 w-4" />
                <span>{exportingPDF ? 'Exporting...' : 'Export PDF'}</span>
              </button>
              <span className={`${getStatusBadgeClass(grievance.current_step)} text-lg px-4 py-2`}>
                {formatStatus(grievance.current_step)}
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content - Left Column (2/3) */}
          <div className="lg:col-span-2 space-y-6">
            {/* Timeline */}
            <div className="card">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Grievance Timeline</h2>

              <div className="relative">
                {/* Timeline Line */}
                <div className="absolute left-6 top-8 bottom-8 w-0.5 bg-gray-200"></div>

                {/* Timeline Steps */}
                <div className="space-y-6">
                  {timelineSteps.map((step, index) => {
                    const isCompleted = index <= currentStepIndex;
                    const isCurrent = index === currentStepIndex;
                    const timelineEntry = grievance.timeline?.find(t => t.step === step.key);
                    const StepIcon = step.icon;

                    return (
                      <div key={step.key} className="relative flex items-start">
                        {/* Icon Circle */}
                        <div className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center ${
                          isCompleted
                            ? 'bg-primary text-white'
                            : 'bg-gray-200 text-gray-400'
                        } ${isCurrent ? 'ring-4 ring-primary ring-opacity-20' : ''}`}>
                          <StepIcon className="h-6 w-6" />
                        </div>

                        {/* Content */}
                        <div className="ml-4 flex-1">
                          <div className="flex items-center justify-between">
                            <h3 className={`font-medium ${isCompleted ? 'text-gray-900' : 'text-gray-500'}`}>
                              {step.label}
                            </h3>
                            {timelineEntry && (
                              <span className="text-sm text-gray-500">
                                {format(new Date(timelineEntry.step_date), 'MMM dd, yyyy')}
                              </span>
                            )}
                          </div>
                          {timelineEntry?.notes && (
                            <p className="text-sm text-gray-600 mt-1">{timelineEntry.notes}</p>
                          )}
                          {timelineEntry?.handler_name && (
                            <p className="text-xs text-gray-500 mt-1">
                              Handled by: {timelineEntry.handler_name}
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Grievance Details */}
            <div className="card">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Incident Details</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Grievant</label>
                  <p className="text-gray-900">{grievance.grievant_name}</p>
                  {grievance.grievant_employee_id && (
                    <p className="text-sm text-gray-500">ID: {grievance.grievant_employee_id}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Facility</label>
                  <p className="text-gray-900">{grievance.facility}</p>
                  {grievance.craft && (
                    <p className="text-sm text-gray-500 capitalize">{grievance.craft}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Incident Date</label>
                  <p className="text-gray-900">
                    {format(new Date(grievance.incident_date), 'MMMM dd, yyyy')}
                  </p>
                  {grievance.incident_time && (
                    <p className="text-sm text-gray-500">
                      {format(new Date(`2000-01-01T${grievance.incident_time}`), 'h:mm a')}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Filed Date</label>
                  <p className="text-gray-900">
                    {format(new Date(grievance.created_at), 'MMMM dd, yyyy')}
                  </p>
                  <p className="text-sm text-gray-500">
                    {formatDistanceToNow(new Date(grievance.created_at), { addSuffix: true })}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Contract Article</label>
                  <p className="text-gray-900">{grievance.contract_article}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Violation Type</label>
                  <p className="text-gray-900">{grievance.violation_type}</p>
                </div>
              </div>

              <div className="mt-6">
                <label className="block text-sm font-medium text-gray-600 mb-2">Description</label>
                <p className="text-gray-900 whitespace-pre-line">{grievance.detailed_description}</p>
              </div>

              {grievance.management_representative && (
                <div className="mt-6">
                  <label className="block text-sm font-medium text-gray-600 mb-1">
                    Management Representative
                  </label>
                  <p className="text-gray-900">{grievance.management_representative}</p>
                </div>
              )}

              {grievance.witnesses && grievance.witnesses.length > 0 && (
                <div className="mt-6">
                  <label className="block text-sm font-medium text-gray-600 mb-2">Witnesses</label>
                  <div className="flex flex-wrap gap-2">
                    {grievance.witnesses.map((witness, idx) => (
                      <span key={idx} className="badge bg-gray-100 text-gray-800">
                        {witness}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Documents */}
            <div className="card">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">Documents</h2>
                {!showUploadForm && (
                  <button
                    onClick={() => setShowUploadForm(true)}
                    className="btn-primary flex items-center space-x-2"
                  >
                    <Upload className="h-4 w-4" />
                    <span>Upload</span>
                  </button>
                )}
              </div>

              {/* Upload Form */}
              {showUploadForm && (
                <div className="mb-6 bg-gray-50 p-6 rounded-lg border-2 border-dashed border-gray-300">
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Document Label (Optional)
                    </label>
                    <input
                      type="text"
                      value={fileLabel}
                      onChange={(e) => setFileLabel(e.target.value)}
                      placeholder="e.g., Timecard, Email, Schedule"
                      className="input-field"
                    />
                  </div>

                  {/* Drag and Drop Area */}
                  <div
                    onDragEnter={handleDragEnter}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                      isDragging
                        ? 'border-primary bg-primary bg-opacity-5'
                        : 'border-gray-300 hover:border-primary'
                    }`}
                  >
                    <Upload className={`h-12 w-12 mx-auto mb-4 ${isDragging ? 'text-primary' : 'text-gray-400'}`} />
                    <p className="text-gray-700 font-medium mb-1">
                      Drag and drop files here, or click to browse
                    </p>
                    <p className="text-sm text-gray-500 mb-4">
                      PDF, JPG, PNG files only • Max 10MB per file • Images auto-compressed to 2MB
                    </p>

                    {/* Hidden file inputs */}
                    <input
                      ref={fileInputRef}
                      type="file"
                      onChange={handleFileSelect}
                      accept=".pdf,.jpg,.jpeg,.png"
                      multiple
                      className="hidden"
                    />
                    <input
                      ref={cameraInputRef}
                      type="file"
                      onChange={handleFileSelect}
                      accept="image/*"
                      capture="environment"
                      className="hidden"
                    />

                    {/* Action buttons */}
                    <div className="flex flex-col sm:flex-row gap-3 justify-center">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="btn-primary flex items-center justify-center space-x-2"
                      >
                        <Upload className="h-4 w-4" />
                        <span>Select Files</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => cameraInputRef.current?.click()}
                        className="btn-secondary flex items-center justify-center space-x-2 md:hidden"
                      >
                        <Camera className="h-4 w-4" />
                        <span>Take Photo</span>
                      </button>
                    </div>
                  </div>

                  {/* Upload Progress */}
                  {uploadingFiles.length > 0 && (
                    <div className="mt-4 space-y-2">
                      {uploadingFiles.map((file) => (
                        <div key={file.id} className="bg-white p-3 rounded border border-gray-200">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm font-medium text-gray-900 truncate">
                              {file.name}
                            </span>
                            <span className="text-xs text-gray-500">{file.progress}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-primary h-2 rounded-full transition-all"
                              style={{ width: `${file.progress}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="mt-4 flex justify-end">
                    <button
                      onClick={() => {
                        setShowUploadForm(false);
                        setFileLabel('');
                      }}
                      className="btn-secondary"
                    >
                      Close
                    </button>
                  </div>
                </div>
              )}

              {/* Documents Grid */}
              {grievance.documents && grievance.documents.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {grievance.documents.map((doc) => {
                    const FileIcon = getFileIcon(doc.file_type, doc.file_name);
                    const isImage = doc.file_type.startsWith('image/');

                    return (
                      <div
                        key={doc.id}
                        className="border border-gray-200 rounded-lg p-4 hover:border-primary transition-colors group"
                      >
                        <div className="flex items-start space-x-3">
                          <div className="flex-shrink-0">
                            {isImage ? (
                              <div className="w-12 h-12 rounded bg-blue-50 flex items-center justify-center">
                                <ImageIcon className="h-6 w-6 text-blue-600" />
                              </div>
                            ) : (
                              <div className="w-12 h-12 rounded bg-red-50 flex items-center justify-center">
                                <FileText className="h-6 w-6 text-red-600" />
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {doc.label || doc.file_name}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              {formatFileSize(doc.file_size)}
                            </p>
                            {doc.uploaded_by_name && (
                              <p className="text-xs text-gray-500">
                                By {doc.uploaded_by_name}
                              </p>
                            )}
                            {doc.created_at && (
                              <p className="text-xs text-gray-500">
                                {format(new Date(doc.created_at), 'MMM dd, yyyy')}
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="mt-3 flex space-x-2">
                          <a
                            href={`${api.defaults.baseURL}/${doc.file_path}`}
                            download={doc.file_name}
                            className="flex-1 flex items-center justify-center space-x-1 px-3 py-1.5 text-xs font-medium text-primary bg-primary bg-opacity-10 rounded hover:bg-opacity-20 transition-colors"
                          >
                            <Download className="h-3 w-3" />
                            <span>Download</span>
                          </a>
                          <button
                            onClick={() => setDeleteConfirm(doc.id)}
                            className="flex items-center justify-center px-3 py-1.5 text-xs font-medium text-red-600 bg-red-50 rounded hover:bg-red-100 transition-colors"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </div>

                        {/* Delete Confirmation */}
                        {deleteConfirm === doc.id && (
                          <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded">
                            <p className="text-sm text-red-800 mb-2">
                              Delete this document?
                            </p>
                            <div className="flex space-x-2">
                              <button
                                onClick={() => handleDeleteDocument(doc.id)}
                                className="flex-1 px-3 py-1.5 text-xs font-medium text-white bg-red-600 rounded hover:bg-red-700"
                              >
                                Delete
                              </button>
                              <button
                                onClick={() => setDeleteConfirm(null)}
                                className="flex-1 px-3 py-1.5 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Paperclip className="h-12 w-12 text-gray-300 mx-auto mb-2" />
                  <p className="text-gray-500 text-sm mb-4">No documents uploaded yet</p>
                  {!showUploadForm && (
                    <button
                      onClick={() => setShowUploadForm(true)}
                      className="btn-primary"
                    >
                      Upload First Document
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Notes */}
            <div className="card">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">Notes & Updates</h2>
                {!showNoteForm && (
                  <button
                    onClick={() => setShowNoteForm(true)}
                    className="btn-primary flex items-center space-x-2"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Add Note</span>
                  </button>
                )}
              </div>

              {/* Add Note Form */}
              {showNoteForm && (
                <form onSubmit={handleAddNote} className="mb-6 bg-gray-50 p-4 rounded-lg">
                  <textarea
                    value={noteText}
                    onChange={(e) => setNoteText(e.target.value)}
                    placeholder="Add a note or update..."
                    rows={4}
                    className="input-field"
                    required
                  />
                  <div className="flex space-x-3 mt-3">
                    <button
                      type="submit"
                      disabled={addingNote}
                      className="btn-primary flex items-center space-x-2 disabled:opacity-50"
                    >
                      <Send className="h-4 w-4" />
                      <span>{addingNote ? 'Adding...' : 'Add Note'}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowNoteForm(false);
                        setNoteText('');
                      }}
                      className="btn-secondary"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}

              {/* Notes List */}
              {grievance.notes && grievance.notes.length > 0 ? (
                <div className="space-y-4">
                  {grievance.notes.map((note) => (
                    <div key={note.id} className="border-l-4 border-primary pl-4 py-2">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center space-x-2">
                          <MessageSquare className="h-4 w-4 text-primary" />
                          <span className="text-sm font-medium text-gray-900">
                            {note.author_name || 'Unknown'}
                          </span>
                        </div>
                        <span className="text-xs text-gray-500">
                          {format(new Date(note.created_at), 'MMM dd, yyyy h:mm a')}
                        </span>
                      </div>
                      <p className="text-gray-700 mt-2 whitespace-pre-line">{note.note_text}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <MessageSquare className="h-12 w-12 text-gray-300 mx-auto mb-2" />
                  <p className="text-gray-500 text-sm">No notes added yet</p>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar - Right Column (1/3) */}
          <div className="lg:col-span-1 space-y-6">
            {/* Status Card */}
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Status</h3>
              <div className="space-y-3">
                <div>
                  <span className="text-sm text-gray-600">Current Step</span>
                  <div className="mt-1">
                    <span className={getStatusBadgeClass(grievance.current_step)}>
                      {formatStatus(grievance.current_step)}
                    </span>
                  </div>
                </div>
                <div>
                  <span className="text-sm text-gray-600">Overall Status</span>
                  <div className="mt-1">
                    <span className={getStatusBadgeClass(grievance.status)}>
                      {formatStatus(grievance.status)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Deadlines */}
            {grievance.deadlines && grievance.deadlines.length > 0 && (
              <div className="card">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Upcoming Deadlines</h3>
                <div className="space-y-3">
                  {grievance.deadlines
                    .filter(d => !d.is_completed)
                    .map((deadline) => {
                      const daysUntil = Math.ceil(
                        (new Date(deadline.deadline_date) - new Date()) / (1000 * 60 * 60 * 24)
                      );
                      const isUrgent = daysUntil <= 3;
                      const isOverdue = daysUntil < 0;

                      return (
                        <div
                          key={deadline.id}
                          className={`p-3 rounded-lg ${
                            isOverdue
                              ? 'bg-red-50 border border-red-200'
                              : isUrgent
                              ? 'bg-yellow-50 border border-yellow-200'
                              : 'bg-blue-50 border border-blue-200'
                          }`}
                        >
                          <div className="flex items-start space-x-2">
                            <Clock className={`h-5 w-5 mt-0.5 ${
                              isOverdue ? 'text-red-500' : isUrgent ? 'text-yellow-600' : 'text-blue-500'
                            }`} />
                            <div className="flex-1">
                              <p className="text-sm font-medium text-gray-900">
                                {deadline.description}
                              </p>
                              <p className="text-xs text-gray-600 mt-1">
                                {format(new Date(deadline.deadline_date), 'MMM dd, yyyy')}
                              </p>
                              <p className={`text-xs mt-1 font-medium ${
                                isOverdue ? 'text-red-600' : isUrgent ? 'text-yellow-700' : 'text-blue-600'
                              }`}>
                                {isOverdue ? `Overdue by ${Math.abs(daysUntil)} days` : `${daysUntil} days remaining`}
                              </p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>
            )}

            {/* Quick Stats */}
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Info</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Documents</span>
                  <span className="font-medium text-gray-900">
                    {grievance.documents?.length || 0}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Notes</span>
                  <span className="font-medium text-gray-900">
                    {grievance.notes?.length || 0}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Witnesses</span>
                  <span className="font-medium text-gray-900">
                    {grievance.witnesses?.length || 0}
                  </span>
                </div>
                {grievance.steward_name && (
                  <div className="pt-3 border-t border-gray-200">
                    <span className="text-gray-600 block mb-1">Assigned Steward</span>
                    <span className="font-medium text-gray-900">{grievance.steward_name}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GrievanceDetailPage;
