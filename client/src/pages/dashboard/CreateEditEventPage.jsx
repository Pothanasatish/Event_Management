import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Calendar,
  Clock,
  MapPin,
  Globe,
  Upload,
  Plus,
  Trash2,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input, Select, Textarea } from '../../components/ui/Input';
import { Badge, Card } from '../../components/ui/Badge';
import { EventCard } from '../../components/shared/EventCard';
import { eventService } from '../../services/eventService';
import { categoryService } from '../../services/categoryService';
import toast from 'react-hot-toast';

export const CreateEditEventPage = () => {
  const { id } = useParams();
  const isEditMode = !!id;
  const navigate = useNavigate();

  const [currentStep, setCurrentStep] = useState(1);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [savingDraft, setSavingDraft] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    tagsString: '',
    startDate: '',
    endDate: '',
    timezone: 'UTC',
    locationType: 'physical',
    venueName: '',
    venueAddress: '',
    venueCity: '',
    venueMapUrl: '',
    onlineLink: '',
    capacity: 50,
    price: 0,
    rsvpDeadline: '',
    coverImage: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1200&auto=format&fit=crop&q=80',
    coverImageFile: null,
    status: 'published',
    agenda: [{ time: '09:00 AM', title: 'Welcome & Keynote', speaker: '', description: '' }],
  });

  const [coverPreview, setCoverPreview] = useState(formData.coverImage);

  useEffect(() => {
    categoryService.getCategories().then((cats) => {
      setCategories(cats || []);
      if (cats && cats.length > 0 && !formData.category) {
        setFormData((prev) => ({ ...prev, category: cats[0]._id }));
      }
    });

    if (isEditMode) {
      setLoading(true);
      eventService
        .getEventById(id)
        .then((ev) => {
          setFormData({
            title: ev.title || '',
            description: ev.description || '',
            category: ev.category?._id || ev.category || '',
            tagsString: ev.tags ? ev.tags.join(', ') : '',
            startDate: ev.startDate ? new Date(ev.startDate).toISOString().slice(0, 16) : '',
            endDate: ev.endDate ? new Date(ev.endDate).toISOString().slice(0, 16) : '',
            timezone: ev.timezone || 'UTC',
            locationType: ev.locationType || 'physical',
            venueName: ev.venue?.name || '',
            venueAddress: ev.venue?.address || '',
            venueCity: ev.venue?.city || '',
            venueMapUrl: ev.venue?.mapUrl || '',
            onlineLink: ev.onlineLink || '',
            capacity: ev.capacity || 50,
            price: ev.price || 0,
            rsvpDeadline: ev.rsvpDeadline ? new Date(ev.rsvpDeadline).toISOString().slice(0, 16) : '',
            coverImage: ev.coverImage || '',
            coverImageFile: null,
            status: ev.status || 'published',
            agenda: ev.agenda && ev.agenda.length > 0 ? ev.agenda : [{ time: '09:00 AM', title: 'Welcome & Keynote', speaker: '', description: '' }],
          });
          setCoverPreview(ev.coverImage);
        })
        .catch((err) => {
          toast.error('Failed to load event details');
        })
        .finally(() => setLoading(false));
    }
  }, [id, isEditMode]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData((prev) => ({ ...prev, coverImageFile: file }));
      setCoverPreview(URL.createObjectURL(file));
    }
  };

  // Agenda row helpers
  const handleAgendaChange = (index, field, value) => {
    const newAgenda = [...formData.agenda];
    newAgenda[index][field] = value;
    setFormData((prev) => ({ ...prev, agenda: newAgenda }));
  };

  const addAgendaRow = () => {
    setFormData((prev) => ({
      ...prev,
      agenda: [...prev.agenda, { time: '', title: '', speaker: '', description: '' }],
    }));
  };

  const removeAgendaRow = (index) => {
    if (formData.agenda.length === 1) return;
    setFormData((prev) => ({
      ...prev,
      agenda: prev.agenda.filter((_, i) => i !== index),
    }));
  };

  // Validate step before proceeding
  const validateStep = () => {
    if (currentStep === 1) {
      if (!formData.title.trim()) {
        toast.error('Please enter an event title');
        return false;
      }
      if (!formData.description.trim()) {
        toast.error('Please provide a description');
        return false;
      }
    } else if (currentStep === 2) {
      if (!formData.startDate || !formData.endDate) {
        toast.error('Please set valid start and end dates');
        return false;
      }
      if (new Date(formData.endDate) <= new Date(formData.startDate)) {
        toast.error('End date must be after start date');
        return false;
      }
    } else if (currentStep === 3) {
      if (!formData.capacity || parseInt(formData.capacity, 10) < 1) {
        toast.error('Capacity must be at least 1 spot');
        return false;
      }
    }
    return true;
  };

  const nextStep = () => {
    if (validateStep()) {
      setCurrentStep((prev) => Math.min(prev + 1, 5));
    }
  };

  const prevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  // Build FormData and submit
  const handleSubmit = async (targetStatus = 'published') => {
    try {
      setLoading(true);
      const postData = new FormData();
      postData.append('title', formData.title);
      postData.append('description', formData.description);
      postData.append('category', formData.category);
      postData.append('status', targetStatus);
      postData.append('startDate', formData.startDate);
      postData.append('endDate', formData.endDate);
      postData.append('timezone', formData.timezone);
      postData.append('locationType', formData.locationType);
      postData.append('capacity', formData.capacity);
      postData.append('price', formData.price);

      if (formData.rsvpDeadline) {
        postData.append('rsvpDeadline', formData.rsvpDeadline);
      }

      if (formData.locationType === 'online') {
        postData.append('onlineLink', formData.onlineLink);
      } else {
        postData.append('venue[name]', formData.venueName);
        postData.append('venue[address]', formData.venueAddress);
        postData.append('venue[city]', formData.venueCity);
        postData.append('venue[mapUrl]', formData.venueMapUrl);
      }

      const tagsArray = formData.tagsString
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean);
      tagsArray.forEach((t) => postData.append('tags[]', t));

      postData.append('agenda', JSON.stringify(formData.agenda));

      if (formData.coverImageFile) {
        postData.append('coverImage', formData.coverImageFile);
      } else if (formData.coverImage) {
        postData.append('coverImage', formData.coverImage);
      }

      if (isEditMode) {
        await eventService.updateEvent(id, postData);
        toast.success('Event updated successfully!');
      } else {
        await eventService.createEvent(postData);
        toast.success(
          targetStatus === 'draft' ? 'Event saved as draft!' : 'Event published successfully!'
        );
      }
      navigate('/dashboard/events');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save event');
    } finally {
      setLoading(false);
    }
  };

  const steps = [
    { number: 1, label: 'Basics' },
    { number: 2, label: 'Date & Location' },
    { number: 3, label: 'Tickets & Capacity' },
    { number: 4, label: 'Media & Details' },
    { number: 5, label: 'Review & Publish' },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      {/* Page Title */}
      <div>
        <Link
          to="/dashboard/events"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 mb-2"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to My Events</span>
        </Link>
        <h1 className="text-2xl sm:text-3xl font-extrabold font-heading text-slate-900 dark:text-white">
          {isEditMode ? 'Edit Event' : 'Create a New Event'}
        </h1>
        <p className="text-xs sm:text-sm text-slate-500">
          Follow the 5-step wizard to set up and launch your event.
        </p>
      </div>

      {/* Progress Stepper */}
      <div className="flex items-center justify-between p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-soft overflow-x-auto">
        {steps.map((st, i) => (
          <div key={st.number} className="flex items-center gap-3 shrink-0">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                currentStep === st.number
                  ? 'bg-gradient-to-r from-brand-600 to-purple-600 text-white shadow-md'
                  : currentStep > st.number
                  ? 'bg-emerald-500 text-white'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
              }`}
            >
              {currentStep > st.number ? <CheckCircle2 className="w-4 h-4" /> : st.number}
            </div>
            <span
              className={`text-xs font-semibold whitespace-nowrap hidden sm:inline ${
                currentStep === st.number
                  ? 'text-slate-900 dark:text-white'
                  : 'text-slate-400'
              }`}
            >
              {st.label}
            </span>
            {i < steps.length - 1 && (
              <div className="w-6 sm:w-12 h-0.5 bg-slate-200 dark:bg-slate-800 mx-1" />
            )}
          </div>
        ))}
      </div>

      {/* Step Contents */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-10 border border-slate-200/80 dark:border-slate-800 shadow-soft space-y-6">
        {/* Step 1: Basics */}
        {currentStep === 1 && (
          <div className="space-y-5">
            <h3 className="text-lg font-bold font-heading text-slate-900 dark:text-white">
              Step 1: Event Basics
            </h3>
            <Input
              label="Event Title"
              name="title"
              required
              autoFocus
              value={formData.title}
              onChange={handleChange}
              placeholder="e.g. NextGen Web & AI Summit 2026"
            />
            <Textarea
              label="Description (Markdown supported)"
              name="description"
              required
              rows={5}
              value={formData.description}
              onChange={handleChange}
              placeholder="Provide a comprehensive summary of what attendees can expect, what they will learn, and why they should attend..."
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Select
                label="Category"
                name="category"
                value={formData.category}
                onChange={handleChange}
              >
                {categories.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.name}
                  </option>
                ))}
              </Select>
              <Input
                label="Tags (Comma separated)"
                name="tagsString"
                value={formData.tagsString}
                onChange={handleChange}
                placeholder="AI, Tech, Keynote, Networking"
              />
            </div>
          </div>
        )}

        {/* Step 2: Date & Location */}
        {currentStep === 2 && (
          <div className="space-y-5">
            <h3 className="text-lg font-bold font-heading text-slate-900 dark:text-white">
              Step 2: Date & Location
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Start Date & Time"
                type="datetime-local"
                name="startDate"
                required
                value={formData.startDate}
                onChange={handleChange}
              />
              <Input
                label="End Date & Time"
                type="datetime-local"
                name="endDate"
                required
                value={formData.endDate}
                onChange={handleChange}
              />
            </div>

            {/* Location Type */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                Event Format
              </label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setFormData((p) => ({ ...p, locationType: 'physical' }))}
                  className={`p-4 rounded-2xl border text-left flex items-center gap-3 ${
                    formData.locationType === 'physical'
                      ? 'border-brand-500 bg-brand-50/50 dark:bg-brand-950/40 text-brand-700 dark:text-brand-300 ring-2 ring-brand-500/20'
                      : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  <MapPin className="w-5 h-5" />
                  <div>
                    <p className="text-sm font-bold">In-Person Venue</p>
                    <p className="text-[11px] text-slate-400">Physical address & city</p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setFormData((p) => ({ ...p, locationType: 'online' }))}
                  className={`p-4 rounded-2xl border text-left flex items-center gap-3 ${
                    formData.locationType === 'online'
                      ? 'border-brand-500 bg-brand-50/50 dark:bg-brand-950/40 text-brand-700 dark:text-brand-300 ring-2 ring-brand-500/20'
                      : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  <Globe className="w-5 h-5" />
                  <div>
                    <p className="text-sm font-bold">Online Webinar / Stream</p>
                    <p className="text-[11px] text-slate-400">Virtual meeting URL</p>
                  </div>
                </button>
              </div>
            </div>

            {formData.locationType === 'online' ? (
              <Input
                label="Virtual Meeting / Stream Link"
                name="onlineLink"
                value={formData.onlineLink}
                onChange={handleChange}
                placeholder="https://zoom.us/j/... or Google Meet"
              />
            ) : (
              <div className="space-y-4">
                <Input
                  label="Venue Name"
                  name="venueName"
                  value={formData.venueName}
                  onChange={handleChange}
                  placeholder="e.g. Moscone Convention Center"
                />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Address"
                    name="venueAddress"
                    value={formData.venueAddress}
                    onChange={handleChange}
                    placeholder="747 Howard St"
                  />
                  <Input
                    label="City / State"
                    name="venueCity"
                    value={formData.venueCity}
                    onChange={handleChange}
                    placeholder="San Francisco, CA"
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {/* Step 3: Tickets & Capacity */}
        {currentStep === 3 && (
          <div className="space-y-5">
            <h3 className="text-lg font-bold font-heading text-slate-900 dark:text-white">
              Step 3: Tickets & Capacity
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Total Capacity (Spots Available)"
                type="number"
                min="1"
                name="capacity"
                required
                value={formData.capacity}
                onChange={handleChange}
                helperText="When filled, additional attendees are routed to the automated waitlist."
              />
              <Input
                label="Admission Price ($ USD)"
                type="number"
                min="0"
                step="0.01"
                name="price"
                value={formData.price}
                onChange={handleChange}
                helperText="Set to 0 for Free admission."
              />
            </div>
            <Input
              label="RSVP Deadline (Optional)"
              type="datetime-local"
              name="rsvpDeadline"
              value={formData.rsvpDeadline}
              onChange={handleChange}
              helperText="Cutoff timestamp after which no further RSVPs are accepted."
            />
          </div>
        )}

        {/* Step 4: Media & Agenda */}
        {currentStep === 4 && (
          <div className="space-y-6">
            <h3 className="text-lg font-bold font-heading text-slate-900 dark:text-white">
              Step 4: Media & Schedule
            </h3>

            {/* Cover Image */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                Event Cover Image
              </label>
              <div className="flex flex-col sm:flex-row gap-4 items-start">
                <img
                  src={coverPreview}
                  alt="Cover Preview"
                  className="w-full sm:w-48 aspect-[16/9] object-cover rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm"
                />
                <div className="space-y-2 flex-1 w-full">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="block w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-brand-50 file:text-brand-700 dark:file:bg-brand-950 dark:file:text-brand-300 hover:file:bg-brand-100"
                  />
                  <p className="text-[11px] text-slate-400">
                    Or paste an image URL:
                  </p>
                  <Input
                    name="coverImage"
                    value={formData.coverImage}
                    onChange={(e) => {
                      handleChange(e);
                      setCoverPreview(e.target.value);
                    }}
                    placeholder="https://images.unsplash.com/..."
                  />
                </div>
              </div>
            </div>

            {/* Dynamic Agenda Rows */}
            <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                  Agenda & Program Sessions
                </label>
                <Button variant="secondary" size="sm" icon={Plus} onClick={addAgendaRow}>
                  Add Session
                </Button>
              </div>

              {formData.agenda.map((row, index) => (
                <div
                  key={index}
                  className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-500">
                      Session #{index + 1}
                    </span>
                    {formData.agenda.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeAgendaRow(index)}
                        className="text-rose-500 hover:text-rose-600 p-1"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <Input
                      placeholder="e.g. 10:00 AM"
                      value={row.time}
                      onChange={(e) => handleAgendaChange(index, 'time', e.target.value)}
                    />
                    <Input
                      placeholder="Session Title"
                      className="sm:col-span-2"
                      value={row.title}
                      onChange={(e) => handleAgendaChange(index, 'title', e.target.value)}
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <Input
                      placeholder="Speaker / Host Name"
                      value={row.speaker}
                      onChange={(e) => handleAgendaChange(index, 'speaker', e.target.value)}
                    />
                    <Input
                      placeholder="Brief session description"
                      value={row.description}
                      onChange={(e) => handleAgendaChange(index, 'description', e.target.value)}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Step 5: Review & Publish */}
        {currentStep === 5 && (
          <div className="space-y-6">
            <h3 className="text-lg font-bold font-heading text-slate-900 dark:text-white">
              Step 5: Review & Publish
            </h3>
            <p className="text-xs text-slate-500">
              Here is how your event will appear to attendees on the explore feed:
            </p>

            <div className="max-w-md mx-auto">
              <EventCard
                event={{
                  title: formData.title || 'Untitled Event',
                  description: formData.description,
                  coverImage: coverPreview,
                  startDate: formData.startDate || new Date(),
                  endDate: formData.endDate || new Date(),
                  price: parseFloat(formData.price) || 0,
                  capacity: parseInt(formData.capacity, 10) || 50,
                  attendeesCount: 0,
                  locationType: formData.locationType,
                  venue: { name: formData.venueName, city: formData.venueCity },
                  category: categories.find((c) => c._id === formData.category),
                }}
              />
            </div>

            <div className="p-4 rounded-2xl bg-brand-50 dark:bg-brand-950/40 border border-brand-200 dark:border-brand-800 text-xs text-brand-800 dark:text-brand-300 space-y-1">
              <p className="font-bold">Ready to launch?</p>
              <p>
                Click <strong>"Publish Event"</strong> to make it discoverable immediately, or save it as a <strong>"Draft"</strong> to finish tweaking later.
              </p>
            </div>
          </div>
        )}

        {/* Navigation Step Buttons */}
        <div className="flex items-center justify-between pt-6 border-t border-slate-100 dark:border-slate-800">
          <div>
            {currentStep > 1 && (
              <Button variant="outline" icon={ArrowLeft} onClick={prevStep}>
                Previous Step
              </Button>
            )}
          </div>

          <div className="flex items-center gap-3">
            {currentStep === 5 ? (
              <>
                <Button
                  variant="secondary"
                  onClick={() => handleSubmit('draft')}
                  isLoading={loading}
                >
                  Save as Draft
                </Button>
                <Button
                  variant="primary"
                  onClick={() => handleSubmit('published')}
                  isLoading={loading}
                >
                  {isEditMode ? 'Save Changes' : 'Publish Event 🚀'}
                </Button>
              </>
            ) : (
              <Button variant="primary" iconRight={ArrowRight} onClick={nextStep}>
                Next Step
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
