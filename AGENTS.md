# AGENTS.md

## Overview
This document serves as a guide for the team to collaborate effectively when using AI agents in the LocalLink project. LocalLink is a platform designed to connect local Philippine businesses, enabling them to collaborate, trade, and reduce waste. By addressing the unique challenges faced by local businesses, such as limited capital, scalability, and brand awareness, LocalLink aims to strengthen community economies and foster partnerships among neighboring businesses.

## Conventions

### Color Scheme
- **Primary Color**: Teal (#008080) - Used for the logo, buttons, and active navigation links.
- **Secondary Color**: White (#FFFFFF) - Used for the background and text areas.
- **Accent Colors**:
  - Yellow (#FFD700) - Used for highlighting urgent needs.
  - Light Gray (#F5F5F5) - Used for background sections and dividers.

### Typography
- **Font Style**: Clean and modern sans-serif font (e.g., similar to Poppins or Open Sans).
- **Font Sizes**:
  - Large headings (e.g., "Welcome back, Your Sari-Sari Store!"): ~24px-32px.
  - Subheadings (e.g., "Here's what's new near you"): ~16px-20px.
  - Body text (e.g., "Search for supplies, skills, or partners..."): ~14px-16px.
- **Font Weight**:
  - Bold for headings and buttons.
  - Regular for body text.

### Button Styles
- **Primary Buttons**:
  - Background: Teal (#008080).
  - Text Color: White (#FFFFFF).
  - Rounded corners.
  - Padding: Medium (e.g., 10px-15px).
- **Secondary Buttons**:
  - Border: Teal (#008080).
  - Text Color: Teal (#008080).
  - Background: White (#FFFFFF).
  - Rounded corners.

### Navigation Bar
- **Layout**: Horizontal navigation bar at the top.
- **Active Link**: Teal background with white text.
- **Inactive Links**: Black text with no background.

### Card Design
- **Layout**: Grid layout for displaying cards.
- **Card Elements**:
  - Image at the top.
  - Title in bold.
  - Subtitle in smaller font size.
  - Tags (e.g., "Barter Available", "Urgent Need") with distinct colors:
    - Barter Available: Light Green.
    - Urgent Need: Yellow.

### Search and Filters
- **Search Bar**:
  - Placeholder text: Light gray.
  - Rounded corners.
- **Filters**:
  - Dropdown menus for "Location" and "Category".
  - Toggle buttons for "DTI-Registered Only", "Barter-Friendly", and "Urgent Needs".

### Layout
- **Spacing**:
  - Consistent padding and margins between elements.
  - Adequate white space for readability.
- **Alignment**:
  - Left-aligned text for most elements.
  - Centered text for headings and buttons.

### Icons
- **Style**: Minimalistic and modern.
- **Usage**:
  - Icons for navigation (e.g., Home, Discover, Messages, Profile).
  - Icons for trusted partners and other visual indicators.

### Accessibility
- **Contrast**: Ensure sufficient contrast between text and background for readability.
- **Responsive Design**: Ensure the layout adapts to different screen sizes (mobile, tablet, desktop).

## Page-Specific Details

### Discover
- **Purpose**: To allow users to browse template businesses.
- **Features**:
  - Search bar for finding specific businesses.
  - Filters for narrowing down search results (e.g., location, category, DTI-registered, barter-friendly, urgent needs).
  - Connect button to establish contact with businesses.

### Inbox
- **Purpose**: To manage user notifications and messages.
- **Features**:
  - Notifications for new messages or updates.
  - Messaging functionality to communicate with business contacts.

### Profile
- **Purpose**: To display and manage user and business information.
- **Features**:
  - User and business name, location, and trust score.
  - List of connections and inventory (items available and needed).
  - Settings for customization.

### Home
- **Purpose**: To provide a personalized dashboard for the user.
- **Features**:
  - Welcome message with user/business name.
  - Quick actions (e.g., Post a Need, Post an Offer).
  - Trusted partners section.
  - Search bar and filters for exploring businesses.
  - Display of new or relevant businesses.

### Login/Sign-Up
- **Purpose**: To allow users to register and log in to the platform.
- **Features**:
  - Registration with username and password.
  - Integration with Supabase for authentication.
  - Collection of user details (e.g., name, business, location).

## PH-Specific Features
- **Bilingual UI**: Supports both Tagalog and English for accessibility.
- **Offline Mode**: Provides basic functionality without internet access for areas with poor connectivity.
- **Verification Badges**: Includes DTI/SEC registration tags and peer-endorsed trust badges to establish credibility.
- **Barter/Trade System**: Facilitates non-cash exchanges between businesses.
- **Localized Search**: Allows filtering by proximity, industry, and specific needs.

## Usage
Provide clear instructions on how to use the agents in the project. Include details on how to integrate them into the workflow and any prerequisites for their usage.

## Examples
Include code snippets or examples of agent usage for each page. For instance:

```javascript
// Example: Using an agent to fetch businesses in the Discover page
const businesses = await agent.fetchBusinesses({
  location: 'Quezon City',
  category: 'Sari-sari Store',
  filters: ['DTI-Registered', 'Barter-Friendly']
});
console.log(businesses);
```

```javascript
// Example: Sending a message to a business contact from the Inbox page
await agent.sendMessage({
  recipientId: 'business123',
  message: 'Hello, I am interested in your products.'
});
```

```javascript
// Example: Fetching user profile details
const profile = await agent.getUserProfile();
console.log(profile);
```

```javascript
// Example: Registering a new user on the Login/Sign-Up page
await agent.registerUser({
  username: 'newuser',
  password: 'securepassword',
  name: 'John Doe',
  business: 'John's Store',
  location: 'Quezon City'
});
```

```javascript
// Example: Facilitating a barter/trade system
const trade = await agent.initiateTrade({
  offer: '10 extra tables',
  request: '50kg of rice',
  partnerId: 'business456'
});
console.log(trade);
```

## Future Enhancements
- **Integration with Maps**: To provide location-based services and navigation.
- **Additional Tools**: Consider using Tailwind CSS for styling and MongoDB for database management.
- **Advanced Algorithms**: Develop a matchmaking system to connect businesses based on mutual interests and needs.
- **Social Media Integration**: Promote the platform through various social media channels to increase user engagement.

This document will be updated as the project evolves to include more details and examples.
