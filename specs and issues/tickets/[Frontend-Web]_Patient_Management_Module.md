# [Frontend-Web] Patient Management Module

## Overview
Implement the patient management module including patient list, patient details, add/edit patient forms, and patient search functionality.

## Context
Reference: `spec:df06a57d-bbce-4623-8e1c-cd129f15f2cf/9205213b-7551-4266-99b1-915e78111a8d` (Frontend Web Implementation)

Patient management is a core feature allowing therapists to maintain comprehensive patient records, track history, and manage demographics.

## Patient List Page

```wireframe
┌────────────────────────────────────────────────────────────┐
│  Patients                                    [+ Add Patient]│
│                                                             │
│  ┌─────────────────────────────────────┐  [🔍 Search...]  │
│  │ All (45) │ Active (38) │ Inactive (7)│                  │
│  └─────────────────────────────────────┘                   │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ 👤 Rahul Sharma                    📅 Next: Tomorrow │  │
│  │    25 years • Male • Anxiety                         │  │
│  │    Last session: 3 days ago                          │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ 👤 Priya Patel                     📅 Next: Friday   │  │
│  │    32 years • Female • Depression                    │  │
│  │    Last session: 1 week ago                          │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ 👤 Amit Kumar                      📅 Next: Mon 2PM  │  │
│  │    28 years • Male • Stress Management               │  │
│  │    Last session: 2 days ago                          │  │
│  └──────────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────────┘
```

## Patient Detail Page

```wireframe
┌────────────────────────────────────────────────────────────┐
│  ← Back to Patients                                        │
│                                                             │
│  👤 Rahul Sharma                              [Edit] [•••] │
│  25 years • Male • Mumbai                                  │
│  Patient since: Jan 2024 • 12 sessions completed           │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ Overview │ Sessions │ Notes │ BioSync │ Documents  │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  📋 Demographics                                            │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ Phone: +91 98765 43210                               │  │
│  │ Email: rahul.sharma@email.com                        │  │
│  │ ABHA ID: 12-3456-7890-1234                          │  │
│  │ Emergency Contact: Mother - +91 98765 00000          │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                             │
│  🏥 Clinical Information                                    │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ Primary Concern: Generalized Anxiety Disorder        │  │
│  │ ICD-10: F41.1                                        │  │
│  │ Medications: Escitalopram 10mg                       │  │
│  │ Allergies: None                                      │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                             │
│  📊 Recent Activity                                         │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ • Session completed - 3 days ago                     │  │
│  │ • Payment received ₹1,500 - 3 days ago              │  │
│  │ • BioSync data synced - 1 day ago                   │  │
│  └──────────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────────┘
```

## Add/Edit Patient Form

```wireframe
┌────────────────────────────────────────────────────────────┐
│  Add New Patient                                    [Close] │
│                                                             │
│  Personal Information                                       │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ Full Name *                                         │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌──────────────────┐  ┌──────────────────┐               │
│  │ Age *            │  │ Gender *         │               │
│  └──────────────────┘  └──────────────────┘               │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ Phone Number *                                      │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ Email                                               │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  Clinical Information                                       │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ Primary Concern *                                   │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ Referral Source                                     │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ Notes (Optional)                                    │   │
│  │                                                     │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│                              [Cancel]  [Save Patient]       │
└────────────────────────────────────────────────────────────┘
```

## Technical Requirements

### 1. Patient List Component
```typescript
export default function PatientsPage() {
  const [filter, setFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  const { data: patients, isLoading } = useQuery({
    queryKey: ['patients', filter, searchQuery],
    queryFn: () => fetchPatients({ filter, search: searchQuery })
  });
  
  return (
    <div>
      <PageHeader 
        title="Patients" 
        action={<Button onClick={openAddPatient}>+ Add Patient</Button>}
      />
      
      <Tabs value={filter} onValueChange={setFilter}>
        <TabsList>
          <TabsTrigger value="all">All ({counts.all})</TabsTrigger>
          <TabsTrigger value="active">Active ({counts.active})</TabsTrigger>
          <TabsTrigger value="inactive">Inactive ({counts.inactive})</TabsTrigger>
        </TabsList>
      </Tabs>
      
      <SearchInput 
        value={searchQuery}
        onChange={setSearchQuery}
        placeholder="Search patients..."
      />
      
      <PatientList patients={patients} />
    </div>
  );
}
```

### 2. Patient Card Component
```typescript
function PatientCard({ patient }: { patient: Patient }) {
  return (
    <Card className="hover:shadow-md transition-shadow cursor-pointer">
      <CardContent className="flex items-center justify-between p-4">
        <div className="flex items-center gap-4">
          <Avatar>
            <AvatarFallback>{patient.initials}</AvatarFallback>
          </Avatar>
          <div>
            <h3 className="font-semibold">{patient.full_name}</h3>
            <p className="text-sm text-gray-600">
              {patient.age} years • {patient.gender} • {patient.primary_concern}
            </p>
            <p className="text-xs text-gray-500">
              Last session: {formatRelativeTime(patient.last_session_date)}
            </p>
          </div>
        </div>
        <div className="text-right">
          {patient.next_session && (
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="w-4 h-4" />
              <span>Next: {formatDate(patient.next_session)}</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
```

### 3. Patient Detail Page
```typescript
export default function PatientDetailPage({ params }: { params: { id: string } }) {
  const { data: patient } = useQuery({
    queryKey: ['patient', params.id],
    queryFn: () => fetchPatient(params.id)
  });
  
  const [activeTab, setActiveTab] = useState('overview');
  
  return (
    <div>
      <PatientHeader patient={patient} />
      
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="sessions">Sessions</TabsTrigger>
          <TabsTrigger value="notes">Notes</TabsTrigger>
          <TabsTrigger value="biosync">BioSync</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview">
          <PatientOverview patient={patient} />
        </TabsContent>
        
        <TabsContent value="sessions">
          <SessionHistory patientId={patient.id} />
        </TabsContent>
        
        {/* Other tabs */}
      </Tabs>
    </div>
  );
}
```

### 4. Add/Edit Patient Form
```typescript
const patientSchema = z.object({
  full_name: z.string().min(2, 'Name must be at least 2 characters'),
  age: z.number().min(1).max(120),
  gender: z.enum(['male', 'female', 'other']),
  phone: z.string().regex(/^[6-9]\d{9}$/, 'Invalid Indian phone number'),
  email: z.string().email().optional(),
  primary_concern: z.string().min(1, 'Primary concern is required'),
  referral_source: z.string().optional(),
  notes: z.string().optional()
});

function AddPatientDialog({ open, onClose }: AddPatientDialogProps) {
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(patientSchema)
  });
  
  const createPatient = useMutation({
    mutationFn: (data: PatientFormData) => supabase
      .from('patients')
      .insert(data),
    onSuccess: () => {
      toast.success('Patient added successfully');
      onClose();
      queryClient.invalidateQueries(['patients']);
    }
  });
  
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <form onSubmit={handleSubmit(createPatient.mutate)}>
          {/* Form fields */}
        </form>
      </DialogContent>
    </Dialog>
  );
}
```

### 5. Search Functionality
Implement fuzzy search across:
- Patient name
- Phone number
- Primary concern
- ABHA ID

### 6. Real-time Updates
Subscribe to patient changes:
```typescript
useEffect(() => {
  const subscription = supabase
    .channel('patients')
    .on('postgres_changes', 
      { event: '*', schema: 'public', table: 'patients' },
      (payload) => {
        queryClient.invalidateQueries(['patients']);
      }
    )
    .subscribe();
  
  return () => subscription.unsubscribe();
}, []);
```

## Acceptance Criteria
- [ ] Patient list page implemented with tabs
- [ ] Patient cards display all relevant information
- [ ] Search functionality working
- [ ] Filter by active/inactive working
- [ ] Patient detail page implemented with tabs
- [ ] Add patient form working with validation
- [ ] Edit patient form working
- [ ] Delete patient functionality (with confirmation)
- [ ] Real-time updates working
- [ ] Responsive design on mobile
- [ ] Loading states implemented
- [ ] Error handling implemented
- [ ] Empty states for no patients
- [ ] Pagination or infinite scroll for large lists

## Dependencies
- Requires: Dashboard Layout Implementation
- Requires: Database Schema Implementation

## Estimated Effort
10-12 hours