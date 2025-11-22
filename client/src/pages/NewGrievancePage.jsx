import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { ArrowLeft, AlertCircle, Plus, X, FileText } from 'lucide-react';
import api from '../services/api';

const NewGrievancePage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  // Form state
  const [formData, setFormData] = useState({
    grievantName: '',
    grievantEmployeeId: '',
    facility: '',
    craft: '',
    incidentDate: '',
    incidentTime: '',
    contractArticle: '',
    violationType: '',
    briefDescription: '',
    detailedDescription: '',
    managementRepresentative: '',
    witnesses: [],
    stewardId: ''
  });

  const [witnessInput, setWitnessInput] = useState('');
  const [stewards, setStewards] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState('');

  // Contract articles based on seed data
  const contractArticles = [
    'Article 7 - Employee Classifications',
    'Article 8 - Hours of Work',
    'Article 10 - Leave',
    'Article 14 - Safety and Health',
    'Article 15 - Grievance-Arbitration Procedure',
    'Article 16 - Discipline',
    'Article 17 - Representation',
    'Article 19 - Handbooks and Manuals',
    'Article 21 - Union-Management Relations',
    'Article 37 - Discipline for Off-Duty Conduct'
  ];

  // Violation types based on seed data
  const violationTypes = [
    'Overtime Distribution Violation',
    'Unwarranted Discipline - Letter of Warning',
    'Seniority Bypass - Route Assignment',
    '12/60 Hour Rule Violation',
    'Unsafe Working Conditions - Equipment',
    'M-41 Violation - Lunch Break Denial',
    'Annual Leave Denial',
    'NS Day Violation',
    'Emergency Suspension Without Just Cause',
    'Unpaid Overtime',
    'Schedule Violation',
    'Safety Hazard',
    'Wrongful Termination',
    'Contract Violation - Other'
  ];

  const crafts = [
    'carrier',
    'clerk',
    'maintenance',
    'motor_vehicle',
    'mail_handler'
  ];

  useEffect(() => {
    // Pre-fill user information
    if (user) {
      setFormData(prev => ({
        ...prev,
        grievantName: `${user.firstName} ${user.lastName}`,
        grievantEmployeeId: user.employeeId || '',
        facility: user.facility || '',
        craft: user.craft || ''
      }));
    }

    // Fetch stewards
    fetchStewards();
  }, [user]);

  const fetchStewards = async () => {
    try {
      const response = await api.get('/users/stewards');
      setStewards(response.data.stewards || []);
    } catch (err) {
      console.error('Error fetching stewards:', err);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleAddWitness = () => {
    if (witnessInput.trim()) {
      setFormData(prev => ({
        ...prev,
        witnesses: [...prev.witnesses, witnessInput.trim()]
      }));
      setWitnessInput('');
    }
  };

  const handleRemoveWitness = (index) => {
    setFormData(prev => ({
      ...prev,
      witnesses: prev.witnesses.filter((_, i) => i !== index)
    }));
  };

  const handleWitnessKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddWitness();
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.grievantName.trim()) {
      newErrors.grievantName = 'Grievant name is required';
    }
    if (!formData.grievantEmployeeId.trim()) {
      newErrors.grievantEmployeeId = 'Employee ID is required';
    }
    if (!formData.facility.trim()) {
      newErrors.facility = 'Facility is required';
    }
    if (!formData.craft) {
      newErrors.craft = 'Craft is required';
    }
    if (!formData.incidentDate) {
      newErrors.incidentDate = 'Incident date is required';
    }
    if (!formData.incidentTime) {
      newErrors.incidentTime = 'Incident time is required';
    }
    if (!formData.contractArticle) {
      newErrors.contractArticle = 'Contract article is required';
    }
    if (!formData.violationType) {
      newErrors.violationType = 'Violation type is required';
    }
    if (!formData.briefDescription.trim()) {
      newErrors.briefDescription = 'Brief description is required';
    } else if (formData.briefDescription.trim().length > 100) {
      newErrors.briefDescription = 'Brief description must be 100 characters or less';
    }
    if (!formData.detailedDescription.trim()) {
      newErrors.detailedDescription = 'Detailed description is required';
    }
    if (!formData.managementRepresentative.trim()) {
      newErrors.managementRepresentative = 'Management representative is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError('');

    if (!validateForm()) {
      setSubmitError('Please fix the errors above before submitting.');
      return;
    }

    try {
      setLoading(true);

      // Prepare data for API
      const grievanceData = {
        grievantName: formData.grievantName,
        grievantEmployeeId: formData.grievantEmployeeId,
        facility: formData.facility,
        craft: formData.craft,
        incidentDate: formData.incidentDate,
        incidentTime: formData.incidentTime,
        contractArticle: formData.contractArticle,
        violationType: formData.violationType,
        briefDescription: formData.briefDescription,
        detailedDescription: formData.detailedDescription,
        managementRepresentative: formData.managementRepresentative,
        witnesses: formData.witnesses,
        stewardId: formData.stewardId || null
      };

      const response = await api.post('/grievances', grievanceData);

      // Redirect to the newly created grievance detail page
      if (response.data.grievance && response.data.grievance.id) {
        navigate(`/grievances/${response.data.grievance.id}`);
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      console.error('Error creating grievance:', err);
      setSubmitError(
        err.response?.data?.error?.message ||
        'Failed to create grievance. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <button
          onClick={() => navigate('/dashboard')}
          className="flex items-center space-x-2 text-primary hover:text-primary-dark mb-6 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Dashboard</span>
        </button>

        <div className="card">
          <div className="border-b border-gray-200 pb-4 mb-6">
            <h1 className="text-3xl font-bold text-gray-900 flex items-center">
              <FileText className="h-8 w-8 text-primary mr-3" />
              File New Grievance
            </h1>
            <p className="text-sm text-gray-600 mt-2">
              Complete all required fields to file a grievance. All information will be reviewed by your union steward.
            </p>
          </div>

          {submitError && (
            <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded flex items-start">
              <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
              <span className="text-sm">{submitError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Section 1: Grievant Information */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">
                Grievant Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Grievant Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="grievantName"
                    value={formData.grievantName}
                    onChange={handleChange}
                    autoComplete="name"
                    className={`input-field ${errors.grievantName ? 'border-red-500' : ''}`}
                    placeholder="Full Name"
                  />
                  {errors.grievantName && (
                    <p className="text-red-500 text-xs mt-1">{errors.grievantName}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Employee ID <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="grievantEmployeeId"
                    value={formData.grievantEmployeeId}
                    onChange={handleChange}
                    autoComplete="off"
                    className={`input-field ${errors.grievantEmployeeId ? 'border-red-500' : ''}`}
                    placeholder="12345678"
                  />
                  {errors.grievantEmployeeId && (
                    <p className="text-red-500 text-xs mt-1">{errors.grievantEmployeeId}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Facility <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="facility"
                    value={formData.facility}
                    onChange={handleChange}
                    autoComplete="organization"
                    className={`input-field ${errors.facility ? 'border-red-500' : ''}`}
                    placeholder="Brooklyn Main Post Office"
                  />
                  {errors.facility && (
                    <p className="text-red-500 text-xs mt-1">{errors.facility}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Craft <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="craft"
                    value={formData.craft}
                    onChange={handleChange}
                    className={`input-field ${errors.craft ? 'border-red-500' : ''}`}
                  >
                    <option value="">Select Craft</option>
                    {crafts.map(craft => (
                      <option key={craft} value={craft}>
                        {craft.split('_').map(word =>
                          word.charAt(0).toUpperCase() + word.slice(1)
                        ).join(' ')}
                      </option>
                    ))}
                  </select>
                  {errors.craft && (
                    <p className="text-red-500 text-xs mt-1">{errors.craft}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Section 2: Incident Details */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">
                Incident Details
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Incident Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    name="incidentDate"
                    value={formData.incidentDate}
                    onChange={handleChange}
                    className={`input-field ${errors.incidentDate ? 'border-red-500' : ''}`}
                  />
                  {errors.incidentDate && (
                    <p className="text-red-500 text-xs mt-1">{errors.incidentDate}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Incident Time <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="time"
                    name="incidentTime"
                    value={formData.incidentTime}
                    onChange={handleChange}
                    className={`input-field ${errors.incidentTime ? 'border-red-500' : ''}`}
                  />
                  {errors.incidentTime && (
                    <p className="text-red-500 text-xs mt-1">{errors.incidentTime}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Section 3: Contract & Violation */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">
                Contract Article & Violation
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Contract Article <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="contractArticle"
                    value={formData.contractArticle}
                    onChange={handleChange}
                    className={`input-field ${errors.contractArticle ? 'border-red-500' : ''}`}
                  >
                    <option value="">Select Contract Article</option>
                    {contractArticles.map(article => (
                      <option key={article} value={article}>
                        {article}
                      </option>
                    ))}
                  </select>
                  {errors.contractArticle && (
                    <p className="text-red-500 text-xs mt-1">{errors.contractArticle}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Violation Type <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="violationType"
                    value={formData.violationType}
                    onChange={handleChange}
                    className={`input-field ${errors.violationType ? 'border-red-500' : ''}`}
                  >
                    <option value="">Select Violation Type</option>
                    {violationTypes.map(type => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                  {errors.violationType && (
                    <p className="text-red-500 text-xs mt-1">{errors.violationType}</p>
                  )}
                </div>
              </div>

              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Brief Description (Max 100 characters) <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="briefDescription"
                  value={formData.briefDescription}
                  onChange={handleChange}
                  maxLength={100}
                  className={`input-field ${errors.briefDescription ? 'border-red-500' : ''}`}
                  placeholder="Short summary of the grievance"
                />
                <div className="flex justify-between items-center mt-1">
                  {errors.briefDescription ? (
                    <p className="text-red-500 text-xs">{errors.briefDescription}</p>
                  ) : (
                    <span className="text-xs text-gray-500">
                      {formData.briefDescription.length}/100 characters
                    </span>
                  )}
                </div>
              </div>

              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Detailed Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="detailedDescription"
                  value={formData.detailedDescription}
                  onChange={handleChange}
                  rows={6}
                  className={`input-field ${errors.detailedDescription ? 'border-red-500' : ''}`}
                  placeholder="Provide a complete description of the incident, including dates, times, locations, and any relevant details that support your grievance..."
                />
                {errors.detailedDescription && (
                  <p className="text-red-500 text-xs mt-1">{errors.detailedDescription}</p>
                )}
              </div>
            </div>

            {/* Section 4: Witnesses & Management */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">
                Witnesses & Management Representative
              </h2>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Management Representative <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="managementRepresentative"
                  value={formData.managementRepresentative}
                  onChange={handleChange}
                  className={`input-field ${errors.managementRepresentative ? 'border-red-500' : ''}`}
                  placeholder="Supervisor John Smith"
                />
                {errors.managementRepresentative && (
                  <p className="text-red-500 text-xs mt-1">{errors.managementRepresentative}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Witnesses (Optional)
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={witnessInput}
                    onChange={(e) => setWitnessInput(e.target.value)}
                    onKeyPress={handleWitnessKeyPress}
                    className="input-field flex-1"
                    placeholder="Enter witness name and press Enter"
                  />
                  <button
                    type="button"
                    onClick={handleAddWitness}
                    className="btn-primary flex items-center space-x-1 px-4"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Add</span>
                  </button>
                </div>

                {formData.witnesses.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {formData.witnesses.map((witness, index) => (
                      <div
                        key={index}
                        className="inline-flex items-center bg-primary bg-opacity-10 text-primary px-3 py-1 rounded-full text-sm"
                      >
                        <span>{witness}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveWitness(index)}
                          className="ml-2 text-primary hover:text-primary-dark"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Section 5: Steward Assignment */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">
                Steward Assignment
              </h2>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Assign to Steward (Optional)
                </label>
                <select
                  name="stewardId"
                  value={formData.stewardId}
                  onChange={handleChange}
                  className="input-field"
                >
                  <option value="">Select a steward (or leave blank)</option>
                  {stewards.map(steward => (
                    <option key={steward.id} value={steward.id}>
                      {steward.first_name} {steward.last_name} - {steward.facility}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  You can assign this grievance to a specific union steward, or leave blank to assign later.
                </p>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={() => navigate('/dashboard')}
                className="px-6 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="btn-primary px-8 py-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Filing Grievance...</span>
                  </>
                ) : (
                  <>
                    <FileText className="h-4 w-4" />
                    <span>File Grievance</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default NewGrievancePage;
