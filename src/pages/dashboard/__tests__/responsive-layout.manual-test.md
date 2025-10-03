# Dashboard Responsive Layout Manual Test

## Overview
This document describes manual testing procedures for the responsive layout implementation of the Platform Dashboard (Task 11).

## Requirements Covered
- **5.1**: Responsive design for mobile, tablet, and desktop
- **5.2**: Loading states and performance optimization
- **5.4**: Error handling and retry functionality

## Test Cases

### 1. Mobile Layout (< 640px)
**Expected Behavior:**
- Header: Stacked layout with smaller text and icons
- Metrics cards: Single column layout (grid-cols-1)
- Padding: Reduced padding (p-4 instead of p-6)
- Text: Smaller font sizes (text-lg instead of text-xl)
- Auto-refresh badge: Shows "Auto" instead of "Auto-refresh"
- Refresh button: Icon only on mobile

**Test Steps:**
1. Open dashboard in browser
2. Resize window to < 640px width
3. Verify all cards stack vertically
4. Check header layout is compact
5. Verify text is readable and properly sized

### 2. Tablet Layout (640px - 1024px)
**Expected Behavior:**
- Header: Responsive flex layout
- Contracts: 2 columns for status cards (sm:grid-cols-2)
- Products: 2 columns for environment cards (sm:grid-cols-2)
- Users: 2 columns for detail cards (sm:grid-cols-2)
- Padding: Medium padding (sm:p-6)

**Test Steps:**
1. Resize window to 768px width
2. Verify cards arrange in 2-column grids where appropriate
3. Check spacing and padding are appropriate
4. Verify header shows full text labels

### 3. Desktop Layout (> 1024px)
**Expected Behavior:**
- Header: Full horizontal layout
- Contracts: 3 columns for status cards (lg:grid-cols-3)
- Products: 4 columns for environment cards (lg:grid-cols-4)
- Users: 2 columns for detail cards (maintains sm:grid-cols-2)
- Spacing: Larger spacing (lg:space-y-8)

**Test Steps:**
1. Resize window to > 1024px width
2. Verify optimal grid layouts for each section
3. Check all text and icons are full size
4. Verify proper spacing between sections

### 4. Loading States
**Expected Behavior:**
- Skeleton loaders adapt to screen size
- Responsive skeleton dimensions (h-3 sm:h-4, w-20 sm:w-24)
- Grid layouts maintained during loading

**Test Steps:**
1. Refresh dashboard to trigger loading state
2. Verify skeletons appear with proper responsive sizing
3. Check grid layouts are maintained
4. Test across different screen sizes

### 5. Error States
**Expected Behavior:**
- Error messages remain readable on small screens
- Retry buttons maintain proper touch targets (min 44px)
- Error cards maintain responsive padding

**Test Steps:**
1. Simulate network error (disconnect internet)
2. Verify error states display properly
3. Check retry buttons are accessible on mobile
4. Test error recovery flow

### 6. Performance Considerations
**Expected Behavior:**
- Smooth transitions between breakpoints
- No layout shift during loading
- Proper hover states on desktop only

**Test Steps:**
1. Slowly resize browser window
2. Verify smooth transitions
3. Check for any layout jumping
4. Test hover effects on desktop

## Breakpoint Reference

| Breakpoint | Width | Grid Behavior |
|------------|-------|---------------|
| Mobile | < 640px | Single column (grid-cols-1) |
| Small | 640px+ | 2 columns (sm:grid-cols-2) |
| Large | 1024px+ | 3-4 columns (lg:grid-cols-3/4) |

## CSS Classes Used

### Container Responsive Classes
- `px-4 sm:px-6 lg:px-8` - Responsive horizontal padding
- `py-6 sm:py-8` - Responsive vertical padding
- `space-y-6 lg:space-y-8` - Responsive section spacing

### Grid Responsive Classes
- `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3` - Contracts status cards
- `grid-cols-1 sm:grid-cols-2 lg:grid-cols-4` - Products environment cards
- `grid-cols-1 sm:grid-cols-2` - Users detail cards

### Typography Responsive Classes
- `text-lg sm:text-xl` - Section headings
- `text-2xl sm:text-3xl` - Page title
- `text-xs sm:text-sm` - Card titles and metadata

### Component Responsive Classes
- `p-4 sm:p-6` - Card padding
- `h-4 w-4 sm:h-5 sm:w-5` - Icon sizes
- `line-clamp-2` - Text truncation for long content

## Success Criteria
- [ ] All layouts work correctly across breakpoints
- [ ] Loading states are responsive
- [ ] Error states remain functional on mobile
- [ ] No horizontal scrolling on mobile
- [ ] Touch targets meet accessibility guidelines (44px minimum)
- [ ] Text remains readable at all sizes
- [ ] Grid layouts adapt appropriately
- [ ] Performance remains smooth during transitions