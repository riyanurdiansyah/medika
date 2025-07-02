# Flutter BasicInfoRequest to Next.js Transformation

This document explains how the Flutter `BasicInfoRequest` widget has been transformed to Next.js components.

## Original Flutter Code

```dart
class BasicInfoRequest extends GetView<RequestController> {
  const BasicInfoRequest({super.key});

  @override
  Widget build(BuildContext context) {
    return ListView(
      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 16),
      children: [
        Text(
          'Create a new request Instalasi',
          style: Calibri700.copyWith(fontSize: 16),
        ),
        4.ph,
        Text(
          '1 of 3 Completed Basic Info',
          style: Calibri400.copyWith(fontSize: 16),
        ),
        10.ph,
        FilledPrimaryTextfield(
          style: Calibri400.copyWith(
            fontSize: 18,
            color: ColorStyles.disableBold,
          ),
          labelText: 'No Dokumen',
          textInputAction: TextInputAction.next,
          isRequired: true,
          controller: controller.tcNoDokumen,
        ),
        14.ph,
        FilledPrimaryTextfield(
          style: Calibri400.copyWith(
            fontSize: 18,
            color: ColorStyles.disableBold,
          ),
          onTap: () => controller.onPickDate(
            controller.tcTanggal,
            controller.dtTanggal,
          ),
          labelText: 'Tanggal Dokumen',
          isRequired: true,
          readOnly: true,
          controller: controller.tcTanggal,
        ),
        // ... more fields
      ],
    );
  }
}
```

## Next.js Implementation

### 1. Form Component (`src/components/requests/BasicInfoRequestForm.tsx`)

The Flutter widget has been transformed into a React component with the following features:

#### Key Transformations:

- **ListView → Box with flexDirection: 'column'**: The Flutter ListView becomes a Material-UI Box with vertical layout
- **FilledPrimaryTextfield → TextField**: Flutter text fields become Material-UI TextField components
- **Date Picker**: Flutter's date picker becomes HTML5 date input with proper formatting
- **Styling**: Flutter styles are converted to Material-UI sx props
- **State Management**: Flutter controllers become React useState hooks

#### Form Fields Included:

1. **No Dokumen** - Document number (required)
2. **Tanggal Dokumen** - Document date (required, date picker)
3. **Alamat** - Address (required, multiline)
4. **No Telepon** - Phone number (required)
5. **Kepala Laboratorium** - Lab head (required)
6. **Penanggung Jawab Alat** - Equipment PIC (required)
7. **Tanggal Pengajuan Form** - Form submission date (required, date picker)
8. **Alat** - Equipment (required)
9. **Merk** - Brand (required)
10. **Serial Number** - Serial number (required)
11. **No SPK/Invoice** - Invoice number (required)

### 2. Detail Page (`src/pages/requests/detail/[guid].tsx`)

A new detail page that:
- Uses GUID parameter in the URL
- Shows the form in edit mode when "Edit" is clicked
- Displays request details in read-only mode
- Handles approval/rejection actions

### 3. Navigation Updates

All request list pages now navigate to the new detail page:
- `/requests/approvals` → `/requests/detail/[guid]`
- `/requests/flutter-style-approvals` → `/requests/detail/[guid]`
- `/requests/list` → `/requests/detail/[guid]`

## Key Features

### ✅ **Exact Field Mapping**
All Flutter form fields are preserved with the same labels and requirements

### ✅ **Progress Indicator**
Shows "1 of 3 Completed Basic Info" with a progress bar (33%)

### ✅ **Form Validation**
Client-side validation for all required fields

### ✅ **Date Handling**
Date fields use HTML5 date inputs with proper formatting

### ✅ **Responsive Design**
Form adapts to different screen sizes

### ✅ **Edit Mode**
Form can be used for both creating new requests and editing existing ones

### ✅ **Loading States**
Shows loading indicators during save operations

## Usage Examples

### 1. Create New Request
```typescript
<BasicInfoRequestForm
  onSubmit={handleSubmit}
  onNext={handleNext}
  isEdit={false}
  loading={false}
/>
```

### 2. Edit Existing Request
```typescript
<BasicInfoRequestForm
  data={existingRequest}
  onSubmit={handleSave}
  isEdit={true}
  loading={saving}
/>
```

### 3. Navigation to Detail Page
```typescript
const handleViewRequest = (requestId: string) => {
  router.push(`/requests/detail/${requestId}`)
}
```

## Styling Comparison

### Flutter Styling:
```dart
style: Calibri400.copyWith(
  fontSize: 18,
  color: ColorStyles.disableBold,
)
```

### Next.js Styling:
```typescript
sx={{
  '& .MuiInputLabel-root': {
    fontSize: '18px',
    color: 'text.secondary'
  },
  '& .MuiInputBase-input': {
    fontSize: '18px',
    color: 'text.primary'
  }
}}
```

## Test Page

Visit `/requests/test-form` to see the form component in action with test data.

## File Structure

```
src/
├── components/
│   └── requests/
│       └── BasicInfoRequestForm.tsx    # Main form component
├── pages/
│   └── requests/
│       ├── detail/
│       │   └── [guid].tsx              # Detail page with GUID
│       └── test-form/
│           └── index.tsx               # Test page
```

## Next Steps

1. **Add More Form Steps**: Implement the remaining 2 steps (2 of 3, 3 of 3)
2. **Enhanced Date Picker**: Install and use MUI Date Picker for better UX
3. **Form Persistence**: Add auto-save functionality
4. **File Upload**: Add attachment upload capabilities
5. **Validation Rules**: Add more sophisticated validation rules

## Dependencies

The form component uses:
- `@mui/material` for UI components
- `date-fns` for date formatting
- `react` for state management
- TypeScript for type safety 