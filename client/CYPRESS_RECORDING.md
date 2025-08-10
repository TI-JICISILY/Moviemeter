# Cypress E2E Testing with Recording

This document explains how to use Cypress for End-to-End testing with video recording and screenshot capabilities for the MovieMeter application.

## 🎥 Recording Features

### Video Recording
- **Automatic**: All test runs are automatically recorded as MP4 videos
- **Location**: Videos are saved in `cypress/videos/` directory
- **Compression**: Videos are compressed to reduce file size
- **Failed Tests**: Videos are always saved for failed tests
- **Passed Tests**: Videos are saved based on configuration

### Screenshot Recording
- **Automatic**: Screenshots are taken on test failures
- **Manual**: Screenshots can be taken at any point using `cy.screenshot()`
- **Location**: Screenshots are saved in `cypress/screenshots/` directory
- **Timestamps**: Custom screenshots with timestamps available

## 🚀 Quick Start

### 1. Start the Development Server
```bash
npm start
```

### 2. Open Cypress Test Runner
```bash
npm run cypress:open
```

### 3. Run Tests with Recording
```bash
npm run cypress:run
```

## 📁 File Structure

```
client/
├── cypress/
│   ├── e2e/
│   │   ├── moviemeter-e2e.cy.js          # Main E2E tests
│   │   └── recording-demo.cy.js          # Recording demo tests
│   ├── support/
│   │   ├── e2e.js                        # Global configuration
│   │   └── commands.js                   # Custom commands
│   ├── videos/                           # Recorded videos
│   └── screenshots/                      # Screenshots
├── cypress.config.js                     # Cypress configuration
└── CYPRESS_RECORDING.md                  # This documentation
```

## 🎬 Test Recording Examples

### Basic Recording
```javascript
describe('Movie Search Flow', () => {
  it('should record the complete search process', () => {
    // Take initial screenshot
    cy.screenshot('01-initial-page')
    
    // Perform search
    cy.get('[data-testid="search-input"]').type('batman')
    cy.screenshot('02-search-typed')
    
    cy.get('button[type="submit"]').click()
    cy.screenshot('03-search-submitted')
    
    // Wait for results
    cy.get('[data-testid="movie-card"]').should('be.visible')
    cy.screenshot('04-results-displayed')
  })
})
```

### Recording with Timestamps
```javascript
// Custom command for timestamped screenshots
cy.screenshotWithTimestamp('user-action')

// This creates: user-action-2024-01-15T10-30-45-123Z.png
```

### Recording Responsive Design
```javascript
it('should record responsive behavior', () => {
  const breakpoints = [
    { width: 375, height: 667, name: 'mobile' },
    { width: 768, height: 1024, name: 'tablet' },
    { width: 1280, height: 720, name: 'desktop' }
  ]
  
  breakpoints.forEach(({ width, height, name }) => {
    cy.viewport(width, height)
    cy.screenshot(`responsive-${name}`)
  })
})
```

## 🎯 Available Test Scenarios

### 1. Complete User Journey
- **File**: `recording-demo.cy.js`
- **Test**: `should record a complete user journey from search to movie details`
- **Steps**:
  1. Initial page load
  2. User typing in search
  3. Search submission
  4. Loading state
  5. Results display
  6. Movie card interaction
  7. Navigation to movie details
  8. Page scrolling
  9. Back navigation
  10. New search

### 2. Authentication Flow
- **File**: `recording-demo.cy.js`
- **Test**: `should record authentication flow with form validation`
- **Steps**:
  1. Registration page navigation
  2. Empty form validation
  3. Invalid data validation
  4. Valid data entry
  5. Successful registration
  6. Login page redirect
  7. Login form completion
  8. Successful login
  9. Home page with user menu

### 3. Responsive Design Testing
- **File**: `recording-demo.cy.js`
- **Test**: `should record responsive design testing`
- **Viewports**:
  - Mobile (375x667)
  - Tablet (768x1024)
  - Tablet Landscape (1024x768)
  - Desktop (1280x720)
  - Large Desktop (1920x1080)

### 4. Error Handling
- **File**: `recording-demo.cy.js`
- **Test**: `should record error handling scenarios`
- **Scenarios**:
  - Server errors (500)
  - Timeout errors (408)
  - Not found errors (404)

## 🛠️ Custom Commands

### Available Commands
```javascript
// Clear localStorage
cy.clearLocalStorage()

// Set localStorage item
cy.setLocalStorage('key', 'value')

// Get localStorage item
cy.getLocalStorage('key')

// Wait and click with validation
cy.waitAndClick('[data-testid="button"]')

// Type with realistic delay
cy.typeWithDelay('[data-testid="input"]', 'text', 100)

// Screenshot with timestamp
cy.screenshotWithTimestamp('action-name')

// Check if element exists
cy.elementExists('[data-testid="element"]')

// Wait for API response
cy.waitForApi('GET', '**/api/endpoint', 'alias')

// Mock API response
cy.mockApi('GET', '**/api/endpoint', { data: 'response' }, 'alias')

// Test responsive breakpoints
cy.testResponsive([
  { width: 375, height: 667, name: 'mobile' },
  { width: 768, height: 1024, name: 'tablet' }
])

// Test form validation
cy.testFormValidation('[data-testid="form"]', [
  { selector: '[data-testid="email"]', value: 'invalid', expectedError: 'Invalid email' }
])
```

## 📊 Recording Configuration

### Video Settings
```javascript
// cypress.config.js
{
  e2e: {
    video: true,                    // Enable video recording
    videoCompression: 32,          // Compression quality (0-51)
    screenshotOnRunFailure: true,  // Screenshots on failure
    defaultCommandTimeout: 10000,  // Command timeout
    viewportWidth: 1280,           // Default viewport width
    viewportHeight: 720,           // Default viewport height
  }
}
```

### Screenshot Settings
```javascript
// Take screenshot with custom name
cy.screenshot('custom-name')

// Take screenshot with timestamp
cy.screenshotWithTimestamp('action')

// Take screenshot of specific element
cy.get('[data-testid="element"]').screenshot('element-screenshot')
```

## 🎥 Viewing Recordings

### Videos
- **Location**: `cypress/videos/`
- **Format**: MP4
- **Player**: Any video player (VLC, Windows Media Player, etc.)
- **Cypress Dashboard**: Upload to Cypress Dashboard for cloud viewing

### Screenshots
- **Location**: `cypress/screenshots/`
- **Format**: PNG
- **Viewer**: Any image viewer
- **Organization**: Organized by test file and test name

## 🔧 Troubleshooting

### Common Issues

1. **Videos not recording**
   - Check `video: true` in config
   - Ensure sufficient disk space
   - Check browser permissions

2. **Screenshots not taking**
   - Verify `screenshotOnRunFailure: true`
   - Check file permissions
   - Ensure element is visible

3. **Large video files**
   - Adjust `videoCompression` setting
   - Use `video: false` for specific tests
   - Clean up old recordings

### Performance Tips

1. **Reduce video size**
   ```javascript
   videoCompression: 51  // Higher compression
   ```

2. **Disable video for specific tests**
   ```javascript
   it('test without video', { video: false }, () => {
     // Test code
   })
   ```

3. **Clean up recordings**
   ```bash
   # Remove old videos
   rm -rf cypress/videos/*
   
   # Remove old screenshots
   rm -rf cypress/screenshots/*
   ```

## 📈 Best Practices

### Recording Strategy
1. **Record key user flows** - Focus on critical paths
2. **Include error scenarios** - Capture failure states
3. **Test responsive design** - Record different viewports
4. **Use descriptive names** - Clear screenshot/video names
5. **Keep recordings focused** - One user journey per test

### File Management
1. **Regular cleanup** - Remove old recordings
2. **Organize by feature** - Group related tests
3. **Version control** - Don't commit large video files
4. **Backup important recordings** - Save critical test runs

### Performance
1. **Optimize test speed** - Faster tests = smaller videos
2. **Use appropriate timeouts** - Balance speed vs reliability
3. **Mock external dependencies** - Reduce network calls
4. **Parallel execution** - Run tests in parallel when possible

## 🚀 Next Steps

1. **Run the demo tests** to see recording in action
2. **Customize the configuration** for your needs
3. **Add more test scenarios** based on your requirements
4. **Set up CI/CD integration** for automated recording
5. **Configure Cypress Dashboard** for cloud viewing

## 📚 Additional Resources

- [Cypress Documentation](https://docs.cypress.io/)
- [Cypress Video Recording](https://docs.cypress.io/guides/references/configuration#Videos)
- [Cypress Screenshots](https://docs.cypress.io/guides/references/configuration#Screenshots)
- [Cypress Dashboard](https://docs.cypress.io/guides/dashboard/introduction)
