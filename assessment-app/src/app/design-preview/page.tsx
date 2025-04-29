import React from 'react';
import { Layout, Card, Button, ProgressBar, Icon, Celebration } from '@/components/ui';
import designSystem from '@/lib/designSystem';

export default function DesignPreviewPage() {
  return (
    <Layout title="Design System Preview" subtitle="A showcase of the UX improvements implemented">
      <div className="space-y-16">
        {/* Colors Section */}
        <section className="space-y-6">
          <h2 className="text-2xl font-bold text-text-heading tracking-heading">Colors</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card 
              title="Primary Colors" 
              padding="md"
            >
              <div className="space-y-4">
                <div>
                  <div className="w-full h-16 rounded bg-primary"></div>
                  <p className="mt-2 text-sm">Primary: {designSystem.colors.primary}</p>
                </div>
                <div>
                  <div className="w-full h-16 rounded bg-secondary"></div>
                  <p className="mt-2 text-sm">Secondary: {designSystem.colors.secondary}</p>
                </div>
                <div>
                  <div className="w-full h-16 rounded bg-accent"></div>
                  <p className="mt-2 text-sm">Accent: {designSystem.colors.accent}</p>
                </div>
              </div>
            </Card>
            
            <Card 
              title="Background Colors" 
              padding="md"
            >
              <div className="space-y-4">
                <div>
                  <div className="w-full h-16 rounded bg-background"></div>
                  <p className="mt-2 text-sm">Background: {designSystem.colors.background.main}</p>
                </div>
                <div>
                  <div className="w-full h-16 rounded bg-card"></div>
                  <p className="mt-2 text-sm">Card: {designSystem.colors.background.card}</p>
                </div>
                <div>
                  <div className="w-full h-16 rounded bg-subtle"></div>
                  <p className="mt-2 text-sm">Subtle: {designSystem.colors.background.subtle}</p>
                </div>
              </div>
            </Card>
            
            <Card 
              title="Text Colors" 
              padding="md"
            >
              <div className="space-y-4">
                <div className="flex items-center">
                  <div className="w-8 h-8 rounded-full bg-text-heading mr-3"></div>
                  <p className="text-text-heading">Heading Text</p>
                </div>
                <div className="flex items-center">
                  <div className="w-8 h-8 rounded-full bg-text-body mr-3"></div>
                  <p className="text-text-body">Body Text</p>
                </div>
                <div className="flex items-center">
                  <div className="w-8 h-8 rounded-full bg-text-light mr-3"></div>
                  <p className="text-text-light">Light Text</p>
                </div>
              </div>
            </Card>
          </div>
        </section>
        
        {/* Typography Section */}
        <section className="space-y-6">
          <h2 className="text-2xl font-bold text-text-heading tracking-heading">Typography</h2>
          <Card padding="md">
            <div className="space-y-6">
              <div>
                <h1 className="text-heading font-bold text-text-heading tracking-heading">Heading (24px)</h1>
                <p className="text-sm text-text-light mt-1">Font: {designSystem.typography.fontFamily}</p>
              </div>
              
              <div>
                <p className="text-question text-text-body tracking-body leading-question">
                  Question text (18px) - This is how questions appear in the assessment. The line height is set to {designSystem.typography.lineHeight.question} to improve readability.
                </p>
              </div>
              
              <div>
                <p className="text-option text-text-body tracking-body leading-option">
                  Option text (16px) - This is how answer options appear. The line height is set to {designSystem.typography.lineHeight.option}.
                </p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="font-regular">Regular weight (400)</p>
                  <p className="font-medium">Medium weight (500)</p>
                  <p className="font-semibold">Semibold weight (600)</p>
                  <p className="font-bold">Bold weight (700)</p>
                </div>
                <div>
                  <p className="tracking-heading">Letter spacing: heading (-0.2px)</p>
                  <p className="tracking-body">Letter spacing: body (-0.1px)</p>
                  <p className="tracking-button">Letter spacing: button (0.5px)</p>
                </div>
              </div>
            </div>
          </Card>
        </section>
        
        {/* Component Showcase */}
        <section className="space-y-6">
          <h2 className="text-2xl font-bold text-text-heading tracking-heading">UI Components</h2>
          
          {/* Buttons */}
          <Card title="Buttons" padding="md">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Variants</h3>
                <div className="space-y-4">
                  <Button variant="primary">Primary Button</Button>
                  <Button variant="secondary">Secondary Button</Button>
                  <Button variant="accent">Accent Button</Button>
                  <Button variant="outline">Outline Button</Button>
                  <Button variant="ghost">Ghost Button</Button>
                </div>
              </div>
              
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Sizes</h3>
                <div className="space-y-4">
                  <Button size="sm">Small Button</Button>
                  <Button size="md">Medium Button</Button>
                  <Button size="lg">Large Button</Button>
                  <Button isLoading>Loading Button</Button>
                  <Button icon={<Icon name="check" />}>With Icon</Button>
                </div>
              </div>
            </div>
          </Card>
          
          {/* Progress Bars */}
          <Card title="Progress Indicators" padding="md">
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-4">Basic Progress</h3>
                <ProgressBar current={3} total={10} />
              </div>
              
              <div>
                <h3 className="text-lg font-semibold mb-4">Gradient Progress with Pulse</h3>
                <ProgressBar 
                  current={65} 
                  total={100} 
                  variant="gradient" 
                  showPulse
                />
              </div>
              
              <div>
                <h3 className="text-lg font-semibold mb-4">Progress with Milestones</h3>
                <ProgressBar 
                  current={50} 
                  total={100} 
                  variant="secondary" 
                  height="h-2"
                />
              </div>
            </div>
          </Card>
          
          {/* Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card 
              title="Standard Card" 
              subtitle="With title and subtitle" 
              padding="md"
              elevation="md"
            >
              <p>This is a standard card with medium elevation.</p>
            </Card>
            
            <Card 
              title="Card with Accent" 
              colorAccent="primary" 
              padding="md"
              elevation="sm"
            >
              <p>This card has a primary color accent and subtle elevation.</p>
            </Card>
            
            <Card 
              padding="lg"
              elevation="lg"
            >
              <p>This is a card with large padding and strong elevation.</p>
            </Card>
            
            <Card 
              title="Card with Pattern" 
              padding="md"
              pattern="subtle"
            >
              <p>This card has a subtle background pattern.</p>
            </Card>
          </div>
          
          {/* Icons */}
          <Card title="Icons" padding="md">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="flex flex-col items-center">
                <Icon name="next" size="md" />
                <span className="mt-2 text-sm">next</span>
              </div>
              <div className="flex flex-col items-center">
                <Icon name="previous" size="md" />
                <span className="mt-2 text-sm">previous</span>
              </div>
              <div className="flex flex-col items-center">
                <Icon name="check" size="md" />
                <span className="mt-2 text-sm">check</span>
              </div>
              <div className="flex flex-col items-center">
                <Icon name="error" size="md" />
                <span className="mt-2 text-sm">error</span>
              </div>
              <div className="flex flex-col items-center">
                <Icon name="info" size="md" />
                <span className="mt-2 text-sm">info</span>
              </div>
              <div className="flex flex-col items-center">
                <Icon name="warning" size="md" />
                <span className="mt-2 text-sm">warning</span>
              </div>
              <div className="flex flex-col items-center">
                <Icon name="success" size="md" />
                <span className="mt-2 text-sm">success</span>
              </div>
              <div className="flex flex-col items-center">
                <Icon name="loading" size="md" />
                <span className="mt-2 text-sm">loading</span>
              </div>
            </div>
          </Card>
          
          {/* Celebrations */}
          <Card title="Celebrations" padding="md">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Button 
                onClick={() => {
                  const container = document.getElementById('checkmark-container');
                  if (container) {
                    container.innerHTML = '';
                    const celebration = document.createElement('div');
                    celebration.className = 'relative h-40';
                    celebration.innerHTML = `
                      <div class="absolute inset-0 pointer-events-none flex items-center justify-center">
                        <svg viewBox="0 0 52 52" class="checkmark animate-checkmark" style="width: 80px; height: 80px">
                          <circle class="checkmark__circle" cx="26" cy="26" r="25" fill="none" stroke="#47B39D" stroke-width="2" stroke-miterlimit="10"></circle>
                          <path class="checkmark__check" fill="none" stroke="#47B39D" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" stroke-miterlimit="10" d="M14.1 27.2L22.5 35.7L37.9 19.8"></path>
                        </svg>
                      </div>
                    `;
                    container.appendChild(celebration);
                  }
                }}
              >
                Show Checkmark
              </Button>
              <div id="checkmark-container" className="h-40 bg-gray-50 rounded-lg flex items-center justify-center">
                <p className="text-text-light">Click button to show animation</p>
              </div>
            </div>
          </Card>
        </section>
      </div>
    </Layout>
  );
} 