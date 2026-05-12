# 🎨 UI Update v4 - Professional Dashboard Design

## Status: IN PROGRESS

Mengikuti panduan `Skill.md` untuk dashboard yang lebih profesional dengan:
- ✅ Light mode (calm operational palette)
- ✅ Responsive design
- ✅ Professional typography
- ✅ Disciplined spacing
- ✅ Clear hierarchy

---

## 🎯 Design Principles (from Skill.md)

### Dashboard Identity
- Tool surface for noticing state and acting fast
- Workspace already in use, not a homepage
- Operational clarity > branding theater

### Palette
- Calm neutrals
- Controlled surface ladders
- Sparse semantic accents
- No neon glows, no colorful halos

### Typography
- Disciplined sans with mono for data
- Short, precise, operational labels
- Heading subordinate to work surface

---

## 📋 Changes Made

### 1. globals.css ✅
**Before**: Dark mode with zinc colors
**After**: Light mode with professional palette

```css
:root {
  --background: 250 250 252;      /* Soft off-white */
  --surface: 255 255 255;         /* Pure white cards */
  --border: 226 232 240;          /* Subtle borders */
  
  --text: 15 23 42;               /* Dark slate text */
  --text-muted: 100 116 139;      /* Muted labels */
  
  --accent: 15 23 42;             /* Dark accent */
  --success: 34 197 94;           /* Green */
  --warning: 251 146 60;          /* Orange */
  --error: 239 68 68;             /* Red */
}
```

**New Utilities**:
- `.surface` - White card with border
- `.surface-elevated` - Card with subtle shadow
- `.surface-success/warning/error` - Status surfaces
- `.btn-primary/secondary/ghost` - Button system
- `.input` - Input system
- `.text-mono` - Monospace for data

### 2. Navbar.tsx ✅
**Before**: Dark navbar with colored links
**After**: Light navbar with professional hierarchy

**Features**:
- Sticky with backdrop blur
- Logo with icon in dark square
- Active state with dark background
- Hover states with light gray
- Mobile menu button (placeholder)
- Responsive: hides links on mobile

---

## 🚧 TODO: Chat Components

### MessageBubble.tsx
**Changes Needed**:
- Own messages: `bg-slate-900 text-white`
- Other messages: `bg-white border border-slate-200`
- Sender name: `text-slate-600` with border separator
- Buttons: Use new button system
- File icons: Keep SVG, update colors
- Preview: White background for images
- Timestamp: `text-slate-400`

### ChatWindow.tsx
**Changes Needed**:
- Background: `bg-slate-50` (subtle gray)
- Input area: White with border
- File attachment button: Ghost style
- Send button: Primary style
- Selected file: Light gray surface

### ChatSidebar.tsx
**Changes Needed**:
- Background: White
- Room list: Hover with `bg-slate-50`
- Active room: `bg-slate-900 text-white`
- New chat button: Primary style
- User info: Subtle border separator

### Chat Page
**Changes Needed**:
- Layout: White sidebar + light gray main
- Borders: Subtle slate borders
- Empty state: Centered with icon

---

## 📐 Responsive Breakpoints

```typescript
// Tailwind breakpoints
sm: 640px   // Mobile landscape
md: 768px   // Tablet
lg: 1024px  // Desktop
xl: 1280px  // Large desktop
```

### Mobile Strategy
- Hide nav links, show menu button
- Stack chat layout vertically
- Full-width message bubbles (max-w-md)
- Larger touch targets (min 44px)
- Simplified file preview

### Tablet Strategy
- Show nav links
- Side-by-side chat layout
- Medium message bubbles (max-w-lg)

### Desktop Strategy
- Full nav
- Optimal chat layout
- Larger previews
- Hover states

---

## 🎨 Color System

### Neutrals
```
slate-50   - Background tint
slate-100  - Hover states
slate-200  - Borders
slate-300  - Input borders
slate-400  - Placeholder text
slate-600  - Muted text
slate-900  - Primary text & accent
```

### Semantic
```
green-500  - Success
orange-500 - Warning
red-500    - Error
```

### Usage Rules
- Use slate-900 for primary actions
- Use white for elevated surfaces
- Use slate-50 for page background
- Use slate-200 for borders
- Never use pure black (#000)

---

## 🔤 Typography Scale

### Headings
```
text-2xl font-bold     - Page title
text-xl font-semibold  - Section title
text-lg font-medium    - Card title
```

### Body
```
text-base              - Body text
text-sm                - Labels, buttons
text-xs                - Captions, timestamps
```

### Mono
```
text-mono text-sm      - File names, IDs
text-mono text-xs      - Technical data
```

---

## 🎭 Component Patterns

### Card Pattern
```tsx
<div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
  {/* Content */}
</div>
```

### Button Pattern
```tsx
// Primary
<button className="btn-primary">
  Send
</button>

// Secondary
<button className="btn-secondary">
  Cancel
</button>

// Ghost
<button className="btn-ghost">
  <Icon /> Action
</button>
```

### Input Pattern
```tsx
<input 
  type="text"
  className="input"
  placeholder="Type a message..."
/>
```

### Status Badge Pattern
```tsx
<div className="surface-success px-3 py-1 rounded-lg text-sm">
  ✓ Encrypted
</div>
```

---

## 🚀 Implementation Order

1. ✅ globals.css - Color system
2. ✅ Navbar - Navigation
3. ⏳ MessageBubble - Chat messages
4. ⏳ ChatWindow - Main chat area
5. ⏳ ChatSidebar - Room list
6. ⏳ Chat Page - Layout
7. ⏳ Other pages (Encrypt, Decrypt, etc.)

---

## 📱 Mobile Considerations

### Touch Targets
- Minimum 44x44px for buttons
- Larger padding on mobile
- Bigger file preview buttons

### Layout
- Single column on mobile
- Collapsible sidebar
- Bottom-fixed input area
- Scroll-to-bottom on new message

### Performance
- Lazy load images
- Virtualize long message lists
- Debounce polling on mobile

---

## ✅ Accessibility

- Proper focus states (ring-2)
- Keyboard navigation
- ARIA labels for icons
- Color contrast (WCAG AA)
- Screen reader friendly
- Reduced motion support

---

## 🎯 Next Steps

1. Update MessageBubble component
2. Update ChatWindow component
3. Update ChatSidebar component
4. Update Chat page layout
5. Test responsive behavior
6. Test accessibility
7. Polish animations

---

**Design Philosophy**: Calm, operational, professional. No AI slop, no unnecessary decoration, just clear hierarchy and purposeful design.
