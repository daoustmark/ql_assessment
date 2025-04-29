'use client';

import React, { useState } from 'react';
import {
  Card,
  Button,
  RadioButton,
  TextField,
  ProgressBar,
  Checkbox,
  LoadingSpinner,
  EmptyState,
  Tooltip,
} from '@/components/ui';

export default function DesignSystemPage() {
  const [radioValue, setRadioValue] = useState('option1');
  const [checkboxValue, setCheckboxValue] = useState(false);
  const [textValue, setTextValue] = useState('');
  
  return (
    <div className="min-h-screen bg-background py-12">
      <div className="max-w-5xl mx-auto px-4">
        <div className="mb-12 text-center">
          <h1 className="text-4xl font-bold text-heading mb-4">Design System</h1>
          <p className="text-body max-w-2xl mx-auto">
            A showcase of UI components following our brand guidelines and design standards.
          </p>
        </div>
        
        {/* Color Palette */}
        <section className="mb-16">
          <h2 className="text-2xl font-semibold text-heading mb-6">Color Palette</h2>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <ColorSwatch name="Primary" color="#3B6E8F" className="bg-primary" />
            <ColorSwatch name="Secondary" color="#47B39D" className="bg-secondary" />
            <ColorSwatch name="Accent" color="#EC6B56" className="bg-accent text-white" />
            <ColorSwatch name="Background" color="#F2F7F9" className="bg-background" />
          </div>
        </section>
        
        {/* Typography */}
        <section className="mb-16">
          <h2 className="text-2xl font-semibold text-heading mb-6">Typography</h2>
          
          <Card padding="large" className="space-y-6">
            <div>
              <h1 className="text-heading font-bold">Heading 1</h1>
              <p className="text-sm text-neutral-500 mt-1">24px, Font Weight: 700</p>
            </div>
            <div>
              <h2 className="text-question font-semibold">Heading 2 (Question)</h2>
              <p className="text-sm text-neutral-500 mt-1">18px, Font Weight: 600</p>
            </div>
            <div>
              <p className="text-option">Body Text (Option)</p>
              <p className="text-sm text-neutral-500 mt-1">16px, Font Weight: 400</p>
            </div>
            <div>
              <p className="text-caption">Caption Text</p>
              <p className="text-sm text-neutral-500 mt-1">14px, Font Weight: 400</p>
            </div>
          </Card>
        </section>
        
        {/* Cards */}
        <section className="mb-16">
          <h2 className="text-2xl font-semibold text-heading mb-6">Cards</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card 
              padding="medium" 
              variant="default"
              elevation="base"
              header={<div className="font-medium">Default Card</div>}
            >
              <p>Standard card with default styling and medium padding.</p>
            </Card>
            
            <Card 
              padding="medium" 
              variant="flat"
              header={<div className="font-medium">Flat Card</div>}
            >
              <p>Flat card with border instead of shadow.</p>
            </Card>
            
            <Card 
              padding="medium" 
              variant="raised"
              elevation="floating"
              header={<div className="font-medium">Raised Card</div>}
            >
              <p>Elevated card with more prominent shadow.</p>
            </Card>
            
            <Card 
              padding="medium" 
              variant="interactive"
              withTexture={true}
              header={<div className="font-medium">Interactive Card</div>}
            >
              <p>Card with hover effects and subtle background texture.</p>
            </Card>
          </div>
        </section>
        
        {/* Buttons */}
        <section className="mb-16">
          <h2 className="text-2xl font-semibold text-heading mb-6">Buttons</h2>
          
          <Card padding="large" className="space-y-8">
            <div className="flex flex-wrap gap-4">
              <Button variant="primary">Primary Button</Button>
              <Button variant="secondary">Secondary Button</Button>
              <Button variant="next">Next Button</Button>
              <Button variant="text">Text Button</Button>
            </div>
            
            <div className="flex flex-wrap gap-4">
              <Button variant="primary" disabled>Disabled Primary</Button>
              <Button variant="secondary" disabled>Disabled Secondary</Button>
              <Button variant="next" disabled>Disabled Next</Button>
              <Button variant="text" disabled>Disabled Text</Button>
            </div>
          </Card>
        </section>
        
        {/* Form Elements */}
        <section className="mb-16">
          <h2 className="text-2xl font-semibold text-heading mb-6">Form Elements</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card padding="large">
              <h3 className="text-lg font-medium mb-4">Radio Buttons</h3>
              
              <div className="space-y-2">
                <RadioButton
                  id="radio-1"
                  name="radio-group"
                  value="option1"
                  checked={radioValue === 'option1'}
                  onChange={(e) => setRadioValue(e.target.value)}
                  label="Option 1"
                />
                
                <RadioButton
                  id="radio-2"
                  name="radio-group"
                  value="option2"
                  checked={radioValue === 'option2'}
                  onChange={(e) => setRadioValue(e.target.value)}
                  label="Option 2"
                />
                
                <RadioButton
                  id="radio-3"
                  name="radio-group"
                  value="option3"
                  checked={radioValue === 'option3'}
                  onChange={(e) => setRadioValue(e.target.value)}
                  label="Option 3 (Longer label text to demonstrate wrapping behavior)"
                />
                
                <RadioButton
                  id="radio-4"
                  name="radio-group"
                  value="option4"
                  checked={radioValue === 'option4'}
                  onChange={(e) => setRadioValue(e.target.value)}
                  label="Disabled Option"
                  disabled
                />
              </div>
            </Card>
            
            <Card padding="large">
              <h3 className="text-lg font-medium mb-4">Checkboxes</h3>
              
              <div className="space-y-2">
                <Checkbox
                  id="checkbox-1"
                  name="checkbox"
                  checked={checkboxValue}
                  onChange={(e) => setCheckboxValue(e.target.checked)}
                  label="Standard Checkbox"
                />
                
                <Checkbox
                  id="checkbox-2"
                  name="checkbox-2"
                  checked={true}
                  onChange={() => {}}
                  label="Checked Checkbox"
                />
                
                <Checkbox
                  id="checkbox-3"
                  name="checkbox-3"
                  checked={false}
                  onChange={() => {}}
                  label="Disabled Checkbox"
                  disabled
                />
                
                <Checkbox
                  id="checkbox-4"
                  name="checkbox-4"
                  checked={true}
                  onChange={() => {}}
                  label="Indeterminate"
                  indeterminate={true}
                />
              </div>
            </Card>
            
            <Card padding="large" className="md:col-span-2">
              <h3 className="text-lg font-medium mb-4">Text Fields</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <TextField
                  id="text-1"
                  name="text-1"
                  label="Standard Text Field"
                  placeholder="Enter some text"
                  value={textValue}
                  onChange={(e) => setTextValue(e.target.value)}
                />
                
                <TextField
                  id="text-2"
                  name="text-2"
                  label="With Helper Text"
                  placeholder="Enter your email"
                  helperText="We'll never share your email with anyone."
                />
                
                <TextField
                  id="text-3"
                  name="text-3"
                  label="With Error"
                  placeholder="Enter password"
                  type="password"
                  error="Password must be at least 8 characters"
                />
                
                <TextField
                  id="text-4"
                  name="text-4"
                  label="Disabled Field"
                  placeholder="This field is disabled"
                  disabled
                />
              </div>
            </Card>
          </div>
        </section>
        
        {/* Progress Indicators */}
        <section className="mb-16">
          <h2 className="text-2xl font-semibold text-heading mb-6">Progress Indicators</h2>
          
          <Card padding="large" className="space-y-8">
            <div>
              <h3 className="text-lg font-medium mb-4">Progress Bars</h3>
              
              <div className="space-y-6">
                <ProgressBar value={25} max={100} showLabels={true} />
                <ProgressBar value={50} max={100} showLabels={true} />
                <ProgressBar value={75} max={100} showLabels={true} />
                <ProgressBar value={100} max={100} showLabels={true} />
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-medium mb-4">Loading Spinners</h3>
              
              <div className="flex flex-wrap items-center gap-8">
                <LoadingSpinner size="small" />
                <LoadingSpinner size="medium" label="Loading..." />
                <LoadingSpinner size="large" />
              </div>
            </div>
          </Card>
        </section>
        
        {/* Tooltips */}
        <section className="mb-16">
          <h2 className="text-2xl font-semibold text-heading mb-6">Tooltips</h2>
          
          <Card padding="large">
            <div className="flex flex-wrap justify-center gap-8">
              <Tooltip content="Top tooltip example" position="top">
                <Button variant="secondary">Hover Me (Top)</Button>
              </Tooltip>
              
              <Tooltip content="Right tooltip with more text to demonstrate wrapping" position="right">
                <Button variant="secondary">Hover Me (Right)</Button>
              </Tooltip>
              
              <Tooltip content="Bottom tooltip example" position="bottom">
                <Button variant="secondary">Hover Me (Bottom)</Button>
              </Tooltip>
              
              <Tooltip content="Left tooltip example" position="left">
                <Button variant="secondary">Hover Me (Left)</Button>
              </Tooltip>
            </div>
          </Card>
        </section>
        
        {/* Empty States */}
        <section className="mb-16">
          <h2 className="text-2xl font-semibold text-heading mb-6">Empty States</h2>
          
          <EmptyState
            title="No assessments available"
            description="You don't have any active assessments at the moment. Assessments will appear here once they are assigned to you."
            action={<Button variant="primary">Return to Dashboard</Button>}
          />
        </section>
      </div>
    </div>
  );
}

// Helper component for color swatches
function ColorSwatch({ name, color, className }: { name: string; color: string; className: string }) {
  return (
    <div className="flex flex-col">
      <div className={`h-20 rounded-md ${className}`}></div>
      <div className="mt-2">
        <p className="font-medium">{name}</p>
        <p className="text-sm text-neutral-500">{color}</p>
      </div>
    </div>
  );
} 